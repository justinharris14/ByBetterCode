package com.bybettercode.creche.data.dao

import androidx.room.*
import com.bybettercode.creche.models.Parent
import kotlinx.coroutines.flow.Flow

@Dao
interface ParentDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(parent: Parent): Long

    @Query("SELECT * FROM parents ORDER BY name")
    fun getAllParents(): Flow<List<Parent>>

    @Query("SELECT * FROM parents WHERE name LIKE '%' || :query || '%' OR phone LIKE '%' || :query || '%' ORDER BY name")
    fun searchParents(query: String): Flow<List<Parent>>
}

