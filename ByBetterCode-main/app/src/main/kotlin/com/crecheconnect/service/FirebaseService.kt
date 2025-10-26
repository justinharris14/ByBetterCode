package com.crecheconnect.service

import com.crecheconnect.model.*
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import kotlinx.coroutines.tasks.await

class FirebaseServiceImpl : FirebaseService {
    private val auth: FirebaseAuth = Firebase.auth
    private val firestore: FirebaseFirestore = Firebase.firestore

    // Auth implementations
    override suspend fun signIn(email: String, password: String): Result<User> {
        return try {
            val authResult = auth.signInWithEmailAndPassword(email, password).await()
            val firebaseUser = authResult.user

            if (firebaseUser != null) {
                // Get user data from Firestore
                val userDoc = firestore.collection("users").document(firebaseUser.uid).get().await()
                val user = userDoc.toObject(User::class.java)?.copy(id = firebaseUser.uid.toLong())
                    ?: User(
                        id = firebaseUser.uid.toLong(),
                        email = firebaseUser.email ?: email,
                        name = firebaseUser.displayName ?: "Unknown",
                        role = UserRole.PARENT,
                        phone = firebaseUser.phoneNumber,
                        password = "" // Default empty password for Firebase users
                    )
                Result.success(user)
            } else {
                Result.failure(Exception("Sign in failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun signUp(email: String, password: String, name: String, phone: String): Result<User> {
        return try {
            val authResult = auth.createUserWithEmailAndPassword(email, password).await()
            val firebaseUser = authResult.user

            if (firebaseUser != null) {
                // Create user document in Firestore
                val user = User(
                    id = firebaseUser.uid.toLong(),
                    email = email,
                    name = name,
                    role = UserRole.PARENT,
                    phone = phone,
                    password = password // Store password for local model compatibility
                )

                firestore.collection("users").document(firebaseUser.uid).set(user).await()
                Result.success(user)
            } else {
                Result.failure(Exception("Sign up failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun signOut() {
        auth.signOut()
    }

    override suspend fun getCurrentUser(): User? {
        return auth.currentUser?.let { firebaseUser ->
            // In a real app, you'd fetch from Firestore
            User(
                id = firebaseUser.uid.toLong(),
                email = firebaseUser.email ?: "",
                name = firebaseUser.displayName ?: "Unknown",
                role = UserRole.PARENT,
                phone = firebaseUser.phoneNumber,
                password = "" // Default empty password for Firebase users
            )
        }
    }

    // Events implementations
    override suspend fun getEvents(): Result<List<Event>> {
        return try {
            val snapshot = firestore.collection("events").get().await()
            val events = snapshot.documents.mapNotNull { doc ->
                val data = doc.data
                val title = data?.get("title") as? String ?: ""
                val description = data?.get("description") as? String
                val eventDateTime = data?.get("eventDateTime") as? com.google.firebase.Timestamp
                val eventID = data?.get("eventID") as? String
                val createByID = data?.get("createByID") as? String
                val createdAt = data?.get("createdAt") as? com.google.firebase.Timestamp

                if (title.isNotEmpty()) {
                    Event(
                        id = eventID?.toLongOrNull(),
                        title = title,
                        description = description,
                        eventDateTime = eventDateTime?.toDate()?.let { kotlinx.datetime.Instant.fromEpochMilliseconds(it.time) },
                        eventID = eventID,
                        Date = data?.get("Date") as? String,
                        createByID = createByID,
                        createdAt = createdAt?.toDate()?.let { kotlinx.datetime.Instant.fromEpochMilliseconds(it.time) },
                        createdBy = createByID?.hashCode()?.toLong() ?: 1L
                    )
                } else null
            }
            Result.success(events)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun addEvent(event: Event): Result<Event> {
        return try {
            // Create data in your Firebase structure
            val eventDateTimeTimestamp = event.eventDateTime?.let { com.google.firebase.Timestamp(it.toEpochMilliseconds() / 1000, 0) }

            val eventData = mapOf<String, Any?>(
                "title" to event.title,
                "description" to (event.description ?: ""),
                "eventDateTime" to eventDateTimeTimestamp,
                "eventID" to (event.eventID ?: java.util.UUID.randomUUID().toString()),
                "Date" to (event.Date ?: ""),
                "createByID" to (event.createByID ?: "uuidOfAdmin"),
                "createdAt" to com.google.firebase.Timestamp.now()
            )

            val docRef = firestore.collection("events").add(eventData).await()
            val newEvent = event.copy(
                id = docRef.id.toLong(),
                eventID = docRef.id,
                createdAt = kotlinx.datetime.Instant.fromEpochMilliseconds(System.currentTimeMillis())
            )
            Result.success(newEvent)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun updateEvent(event: Event): Result<Event> {
        return try {
            if (event.eventID != null) {
                val eventDateTimeTimestamp = event.eventDateTime?.let { com.google.firebase.Timestamp(it.toEpochMilliseconds() / 1000, 0) }
                val createdAtTimestamp = event.createdAt?.let { com.google.firebase.Timestamp(it.toEpochMilliseconds() / 1000, 0) } ?: com.google.firebase.Timestamp.now()

                val eventData = mapOf<String, Any?>(
                    "title" to event.title,
                    "description" to (event.description ?: ""),
                    "eventDateTime" to eventDateTimeTimestamp,
                    "eventID" to event.eventID,
                    "Date" to (event.Date ?: ""),
                    "createByID" to (event.createByID ?: "uuidOfAdmin"),
                    "createdAt" to createdAtTimestamp
                )

                firestore.collection("events").document(event.eventID).set(eventData).await()
                Result.success(event)
            } else {
                Result.failure(Exception("Event ID is required for update"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun deleteEvent(eventId: String): Result<Unit> {
        return try {
            firestore.collection("events").document(eventId).delete().await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Attendance implementations
    override suspend fun getAttendanceRecords(studentId: String): Result<List<AttendanceRecord>> {
        return try {
            val snapshot = firestore.collection("attendance")
                .whereEqualTo("studentId", studentId.toLong())
                .get().await()

            val records = snapshot.documents.mapNotNull { doc ->
                doc.toObject(AttendanceRecord::class.java)?.copy(id = doc.id.toLong())
            }
            Result.success(records)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun addAttendanceRecord(record: AttendanceRecord): Result<AttendanceRecord> {
        return try {
            val docRef = firestore.collection("attendance").add(record).await()
            val newRecord = record.copy(id = docRef.id.toLong())
            Result.success(newRecord)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun updateAttendanceRecord(record: AttendanceRecord): Result<AttendanceRecord> {
        return try {
            if (record.id != null) {
                firestore.collection("attendance").document(record.id.toString()).set(record).await()
                Result.success(record)
            } else {
                Result.failure(Exception("Record ID is required for update"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Subscriptions implementations
    override suspend fun getSubscriptions(userId: String): Result<List<Subscription>> {
        return try {
            val snapshot = firestore.collection("subscriptions")
                .whereEqualTo("userId", userId.toLong())
                .get().await()

            val subscriptions = snapshot.documents.mapNotNull { doc ->
                doc.toObject(Subscription::class.java)?.copy(id = doc.id.toLong())
            }
            Result.success(subscriptions)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun addSubscription(subscription: Subscription): Result<Subscription> {
        return try {
            val docRef = firestore.collection("subscriptions").add(subscription).await()
            val newSubscription = subscription.copy(id = docRef.id.toLong())
            Result.success(newSubscription)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun updateSubscription(subscription: Subscription): Result<Subscription> {
        return try {
            if (subscription.id != null) {
                firestore.collection("subscriptions").document(subscription.id.toString()).set(subscription).await()
                Result.success(subscription)
            } else {
                Result.failure(Exception("Subscription ID is required for update"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
