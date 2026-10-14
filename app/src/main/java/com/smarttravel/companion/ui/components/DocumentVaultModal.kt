package com.smarttravel.companion.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.smarttravel.companion.data.model.DocumentCategory
import com.smarttravel.companion.data.model.TravelDocument
import com.smarttravel.companion.domain.IataBcbpParser
import com.smarttravel.companion.ui.theme.AviationBlue
import com.smarttravel.companion.ui.theme.EmeraldGreen

@Composable
fun DocumentVaultModal(
    isOpen: Boolean,
    onClose: () -> Unit,
    documents: List<TravelDocument>,
    onDeleteDoc: (String) -> Unit = {}
) {
    if (!isOpen) return

    var selectedCategory by remember { mutableStateOf<DocumentCategory?>(null) }
    var inspectedDoc by remember { mutableStateOf<TravelDocument?>(null) }

    val filtered = remember(selectedCategory, documents) {
        if (selectedCategory == null) documents else documents.filter { it.category == selectedCategory }
    }

    Dialog(
        onDismissRequest = onClose,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.85f),
            shape = RoundedCornerShape(24.dp),
            color = Color.White
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "כספת מסמכים מקומית (Offline Vault)",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF1C1C1E)
                        )
                        Text(
                            text = "מוצפנת בזיכרון המכשיר • ${documents.size} מסמכים",
                            fontSize = 11.sp,
                            color = EmeraldGreen,
                            fontWeight = FontWeight.Medium
                        )
                    }
                    IconButton(onClick = onClose) {
                        Icon(Icons.Default.Close, contentDescription = "סגור", tint = Color.Gray)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Category filter chips
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    FilterChip(
                        selected = selectedCategory == null,
                        onClick = { selectedCategory = null },
                        label = { Text("הכל (${documents.size})", fontSize = 11.sp) }
                    )
                    FilterChip(
                        selected = selectedCategory == DocumentCategory.FLIGHT,
                        onClick = { selectedCategory = DocumentCategory.FLIGHT },
                        label = { Text("טיסות", fontSize = 11.sp) }
                    )
                    FilterChip(
                        selected = selectedCategory == DocumentCategory.HOTEL,
                        onClick = { selectedCategory = DocumentCategory.HOTEL },
                        label = { Text("מלונות", fontSize = 11.sp) }
                    )
                    FilterChip(
                        selected = selectedCategory == DocumentCategory.CAR_RENTAL,
                        onClick = { selectedCategory = DocumentCategory.CAR_RENTAL },
                        label = { Text("רכב", fontSize = 11.sp) }
                    )
                    FilterChip(
                        selected = selectedCategory == DocumentCategory.INSURANCE,
                        onClick = { selectedCategory = DocumentCategory.INSURANCE },
                        label = { Text("ביטוח", fontSize = 11.sp) }
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Documents list
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(filtered, key = { it.id }) { doc ->
                        Surface(
                            shape = RoundedCornerShape(16.dp),
                            color = Color(0xFFF9F9FB),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = doc.title,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp,
                                        color = Color(0xFF1C1C1E)
                                    )
                                    Row(
                                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                                        modifier = Modifier.padding(top = 2.dp)
                                    ) {
                                        Text(
                                            text = doc.category.name,
                                            fontSize = 10.sp,
                                            color = AviationBlue,
                                            fontWeight = FontWeight.SemiBold
                                        )
                                        if (doc.barcode != null) {
                                            Text(
                                                text = "• ברקוד ${doc.barcode.format}",
                                                fontSize = 10.sp,
                                                color = Color.Gray
                                            )
                                        }
                                    }
                                }

                                Row {
                                    IconButton(onClick = { inspectedDoc = doc }) {
                                        Icon(
                                            Icons.Default.Info,
                                            contentDescription = "פרטים",
                                            tint = AviationBlue
                                        )
                                    }
                                    IconButton(onClick = { onDeleteDoc(doc.id) }) {
                                        Icon(
                                            Icons.Default.Delete,
                                            contentDescription = "מחק",
                                            tint = Color.LightGray
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Inspect Doc Dialog
    inspectedDoc?.let { doc ->
        AlertDialog(
            onDismissRequest = { inspectedDoc = null },
            title = { Text(doc.title, fontWeight = FontWeight.Bold, fontSize = 16.sp) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(text = "קטגוריה: ${doc.category.name}", fontSize = 12.sp)
                    Text(text = "קובץ מקומי: ${doc.localFilePath}", fontSize = 12.sp)
                    doc.barcode?.let { bc ->
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = Color(0xFFE3F2FD),
                            modifier = Modifier.fillMaxWidth().padding(top = 6.dp)
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Text(
                                    text = "פענוח ברקוד (IATA BCBP):",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp,
                                    color = AviationBlue
                                )
                                val parsed = IataBcbpParser.parse(bc.rawData)
                                if (parsed != null) {
                                    Text(text = "שם נוסע: ${parsed.passengerName}", fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                                    Text(text = "קוד PNR: ${parsed.pnr}", fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                                    Text(text = "מסלול: ${parsed.origin} ➔ ${parsed.destination}", fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                                    Text(text = "טיסה: ${parsed.airline}${parsed.flightNumber}", fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                                    Text(text = "מושב: ${parsed.seatNumber}", fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                                } else {
                                    Text(text = bc.rawData, fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { inspectedDoc = null }) {
                    Text("סגור")
                }
            }
        )
    }
}
