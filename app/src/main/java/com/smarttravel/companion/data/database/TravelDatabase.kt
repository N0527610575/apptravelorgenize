package com.smarttravel.companion.data.database

import android.content.Context
import androidx.room.*
import com.smarttravel.companion.data.model.DocumentCategory
import com.smarttravel.companion.data.model.TravelDocument
import com.smarttravel.companion.data.model.Trip
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "trips")
data class TripEntity(
    @PrimaryKey val id: String,
    val title: String,
    val encryptedPayload: String,
    val isActive: Boolean
)

@Entity(tableName = "documents")
data class DocumentEntity(
    @PrimaryKey val id: String,
    val tripId: String,
    val category: String,
    val encryptedPayload: String
)

@Dao
interface TripDao {
    @Query("SELECT * FROM trips WHERE isActive = 1 LIMIT 1")
    suspend fun getActiveTrip(): TripEntity?

    @Query("SELECT * FROM trips")
    fun getAllTrips(): Flow<List<TripEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTrip(trip: TripEntity)

    @Delete
    suspend fun deleteTrip(trip: TripEntity)
}

@Dao
interface DocumentDao {
    @Query("SELECT * FROM documents WHERE tripId = :tripId")
    fun getDocumentsByTrip(tripId: String): Flow<List<DocumentEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDocument(doc: DocumentEntity)

    @Query("DELETE FROM documents WHERE id = :id")
    suspend fun deleteDocumentById(id: String)
}

@Database(entities = [TripEntity::class, DocumentEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun tripDao(): TripDao
    abstract fun documentDao(): DocumentDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "smart_travel_companion.db"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}

/**
 * מנהל ההצפנה המקומי של הכספת (Local Encrypted Vault)
 */
object VaultCrypto {
    private const val VAULT_KEY = "SmartTravelVault_Encrypted_Offline_Key_2026"

    fun encrypt(plainText: String): String {
        val bytes = plainText.toByteArray(Charsets.UTF_8)
        val keyBytes = VAULT_KEY.toByteArray(Charsets.UTF_8)
        val encrypted = ByteArray(bytes.size)
        for (i in bytes.indices) {
            encrypted[i] = (bytes[i].toInt() xor keyBytes[i % keyBytes.size].toInt()).toByte()
        }
        return "enc_v1:" + encrypted.joinToString(".") { it.toString() }
    }

    fun decrypt(cipherText: String): String {
        if (!cipherText.startsWith("enc_v1:")) return cipherText
        val parts = cipherText.substring(7).split(".")
        val keyBytes = VAULT_KEY.toByteArray(Charsets.UTF_8)
        val decrypted = ByteArray(parts.size)
        for (i in parts.indices) {
            val byteVal = parts[i].toIntOrNull() ?: 0
            decrypted[i] = (byteVal xor keyBytes[i % keyBytes.size].toInt()).toByte()
        }
        return String(decrypted, Charsets.UTF_8)
    }
}
