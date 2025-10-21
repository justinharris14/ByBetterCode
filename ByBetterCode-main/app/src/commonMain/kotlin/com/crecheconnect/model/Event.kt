package com.crecheconnect.model

import kotlinx.datetime.LocalDate
import kotlinx.datetime.LocalTime

data class Event(
    val id: Long? = null,
    val title: String,
    val description: String? = null,
    val date: LocalDate,
    val startTime: LocalTime,
    val endTime: LocalTime,
    val createdBy: Long = 1L
)