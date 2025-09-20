package com.bybettercode.creche.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.bybettercode.creche.data.dao.ChildDao
import com.bybettercode.creche.data.dao.ParentDao
import com.bybettercode.creche.data.dao.TeacherDao
import com.bybettercode.creche.models.Child
import com.bybettercode.creche.models.Parent
import com.bybettercode.creche.models.Teacher

@Database(entities = [Parent::class, Child::class, Teacher::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun parentDao(): ParentDao
    abstract fun childDao(): ChildDao
    abstract fun teacherDao(): TeacherDao

    companion object {
        @Volatile private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase =
            INSTANCE ?: synchronized(this) {
                INSTANCE ?: buildDatabase(context).also { INSTANCE = it }
            }

        private fun buildDatabase(context: Context) =
            Room.databaseBuilder(context.applicationContext,
                AppDatabase::class.java, "creche-db")
                .fallbackToDestructiveMigration()
                .build()
    }
}
