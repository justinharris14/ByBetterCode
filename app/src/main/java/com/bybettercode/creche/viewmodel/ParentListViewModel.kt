package com.bybettercode.creche.viewmodel

import androidx.lifecycle.*
import com.bybettercode.creche.data.repository.ParentRepository
import com.bybettercode.creche.models.Parent
import kotlinx.coroutines.flow.Flow

class ParentListViewModel(private val repo: ParentRepository) : ViewModel() {

    // Query LiveData that drives the Flow
    private val _query = MutableLiveData<String>("")

    // Expose parents as LiveData by switching on _query
    val parents: LiveData<List<Parent>> = _query.switchMap { q ->
        if (q.isNullOrBlank()) {
            repo.getAllParents().asLiveData()
        } else {
            repo.searchParents(q).asLiveData()
        }
    }

    fun setQuery(q: String) { _query.value = q }
    fun loadAll() { _query.value = "" }
}
