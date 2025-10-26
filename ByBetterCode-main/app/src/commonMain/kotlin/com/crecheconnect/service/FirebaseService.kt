package com.crecheconnect.service

import com.crecheconnect.model.Event
import com.crecheconnect.model.User
import com.crecheconnect.model.AttendanceRecord
import com.crecheconnect.model.Subscription

// Simple interface for Firebase services
interface FirebaseService {
    // Auth
    suspend fun signIn(email: String, password: String): Result<User>
    suspend fun signUp(email: String, password: String, name: String, phone: String): Result<User>
    suspend fun signOut()
    suspend fun getCurrentUser(): User?

    // Events
    suspend fun getEvents(): Result<List<Event>>
    suspend fun addEvent(event: Event): Result<Event>
    suspend fun updateEvent(event: Event): Result<Event>
    suspend fun deleteEvent(eventId: String): Result<Unit>

    // Attendance
    suspend fun getAttendanceRecords(studentId: String): Result<List<AttendanceRecord>>
    suspend fun addAttendanceRecord(record: AttendanceRecord): Result<AttendanceRecord>
    suspend fun updateAttendanceRecord(record: AttendanceRecord): Result<AttendanceRecord>

    // Subscriptions
    suspend fun getSubscriptions(userId: String): Result<List<Subscription>>
    suspend fun addSubscription(subscription: Subscription): Result<Subscription>
    suspend fun updateSubscription(subscription: Subscription): Result<Subscription>
}
