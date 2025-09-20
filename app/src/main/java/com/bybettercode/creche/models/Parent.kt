package com.bybettercode.creche.models

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "parents")
data class Parent(
    @PrimaryKey(autoGenerate = true) val parentId: Long = 0,
    val name: String,
    val phone: String,
    val email: String?
)
