package com.smarttravel.companion.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val AviationBlue = Color(0xFF1565C0)
val AviationBlueLight = Color(0xFFE3F2FD)
val SeatHighlight = Color(0xFF007AFF)
val EmeraldGreen = Color(0xFF2E7D32)
val BackgroundLight = Color(0xFFF2F2F7)
val CardBackground = Color(0xFFFFFFFF)

private val LightColorScheme = lightColorScheme(
    primary = AviationBlue,
    onPrimary = Color.White,
    primaryContainer = AviationBlueLight,
    onPrimaryContainer = AviationBlue,
    secondary = SeatHighlight,
    onSecondary = Color.White,
    background = BackgroundLight,
    surface = CardBackground,
    onBackground = Color(0xFF1C1C1E),
    onSurface = Color(0xFF1C1C1E)
)

@Composable
fun SmartTravelTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        content = content
    )
}
