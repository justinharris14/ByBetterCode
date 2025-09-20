// UserDao.kt
package com.bybettercode.creche.data.db.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import com.bybettercode.creche.data.db.entities.User

@Dao
interface UserDao {
    @Insert suspend fun insert(user: User): Long

    @Query("SELECT * FROM users")
    suspend fun getAllParents(): List<User>
}
