package com.smarttravel.companion.domain

import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import com.smarttravel.companion.data.model.DocumentCategory
import com.smarttravel.companion.data.model.TravelDocument
import java.io.File
import java.io.FileOutputStream
import java.util.UUID

object DocumentIngestionService {

    /**
     * קולט קובץ שנבחר על ידי המשתמש (דרך ה-System File Picker),
     * מעתיק אותו לכספת המקומית המאובטחת בזיכרון המכשיר, ומסווג אותו אוטומטית.
     */
    fun ingestFromUri(context: Context, uri: Uri, tripId: String = "trip_rome"): TravelDocument {
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

        // שמירה מאובטחת בכספת המקומית (Private Storage)
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

        // סיווג אוטומטי של המסמך
        val category = DocumentClassifier.classify(displayName)
        val barcode = if (category == DocumentCategory.FLIGHT) {
            DocumentClassifier.extractFlightBarcode(displayName)
        } else null

        // קביעת כותרת יפה למשתמש
        val userTitle = formatUserTitle(displayName, category)

        return TravelDocument(
            id = "doc_${UUID.randomUUID().toString().take(8)}",
            tripId = tripId,
            passengerId = if (category == DocumentCategory.FLIGHT) "pass_1" else null,
            title = userTitle,
            category = category,
            localFilePath = destinationFile.absolutePath,
            mimeType = mimeType,
            barcode = barcode,
            isArchived = false,
            createdAt = System.currentTimeMillis()
        )
    }

    /**
     * סורק את תיקיית הכספת או הורדות לאיתור מסמכים קיימים
     */
    fun scanInternalStorage(context: Context, tripId: String = "trip_rome"): List<TravelDocument> {
        val vaultDir = File(context.filesDir, "vault_documents")
        if (!vaultDir.exists() || !vaultDir.isDirectory) return emptyList()

        val results = mutableListOf<TravelDocument>()
        val files = vaultDir.listFiles() ?: return emptyList()

        for (file in files) {
            if (file.isFile && isSupportedTravelExtension(file.extension)) {
                val category = DocumentClassifier.classify(file.name)
                val barcode = if (category == DocumentCategory.FLIGHT) {
                    DocumentClassifier.extractFlightBarcode(file.name)
                } else null

                results.add(
                    TravelDocument(
                        id = "doc_${file.name.hashCode()}",
                        tripId = tripId,
                        passengerId = if (category == DocumentCategory.FLIGHT) "pass_1" else null,
                        title = formatUserTitle(file.name, category),
                        category = category,
                        localFilePath = file.absolutePath,
                        mimeType = if (file.extension.equals("pdf", ignoreCase = true)) "application/pdf" else "image/${file.extension}",
                        barcode = barcode,
                        createdAt = file.lastModified()
                    )
                )
            }
        }
        return results
    }

    private fun isSupportedTravelExtension(extension: String): Boolean {
        val ext = extension.lowercase()
        return ext in listOf("pdf", "jpg", "jpeg", "png", "pkpass", "webp")
    }

    private fun formatUserTitle(rawName: String, category: DocumentCategory): String {
        val cleanName = rawName.substringBeforeLast(".")
            .replace("_", " ")
            .replace("-", " ")
            .trim()

        return when (category) {
            DocumentCategory.FLIGHT -> if (cleanName.contains("כרטיס", ignoreCase = true) || cleanName.contains("flight", ignoreCase = true)) cleanName else "כרטיס טיסה - $cleanName"
            DocumentCategory.HOTEL -> if (cleanName.contains("מלון", ignoreCase = true) || cleanName.contains("hotel", ignoreCase = true)) cleanName else "אישור מלון - $cleanName"
            DocumentCategory.CAR_RENTAL -> if (cleanName.contains("רכב", ignoreCase = true) || cleanName.contains("car", ignoreCase = true)) cleanName else "שובר רכב - $cleanName"
            DocumentCategory.INSURANCE -> if (cleanName.contains("ביטוח", ignoreCase = true) || cleanName.contains("insurance", ignoreCase = true)) cleanName else "פוליסת ביטוח - $cleanName"
            DocumentCategory.TRAIN -> "כרטיס רכבת - $cleanName"
            DocumentCategory.PASSPORT -> "מסמך זיהוי / דרכון - $cleanName"
            DocumentCategory.CUSTOM -> cleanName
        }
    }
}
