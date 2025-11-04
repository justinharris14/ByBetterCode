package com.bybettercode.creche.data.repository;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000,\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\t\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0010 \n\u0002\b\u0004\u0018\u00002\u00020\u0001B\r\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u00a2\u0006\u0002\u0010\u0004J\u0016\u0010\u0005\u001a\u00020\u00062\u0006\u0010\u0007\u001a\u00020\bH\u0086@\u00a2\u0006\u0002\u0010\tJ\u0012\u0010\n\u001a\u000e\u0012\n\u0012\b\u0012\u0004\u0012\u00020\b0\f0\u000bJ\u0018\u0010\r\u001a\u0004\u0018\u00010\b2\u0006\u0010\u000e\u001a\u00020\u0006H\u0086@\u00a2\u0006\u0002\u0010\u000fR\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u0010"}, d2 = {"Lcom/bybettercode/creche/data/repository/TeacherRepository;", "", "teacherDao", "Lcom/bybettercode/creche/data/dao/TeacherDao;", "(Lcom/bybettercode/creche/data/dao/TeacherDao;)V", "addTeacher", "", "t", "Lcom/bybettercode/creche/models/Teacher;", "(Lcom/bybettercode/creche/models/Teacher;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getAllTeachers", "Lkotlinx/coroutines/flow/Flow;", "", "getTeacherById", "id", "(JLkotlin/coroutines/Continuation;)Ljava/lang/Object;", "app_debug"})
public final class TeacherRepository {
    @org.jetbrains.annotations.NotNull()
    private final com.bybettercode.creche.data.dao.TeacherDao teacherDao = null;
    
    public TeacherRepository(@org.jetbrains.annotations.NotNull()
    com.bybettercode.creche.data.dao.TeacherDao teacherDao) {
        super();
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object addTeacher(@org.jetbrains.annotations.NotNull()
    com.bybettercode.creche.models.Teacher t, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super java.lang.Long> $completion) {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final kotlinx.coroutines.flow.Flow<java.util.List<com.bybettercode.creche.models.Teacher>> getAllTeachers() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Object getTeacherById(long id, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.bybettercode.creche.models.Teacher> $completion) {
        return null;
    }
}