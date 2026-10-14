package com.smarttravel.companion.data.model

enum class TravelPhase {
    IDLE_PRE_TRIP,
    AT_DEPARTURE_AIRPORT,
    BOARDING_GATE,
    WALKING_JET_BRIDGE,
    FINDING_SEAT,
    IN_FLIGHT,
    LANDED_AT_DESTINATION,
    POST_TRIP
}

enum class DocumentCategory {
    FLIGHT,
    HOTEL,
    CAR_RENTAL,
    INSURANCE,
    TRAIN,
    PASSPORT,
    CUSTOM
}

data class BarcodePayload(
    val format: String = "PDF417",
    val rawData: String,
    val passengerName: String? = null,
    val seatNumber: String? = null,
    val flightNumber: String? = null
)

data class TravelDocument(
    val id: String,
    val tripId: String,
    val passengerId: String? = null,
    val title: String,
    val category: DocumentCategory,
    val localFilePath: String,
    val mimeType: String = "application/pdf",
    val barcode: BarcodePayload? = null,
    val isArchived: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)

data class Passenger(
    val id: String,
    val fullName: String,
    val shortName: String,
    val isPrimaryUser: Boolean = false,
    val currentSeatNumber: String = "27E",
    val passportNumber: String? = null
)

data class AirportLocation(
    val code: String,
    val name: String,
    val terminal: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null
)

data class FlightLeg(
    val flightNumber: String,
    val airline: String,
    val origin: AirportLocation,
    val destination: AirportLocation,
    val scheduledDeparture: String,
    val scheduledArrival: String,
    val gate: String? = "B22",
    val baggageBelt: String? = "מסוע 8"
)

data class Trip(
    val id: String,
    val title: String,
    val isActive: Boolean = true,
    val flights: List<FlightLeg> = emptyList(),
    val passengers: List<Passenger> = emptyList(),
    val documents: List<TravelDocument> = emptyList()
)

data class ContextState(
    val currentPhase: TravelPhase = TravelPhase.BOARDING_GATE,
    val activeTripId: String = "trip_rome",
    val activePassengerId: String = "pass_1",
    val toastMessage: String? = "שער העלייה נפתח. נא להכין דרכונים וכרטיסים פתוחים.",
    val highlightedSeat: String? = "27E",
    val isBarcodeHeroVisible: Boolean = true,
    val isMoving: Boolean = false,
    val currentPressure: Float = 1013.25f
)
