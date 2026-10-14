package com.smarttravel.companion.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smarttravel.companion.data.model.ContextState
import com.smarttravel.companion.data.model.TravelDocument
import com.smarttravel.companion.ui.theme.AviationBlue
import com.smarttravel.companion.ui.theme.AviationBlueLight
import com.smarttravel.companion.ui.theme.EmeraldGreen
import com.smarttravel.companion.ui.theme.SeatHighlight

@Composable
fun HeroDisplayCard(
    contextState: ContextState,
    activeDocument: TravelDocument?,
    modifier: Modifier = Modifier,
    onToggleBarcode: () -> Unit = {}
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = activeDocument?.title ?: "כרטיס עלייה למטוס",
                    fontWeight = FontWeight.Bold,
                    fontSize = 17.sp,
                    color = Color(0xFF1C1C1E)
                )
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFFE8F5E9)
                ) {
                    Text(
                        text = "מאובטח Offline",
                        color = EmeraldGreen,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Body
            if (contextState.isBarcodeHeroVisible && activeDocument?.barcode != null) {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = AviationBlueLight
                ) {
                    Text(
                        text = "הצג לסריקה בעמדת השער",
                        color = AviationBlue,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                Box(
                    modifier = Modifier
                        .size(200.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color(0xFFFAFAFA))
                        .border(2.dp, AviationBlue.copy(alpha = 0.3f), RoundedCornerShape(16.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "[ QR / BCBP BARCODE ]",
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace,
                            color = Color.DarkGray
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = activeDocument.barcode.flightNumber ?: "LY385",
                            fontWeight = FontWeight.Black,
                            fontSize = 20.sp,
                            color = AviationBlue
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "מושב: ${activeDocument.barcode.seatNumber ?: contextState.highlightedSeat ?: "27E"}",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = SeatHighlight
                    )
                    Text(text = "•", color = Color.Gray)
                    Text(
                        text = "תקן IATA BCBP",
                        fontSize = 12.sp,
                        color = Color.Gray
                    )
                }
            } else if (contextState.highlightedSeat != null) {
                Text(
                    text = "המושב שלך במטוס",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Gray,
                    letterSpacing = 1.sp
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = contextState.highlightedSeat,
                    fontSize = 92.sp,
                    fontWeight = FontWeight.Black,
                    fontFamily = FontFamily.Monospace,
                    color = SeatHighlight,
                    textAlign = TextAlign.Center
                )

                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFFF2F2F7)
                ) {
                    Text(
                        text = "תא עליון מעל השורה • גישה ישירה לשרוול",
                        fontSize = 12.sp,
                        color = Color(0xFF555555),
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                    )
                }
            } else {
                Text(
                    text = "המסמך שמור ומוכן לשימוש בכספת המקומית",
                    fontSize = 14.sp,
                    color = Color.Gray,
                    textAlign = TextAlign.Center
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            TextButton(onClick = onToggleBarcode) {
                Text(
                    text = if (contextState.isBarcodeHeroVisible) "⇄ הצג מספר מושב" else "⇄ הצג ברקוד לסריקה",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = AviationBlue
                )
            }
        }
    }
}
