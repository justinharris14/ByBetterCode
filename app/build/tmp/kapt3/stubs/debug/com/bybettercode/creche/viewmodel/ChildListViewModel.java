package com.bybettercode.creche.viewmodel;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000<\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0010\t\n\u0000\n\u0002\u0018\u0002\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\u0002\n\u0002\b\u0005\u0018\u00002\u00020\u0001B\r\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u00a2\u0006\u0002\u0010\u0004J\u000e\u0010\u000e\u001a\u00020\u000f2\u0006\u0010\u0010\u001a\u00020\u000bJ\u000e\u0010\u0011\u001a\u00020\u00122\u0006\u0010\u0013\u001a\u00020\u0007J\u0016\u0010\u0014\u001a\u00020\u000f2\u0006\u0010\u0015\u001a\u00020\u00072\u0006\u0010\u0016\u001a\u00020\u0007R\u0014\u0010\u0005\u001a\b\u0012\u0004\u0012\u00020\u00070\u0006X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u001d\u0010\b\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\u000b0\n0\t\u00a2\u0006\b\n\u0000\u001a\u0004\b\f\u0010\rR\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u0017"}, d2 = {"Lcom/bybettercode/creche/viewmodel/ChildListViewModel;", "Landroidx/lifecycle/ViewModel;", "repo", "Lcom/bybettercode/creche/data/repository/ChildRepository;", "(Lcom/bybettercode/creche/data/repository/ChildRepository;)V", "_parentId", "Landroidx/lifecycle/MutableLiveData;", "", "childrenForParent", "Landroidx/lifecycle/LiveData;", "", "Lcom/bybettercode/creche/models/Child;", "getChildrenForParent", "()Landroidx/lifecycle/LiveData;", "addChild", "Lkotlinx/coroutines/Job;", "child", "loadForParent", "", "parentId", "reassignTeacher", "childId", "teacherId", "app_debug"})
public final class ChildListViewModel extends androidx.lifecycle.ViewModel {
    @org.jetbrains.annotations.NotNull()
    private final com.bybettercode.creche.data.repository.ChildRepository repo = null;
    @org.jetbrains.annotations.NotNull()
    private final androidx.lifecycle.MutableLiveData<java.lang.Long> _parentId = null;
    @org.jetbrains.annotations.NotNull()
    private final androidx.lifecycle.LiveData<java.util.List<com.bybettercode.creche.models.Child>> childrenForParent = null;
    
    public ChildListViewModel(@org.jetbrains.annotations.NotNull()
    com.bybettercode.creche.data.repository.ChildRepository repo) {
        super();
    }
    
    @org.jetbrains.annotations.NotNull()
    public final androidx.lifecycle.LiveData<java.util.List<com.bybettercode.creche.models.Child>> getChildrenForParent() {
        return null;
    }
    
    public final void loadForParent(long parentId) {
    }
    
    @org.jetbrains.annotations.NotNull()
    public final kotlinx.coroutines.Job addChild(@org.jetbrains.annotations.NotNull()
    com.bybettercode.creche.models.Child child) {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final kotlinx.coroutines.Job reassignTeacher(long childId, long teacherId) {
        return null;
    }
}