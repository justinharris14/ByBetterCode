package com.bybettercode.creche.data.dao

import androidx.room.*
import com.bybettercode.creche.models.Teacher
import kotlinx.coroutines.flow.Flow

@Dao
interface TeacherDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(teacher: Teacher): Long

    @Query("SELECT * FROM teachers ORDER BY name")
    fun getAllTeachers(): Flow<List<Teacher>>

    @Query("SELECT * FROM teachers WHERE teacherId = :id LIMIT 1")
    suspend fun getTeacherById(id: Long): Teacher?
}
