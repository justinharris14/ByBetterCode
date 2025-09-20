package com.bybettercode.creche.data.repository

import com.bybettercode.creche.data.dao.ParentDao
import com.bybettercode.creche.models.Parent
import kotlinx.coroutines.flow.Flow

class ParentRepository(private val parentDao: ParentDao) {
    suspend fun addParent(parent: Parent) = parentDao.insert(parent)
    suspend fun updateParent(parent: Parent) = parentDao.update(parent)
    fun getAllParents(): Flow<List<Parent>> = parentDao.getAllParents()
    fun searchParents(query: String): Flow<List<Parent>> = parentDao.searchParents(query)
    suspend fun getParentById(id: Long) = parentDao.getParentById(id)
}
