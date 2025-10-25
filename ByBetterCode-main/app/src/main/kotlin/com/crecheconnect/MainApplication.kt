package com.crecheconnect

import android.app.Application
import com.google.firebase.FirebaseApp

class MainApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        FirebaseApp.initializeApp(this)
        // other initialization...
    }

    companion object {
        lateinit var instance: MainApplication
            private set
    }
}
