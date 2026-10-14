package com.smarttravel.companion.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smarttravel.companion.data.model.FlightLeg
import com.smarttravel.companion.ui.theme.EmeraldGreen

@Composable
fun FlightStatusBanner(
    flightLeg: FlightLeg?,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 6.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.horizontalGradient(
                        colors = listOf(Color(0xFF0D47A1), Color(0xFF1E88E5))
                    )
                )
                .padding(16.dp)
        ) {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = flightLeg?.flightNumber ?: "LY385",
                                color = Color.White,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = EmeraldGreen.copy(alpha = 0.25f)
                            ) {
                                Text(
                                    text = "בזמן (ON TIME)",
                                    color = Color(0xFFA5D6A7),
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                        Text(
                            text = "${flightLeg?.origin?.name ?: "נתב״ג (TLV)"} ➔ ${flightLeg?.destination?.name ?: "רומא (FCO)"}",
                            color = Color(0xFFBBDEFB),
                            fontSize = 12.sp,
                            modifier = Modifier.padding(top = 2.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    StatusItem(title = "שער עלייה", value = flightLeg?.gate ?: "B22", valueColor = Color(0xFFFFD54F))
                    StatusItem(title = "המראה", value = "10:00", valueColor = Color.White)
                    StatusItem(title = "איסוף כבודה", value = flightLeg?.baggageBelt ?: "מסוע 8", valueColor = Color(0xFF81C784))
                }
            }
        }
    }
}

@Composable
private fun StatusItem(
    title: String,
    value: String,
    valueColor: Color
) {
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = Color.White.copy(alpha = 0.1f)
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = title, fontSize = 10.sp, color = Color(0xFFE3F2FD))
            Text(
                text = value,
                fontSize = 15.sp,
                fontWeight = FontWeight.Black,
                fontFamily = FontFamily.Monospace,
                color = valueColor,
                modifier = Modifier.padding(top = 2.dp)
            )
        }
    }
}
