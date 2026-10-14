package com.smarttravel.companion.domain

import android.content.Context
import android.net.Uri
import java.io.File
import java.io.InputStream
import java.nio.charset.Charset
import java.util.zip.InflaterInputStream

data class ExtractedDocumentContent(
    val rawText: String,
    val detectedBarcode: String? = null,
    val detectedPassengerName: String? = null,
    val detectedFlightNumber: String? = null,
    val detectedSeatNumber: String? = null,
    val detectedPnr: String? = null
)

object DocumentContentExtractor {

    private val IATA_BCBP_REGEX = Regex("M1[A-Z0-9/ ]{20,60}[A-Z0-9]{6,10}")
    private val FLIGHT_REGEX = Regex("\\b([A-Z0-9]{2,3})\\s?(\\d{3,4})\\b")
    private val SEAT_REGEX = Regex("\\b(\\d{1,2}[A-F])\\b", RegexOption.IGNORE_CASE)
    private val PNR_REGEX = Regex("\\b([A-Z0-9]{6})\\b")

    /**
     * מחלץ תוכן טקסטואלי, ברקודים ושמות נוסעים מתוך קובץ PDF או תמונה
     */
    fun extract(context: Context, uri: Uri, fileName: String): ExtractedDocumentContent {
        val extractedBuilder = StringBuilder()
        extractedBuilder.append(fileName).append(" ")

        try {
            context.contentResolver.openInputStream(uri)?.use { stream ->
                val buffer = ByteArray(1024 * 64) // Read up to 64KB for inspection
                val bytesRead = stream.read(buffer)
                if (bytesRead > 0) {
                    val rawChunk = String(buffer, 0, bytesRead, Charsets.ISO_8859_1)
                    extractedBuilder.append(extractReadableStrings(rawChunk))
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        val fullText = extractedBuilder.toString()

        // 1. נסה לזהות ברקוד IATA BCBP
        val bcbpMatch = IATA_BCBP_REGEX.find(fullText)
        val rawBarcode = bcbpMatch?.value

        var passengerName: String? = null
        var flightNumber: String? = null
        var seatNumber: String? = null
        var pnr: String? = null

        if (rawBarcode != null) {
            val parsed = IataBcbpParser.parse(rawBarcode)
            if (parsed != null) {
                passengerName = parsed.passengerName
                flightNumber = "${parsed.airline}${parsed.flightNumber}"
                seatNumber = parsed.seatNumber
                pnr = parsed.pnr
            }
        }

        // 2. אם לא חולץ שם מהברקוד, חפש תבניות שמות טיסה (למשל LASTNAME/FIRSTNAME או "Passenger: Name")
        if (passengerName == null) {
            passengerName = findPassengerNameInText(fullText)
        }

        // 3. חילוץ מספר טיסה ומושב מטקסט חופשי
        if (flightNumber == null) {
            val match = FLIGHT_REGEX.find(fullText)
            if (match != null && !match.value.contains("2024") && !match.value.contains("2025") && !match.value.contains("2026")) {
                flightNumber = match.value.replace(" ", "").uppercase()
            }
        }

        if (seatNumber == null) {
            val match = SEAT_REGEX.find(fullText)
            if (match != null) {
                seatNumber = match.value.uppercase()
            }
        }

        return ExtractedDocumentContent(
            rawText = fullText,
            detectedBarcode = rawBarcode,
            detectedPassengerName = passengerName,
            detectedFlightNumber = flightNumber,
            detectedSeatNumber = seatNumber,
            detectedPnr = pnr
        )
    }

    private fun extractReadableStrings(raw: String): String {
        val result = StringBuilder()
        val currentWord = StringBuilder()

        for (ch in raw) {
            if (ch.isLetterOrDigit() || ch in " /-:.,_()#@\n\r" || ch.code in 0x0590..0x05FF) {
                currentWord.append(ch)
            } else {
                if (currentWord.length >= 3) {
                    result.append(currentWord).append(" ")
                }
                currentWord.clear()
            }
        }
        if (currentWord.length >= 3) {
            result.append(currentWord)
        }
        return result.toString()
    }

    private fun findPassengerNameInText(text: String): String? {
        // Form 1: LAST/FIRST (IATA style in text)
        val slashNameRegex = Regex("\\b([A-Z]{2,15})/([A-Z]{2,15})\\b")
        val slashMatch = slashNameRegex.find(text)
        if (slashMatch != null) {
            val last = slashMatch.groupValues[1].lowercase().replaceFirstChar { it.uppercase() }
            val first = slashMatch.groupValues[2].lowercase().replaceFirstChar { it.uppercase() }
            return "$first $last"
        }

        // Form 2: Hebrew names like "נוסע: נחמן חסון" or "שם המבוטח: נחמן חסון"
        val hebrewPassengerRegex = Regex("(?:נוסע|מבוטח|שם מלא|שם הנוסע|שם)\\s*[:\\-]\\s*([\\u0590-\\u05FF]{2,15}\\s+[\\u0590-\\u05FF]{2,15})")
        val hebrewMatch = hebrewPassengerRegex.find(text)
        if (hebrewMatch != null) {
            return hebrewMatch.groupValues[1].trim()
        }

        // Form 3: English labels "Passenger: John Doe" or "Name: Jane Doe"
        val englishPassengerRegex = Regex("(?:Passenger|Name|Guest)\\s*[:\\-]\\s*([A-Z][a-z]{2,15}\\s+[A-Z][a-z]{2,15})")
        val englishMatch = englishPassengerRegex.find(text)
        if (englishMatch != null) {
            return englishMatch.groupValues[1].trim()
        }

        return null
    }
}

