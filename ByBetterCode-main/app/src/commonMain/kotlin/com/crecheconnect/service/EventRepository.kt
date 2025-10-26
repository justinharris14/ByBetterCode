package com.crecheconnect.service

import com.crecheconnect.model.Event
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

object EventRepository {
    private val _events = MutableStateFlow<List<Event>>(emptyList())
    val events: StateFlow<List<Event>> = _events

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error

    // For now, we'll need to set this from the Android side
    private lateinit var firebaseService: FirebaseService

    fun initializeFirebaseService(service: FirebaseService) {
        firebaseService = service
    }

    suspend fun addEvent(event: Event) {
        _isLoading.value = true
        _error.value = null

        try {
            val result = firebaseService.addEvent(event)
            result.fold(
                onSuccess = { newEvent ->
                    // Update local state with the new event
                    _events.value = _events.value + newEvent
                },
                onFailure = { exception ->
                    _error.value = "Failed to add event: ${exception.message}"
                }
            )
        } catch (e: Exception) {
            _error.value = "Failed to add event: ${e.message}"
        } finally {
            _isLoading.value = false
        }
    }

    suspend fun updateEvent(updatedEvent: Event) {
        _isLoading.value = true
        _error.value = null

        try {
            val result = firebaseService.updateEvent(updatedEvent)
            result.fold(
                onSuccess = { event ->
                    // Update local state
                    _events.value = _events.value.map { existingEvent ->
                        if (existingEvent.id == event.id) event else existingEvent
                    }
                },
                onFailure = { exception ->
                    _error.value = "Failed to update event: ${exception.message}"
                }
            )
        } catch (e: Exception) {
            _error.value = "Failed to update event: ${e.message}"
        } finally {
            _isLoading.value = false
        }
    }

    suspend fun deleteEvent(eventId: Long) {
        _isLoading.value = true
        _error.value = null

        try {
            val result = firebaseService.deleteEvent(eventId.toString())
            result.fold(
                onSuccess = {
                    // Update local state
                    _events.value = _events.value.filter { it.id != eventId }
                },
                onFailure = { exception ->
                    _error.value = "Failed to delete event: ${exception.message}"
                }
            )
        } catch (e: Exception) {
            _error.value = "Failed to delete event: ${e.message}"
        } finally {
            _isLoading.value = false
        }
    }

    suspend fun refreshEvents() {
        _isLoading.value = true
        _error.value = null

        try {
            val result = firebaseService.getEvents()
            result.fold(
                onSuccess = { eventsList ->
                    _events.value = eventsList
                },
                onFailure = { exception ->
                    _error.value = "Failed to load events: ${exception.message}"
                    // If Firebase fails, keep any cached data or show empty list
                    _events.value = emptyList()
                }
            )
        } catch (e: Exception) {
            _error.value = "Failed to refresh events: ${e.message}"
            _isLoading.value = false
        } finally {
            _isLoading.value = false
        }
    }

    // Helper function to add some sample events for demo purposes
    suspend fun addSampleEvents() {
        val sampleEvents = listOf(
            Event(
                id = null,
                title = "Parent-Teacher Meeting",
                description = "Monthly meeting to discuss child's progress",
                eventDateTime = kotlinx.datetime.Instant.fromEpochMilliseconds(System.currentTimeMillis()),
                eventID = java.util.UUID.randomUUID().toString(),
                Date = "",
                createByID = "uuidOfAdmin",
                createdAt = kotlinx.datetime.Instant.fromEpochMilliseconds(System.currentTimeMillis()),
                location = "Main Hall",
                createdBy = 1L
            ),
            Event(
                id = null,
                title = "Holiday Celebration",
                description = "End of year celebration for all children and parents",
                eventDateTime = kotlinx.datetime.Instant.fromEpochMilliseconds(System.currentTimeMillis()),
                eventID = java.util.UUID.randomUUID().toString(),
                Date = "",
                createByID = "uuidOfAdmin",
                createdAt = kotlinx.datetime.Instant.fromEpochMilliseconds(System.currentTimeMillis()),
                location = "Playground",
                createdBy = 1L
            ),
            Event(
                id = null,
                title = "Art Workshop",
                description = "Creative activities for children aged 3-5",
                eventDateTime = kotlinx.datetime.Instant.fromEpochMilliseconds(System.currentTimeMillis()),
                eventID = java.util.UUID.randomUUID().toString(),
                Date = "",
                createByID = "uuidOfAdmin",
                createdAt = kotlinx.datetime.Instant.fromEpochMilliseconds(System.currentTimeMillis()),
                location = "Activity Room",
                createdBy = 1L
            )
        )

        sampleEvents.forEach { event ->
            addEvent(event)
        }
    }
}