package com.bybettercode.creche.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
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

@Database(
    entities = [Parent::class, Child::class, Teacher::class],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun parentDao(): ParentDao
    abstract fun childDao(): ChildDao
    abstract fun teacherDao(): TeacherDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "creche_database"
                )
                    .addCallback(DatabaseCallback())        // <<--- important
                    .fallbackToDestructiveMigration()       // optional
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }


    private class DatabaseCallback : RoomDatabase.Callback() {
        override fun onCreate(db: SupportSQLiteDatabase) {
            super.onCreate(db)
            INSTANCE?.let { database ->
                CoroutineScope(Dispatchers.IO).launch {
                    prepopulate(database)
                }
            }
        }

        suspend fun prepopulate(db: AppDatabase) {
            val parentDao = db.parentDao()
            val childDao = db.childDao()
            val teacherDao = db.teacherDao()

            // Parents
            val parent1 = Parent(
                name = "Alice Johnson",
                phone = "1234567890",
                email = "alice@example.com"
            )
            val parent2 = Parent(
                name = "Bob Smith",
                phone = "9876543210",
                email = "bob@example.com"
            )

            val p1Id = parentDao.insert(parent1)
            val p2Id = parentDao.insert(parent2)

            // Children
            val child1 = Child(
                parentId = p1Id,
                name = "Charlie Johnson",
                dob = "2021-05-01",
                description = "Loves painting",
                allergies = null,
                medicalHistory = "No known allergies",
                assignedTeacherId = null
            )
            val child2 = Child(
                parentId = p2Id,
                name = "Daisy Smith",
                dob = "2020-03-15",
                description = "Enjoys outdoor games",
                allergies = "Pollen",
                medicalHistory = "Asthma",
                assignedTeacherId = null
            )

            childDao.insert(child1)
            childDao.insert(child2)

            // Teacher
            val teacher = Teacher(
                name = "Ms. Green",
                phone = "555123456"
            )
            teacherDao.insert(teacher)
        }
    }
}
