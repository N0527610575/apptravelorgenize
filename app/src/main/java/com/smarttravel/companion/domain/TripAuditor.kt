package com.smarttravel.companion.domain

import com.smarttravel.companion.data.model.DocumentCategory
import com.smarttravel.companion.data.model.Passenger
import com.smarttravel.companion.data.model.TravelDocument
import com.smarttravel.companion.data.model.Trip

data class MissingDocumentAlert(
    val title: String,
    val description: String,
    val category: DocumentCategory,
    val isCritical: Boolean
)

data class TripAuditReport(
    val isComplete: Boolean,
    val missingAlerts: List<MissingDocumentAlert>,
    val readinessPercentage: Int
)

object TripAuditor {

    /**
     * מבצע ביקורת אוטונומית של כל מסמכי הטיול מול רשימת הנוסעים:
     * ורק כאשר חסר מסמך חיוני — מפיק התראה ממוקדת כדי למנוע הפתעות ברגע האמת.
     */
    fun audit(trip: Trip, documents: List<TravelDocument>, passengers: List<Passenger>): TripAuditReport {
        val alerts = mutableListOf<MissingDocumentAlert>()
        var totalRequirements = 0
        var satisfiedRequirements = 0

        // 1. בדיקת כרטיס טיסה לכל נוסע ברשימה
        for (passenger in passengers) {
            totalRequirements++
            val hasFlightTicket = documents.any {
                it.category == DocumentCategory.FLIGHT &&
                (it.passengerId == passenger.id || it.title.contains(passenger.shortName, ignoreCase = true) || it.title.contains(passenger.fullName, ignoreCase = true))
            }

            if (!hasFlightTicket) {
                alerts.add(
                    MissingDocumentAlert(
                        title = "חסר כרטיס עלייה למטוס עבור ${passenger.fullName}",
                        description = "לא אותר כרטיס טיסה או ברקוד מקושר לנוסע זה",
                        category = DocumentCategory.FLIGHT,
                        isCritical = true
                    )
                )
            } else {
                satisfiedRequirements++
            }
        }

        // 2. בדיקת פוליסת ביטוח נסיעות
        totalRequirements++
        val hasInsurance = documents.any { it.category == DocumentCategory.INSURANCE }
        if (!hasInsurance) {
            alerts.add(
                MissingDocumentAlert(
                    title = "חסרה פוליסת ביטוח נסיעות לחו״ל",
                    description = "לא אותר מסמך ביטוח רפואי או כרטיס PassportCard לנסיעה זו",
                    category = DocumentCategory.INSURANCE,
                    isCritical = true
                )
            )
        } else {
            satisfiedRequirements++
        }

        // 3. בדיקת אישור מלון / לינה ביעד
        totalRequirements++
        val hasHotel = documents.any { it.category == DocumentCategory.HOTEL }
        if (!hasHotel) {
            alerts.add(
                MissingDocumentAlert(
                    title = "חסר שובר הזמנת מלון / לינה",
                    description = "לא אותר אישור הזמנה (Booking / Airbnb / Hotel)",
                    category = DocumentCategory.HOTEL,
                    isCritical = false
                )
            )
        } else {
            satisfiedRequirements++
        }

        // 4. בדיקת דרכונים
        totalRequirements++
        val hasPassport = documents.any { it.category == DocumentCategory.PASSPORT }
        if (!hasPassport) {
            alerts.add(
                MissingDocumentAlert(
                    title = "מומלץ להעלות צילום דרכון / זיהוי",
                    description = "שמירת צילום דרכון בכספת ה-Offline מסייעת במקרה של אובדן",
                    category = DocumentCategory.PASSPORT,
                    isCritical = false
                )
            )
        } else {
            satisfiedRequirements++
        }

        val percentage = if (totalRequirements > 0) {
            (satisfiedRequirements * 100) / totalRequirements
        } else 100

        return TripAuditReport(
            isComplete = alerts.none { it.isCritical },
            missingAlerts = alerts,
            readinessPercentage = percentage
        )
    }
}
