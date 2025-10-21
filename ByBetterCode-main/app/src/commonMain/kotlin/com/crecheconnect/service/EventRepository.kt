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

    private var nextId = 1L

    suspend fun addEvent(event: Event) {
        _isLoading.value = true
        try {
            val newEvent = event.copy(id = nextId++)
            _events.value = _events.value + newEvent
            _error.value = null
        } catch (e: Exception) {
            _error.value = "Failed to add event: ${e.message}"
        } finally {
            _isLoading.value = false
        }
    }

    suspend fun updateEvent(updatedEvent: Event) {
        _isLoading.value = true
        try {
            _events.value = _events.value.map { event ->
                if (event.id == updatedEvent.id) updatedEvent else event
            }
            _error.value = null
        } catch (e: Exception) {
            _error.value = "Failed to update event: ${e.message}"
        } finally {
            _isLoading.value = false
        }
    }

    suspend fun deleteEvent(eventId: Long) {
        _isLoading.value = true
        try {
            _events.value = _events.value.filter { it.id != eventId }
            _error.value = null
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
            // In a real app, this would fetch from Firebase/Firestore
            // For demo purposes, just simulate a refresh delay
            kotlinx.coroutines.delay(1000L)
            _isLoading.value = false
        } catch (e: Exception) {
            _error.value = "Failed to refresh events: ${e.message}"
            _isLoading.value = false
        }
    }
}