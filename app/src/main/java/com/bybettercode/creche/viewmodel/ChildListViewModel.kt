package com.bybettercode.creche.viewmodel

import androidx.lifecycle.*
import com.bybettercode.creche.data.repository.ChildRepository
import com.bybettercode.creche.models.Child
import kotlinx.coroutines.launch

class ChildListViewModel(private val repo: ChildRepository) : ViewModel() {
    private val _parentId = MutableLiveData<Long>()
    val childrenForParent: LiveData<List<Child>> = _parentId.switchMap { pid ->
        repo.getChildrenForParent(pid).asLiveData()
    }

    fun loadForParent(parentId: Long) { _parentId.value = parentId }
    fun addChild(child: Child) = viewModelScope.launch { repo.addChild(child) }
    fun reassignTeacher(childId: Long, teacherId: Long) = viewModelScope.launch { repo.reassignTeacher(childId, teacherId) }
}

class ChildListViewModelFactory(private val repo: ChildRepository) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(ChildListViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return ChildListViewModel(repo) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
