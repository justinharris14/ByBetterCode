package com.bybettercode.creche.data.repository;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u00004\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\t\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\u0002\n\u0002\b\u0004\n\u0002\u0018\u0002\n\u0002\u0010 \n\u0002\b\u0006\u0018\u00002\u00020\u0001B\r\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u00a2\u0006\u0002\u0010\u0004J\u0016\u0010\u0005\u001a\u00020\u00062\u0006\u0010\u0007\u001a\u00020\bH\u0086@\u00a2\u0006\u0002\u0010\tJ\u0016\u0010\n\u001a\u00020\u000b2\u0006\u0010\u0007\u001a\u00020\bH\u0086@\u00a2\u0006\u0002\u0010\tJ\u0018\u0010\f\u001a\u0004\u0018\u00010\b2\u0006\u0010\r\u001a\u00020\u0006H\u0086@\u00a2\u0006\u0002\u0010\u000eJ\u001a\u0010\u000f\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\b0\u00110\u00102\u0006\u0010\u0012\u001a\u00020\u0006J\u001e\u0010\u0013\u001a\u00020\u000b2\u0006\u0010\r\u001a\u00020\u00062\u0006\u0010\u0014\u001a\u00020\u0006H\u0086@\u00a2\u0006\u0002\u0010\u0015J\u0016\u0010\u0016\u001a\u00020\u000b2\u0006\u0010\u0007\u001a\u00020\bH\u0086@\u00a2\u0006\u0002\u0010\tR\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u0017"}, d2 = {"Lcom/bybettercode/creche/data/repository/ChildRepository;", "", "childDao", "Lcom/bybettercode/creche/data/dao/ChildDao;", "(Lcom/bybettercode/creche/data/dao/ChildDao;)V", "addChild", "", "child", "Lcom/bybettercode/creche/models/Child;", "(Lcom/bybettercode/creche/models/Child;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "deleteChild", "", "getChildById", "childId", "(JLkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getChildrenForParent", "Lkotlinx/coroutines/flow/Flow;", "", "parentId", "reassignTeacher", "teacherId", "(JJLkotlin/coroutines/Continuation;)Ljava/lang/Object;", "updateChild", "app_debug"})
public final class ChildRepository {
    @org.jetbrains.annotations.NotNull()
    private final com.bybettercode.creche.data.dao.ChildDao childDao = null;
    
    public ChildRepository(@org.jetbrains.annotations.NotNull()
    com.bybettercode.creche.data.dao.ChildDao childDao) {
        super();
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object addChild(@org.jetbrains.annotations.NotNull()
    com.bybettercode.creche.models.Child child, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super java.lang.Long> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object updateChild(@org.jetbrains.annotations.NotNull()
    com.bybettercode.creche.models.Child child, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object deleteChild(@org.jetbrains.annotations.NotNull()
    com.bybettercode.creche.models.Child child, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final kotlinx.coroutines.flow.Flow<java.util.List<com.bybettercode.creche.models.Child>> getChildrenForParent(long parentId) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object getChildById(long childId, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.bybettercode.creche.models.Child> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object reassignTeacher(long childId, long teacherId, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super kotlin.Unit> $completion) {
        return null;
    }
}