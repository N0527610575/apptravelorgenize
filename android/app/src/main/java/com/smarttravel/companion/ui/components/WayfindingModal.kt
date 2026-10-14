package com.smarttravel.companion.ui.components

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smarttravel.companion.data.model.TravelPhase
import com.smarttravel.companion.ui.theme.AviationBlue
import com.smarttravel.companion.ui.theme.EmeraldGreen

@Composable
fun WayfindingModal(
    currentPhase: TravelPhase,
    targetName: String = "Rome Marriott Hotel",
    targetAddress: String = "Via Veneto 125, Rome, Italy",
    latitude: Double = 41.9069,
    longitude: Double = 12.4916,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var showDialog by remember { mutableStateOf(false) }

    val isEligible = currentPhase == TravelPhase.LANDED_AT_DESTINATION || currentPhase == TravelPhase.POST_TRIP

    if (!isEligible) return

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Button(
            onClick = { showDialog = true },
            colors = ButtonDefaults.buttonColors(containerColor = EmeraldGreen),
            shape = RoundedCornerShape(20.dp),
            modifier = Modifier.fillMaxWidth().height(52.dp)
        ) {
            Text(
                text = "איך להגיע ליעד שלך? (ניווט והתמצאות)",
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp,
                color = Color.White
            )
        }
    }

    if (showDialog) {
        AlertDialog(
            onDismissRequest = { showDialog = false },
            title = {
                Text(
                    text = "ניווט והתמצאות ביעד",
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp
                )
            },
            text = {
                Column {
                    Text(
                        text = "היעד הבא שלך:",
                        fontSize = 12.sp,
                        color = Color.Gray
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = targetName,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = Color(0xFF1C1C1E)
                    )
                    Text(
                        text = targetAddress,
                        fontSize = 13.sp,
                        color = Color.DarkGray
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val gmmIntentUri = Uri.parse("geo:$latitude,$longitude?q=${Uri.encode(targetAddress)}")
                        val mapIntent = Intent(Intent.ACTION_VIEW, gmmIntentUri).apply {
                            setPackage("com.google.android.apps.maps")
                        }
                        try {
                            context.startActivity(mapIntent)
                        } catch (e: Exception) {
                            val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.google.com/maps/search/?api=1&query=${Uri.encode(targetAddress)}"))
                            context.startActivity(browserIntent)
                        }
                        showDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AviationBlue)
                ) {
                    Text("פתח ניווט (Google Maps)")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDialog = false }) {
                    Text("סגור")
                }
            }
        )
    }
}
