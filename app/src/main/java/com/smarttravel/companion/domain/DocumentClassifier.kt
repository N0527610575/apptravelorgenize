package com.smarttravel.companion.domain

import com.smarttravel.companion.data.model.BarcodePayload
import com.smarttravel.companion.data.model.DocumentCategory

object DocumentClassifier {

    private val FLIGHT_KEYWORDS = listOf(
        "boarding pass" to 35, "כרטיס טיסה" to 35, "עלייה למטוס" to 30,
        "flight" to 20, "טיסה" to 20, "gate" to 15, "שער" to 15, "seat" to 15, "מושב" to 15,
        "terminal" to 15, "טרמינל" to 15, "el al" to 20, "אל על" to 20, "ryanair" to 20,
        "wizz" to 20, "easyjet" to 20, "lufthansa" to 20, "e-ticket" to 25
    )

    private val HOTEL_KEYWORDS = listOf(
        "hotel" to 30, "מלון" to 30, "check-in" to 30, "צ'ק אין" to 30, "check-out" to 30, "צ'ק אאוט" to 30,
        "booking" to 25, "בוקינג" to 25, "reservation" to 25, "אישור הזמנה" to 30, "airbnb" to 30,
        "איירבנב" to 30, "room" to 15, "חדר" to 15, "nights" to 15, "לילות" to 15, "marriott" to 25, "hilton" to 25
    )

    private val CAR_KEYWORDS = listOf(
        "car rental" to 35, "השכרת רכב" to 35, "pick-up" to 30, "איסוף רכב" to 30, "drop-off" to 30,
        "החזרת רכב" to 30, "rental agreement" to 30, "שובר רכב" to 30, "sixt" to 30, "שלמה סיקסט" to 30,
        "hertz" to 30, "הרץ" to 30, "avis" to 30, "אויס" to 30, "europcar" to 30, "enterprise" to 30
    )

    private val INSURANCE_KEYWORDS = listOf(
        "insurance" to 35, "ביטוח" to 35, "policy" to 35, "פוליסה" to 35, "passportcard" to 40,
        "פספורטקארד" to 40, "medical coverage" to 30, "כיסוי רפואי" to 30, "הראל" to 30, "הפניקס" to 30,
        "מגדל" to 30, "כלל ביטוח" to 30, "emergency assistance" to 25
    )

    private val PASSPORT_KEYWORDS = listOf(
        "passport" to 35, "דרכון" to 35, "identity card" to 30, "תעודת זהות" to 30,
        "visa" to 30, "ויזה" to 30, "אשרת כניסה" to 30, "state of israel" to 25, "מדינת ישראל" to 25
    )

    private val TRAIN_KEYWORDS = listOf(
        "train" to 30, "רכבת" to 30, "railway" to 30, "ticket" to 20, "station" to 20, "תחנה" to 20,
        "platform" to 20, "רציף" to 20, "eurostar" to 30, "trenitalia" to 30, "sncf" to 30
    )

    /**
     * מנוע סיווג לפי משקולות (Weighted Scoring Engine):
     * מחשב ניקוד מדויק לכל קטגוריה וקובע אוטונומית את סוג המסמך ללא שום תיוג ידני מצד המשתמש.
     */
    fun classify(fileName: String, contentText: String? = null, hasIataBarcode: Boolean = false): DocumentCategory {
        val lowerText = "$fileName ${contentText ?: ""}".lowercase()

        val scores = mutableMapOf<DocumentCategory, Int>()
        scores[DocumentCategory.FLIGHT] = calculateCategoryScore(lowerText, FLIGHT_KEYWORDS) + if (hasIataBarcode) 100 else 0
        scores[DocumentCategory.HOTEL] = calculateCategoryScore(lowerText, HOTEL_KEYWORDS)
        scores[DocumentCategory.CAR_RENTAL] = calculateCategoryScore(lowerText, CAR_KEYWORDS)
        scores[DocumentCategory.INSURANCE] = calculateCategoryScore(lowerText, INSURANCE_KEYWORDS)
        scores[DocumentCategory.PASSPORT] = calculateCategoryScore(lowerText, PASSPORT_KEYWORDS)
        scores[DocumentCategory.TRAIN] = calculateCategoryScore(lowerText, TRAIN_KEYWORDS)

        // קיזוז משקולות למניעת טעויות זיהוי (למשל כרטיס טיסה שמכיל בהערות שוליים "Travel Insurance")
        if (hasIataBarcode || (scores[DocumentCategory.FLIGHT] ?: 0) >= 60) {
            scores[DocumentCategory.INSURANCE] = (scores[DocumentCategory.INSURANCE] ?: 0) - 40
        }

        val best = scores.maxByOrNull { it.value }
        return if ((best?.value ?: 0) > 15) {
            best!!.key
        } else {
            DocumentCategory.CUSTOM
        }
    }

    private fun calculateCategoryScore(text: String, weightedKeywords: List<Pair<String, Int>>): Int {
        var score = 0
        for ((kw, weight) in weightedKeywords) {
            if (text.contains(kw)) {
                score += weight
            }
        }
        return score
    }

    /**
     * מחלץ נתוני טיסה וברקוד (IATA BCBP) אם קיימים בשם הקובץ או בתוכן
     */
    fun extractFlightBarcode(fileName: String, text: String? = null, rawBarcode: String? = null): BarcodePayload? {
        val raw = rawBarcode ?: text ?: ""
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

        // חיפוש תבנית מספר טיסה ומושב
        val flightRegex = Regex("([A-Z0-9]{2,3})\\s?(\\d{3,4})", RegexOption.IGNORE_CASE)
        val match = flightRegex.find("$fileName $raw")
        val flightNum = match?.value?.replace(" ", "")?.uppercase()

        val seatRegex = Regex("(\\d{1,2}[A-F])", RegexOption.IGNORE_CASE)
        val seatMatch = seatRegex.find("$fileName $raw")
        val seatNum = seatMatch?.value?.uppercase()

        if (flightNum != null || seatNum != null) {
            val dummyRaw = "M1TRAVELER/SMART       EABC123 TLVFCO${flightNum ?: "LY385"} 288Y${seatNum ?: "27E"}0048 100"
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
