package com.bybettercode.creche.data.repository

import com.bybettercode.creche.data.dao.TeacherDao
import com.bybettercode.creche.models.Teacher
import kotlinx.coroutines.flow.Flow

class TeacherRepository(private val teacherDao: TeacherDao) {
    suspend fun addTeacher(t: Teacher) = teacherDao.insert(t)
    fun getAllTeachers(): Flow<List<Teacher>> = teacherDao.getAllTeachers()
    suspend fun getTeacherById(id: Long) = teacherDao.getTeacherById(id)
}
