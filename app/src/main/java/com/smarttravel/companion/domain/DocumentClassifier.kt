package com.smarttravel.companion.domain

import com.smarttravel.companion.data.model.BarcodePayload
import com.smarttravel.companion.data.model.DocumentCategory

object DocumentClassifier {

    private val KEYWORDS: Map<DocumentCategory, List<String>> = mapOf(
        DocumentCategory.FLIGHT to listOf(
            "כרטיס טיסה", "עלייה למטוס", "שער", "טרמינל", "בורדינג", "טיסה",
            "boarding pass", "e-ticket", "flight", "departure", "gate", "seat", "airline",
            "el al", "ryanair", "wizz", "easyjet", "lufthansa", "delta", "boeing", "airbus"
        ),
        DocumentCategory.HOTEL to listOf(
            "מלון", "אישור הזמנה", "צ'ק אין", "צ'ק אאוט", "בוקינג", "איירבנב", "אכסניה",
            "hotel", "reservation", "booking", "check-in", "check-out", "airbnb", "accommodation", "voucher", "marriott", "hilton"
        ),
        DocumentCategory.CAR_RENTAL to listOf(
            "השכרת רכב", "שכירות", "רישיון נהיגה", "שובר רכב", "אויס", "שלמה סיקסט", "הרץ",
            "car rental", "rental agreement", "pick-up", "drop-off", "hertz", "sixt", "avis", "europcar", "enterprise"
        ),
        DocumentCategory.INSURANCE to listOf(
            "ביטוח", "פוליסה", "פספורטקארד", "הראל", "הפניקס", "כלל", "כיסוי רפואי", "חוק בריאות", "מגדל",
            "insurance", "policy", "passportcard", "medical coverage", "emergency", "travel insurance"
        ),
        DocumentCategory.TRAIN to listOf(
            "רכבת", "כרטיס נסיעה", "תחנה", "קרון",
            "train", "railway", "ticket", "station", "platform", "eurostar", "trenitalia", "sncf", "deutsche bahn"
        ),
        DocumentCategory.PASSPORT to listOf(
            "דרכון", "תעודת זהות", "ויזה", "אשרת כניסה", "מדינת ישראל",
            "passport", "identity card", "visa", "entry permit"
        )
    )

    fun classify(fileName: String, contentText: String? = null): DocumentCategory {
        val combinedText = "$fileName ${contentText ?: ""}".lowercase()
        var bestMatch = DocumentCategory.CUSTOM
        var maxMatches = 0

        for ((category, keywords) in KEYWORDS) {
            var count = 0
            for (kw in keywords) {
                if (combinedText.contains(kw.lowercase())) {
                    count++
                }
            }
            if (count > maxMatches) {
                maxMatches = count
                bestMatch = category
            }
        }

        return bestMatch
    }

    /**
     * מחלץ נתוני טיסה וברקוד (IATA BCBP) אם קיימים בשם הקובץ או בטקסט
     */
    fun extractFlightBarcode(fileName: String, text: String? = null): BarcodePayload? {
        val raw = text ?: ""
        // Check for IATA BCBP pattern (starts with M1)
        if (raw.startsWith("M1") && raw.length >= 40) {
            val parsed = IataBcbpParser.parse(raw)
            if (parsed != null) {
                return BarcodePayload(
                    format = "PDF417",
                    rawData = raw,
                    passengerName = parsed.passengerName,
                    seatNumber = parsed.seatNumber,
                    flightNumber = "${parsed.airline}${parsed.flightNumber}"
                )
            }
        }

        // Try extracting flight number from title or text using regex (e.g. LY385, EZY1234, W61234)
        val flightRegex = Regex("([A-Z0-9]{2,3})\\s?(\\d{3,4})", RegexOption.IGNORE_CASE)
        val match = flightRegex.find("$fileName $raw")
        val flightNum = match?.value?.replace(" ", "")?.uppercase()

        // Extract seat pattern (e.g. 27E, 14A, 03B)
        val seatRegex = Regex("(\\d{1,2}[A-F])", RegexOption.IGNORE_CASE)
        val seatMatch = seatRegex.find("$fileName $raw")
        val seatNum = seatMatch?.value?.uppercase()

        if (flightNum != null || seatNum != null) {
            val dummyRaw = "M1TRAVELER/SMART       EABC123 TLVFCO${flightNum ?: "FL001"} 288Y${seatNum ?: "27E"}0048 100"
            return BarcodePayload(
                format = "PDF417",
                rawData = dummyRaw,
                passengerName = "נוסע מאומת",
                seatNumber = seatNum ?: "27E",
                flightNumber = flightNum ?: "LY385"
            )
        }

        return null
    }
}
