package com.bybettercode.creche.data.repository

import com.bybettercode.creche.data.dao.ChildDao
import com.bybettercode.creche.models.Child
import kotlinx.coroutines.flow.Flow

class ChildRepository(private val childDao: ChildDao) {

    // return Long to get generated child id if you need it
    suspend fun addChild(child: Child): Long {
        return childDao.insert(child)
    }

    suspend fun updateChild(child: Child) = childDao.update(child)
    suspend fun deleteChild(child: Child) = childDao.delete(child)

    fun getChildrenForParent(parentId: Long): Flow<List<Child>> = childDao.getChildrenForParent(parentId)
    suspend fun getChildById(childId: Long): Child? = childDao.getChildById(childId)
    suspend fun reassignTeacher(childId: Long, teacherId: Long) = childDao.reassignTeacher(childId, teacherId)
}
