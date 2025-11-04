package com.bybettercode.creche.data.repository;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000:\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\t\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\u0010 \n\u0002\b\u0002\n\u0002\u0010\u000e\n\u0002\b\u0002\u0018\u00002\u00020\u0001B\r\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u00a2\u0006\u0002\u0010\u0004J\u0016\u0010\u0005\u001a\u00020\u00062\u0006\u0010\u0007\u001a\u00020\bH\u0086@\u00a2\u0006\u0002\u0010\tJ\u0016\u0010\n\u001a\u00020\u000b2\u0006\u0010\u0007\u001a\u00020\bH\u0086@\u00a2\u0006\u0002\u0010\tJ\u0012\u0010\f\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\b0\u000e0\rJ\u001a\u0010\u000f\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\b0\u000e0\r2\u0006\u0010\u0010\u001a\u00020\u0011J\u0016\u0010\u0012\u001a\u00020\u000b2\u0006\u0010\u0007\u001a\u00020\bH\u0086@\u00a2\u0006\u0002\u0010\tR\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u0013"}, d2 = {"Lcom/bybettercode/creche/data/repository/ParentRepository;", "", "parentDao", "Lcom/bybettercode/creche/data/dao/ParentDao;", "(Lcom/bybettercode/creche/data/dao/ParentDao;)V", "addParent", "", "parent", "Lcom/bybettercode/creche/models/Parent;", "(Lcom/bybettercode/creche/models/Parent;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "deleteParent", "", "getAllParents", "Lkotlinx/coroutines/flow/Flow;", "", "searchParents", "query", "", "updateParent", "app_debug"})
public final class ParentRepository {
    @org.jetbrains.annotations.NotNull()
    private final com.bybettercode.creche.data.dao.ParentDao parentDao = null;
    
    public ParentRepository(@org.jetbrains.annotations.NotNull()
    com.bybettercode.creche.data.dao.ParentDao parentDao) {
        super();
    }
    
    @org.jetbrains.annotations.NotNull()
    public final kotlinx.coroutines.flow.Flow<java.util.List<com.bybettercode.creche.models.Parent>> getAllParents() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final kotlinx.coroutines.flow.Flow<java.util.List<com.bybettercode.creche.models.Parent>> searchParents(@org.jetbrains.annotations.NotNull()
    java.lang.String query) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object addParent(@org.jetbrains.annotations.NotNull()
    com.bybettercode.creche.models.Parent parent, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super java.lang.Long> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object updateParent(@org.jetbrains.annotations.NotNull()
    com.bybettercode.creche.models.Parent parent, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object deleteParent(@org.jetbrains.annotations.NotNull()
    com.bybettercode.creche.models.Parent parent, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion) {
        return null;
    }
}