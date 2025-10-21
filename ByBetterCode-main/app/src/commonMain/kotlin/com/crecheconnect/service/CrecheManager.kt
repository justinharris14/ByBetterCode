package com.crecheconnect.service

import com.crecheconnect.model.Event
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

object CacheManager {
    private const val EVENTS_CACHE_KEY = "cached_events"
    private const val LAST_SYNC_KEY = "last_sync_timestamp"

    private val _cachedEvents = MutableStateFlow<List<Event>>(emptyList())
    val cachedEvents: StateFlow<List<Event>> = _cachedEvents

    private val _isOnline = MutableStateFlow(true)
    val isOnline: StateFlow<Boolean> = _isOnline

    private val _lastSyncTime = MutableStateFlow<Long?>(null)
    val lastSyncTime: StateFlow<Long?> = _lastSyncTime

    fun updateOnlineStatus(isOnline: Boolean) {
        _isOnline.value = isOnline
    }

    fun cacheEvents(events: List<Event>) {
        _cachedEvents.value = events
        _lastSyncTime.value = System.currentTimeMillis()
        // In a real implementation, you'd save to SharedPreferences or local database
        saveToLocalStorage(EVENTS_CACHE_KEY, events)
        saveToLocalStorage(LAST_SYNC_KEY, System.currentTimeMillis())
    }

    fun getCachedEvents(): List<Event> {
        return _cachedEvents.value
    }

    fun loadCachedData() {
        // Load from local storage in real implementation
        val cachedEvents = loadFromLocalStorage<List<Event>>(EVENTS_CACHE_KEY) ?: emptyList()
        val lastSync = loadFromLocalStorage<Long>(LAST_SYNC_KEY)

        _cachedEvents.value = cachedEvents
        _lastSyncTime.value = lastSync
    }

    // Simplified local storage simulation
    // In real implementation, use SharedPreferences or Room database
    private val localStorage = mutableMapOf<String, Any>()

    private fun saveToLocalStorage(key: String, value: Any) {
        localStorage[key] = value
    }

    private inline fun <reified T> loadFromLocalStorage(key: String): T? {
        return localStorage[key] as? T
    }
}
