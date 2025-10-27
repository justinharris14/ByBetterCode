package com.crecheconnect.model

import kotlinx.datetime.Instant

data class Event(
    val id: Long? = null,
    val title: String,
    val description: String? = null,
    val eventDateTime: Instant? = null, // Your Firebase timestamp field
    val eventID: String? = null, // Your Firebase eventID field
    val Date: String? = null, // Your Firebase Date field (empty)
    val createByID: String? = null, // Your Firebase createByID field
    val createdAt: Instant? = null, // Your Firebase createdAt field
    val location: String? = null,
    val createdBy: Long = 1L,

    // Backward compatibility fields
    val startTime: String? = null,
    val endTime: String? = null
)