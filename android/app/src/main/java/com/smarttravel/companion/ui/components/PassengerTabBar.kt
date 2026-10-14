package com.smarttravel.companion.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smarttravel.companion.data.model.Passenger
import com.smarttravel.companion.ui.theme.AviationBlue
import com.smarttravel.companion.ui.theme.EmeraldGreen

@Composable
fun PassengerTabBar(
    passengers: List<Passenger>,
    activePassengerId: String,
    onPassengerSelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    if (passengers.isEmpty()) return

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 6.dp)
    ) {
        Text(
            text = "מעבר מהיר בין כרטיסי נוסעים (${passengers.size})",
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Gray,
            modifier = Modifier.padding(bottom = 6.dp)
        )

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            passengers.forEach { passenger ->
                val isSelected = passenger.id == activePassengerId

                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = if (isSelected) AviationBlue else Color.White,
                    shadowElevation = if (isSelected) 4.dp else 1.dp,
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .clickable { onPassengerSelected(passenger.id) }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = passenger.shortName,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isSelected) Color.White else Color(0xFF1C1C1E)
                                )
                                if (passenger.isPrimaryUser) {
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Box(
                                        modifier = Modifier
                                            .size(8.dp)
                                            .clip(CircleShape)
                                            .padding(top = 1.dp)
                                    ) {
                                        Surface(
                                            color = if (isSelected) Color(0xFFA5D6A7) else EmeraldGreen,
                                            shape = CircleShape,
                                            modifier = Modifier.fillMaxSize()
                                        ) {}
                                    }
                                }
                            }
                            Text(
                                text = "מושב ${passenger.currentSeatNumber}",
                                fontSize = 11.sp,
                                color = if (isSelected) Color(0xFFBBDEFB) else Color.Gray
                            )
                        }
                    }
                }
            }
        }
    }
}
