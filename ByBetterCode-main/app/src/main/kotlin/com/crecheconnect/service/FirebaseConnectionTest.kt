package com.crecheconnect.service

import android.util.Log
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

object FirebaseConnectionTest {

    private const val TAG = "FirebaseTest"

    /**
     * Test Firebase connection and basic operations
     */
    suspend fun testConnection(): Boolean {
        return try {
            Log.d(TAG, "Testing Firebase connection...")

            val firestore = FirebaseFirestore.getInstance()

            // Test 1: Basic connection test
            val testCollection = firestore.collection("test_connection")
            val testDoc = testCollection.document("connection_test")

            // Test write
            testDoc.set(mapOf("timestamp" to System.currentTimeMillis())).await()

            // Test read
            val snapshot = testDoc.get().await()
            val data = snapshot.data

            // Test cleanup
            testDoc.delete().await()

            Log.d(TAG, "✅ Firebase connection successful!")
            Log.d(TAG, "Test data: $data")

            true

        } catch (e: Exception) {
            Log.e(TAG, "❌ Firebase connection failed", e)
            false
        }
    }

    /**
     * Test events collection specifically
     */
    suspend fun testEventsCollection(): Boolean {
        return try {
            Log.d(TAG, "Testing events collection...")

            val firestore = FirebaseFirestore.getInstance()

            // Test adding a sample event
            val testEvent = mapOf(
                "title" to "Firebase Test Event",
                "description" to "Testing Firebase connection",
                "date" to "2024-01-01",
                "startTime" to "10:00",
                "endTime" to "11:00",
                "location" to "Test Location",
                "createdBy" to 1L
            )

            val docRef = firestore.collection("events").add(testEvent).await()
            Log.d(TAG, "✅ Successfully added test event with ID: ${docRef.id}")

            // Test reading it back
            val snapshot = docRef.get().await()
            val eventData = snapshot.data
            Log.d(TAG, "✅ Successfully read back event: $eventData")

            // Clean up
            docRef.delete().await()
            Log.d(TAG, "✅ Successfully deleted test event")

            true

        } catch (e: Exception) {
            Log.e(TAG, "❌ Events collection test failed", e)
            false
        }
    }

    /**
     * Run all Firebase tests
     */
    suspend fun runAllTests(): TestResults {
        Log.d(TAG, "🚀 Starting Firebase connection tests...")

        val connectionTest = testConnection()
        val eventsTest = testEventsCollection()

        val results = TestResults(
            connectionSuccessful = connectionTest,
            eventsCollectionWorking = eventsTest,
            overallSuccess = connectionTest && eventsTest
        )

        if (results.overallSuccess) {
            Log.d(TAG, "🎉 All Firebase tests passed!")
        } else {
            Log.e(TAG, "⚠️ Some Firebase tests failed")
        }

        return results
    }
}

data class TestResults(
    val connectionSuccessful: Boolean,
    val eventsCollectionWorking: Boolean,
    val overallSuccess: Boolean
)
