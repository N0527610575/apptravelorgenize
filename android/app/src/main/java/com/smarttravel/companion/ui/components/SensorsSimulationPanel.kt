package com.smarttravel.companion.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import com.smarttravel.companion.data.model.TravelPhase
import com.smarttravel.companion.ui.theme.AviationBlue
import com.smarttravel.companion.ui.theme.AviationBlueLight

@Composable
fun SensorsSimulationPanel(
    currentPhase: TravelPhase,
    onPhaseSelected: (TravelPhase) -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(16.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "סימולטור חיישנים ומצבי מסע (Live State Machine)",
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp,
                color = Color(0xFF1C1C1E)
            )
            Text(
                text = "בחר שלב כדי לבדוק את תגובת האפליקציה לחיישני המכשיר:",
                fontSize = 11.sp,
                color = Color.Gray,
                modifier = Modifier.padding(top = 2.dp, bottom = 12.dp)
            )

            val phases = listOf(
                Pair(TravelPhase.AT_DEPARTURE_AIRPORT, "🏢 בשדה התעופה (GPS)"),
                Pair(TravelPhase.BOARDING_GATE, "🎫 שער עלייה (ברקוד ענק)"),
                Pair(TravelPhase.FINDING_SEAT, "💺 מציאת מושב (27E)"),
                Pair(TravelPhase.IN_FLIGHT, "✈️ בטיסה (צניחת ברומטר)"),
                Pair(TravelPhase.LANDED_AT_DESTINATION, "🛬 נחיתה ביעד (ניווט)"),
                Pair(TravelPhase.IDLE_PRE_TRIP, "🏠 שגרה / בית")
            )

            phases.chunked(2).forEach { row ->
                Row(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    row.forEach { (phase, label) ->
                        val isSelected = phase == currentPhase
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = if (isSelected) AviationBlue else Color(0xFFF2F2F7),
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(12.dp))
                                .clickable { onPhaseSelected(phase) }
                        ) {
                            Text(
                                text = label,
                                fontSize = 11.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) Color.White else Color(0xFF333333),
                                modifier = Modifier.padding(vertical = 8.dp, horizontal = 6.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}
