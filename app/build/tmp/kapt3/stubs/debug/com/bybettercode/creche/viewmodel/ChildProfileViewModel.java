package com.bybettercode.creche.viewmodel;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u00006\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0010\t\n\u0000\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0010\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\u0018\u00002\u00020\u0001B\r\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u00a2\u0006\u0002\u0010\u0004J\u000e\u0010\r\u001a\u00020\u000e2\u0006\u0010\u000f\u001a\u00020\u0007J\u000e\u0010\u0010\u001a\u00020\u00112\u0006\u0010\b\u001a\u00020\nR\u0014\u0010\u0005\u001a\b\u0012\u0004\u0012\u00020\u00070\u0006X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0019\u0010\b\u001a\n\u0012\u0006\u0012\u0004\u0018\u00010\n0\t\u00a2\u0006\b\n\u0000\u001a\u0004\b\u000b\u0010\fR\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u0012"}, d2 = {"Lcom/bybettercode/creche/viewmodel/ChildProfileViewModel;", "Landroidx/lifecycle/ViewModel;", "repo", "Lcom/bybettercode/creche/data/repository/ChildRepository;", "(Lcom/bybettercode/creche/data/repository/ChildRepository;)V", "_childId", "Landroidx/lifecycle/MutableLiveData;", "", "child", "Landroidx/lifecycle/LiveData;", "Lcom/bybettercode/creche/models/Child;", "getChild", "()Landroidx/lifecycle/LiveData;", "loadChild", "", "childId", "saveChild", "Lkotlinx/coroutines/Job;", "app_debug"})
public final class ChildProfileViewModel extends androidx.lifecycle.ViewModel {
    @org.jetbrains.annotations.NotNull()
    private final com.bybettercode.creche.data.repository.ChildRepository repo = null;
    @org.jetbrains.annotations.NotNull()
    private final androidx.lifecycle.MutableLiveData<java.lang.Long> _childId = null;
    @org.jetbrains.annotations.NotNull()
    private final androidx.lifecycle.LiveData<com.bybettercode.creche.models.Child> child = null;
    
    public ChildProfileViewModel(@org.jetbrains.annotations.NotNull()
    com.bybettercode.creche.data.repository.ChildRepository repo) {
        super();
    }
    
    @org.jetbrains.annotations.NotNull()
    public final androidx.lifecycle.LiveData<com.bybettercode.creche.models.Child> getChild() {
        return null;
    }
    
    public final void loadChild(long childId) {
    }
    
    @org.jetbrains.annotations.NotNull()
    public final kotlinx.coroutines.Job saveChild(@org.jetbrains.annotations.NotNull()
    com.bybettercode.creche.models.Child child) {
        return null;
    }
}