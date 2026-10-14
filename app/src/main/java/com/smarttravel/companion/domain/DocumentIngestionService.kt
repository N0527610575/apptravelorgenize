package com.smarttravel.companion.domain

import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import com.smarttravel.companion.data.model.DocumentCategory
import com.smarttravel.companion.data.model.Passenger
import com.smarttravel.companion.data.model.TravelDocument
import java.io.File
import java.io.FileOutputStream
import java.util.UUID

data class IngestionResult(
    val document: TravelDocument,
    val newPassenger: Passenger? = null
)

object DocumentIngestionService {

    /**
     * קולט קובץ, סורק את תוכנו ללא שום תיוג ידני, מסווג אוטומטית,
     * ומחלץ/יוצר את הנוסע אוטומטית אם טרם קיים במערכת.
     */
    fun ingestFromUri(
        context: Context,
        uri: Uri,
        tripId: String = "trip_rome",
        existingPassengers: List<Passenger> = emptyList()
    ): IngestionResult {
        var displayName = "מסמך_נסיעה_${System.currentTimeMillis()}"
        var mimeType = context.contentResolver.getType(uri) ?: "application/pdf"

        try {
            context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (nameIndex != -1 && cursor.moveToFirst()) {
                    val name = cursor.getString(nameIndex)
                    if (!name.isNullOrBlank()) {
                        displayName = name
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        // 1. שמירה מאובטחת בכספת המקומית בזיכרון המכשיר
        val vaultDir = File(context.filesDir, "vault_documents").apply { mkdirs() }
        val sanitizedName = displayName.replace(Regex("[^a-zA-Z0-9._-]"), "_")
        val destinationFile = File(vaultDir, "${System.currentTimeMillis()}_$sanitizedName")

        try {
            context.contentResolver.openInputStream(uri)?.use { input ->
                FileOutputStream(destinationFile).use { output ->
                    input.copyTo(output)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        // 2. סריקת תוכן הקובץ (OCR / חילוץ טקסט / חילוץ ברקוד)
        val extracted = DocumentContentExtractor.extract(context, uri, displayName)

        // 3. סיווג אוטומטי לפי תוכן ומשקולות ללא שום תיוג ידני!
        val category = DocumentClassifier.classify(
            fileName = displayName,
            contentText = extracted.rawText,
            hasIataBarcode = extracted.detectedBarcode != null
        )

        // 4. חילוץ ברקוד טיסה
        val barcode = if (category == DocumentCategory.FLIGHT) {
            DocumentClassifier.extractFlightBarcode(
                fileName = displayName,
                text = extracted.rawText,
                rawBarcode = extracted.detectedBarcode
            )
        } else null

        // 5. העלאה ושיוך אוטומטי של הנוסע ("ושהנוסע יעלה אוטומטית")
        var matchedPassengerId: String? = null
        var newlyDiscoveredPassenger: Passenger? = null

        val detectedName = extracted.detectedPassengerName ?: barcode?.passengerName
        if (!detectedName.isNullOrBlank() && detectedName != "נוסע מאומת") {
            val existing = existingPassengers.find {
                it.fullName.equals(detectedName, ignoreCase = true) ||
                it.shortName.equals(detectedName, ignoreCase = true)
            }

            if (existing != null) {
                matchedPassengerId = existing.id
            } else {
                // יצירת נוסע חדש אוטומטית ישירות מתוך המסמך!
                val short = detectedName.split(" ").firstOrNull() ?: detectedName
                val newPassId = "pass_${UUID.randomUUID().toString().take(6)}"
                newlyDiscoveredPassenger = Passenger(
                    id = newPassId,
                    fullName = detectedName,
                    shortName = short,
                    isPrimaryUser = existingPassengers.isEmpty(),
                    currentSeatNumber = extracted.detectedSeatNumber ?: barcode?.seatNumber ?: "27E"
                )
                matchedPassengerId = newPassId
            }
        } else {
            // אם לא צוין שם מפורש אך זה כרטיס טיסה, משייכים לנוסע הראשי
            matchedPassengerId = existingPassengers.firstOrNull()?.id ?: "pass_1"
        }

        val userTitle = formatUserTitle(displayName, category, detectedName)

        val doc = TravelDocument(
            id = "doc_${UUID.randomUUID().toString().take(8)}",
            tripId = tripId,
            passengerId = matchedPassengerId,
            title = userTitle,
            category = category,
            localFilePath = destinationFile.absolutePath,
            mimeType = mimeType,
            barcode = barcode,
            isArchived = false,
            createdAt = System.currentTimeMillis()
        )

        return IngestionResult(document = doc, newPassenger = newlyDiscoveredPassenger)
    }

    /**
     * סורק את תיקיית הכספת הפנימית
     */
    fun scanInternalStorage(
        context: Context,
        tripId: String = "trip_rome",
        existingPassengers: List<Passenger> = emptyList()
    ): List<IngestionResult> {
        val vaultDir = File(context.filesDir, "vault_documents")
        if (!vaultDir.exists() || !vaultDir.isDirectory) return emptyList()

        val results = mutableListOf<IngestionResult>()
        val files = vaultDir.listFiles() ?: return emptyList()

        for (file in files) {
            if (file.isFile && isSupportedTravelExtension(file.extension)) {
                val category = DocumentClassifier.classify(file.name)
                val barcode = if (category == DocumentCategory.FLIGHT) {
                    DocumentClassifier.extractFlightBarcode(file.name)
                } else null

                val doc = TravelDocument(
                    id = "doc_${file.name.hashCode()}",
                    tripId = tripId,
                    passengerId = existingPassengers.firstOrNull()?.id ?: "pass_1",
                    title = formatUserTitle(file.name, category, null),
                    category = category,
                    localFilePath = file.absolutePath,
                    mimeType = if (file.extension.equals("pdf", ignoreCase = true)) "application/pdf" else "image/${file.extension}",
                    barcode = barcode,
                    createdAt = file.lastModified()
                )
                results.add(IngestionResult(document = doc, newPassenger = null))
            }
        }
        return results
    }

    private fun isSupportedTravelExtension(extension: String): Boolean {
        val ext = extension.lowercase()
        return ext in listOf("pdf", "jpg", "jpeg", "png", "pkpass", "webp")
    }

    private fun formatUserTitle(rawName: String, category: DocumentCategory, passengerName: String?): String {
        val cleanName = rawName.substringBeforeLast(".")
            .replace("_", " ")
            .replace("-", " ")
            .trim()

        val suffix = if (!passengerName.isNullOrBlank() && passengerName != "נוסע מאומת") " - $passengerName" else ""

        return when (category) {
            DocumentCategory.FLIGHT -> "כרטיס טיסה$suffix"
            DocumentCategory.HOTEL -> "אישור מלון - $cleanName"
            DocumentCategory.CAR_RENTAL -> "שובר השכרת רכב - $cleanName"
            DocumentCategory.INSURANCE -> "פוליסת ביטוח$suffix"
            DocumentCategory.TRAIN -> "כרטיס רכבת - $cleanName"
            DocumentCategory.PASSPORT -> "דרכון / זיהוי$suffix"
            DocumentCategory.CUSTOM -> cleanName
        }
    }
}
