package com.crecheconnect.service

import android.util.Log
import com.crecheconnect.model.*
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

object FirebaseInitializer {

    private const val TAG = "FirebaseInitializer"

    /**
     * Initialize Firebase with sample data for development/testing
     */
    suspend fun initializeSampleData() {
        val firestore = FirebaseFirestore.getInstance()

        try {
            // Check if events already exist
            val eventsSnapshot = firestore.collection("events").get().await()
            if (eventsSnapshot.isEmpty) {
                Log.d(TAG, "Initializing sample events...")

                // Add sample events in Firebase structure
                val sampleEvents = listOf(
                    mapOf(
                        "title" to "Sports Day",
                        "description" to "Annual sports day for all children",
                        "eventDateTime" to com.google.firebase.Timestamp.now(),
                        "eventID" to java.util.UUID.randomUUID().toString(),
                        "Date" to "",
                        "createByID" to "uuidOfAdmin",
                        "createdAt" to com.google.firebase.Timestamp.now()
                    ),
                    mapOf(
                        "title" to "Parent-Teacher Meeting",
                        "description" to "Monthly meeting to discuss child's progress",
                        "eventDateTime" to com.google.firebase.Timestamp.now(),
                        "eventID" to java.util.UUID.randomUUID().toString(),
                        "Date" to "",
                        "createByID" to "uuidOfAdmin",
                        "createdAt" to com.google.firebase.Timestamp.now()
                    ),
                    mapOf(
                        "title" to "Art Workshop",
                        "description" to "Creative activities for children",
                        "eventDateTime" to com.google.firebase.Timestamp.now(),
                        "eventID" to java.util.UUID.randomUUID().toString(),
                        "Date" to "",
                        "createByID" to "uuidOfAdmin",
                        "createdAt" to com.google.firebase.Timestamp.now()
                    )
                )

                // Add events to Firestore
                sampleEvents.forEach { eventData ->
                    firestore.collection("events")
                        .add(eventData)
                        .await()
                }

                Log.d(TAG, "Sample events initialized successfully")
            } else {
                Log.d(TAG, "Events already exist, skipping initialization")
            }

            // Check if users collection exists and add sample users if needed
            val usersSnapshot = firestore.collection("users").get().await()
            if (usersSnapshot.isEmpty) {
                Log.d(TAG, "Initializing sample users...")

                // Create admin user with Firebase Auth UID
                val adminUser = User(
                    id = 1L,
                    email = "admin@demo.com",
                    name = "System Administrator",
                    role = UserRole.ADMIN,
                    phone = "+1234567890",
                    password = "admin123" // For demo purposes
                )

                firestore.collection("users")
                    .document("1")
                    .set(adminUser)
                    .await()

                // Create parent user
                val parentUser = User(
                    id = 2L,
                    email = "parent@demo.com",
                    name = "Demo Parent",
                    role = UserRole.PARENT,
                    phone = "+1234567891",
                    password = "demo123" // For demo purposes
                )

                firestore.collection("users")
                    .document("2")
                    .set(parentUser)
                    .await()

                Log.d(TAG, "Sample users initialized successfully")
            } else {
                Log.d(TAG, "Users already exist, skipping initialization")
            }

        } catch (e: Exception) {
            Log.e(TAG, "Error initializing sample data", e)
        }
    }

    /**
     * Clear all data from Firebase (use with caution!)
     */
    suspend fun clearAllData() {
        val firestore = FirebaseFirestore.getInstance()

        try {
            Log.w(TAG, "Clearing all Firebase data...")

            // Delete all events
            val eventsSnapshot = firestore.collection("events").get().await()
            eventsSnapshot.documents.forEach { doc ->
                doc.reference.delete().await()
            }

            // Delete all users (except admin users if any)
            val usersSnapshot = firestore.collection("users").get().await()
            usersSnapshot.documents.forEach { doc ->
                doc.reference.delete().await()
            }

            Log.w(TAG, "All Firebase data cleared")

        } catch (e: Exception) {
            Log.e(TAG, "Error clearing data", e)
        }
    }
}
