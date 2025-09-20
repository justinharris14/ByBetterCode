package com.bybettercode.creche.viewmodel

import androidx.lifecycle.*
import com.bybettercode.creche.data.repository.ChildRepository
import com.bybettercode.creche.models.Child
import kotlinx.coroutines.launch

class ChildProfileViewModel(private val repo: ChildRepository) : ViewModel() {
    private val _childId = MutableLiveData<Long>()
    val child: LiveData<Child?> = _childId.switchMap { cid ->
        liveData { emit(repo.getChildById(cid)) }
    }

    fun loadChild(childId: Long) { _childId.value = childId }
    fun saveChild(child: Child) = viewModelScope.launch { repo.updateChild(child) }
}

class ChildProfileViewModelFactory(private val repo: ChildRepository) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(ChildProfileViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return ChildProfileViewModel(repo) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
