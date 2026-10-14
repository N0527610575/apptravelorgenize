package com.smarttravel.companion.domain

import com.smarttravel.companion.data.model.ContextState
import com.smarttravel.companion.data.model.TravelPhase

data class SensorInputs(
    val isAtAirport: Boolean,
    val minutesToDeparture: Int,
    val isPressureDropped: Boolean,
    val isWalking: Boolean
)

class ContextStateMachine(private val tripId: String = "trip_rome") {
    private var state = ContextState(activeTripId = tripId)

    fun evaluate(inputs: SensorInputs): ContextState {
        val prev = state.currentPhase
        var next = prev

        if (inputs.isPressureDropped) {
            next = TravelPhase.IN_FLIGHT
        } else if (prev == TravelPhase.IN_FLIGHT && !inputs.isPressureDropped) {
            next = TravelPhase.LANDED_AT_DESTINATION
        } else if (inputs.isAtAirport) {
            if (inputs.minutesToDeparture in 1..45) {
                next = TravelPhase.BOARDING_GATE
            } else if (inputs.minutesToDeparture <= 0 && !inputs.isWalking) {
                next = TravelPhase.FINDING_SEAT
            } else {
                next = TravelPhase.AT_DEPARTURE_AIRPORT
            }
        } else {
            next = TravelPhase.IDLE_PRE_TRIP
        }

        val (isBarcode, toast) = when (next) {
            TravelPhase.BOARDING_GATE -> Pair(true, "שער העלייה נפתח. נא להכין דרכונים וכרטיסים פתוחים.")
            TravelPhase.FINDING_SEAT -> Pair(false, "טיסה נעימה. מספר המושב שלך מוצג על המסך.")
            TravelPhase.IN_FLIGHT -> Pair(false, "מצב טיסה פעיל (דיחוס תא נוסעים). נעדכן בנחיתה.")
            TravelPhase.LANDED_AT_DESTINATION -> Pair(false, "ברוכים הבאים ליעד! לחץ כאן להוראות הגעה למלון.")
            TravelPhase.AT_DEPARTURE_AIRPORT -> Pair(false, "הגעת לשדה התעופה. בורדינג ייפתח 45 דק׳ לפני ההמראה.")
            TravelPhase.WALKING_JET_BRIDGE -> Pair(false, "הליכה בשרוול אל המטוס. מושבך ממתין בשורה 27.")
            else -> Pair(false, null)
        }

        state = state.copy(
            currentPhase = next,
            isBarcodeHeroVisible = isBarcode,
            toastMessage = toast,
            isMoving = inputs.isWalking
        )

        return state
    }

    fun setPhase(phase: TravelPhase): ContextState {
        val (isBarcode, toast) = when (phase) {
            TravelPhase.BOARDING_GATE -> Pair(true, "שער העלייה נפתח. נא להכין דרכונים וכרטיסים פתוחים.")
            TravelPhase.FINDING_SEAT -> Pair(false, "טיסה נעימה. מספר המושב שלך מוצג על המסך.")
            TravelPhase.IN_FLIGHT -> Pair(false, "מצב טיסה פעיל. נעדכן בנחיתה.")
            TravelPhase.LANDED_AT_DESTINATION -> Pair(false, "ברוכים הבאים ליעד! לחץ כאן להוראות הגעה.")
            TravelPhase.WALKING_JET_BRIDGE -> Pair(false, "הליכה בשרוול אל המטוס.")
            TravelPhase.AT_DEPARTURE_AIRPORT -> Pair(false, "הגעת לשדה התעופה.")
            else -> Pair(false, null)
        }
        state = state.copy(
            currentPhase = phase,
            isBarcodeHeroVisible = isBarcode,
            toastMessage = toast
        )
        return state
    }
}
