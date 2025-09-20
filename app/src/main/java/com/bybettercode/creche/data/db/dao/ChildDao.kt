package com.bybettercode.creche.data.dao

import androidx.room.*
import com.bybettercode.creche.models.Child
import kotlinx.coroutines.flow.Flow

@Dao
interface ChildDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(child: Child): Long

    @Update
    suspend fun update(child: Child)

    @Delete
    suspend fun delete(child: Child)

    @Query("SELECT * FROM children WHERE parentId = :parentId ORDER BY name")
    fun getChildrenForParent(parentId: Long): Flow<List<Child>>

    @Query("SELECT * FROM children WHERE childId = :childId LIMIT 1")
    suspend fun getChildById(childId: Long): Child?

    @Query("UPDATE children SET assignedTeacherId = :teacherId WHERE childId = :childId")
    suspend fun reassignTeacher(childId: Long, teacherId: Long)
}
