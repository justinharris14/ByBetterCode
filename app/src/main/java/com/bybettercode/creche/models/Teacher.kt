package com.bybettercode.creche.models

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "teachers")
data class Teacher(
    @PrimaryKey(autoGenerate = true) val teacherId: Long = 0,
    val name: String,
    val phone: String?
)
