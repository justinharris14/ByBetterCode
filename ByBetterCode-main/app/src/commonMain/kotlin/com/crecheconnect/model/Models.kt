package com.crecheconnect.model

import kotlinx.datetime.Instant
import kotlinx.datetime.LocalDate
import kotlinx.datetime.LocalTime

data class User(
    val id: Long? = null,
    val email: String,
    val password: String,
    val role: UserRole = UserRole.PARENT,
    val name: String,
    val phone: String? = null,
    val createdAt: Instant? = null
)

enum class UserRole {
    PARENT, ADMIN
}

data class Student(
    val id: Long? = null,
    val name: String,
    val parentId: Long,
    val className: String,
    val dateOfBirth: String? = null,
    val createdAt: Instant? = null
)

data class AttendanceRecord(
    val id: Long? = null,
    val studentId: Long,
    val date: String,
    val isPresent: Boolean = true,
    val checkedBy: Long,
    val createdAt: Instant? = null
)

enum class SubscriptionType {
    MONTHLY, YEARLY
}

enum class SubscriptionStatus {
    ACTIVE, INACTIVE, CANCELED
}

data class Subscription(
    val id: Long? = null,
    val userId: Long,
    val type: SubscriptionType,
    val status: SubscriptionStatus = SubscriptionStatus.ACTIVE,
    val startDate: String,
    val endDate: String,
    val createdAt: Instant? = null
)

data class DashboardStats(
    val totalStudents: Int,
    val totalEvents: Int,
    val activeSubscriptions: Int,
    val todayAttendance: Int
)

