package com.crecheconnect

import android.app.Application
import android.util.Log
import com.google.firebase.FirebaseApp
import com.crecheconnect.service.FirebaseInitializer
import com.crecheconnect.service.FirebaseConnectionTest
import com.crecheconnect.service.FirebaseServiceImpl
import com.crecheconnect.service.EventRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        FirebaseApp.initializeApp(this)

        // Initialize EventRepository with Firebase service
        EventRepository.initializeFirebaseService(FirebaseServiceImpl())

        // Test Firebase connection first
        CoroutineScope(Dispatchers.IO).launch {
            try {
                Log.d("MainApplication", "Testing Firebase connection...")
                val testResults = FirebaseConnectionTest.runAllTests()

                if (testResults.overallSuccess) {
                    Log.d("MainApplication", "✅ Firebase connection verified!")
                    initializeSampleData()
                } else {
                    Log.e("MainApplication", "❌ Firebase connection failed - using offline mode")
                    // Could fall back to local data or show error
                }
            } catch (e: Exception) {
                Log.e("MainApplication", "Failed to test Firebase connection", e)
            }
        }

        // other initialization...
    }

    private fun initializeSampleData() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                FirebaseInitializer.initializeSampleData()
                Log.d("MainApplication", "Firebase sample data initialized")
            } catch (e: Exception) {
                Log.e("MainApplication", "Failed to initialize Firebase data", e)
            }
        }
    }

    companion object {
        lateinit var instance: MainApplication
            private set
    }
}
