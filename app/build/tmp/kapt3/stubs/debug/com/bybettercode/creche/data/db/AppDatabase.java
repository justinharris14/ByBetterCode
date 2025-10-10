package com.bybettercode.creche.data.db;

/**
 * AppDatabase for the creche app.
 *
 * This version = 2 includes the new Parent.idNumber column.
 * Migration 1 -> 2 adds the column without destroying existing data.
 */
@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000 \n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0003\b\'\u0018\u0000 \t2\u00020\u0001:\u0002\t\nB\u0005\u00a2\u0006\u0002\u0010\u0002J\b\u0010\u0003\u001a\u00020\u0004H&J\b\u0010\u0005\u001a\u00020\u0006H&J\b\u0010\u0007\u001a\u00020\bH&\u00a8\u0006\u000b"}, d2 = {"Lcom/bybettercode/creche/data/db/AppDatabase;", "Landroidx/room/RoomDatabase;", "()V", "childDao", "Lcom/bybettercode/creche/data/dao/ChildDao;", "parentDao", "Lcom/bybettercode/creche/data/dao/ParentDao;", "teacherDao", "Lcom/bybettercode/creche/data/dao/TeacherDao;", "Companion", "DatabaseCallback", "app_debug"})
@androidx.room.Database(entities = {com.bybettercode.creche.models.Parent.class, com.bybettercode.creche.models.Child.class, com.bybettercode.creche.models.Teacher.class}, version = 2, exportSchema = false)
public abstract class AppDatabase extends androidx.room.RoomDatabase {
    @kotlin.jvm.Volatile()
    @org.jetbrains.annotations.Nullable()
    private static volatile com.bybettercode.creche.data.db.AppDatabase INSTANCE;
    @org.jetbrains.annotations.NotNull()
    private static final androidx.room.migration.Migration MIGRATION_1_2 = null;
    @org.jetbrains.annotations.NotNull()
    public static final com.bybettercode.creche.data.db.AppDatabase.Companion Companion = null;
    
    public AppDatabase() {
        super();
    }
    
    @org.jetbrains.annotations.NotNull()
    public abstract com.bybettercode.creche.data.dao.ParentDao parentDao();
    
    @org.jetbrains.annotations.NotNull()
    public abstract com.bybettercode.creche.data.dao.ChildDao childDao();
    
    @org.jetbrains.annotations.NotNull()
    public abstract com.bybettercode.creche.data.dao.TeacherDao teacherDao();
    
    @kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000 \n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\b\u0086\u0003\u0018\u00002\u00020\u0001B\u0007\b\u0002\u00a2\u0006\u0002\u0010\u0002J\u000e\u0010\u0007\u001a\u00020\u00042\u0006\u0010\b\u001a\u00020\tR\u0010\u0010\u0003\u001a\u0004\u0018\u00010\u0004X\u0082\u000e\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0005\u001a\u00020\u0006X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006\n"}, d2 = {"Lcom/bybettercode/creche/data/db/AppDatabase$Companion;", "", "()V", "INSTANCE", "Lcom/bybettercode/creche/data/db/AppDatabase;", "MIGRATION_1_2", "Landroidx/room/migration/Migration;", "getInstance", "context", "Landroid/content/Context;", "app_debug"})
    public static final class Companion {
        
        private Companion() {
            super();
        }
        
        /**
         * Get singleton instance of AppDatabase. Uses migration 1->2.
         */
        @org.jetbrains.annotations.NotNull()
        public final com.bybettercode.creche.data.db.AppDatabase getInstance(@org.jetbrains.annotations.NotNull()
        android.content.Context context) {
            return null;
        }
    }
    
    /**
     * Seed the database when it is first created (onCreate).
     * This runs only when DB file is created for the first time (fresh install).
     */
    @kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000 \n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\b\u0002\u0018\u00002\u00020\u0001B\u0005\u00a2\u0006\u0002\u0010\u0002J\u0010\u0010\u0003\u001a\u00020\u00042\u0006\u0010\u0005\u001a\u00020\u0006H\u0016J\u0016\u0010\u0007\u001a\u00020\u00042\u0006\u0010\u0005\u001a\u00020\bH\u0082@\u00a2\u0006\u0002\u0010\t\u00a8\u0006\n"}, d2 = {"Lcom/bybettercode/creche/data/db/AppDatabase$DatabaseCallback;", "Landroidx/room/RoomDatabase$Callback;", "()V", "onCreate", "", "db", "Landroidx/sqlite/db/SupportSQLiteDatabase;", "prepopulate", "Lcom/bybettercode/creche/data/db/AppDatabase;", "(Lcom/bybettercode/creche/data/db/AppDatabase;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "app_debug"})
    static final class DatabaseCallback extends androidx.room.RoomDatabase.Callback {
        
        public DatabaseCallback() {
            super();
        }
        
        @java.lang.Override()
        public void onCreate(@org.jetbrains.annotations.NotNull()
        androidx.sqlite.db.SupportSQLiteDatabase db) {
        }
        
        private final java.lang.Object prepopulate(com.bybettercode.creche.data.db.AppDatabase db, kotlin.coroutines.Continuation<? super kotlin.Unit> $completion) {
            return null;
        }
    }
}