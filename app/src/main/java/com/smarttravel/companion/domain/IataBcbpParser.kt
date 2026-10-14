package com.smarttravel.companion.domain

data class ParsedFlightBcbp(
    val passengerName: String,
    val pnr: String,
    val origin: String,
    val destination: String,
    val airline: String,
    val flightNumber: String,
    val seatNumber: String
)

object IataBcbpParser {
    /**
     * מפענח מחרוזת כרטיס טיסה סטנדרטית בתקן IATA BCBP
     */
    fun parse(rawData: String): ParsedFlightBcbp? {
        if (!rawData.startsWith("M") || rawData.length < 52) {
            return null
        }
        return try {
            val rawName = rawData.substring(2, 22).trim()
            val formattedName = formatName(rawName)
            val pnr = rawData.substring(23, 30).trim()
            val origin = rawData.substring(30, 33).trim()
            val destination = rawData.substring(33, 36).trim()
            val airline = rawData.substring(36, 39).trim()
            val flightNumber = rawData.substring(39, 44).trim()
            val rawSeat = rawData.substring(48, 52).trim()
            val cleanSeat = rawSeat.trimStart('0')

            ParsedFlightBcbp(
                passengerName = formattedName,
                pnr = pnr,
                origin = origin,
                destination = destination,
                airline = airline,
                flightNumber = flightNumber,
                seatNumber = cleanSeat
            )
        } catch (e: Exception) {
            null
        }
    }

    private fun formatName(raw: String): String {
        if (!raw.contains("/")) return raw
        val parts = raw.split("/")
        val last = parts.getOrNull(0)?.lowercase()?.replaceFirstChar { it.uppercase() } ?: ""
        val first = parts.getOrNull(1)?.lowercase()?.replaceFirstChar { it.uppercase() } ?: ""
        return "$first $last".trim()
    }
}
