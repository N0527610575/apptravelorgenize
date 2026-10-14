package com.smarttravel.companion.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smarttravel.companion.data.model.*
import com.smarttravel.companion.domain.ContextStateMachine
import com.smarttravel.companion.ui.components.*
import com.smarttravel.companion.ui.theme.AviationBlue
import com.smarttravel.companion.ui.theme.BackgroundLight
import com.smarttravel.companion.ui.theme.EmeraldGreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainCompanionScreen(
    trip: Trip = Trip(
        id = "trip_rome",
        title = "חופשה ברומא",
        flights = listOf(
            FlightLeg(
                flightNumber = "LY385",
                airline = "אל על (EL AL)",
                origin = AirportLocation("TLV", "נתב״ג טרמינל 3", "3"),
                destination = AirportLocation("FCO", "רומא פיומיצ׳ינו", "1"),
                scheduledDeparture = "2026-10-15T10:00:00Z",
                scheduledArrival = "2026-10-15T13:45:00Z",
                gate = "B22",
                baggageBelt = "מסוע 8"
            )
        ),
        passengers = listOf(
            Passenger("pass_1", "נחמן חסון", "נחמן", isPrimaryUser = true, currentSeatNumber = "27E"),
            Passenger("pass_2", "שולמית חיה", "שולמית", isPrimaryUser = false, currentSeatNumber = "27F")
        ),
        documents = listOf(
            TravelDocument(
                id = "doc_pass_1",
                tripId = "trip_rome",
                passengerId = "pass_1",
                title = "כרטיס עלייה למטוס - נחמן",
                category = DocumentCategory.FLIGHT,
                localFilePath = "boarding_pass_nachman.pdf",
                barcode = BarcodePayload(
                    format = "PDF417",
                    rawData = "M1HASSON/NACHMAN       EABC123 TLVFCOLY 0385 288Y027E0048 100",
                    passengerName = "Nachman Hasson",
                    seatNumber = "27E",
                    flightNumber = "LY385"
                )
            ),
            TravelDocument(
                id = "doc_pass_2",
                tripId = "trip_rome",
                passengerId = "pass_2",
                title = "כרטיס עלייה למטוס - שולמית",
                category = DocumentCategory.FLIGHT,
                localFilePath = "boarding_pass_shulamit.pdf",
                barcode = BarcodePayload(
                    format = "PDF417",
                    rawData = "M1HAYA/SHULAMIT       EABC123 TLVFCOLY 0385 288Y027F0049 100",
                    passengerName = "Shulamit Haya",
                    seatNumber = "27F",
                    flightNumber = "LY385"
                )
            ),
            TravelDocument(
                id = "doc_hotel_rome",
                tripId = "trip_rome",
                title = "אישור הזמנה - Rome Marriott Hotel",
                category = DocumentCategory.HOTEL,
                localFilePath = "marriott_voucher.pdf"
            ),
            TravelDocument(
                id = "doc_insurance",
                tripId = "trip_rome",
                title = "פוליסת ביטוח PassportCard",
                category = DocumentCategory.INSURANCE,
                localFilePath = "passportcard_policy.pdf"
            )
        )
    )
) {
    val stateMachine = remember { ContextStateMachine(trip.id) }
    var contextState by remember {
        mutableStateOf(
            ContextState(
                currentPhase = TravelPhase.BOARDING_GATE,
                activePassengerId = trip.passengers.firstOrNull()?.id ?: "pass_1",
                highlightedSeat = trip.passengers.firstOrNull()?.currentSeatNumber ?: "27E",
                isBarcodeHeroVisible = true,
                toastMessage = "שער העלייה נפתח. נא להכין דרכונים וכרטיסים פתוחים."
            )
        )
    }

    var isVaultOpen by remember { mutableStateOf(false) }

    val currentPassenger = remember(contextState.activePassengerId, trip.passengers) {
        trip.passengers.find { it.id == contextState.activePassengerId } ?: trip.passengers.firstOrNull()
    }

    val activeDocument = remember(currentPassenger, trip.documents) {
        trip.documents.find { it.category == DocumentCategory.FLIGHT && it.passengerId == currentPassenger?.id }
            ?: trip.documents.firstOrNull()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = trip.title,
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF1C1C1E)
                        )
                        Text(
                            text = "כספת מקומית מוצפנת • טיסה LY385",
                            fontSize = 11.sp,
                            color = AviationBlue,
                            fontWeight = FontWeight.Medium
                        )
                    }
                },
                actions = {
                    FilledTonalButton(
                        onClick = { isVaultOpen = true },
                        shape = RoundedCornerShape(12.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Icon(
                            Icons.Default.Folder,
                            contentDescription = "כספת",
                            modifier = Modifier.size(16.dp),
                            tint = AviationBlue
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("כספת (${trip.documents.size})", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        },
        containerColor = BackgroundLight
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Toast / Context Banner
            contextState.toastMessage?.let { toast ->
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Color(0xFF1C1C1E),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = toast,
                            fontSize = 12.sp,
                            color = Color.White,
                            fontWeight = FontWeight.Medium,
                            modifier = Modifier.weight(1f)
                        )
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = Color(0xFF333333)
                        ) {
                            Text(
                                text = contextState.currentPhase.name,
                                fontSize = 9.sp,
                                color = Color(0xFFCCCCCC),
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                }
            }

            // Live Flight Status
            FlightStatusBanner(flightLeg = trip.flights.firstOrNull())

            // Hero Card
            HeroDisplayCard(
                contextState = contextState.copy(highlightedSeat = currentPassenger?.currentSeatNumber),
                activeDocument = activeDocument,
                onToggleBarcode = {
                    contextState = contextState.copy(isBarcodeHeroVisible = !contextState.isBarcodeHeroVisible)
                }
            )

            // Passenger Tab Row
            PassengerTabBar(
                passengers = trip.passengers,
                activePassengerId = contextState.activePassengerId,
                onPassengerSelected = { passId ->
                    val selected = trip.passengers.find { it.id == passId }
                    contextState = contextState.copy(
                        activePassengerId = passId,
                        highlightedSeat = selected?.currentSeatNumber
                    )
                }
            )

            // Wayfinding Modal
            WayfindingModal(
                currentPhase = contextState.currentPhase,
                targetName = "Rome Marriott Hotel",
                targetAddress = "Via Veneto 125, Rome, Italy"
            )

            // Sensor Simulator & Phase Transitions
            SensorsSimulationPanel(
                currentPhase = contextState.currentPhase,
                onPhaseSelected = { phase ->
                    val newState = stateMachine.setPhase(phase)
                    contextState = newState.copy(
                        activePassengerId = contextState.activePassengerId,
                        highlightedSeat = currentPassenger?.currentSeatNumber
                    )
                }
            )

            Spacer(modifier = Modifier.height(20.dp))
        }

        // Document Vault Dialog
        DocumentVaultModal(
            isOpen = isVaultOpen,
            onClose = { isVaultOpen = false },
            documents = trip.documents
        )
    }
}
