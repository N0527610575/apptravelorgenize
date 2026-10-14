package com.smarttravel.companion.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
        passengers = listOf(
            Passenger("pass_1", "נחמן חסון", "נחמן", isPrimaryUser = true, currentSeatNumber = "27E"),
            Passenger("pass_2", "שולמית חיה", "שולמית", isPrimaryUser = false, currentSeatNumber = "27F")
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

    val currentPassenger = remember(contextState.activePassengerId, trip.passengers) {
        trip.passengers.find { it.id == contextState.activePassengerId } ?: trip.passengers.firstOrNull()
    }

    val activeDocument = remember(currentPassenger) {
        currentPassenger?.let { p ->
            TravelDocument(
                id = "doc_${p.id}",
                tripId = trip.id,
                passengerId = p.id,
                title = "כרטיס עלייה למטוס - ${p.shortName}",
                category = DocumentCategory.FLIGHT,
                localFilePath = "boarding_pass.pdf",
                barcode = BarcodePayload(
                    format = "PDF417",
                    rawData = "M1${p.fullName.uppercase().replace(" ", "/")}/EABC123 TLVFCOLY 0385 288Y0${p.currentSeatNumber}0048 100",
                    passengerName = p.fullName,
                    seatNumber = p.currentSeatNumber,
                    flightNumber = "LY385"
                )
            )
        }
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

            // Wayfinding Modal / Button
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
    }
}
