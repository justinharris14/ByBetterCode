package com.crecheconnect.service

import com.crecheconnect.model.Event
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

object EventRepository {
    private val scope = CoroutineScope(SupervisorJob())
    private val _events = MutableStateFlow<List<Event>>(emptyList())
    val events: StateFlow<List<Event>> = _events.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    // Initialize with sample data for demonstration
    init {
        _events.value = listOf(
            Event(
                id = 1,
                title = "Parent-Teacher Meeting",
                description = "Monthly meeting to discuss child's progress",
                date = "2024-01-15",
                startTime = "10:00",
                endTime = "11:00",
                createdBy = 1
            ),
            Event(
                id = 2,
                title = "Sports Day",
                description = "Annual sports event for all children",
                date = "2024-01-20",
                startTime = "09:00",
                endTime = "15:00",
                createdBy = 1
            ),
            Event(
                id = 3,
                title = "Art Exhibition",
                description = "Showcasing children's artwork",
                date = "2024-01-25",
                startTime = "14:00",
                endTime = "16:00",
                createdBy = 1
            )
        )

        // Update cache with initial events
        CacheManager.cacheEvents(_events.value)
    }

    fun addEvent(event: Event) {
        val newEvent = event.copy(id = generateEventId())
        _events.value = _events.value + newEvent

        // Update cache when events change
        CacheManager.cacheEvents(_events.value)
    }

    fun updateEvent(updatedEvent: Event) {
        _events.value = _events.value.map { event ->
            if (event.id == updatedEvent.id) updatedEvent else event
        }

        // Update cache when events change
        CacheManager.cacheEvents(_events.value)
    }

    fun deleteEvent(eventId: Long) {
        _events.value = _events.value.filter { it.id != eventId }

        // Update cache when events change
        CacheManager.cacheEvents(_events.value)
    }

    fun refreshEvents() {
        _isLoading.value = true
        _error.value = null

        // Simulate network call
        scope.launch {
            try {
                // In a real app, this would fetch from Firebase/Firestore
                kotlinx.coroutines.delay(1000L) // Simulate network delay

                // For demo, just use current events
                CacheManager.cacheEvents(_events.value)
                _isLoading.value = false
            } catch (e: Exception) {
                _error.value = "Failed to refresh events: ${e.message}"
                _isLoading.value = false
            }
        }
    }

    private fun generateEventId(): Long {
        return (_events.value.maxOfOrNull { it.id ?: 0L } ?: 0L) + 1
    }
}
