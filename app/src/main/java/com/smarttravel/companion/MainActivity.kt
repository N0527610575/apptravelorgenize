package com.smarttravel.companion

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.smarttravel.companion.ui.screens.MainCompanionScreen
import com.smarttravel.companion.ui.theme.SmartTravelTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SmartTravelTheme {
                MainCompanionScreen()
            }
        }
    }
}
