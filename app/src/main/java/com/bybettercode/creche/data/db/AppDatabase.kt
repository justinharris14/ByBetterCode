package com.bybettercode.creche.data.db

import android.content.Context
import android.util.Log
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
import com.bybettercode.creche.data.dao.ChildDao
import com.bybettercode.creche.data.dao.ParentDao
import com.bybettercode.creche.data.dao.TeacherDao
import com.bybettercode.creche.models.Child
import com.bybettercode.creche.models.Parent
import com.bybettercode.creche.models.Teacher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * AppDatabase for the creche app.
 *
 * This version = 2 includes the new Parent.idNumber column.
 * Migration 1 -> 2 adds the column without destroying existing data.
 */
@Database(
    entities = [Parent::class, Child::class, Teacher::class],
    version = 2,               // <-- bumped from 1 to 2
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun parentDao(): ParentDao
    abstract fun childDao(): ChildDao
    abstract fun teacherDao(): TeacherDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        // Migration object: alters parents table to add idNumber TEXT column
        private val MIGRATION_1_2 = object : Migration(1, 2) {
            override fun migrate(database: SupportSQLiteDatabase) {
                // Add nullable column idNumber to parents table
                database.execSQL("ALTER TABLE parents ADD COLUMN idNumber TEXT")
                Log.d("AppDatabase", "Migration 1->2 applied: added idNumber to parents")
            }
        }

        /**
         * Get singleton instance of AppDatabase. Uses migration 1->2.
         */
        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "creche_database"
                )
                    .addMigrations(MIGRATION_1_2)     // <-- wire the migration
                    .addCallback(DatabaseCallback()) // optional: seeds sample data on first create
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }

    /**
     * Seed the database when it is first created (onCreate).
     * This runs only when DB file is created for the first time (fresh install).
     */
    private class DatabaseCallback : RoomDatabase.Callback() {
        override fun onCreate(db: SupportSQLiteDatabase) {
            super.onCreate(db)
            // Run seeding on IO thread
            INSTANCE?.let { database ->
                CoroutineScope(Dispatchers.IO).launch {
                    prepopulate(database)
                }
            }
        }

        private suspend fun prepopulate(db: AppDatabase) {
            try {
                val parentDao = db.parentDao()
                val childDao = db.childDao()
                val teacherDao = db.teacherDao()

                // Sample parents (idNumber left null or use a sample string)
                val p1 = Parent(name = "Alice Johnson", phone = "1234567890", email = "alice@example.com", idNumber = "9001011234087")
                val p2 = Parent(name = "Bob Smith", phone = "9876543210", email = "bob@example.com", idNumber = "8802022233344")

                val p1Id = parentDao.insert(p1)
                val p2Id = parentDao.insert(p2)

                // Sample children (parentId uses returned ids)
                val c1 = Child(
                    parentId = p1Id,
                    name = "Charlie Johnson",
                    dob = "2018-05-10",
                    description = "Loves painting",
                    allergies = null,
                    medicalHistory = "No known allergies",
                    assignedTeacherId = null
                )
                val c2 = Child(
                    parentId = p2Id,
                    name = "Daisy Smith",
                    dob = "2020-03-15",
                    description = "Enjoys outdoor games",
                    allergies = "Pollen",
                    medicalHistory = "Asthma",
                    assignedTeacherId = null
                )

                childDao.insert(c1)
                childDao.insert(c2)

                // Insert a teacher
                teacherDao.insert(Teacher(name = "Ms. Green", phone = "555123456"))

                Log.d("AppDatabase", "Pre-populated database with sample parents/children")
            } catch (ex: Exception) {
                Log.e("AppDatabase", "Error prepopulating DB: ${ex.message}", ex)
            }
        }
    }
}
