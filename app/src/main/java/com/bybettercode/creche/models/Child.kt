package com.bybettercode.creche.models

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.ColumnInfo

@Entity(tableName = "children")
data class Child(
    @PrimaryKey(autoGenerate = true) val childId: Long = 0,
    val parentId: Long,
    val name: String,
    val dob: String?,                  // ISO date string or however you prefer
    val description: String?,
    val allergies: String?,            // simple free-text; can be normalized into separate table
    val medicalHistory: String?,
    val assignedTeacherId: Long? = null
)
