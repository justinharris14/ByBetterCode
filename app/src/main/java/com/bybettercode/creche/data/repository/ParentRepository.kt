package com.bybettercode.creche.data.repository

import com.bybettercode.creche.data.dao.ParentDao
import com.bybettercode.creche.models.Parent
import kotlinx.coroutines.flow.Flow

class ParentRepository(private val parentDao: ParentDao) {

    // Return the Flow for listing/searching
    fun getAllParents(): Flow<List<Parent>> = parentDao.getAllParents()

    fun searchParents(query: String): Flow<List<Parent>> = parentDao.searchParents(query)

    // IMPORTANT: return Long so caller gets generated id
    suspend fun addParent(parent: Parent): Long {
        return parentDao.insert(parent)
    }

    suspend fun updateParent(parent: Parent) = parentDao.update(parent)
    suspend fun deleteParent(parent: Parent) = parentDao.delete(parent)
}
