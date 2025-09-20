package com.bybettercode.creche.viewmodel

import androidx.lifecycle.*
import com.bybettercode.creche.data.repository.ParentRepository
import com.bybettercode.creche.models.Parent
import kotlinx.coroutines.launch

class ParentListViewModel(private val repo: ParentRepository) : ViewModel() {
    private val _query = MutableLiveData<String>("")
    val parents: LiveData<List<Parent>> = _query.switchMap { q ->
        if (q.isNullOrBlank()) repo.getAllParents().asLiveData()
        else repo.searchParents(q).asLiveData()
    }

    fun setQuery(q: String) { _query.value = q }

    fun addParent(parent: Parent) = viewModelScope.launch { repo.addParent(parent) }
}

// Factory (for injecting repo)
class ParentListViewModelFactory(private val repo: ParentRepository) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(ParentListViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return ParentListViewModel(repo) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
