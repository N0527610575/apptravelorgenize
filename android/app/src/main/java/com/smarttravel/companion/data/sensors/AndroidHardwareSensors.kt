package com.smarttravel.companion.data.sensors

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlin.math.sqrt

/**
 * מנהל חיישן ברומטר (מד לחץ אוויר) של המכשיר.
 * מזהה צניחת לחץ ברומטרי עקב דיחוס תא נוסעים בזמן המראה.
 */
class BarometerSensorManager(context: Context) : SensorEventListener {
    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as? SensorManager
    private val pressureSensor = sensorManager?.getDefaultSensor(Sensor.TYPE_PRESSURE)

    private var baseGroundPressure: Float? = 1013.25f
    private val _currentPressure = MutableStateFlow(1013.25f)
    val currentPressure: StateFlow<Float> = _currentPressure

    private val _isCabinPressurized = MutableStateFlow(false)
    val isCabinPressurized: StateFlow<Boolean> = _isCabinPressurized

    fun start() {
        pressureSensor?.let {
            sensorManager?.registerListener(this, it, SensorManager.SENSOR_DELAY_NORMAL)
        }
    }

    fun stop() {
        sensorManager?.unregisterListener(this)
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event?.sensor?.type == Sensor.TYPE_PRESSURE) {
            val pressure = event.values[0]
            _currentPressure.value = pressure

            if (baseGroundPressure == null) {
                baseGroundPressure = pressure
            } else {
                val drop = (baseGroundPressure ?: 1013.25f) - pressure
                _isCabinPressurized.value = drop >= 30.0f
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

    fun simulatePressure(pressure: Float) {
        _currentPressure.value = pressure
        val drop = (baseGroundPressure ?: 1013.25f) - pressure
        _isCabinPressurized.value = drop >= 30.0f
    }
}

/**
 * מנהל מד תאוצה (Accelerometer) לזיהוי הליכה לעומת ישיבה.
 */
class MotionSensorManager(context: Context) : SensorEventListener {
    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as? SensorManager
    private val accelerometer = sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)

    private val _isWalking = MutableStateFlow(false)
    val isWalking: StateFlow<Boolean> = _isWalking

    private val WALKING_THRESHOLD = 1.3f

    fun start() {
        accelerometer?.let {
            sensorManager?.registerListener(this, it, SensorManager.SENSOR_DELAY_UI)
        }
    }

    fun stop() {
        sensorManager?.unregisterListener(this)
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event?.sensor?.type == Sensor.TYPE_ACCELEROMETER) {
            val x = event.values[0]
            val y = event.values[1]
            val z = event.values[2]
            val magnitude = sqrt((x * x + y * y + z * z).toDouble()).toFloat() / SensorManager.GRAVITY_EARTH
            _isWalking.value = magnitude > WALKING_THRESHOLD
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

    fun simulateWalking(walking: Boolean) {
        _isWalking.value = walking
    }
}
