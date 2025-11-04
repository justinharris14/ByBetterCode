package com.bybettercode.creche.data.db;

import androidx.annotation.NonNull;
import androidx.room.DatabaseConfiguration;
import androidx.room.InvalidationTracker;
import androidx.room.RoomDatabase;
import androidx.room.RoomOpenHelper;
import androidx.room.migration.AutoMigrationSpec;
import androidx.room.migration.Migration;
import androidx.room.util.DBUtil;
import androidx.room.util.TableInfo;
import androidx.sqlite.db.SupportSQLiteDatabase;
import androidx.sqlite.db.SupportSQLiteOpenHelper;
import com.bybettercode.creche.data.dao.ChildDao;
import com.bybettercode.creche.data.dao.ChildDao_Impl;
import com.bybettercode.creche.data.dao.ParentDao;
import com.bybettercode.creche.data.dao.ParentDao_Impl;
import com.bybettercode.creche.data.dao.TeacherDao;
import com.bybettercode.creche.data.dao.TeacherDao_Impl;
import java.lang.Class;
import java.lang.Override;
import java.lang.String;
import java.lang.SuppressWarnings;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.annotation.processing.Generated;

@Generated("androidx.room.RoomProcessor")
@SuppressWarnings({"unchecked", "deprecation"})
public final class AppDatabase_Impl extends AppDatabase {
  private volatile ParentDao _parentDao;

  private volatile ChildDao _childDao;

  private volatile TeacherDao _teacherDao;

  @Override
  @NonNull
  protected SupportSQLiteOpenHelper createOpenHelper(@NonNull final DatabaseConfiguration config) {
    final SupportSQLiteOpenHelper.Callback _openCallback = new RoomOpenHelper(config, new RoomOpenHelper.Delegate(2) {
      @Override
      public void createAllTables(@NonNull final SupportSQLiteDatabase db) {
        db.execSQL("CREATE TABLE IF NOT EXISTS `parents` (`parentId` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, `name` TEXT NOT NULL, `phone` TEXT NOT NULL, `email` TEXT, `idNumber` TEXT)");
        db.execSQL("CREATE TABLE IF NOT EXISTS `children` (`childId` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, `parentId` INTEGER NOT NULL, `name` TEXT NOT NULL, `dob` TEXT, `description` TEXT, `allergies` TEXT, `medicalHistory` TEXT, `assignedTeacherId` INTEGER)");
        db.execSQL("CREATE TABLE IF NOT EXISTS `teachers` (`teacherId` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, `name` TEXT NOT NULL, `phone` TEXT)");
        db.execSQL("CREATE TABLE IF NOT EXISTS room_master_table (id INTEGER PRIMARY KEY,identity_hash TEXT)");
        db.execSQL("INSERT OR REPLACE INTO room_master_table (id,identity_hash) VALUES(42, '7b7b7bc18596c9ce8e78bf88ecb020b6')");
      }

      @Override
      public void dropAllTables(@NonNull final SupportSQLiteDatabase db) {
        db.execSQL("DROP TABLE IF EXISTS `parents`");
        db.execSQL("DROP TABLE IF EXISTS `children`");
        db.execSQL("DROP TABLE IF EXISTS `teachers`");
        final List<? extends RoomDatabase.Callback> _callbacks = mCallbacks;
        if (_callbacks != null) {
          for (RoomDatabase.Callback _callback : _callbacks) {
            _callback.onDestructiveMigration(db);
          }
        }
      }

      @Override
      public void onCreate(@NonNull final SupportSQLiteDatabase db) {
        final List<? extends RoomDatabase.Callback> _callbacks = mCallbacks;
        if (_callbacks != null) {
          for (RoomDatabase.Callback _callback : _callbacks) {
            _callback.onCreate(db);
          }
        }
      }

      @Override
      public void onOpen(@NonNull final SupportSQLiteDatabase db) {
        mDatabase = db;
        internalInitInvalidationTracker(db);
        final List<? extends RoomDatabase.Callback> _callbacks = mCallbacks;
        if (_callbacks != null) {
          for (RoomDatabase.Callback _callback : _callbacks) {
            _callback.onOpen(db);
          }
        }
      }

      @Override
      public void onPreMigrate(@NonNull final SupportSQLiteDatabase db) {
        DBUtil.dropFtsSyncTriggers(db);
      }

      @Override
      public void onPostMigrate(@NonNull final SupportSQLiteDatabase db) {
      }

      @Override
      @NonNull
      public RoomOpenHelper.ValidationResult onValidateSchema(
          @NonNull final SupportSQLiteDatabase db) {
        final HashMap<String, TableInfo.Column> _columnsParents = new HashMap<String, TableInfo.Column>(5);
        _columnsParents.put("parentId", new TableInfo.Column("parentId", "INTEGER", true, 1, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsParents.put("name", new TableInfo.Column("name", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsParents.put("phone", new TableInfo.Column("phone", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsParents.put("email", new TableInfo.Column("email", "TEXT", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsParents.put("idNumber", new TableInfo.Column("idNumber", "TEXT", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        final HashSet<TableInfo.ForeignKey> _foreignKeysParents = new HashSet<TableInfo.ForeignKey>(0);
        final HashSet<TableInfo.Index> _indicesParents = new HashSet<TableInfo.Index>(0);
        final TableInfo _infoParents = new TableInfo("parents", _columnsParents, _foreignKeysParents, _indicesParents);
        final TableInfo _existingParents = TableInfo.read(db, "parents");
        if (!_infoParents.equals(_existingParents)) {
          return new RoomOpenHelper.ValidationResult(false, "parents(com.bybettercode.creche.models.Parent).\n"
                  + " Expected:\n" + _infoParents + "\n"
                  + " Found:\n" + _existingParents);
        }
        final HashMap<String, TableInfo.Column> _columnsChildren = new HashMap<String, TableInfo.Column>(8);
        _columnsChildren.put("childId", new TableInfo.Column("childId", "INTEGER", true, 1, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsChildren.put("parentId", new TableInfo.Column("parentId", "INTEGER", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsChildren.put("name", new TableInfo.Column("name", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsChildren.put("dob", new TableInfo.Column("dob", "TEXT", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsChildren.put("description", new TableInfo.Column("description", "TEXT", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsChildren.put("allergies", new TableInfo.Column("allergies", "TEXT", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsChildren.put("medicalHistory", new TableInfo.Column("medicalHistory", "TEXT", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsChildren.put("assignedTeacherId", new TableInfo.Column("assignedTeacherId", "INTEGER", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        final HashSet<TableInfo.ForeignKey> _foreignKeysChildren = new HashSet<TableInfo.ForeignKey>(0);
        final HashSet<TableInfo.Index> _indicesChildren = new HashSet<TableInfo.Index>(0);
        final TableInfo _infoChildren = new TableInfo("children", _columnsChildren, _foreignKeysChildren, _indicesChildren);
        final TableInfo _existingChildren = TableInfo.read(db, "children");
        if (!_infoChildren.equals(_existingChildren)) {
          return new RoomOpenHelper.ValidationResult(false, "children(com.bybettercode.creche.models.Child).\n"
                  + " Expected:\n" + _infoChildren + "\n"
                  + " Found:\n" + _existingChildren);
        }
        final HashMap<String, TableInfo.Column> _columnsTeachers = new HashMap<String, TableInfo.Column>(3);
        _columnsTeachers.put("teacherId", new TableInfo.Column("teacherId", "INTEGER", true, 1, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsTeachers.put("name", new TableInfo.Column("name", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsTeachers.put("phone", new TableInfo.Column("phone", "TEXT", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        final HashSet<TableInfo.ForeignKey> _foreignKeysTeachers = new HashSet<TableInfo.ForeignKey>(0);
        final HashSet<TableInfo.Index> _indicesTeachers = new HashSet<TableInfo.Index>(0);
        final TableInfo _infoTeachers = new TableInfo("teachers", _columnsTeachers, _foreignKeysTeachers, _indicesTeachers);
        final TableInfo _existingTeachers = TableInfo.read(db, "teachers");
        if (!_infoTeachers.equals(_existingTeachers)) {
          return new RoomOpenHelper.ValidationResult(false, "teachers(com.bybettercode.creche.models.Teacher).\n"
                  + " Expected:\n" + _infoTeachers + "\n"
                  + " Found:\n" + _existingTeachers);
        }
        return new RoomOpenHelper.ValidationResult(true, null);
      }
    }, "7b7b7bc18596c9ce8e78bf88ecb020b6", "c9ac70045c79f369f55f69d7b193073f");
    final SupportSQLiteOpenHelper.Configuration _sqliteConfig = SupportSQLiteOpenHelper.Configuration.builder(config.context).name(config.name).callback(_openCallback).build();
    final SupportSQLiteOpenHelper _helper = config.sqliteOpenHelperFactory.create(_sqliteConfig);
    return _helper;
  }

  @Override
  @NonNull
  protected InvalidationTracker createInvalidationTracker() {
    final HashMap<String, String> _shadowTablesMap = new HashMap<String, String>(0);
    final HashMap<String, Set<String>> _viewTables = new HashMap<String, Set<String>>(0);
    return new InvalidationTracker(this, _shadowTablesMap, _viewTables, "parents","children","teachers");
  }

  @Override
  public void clearAllTables() {
    super.assertNotMainThread();
    final SupportSQLiteDatabase _db = super.getOpenHelper().getWritableDatabase();
    try {
      super.beginTransaction();
      _db.execSQL("DELETE FROM `parents`");
      _db.execSQL("DELETE FROM `children`");
      _db.execSQL("DELETE FROM `teachers`");
      super.setTransactionSuccessful();
    } finally {
      super.endTransaction();
      _db.query("PRAGMA wal_checkpoint(FULL)").close();
      if (!_db.inTransaction()) {
        _db.execSQL("VACUUM");
      }
    }
  }

  @Override
  @NonNull
  protected Map<Class<?>, List<Class<?>>> getRequiredTypeConverters() {
    final HashMap<Class<?>, List<Class<?>>> _typeConvertersMap = new HashMap<Class<?>, List<Class<?>>>();
    _typeConvertersMap.put(ParentDao.class, ParentDao_Impl.getRequiredConverters());
    _typeConvertersMap.put(ChildDao.class, ChildDao_Impl.getRequiredConverters());
    _typeConvertersMap.put(TeacherDao.class, TeacherDao_Impl.getRequiredConverters());
    return _typeConvertersMap;
  }

  @Override
  @NonNull
  public Set<Class<? extends AutoMigrationSpec>> getRequiredAutoMigrationSpecs() {
    final HashSet<Class<? extends AutoMigrationSpec>> _autoMigrationSpecsSet = new HashSet<Class<? extends AutoMigrationSpec>>();
    return _autoMigrationSpecsSet;
  }

  @Override
  @NonNull
  public List<Migration> getAutoMigrations(
      @NonNull final Map<Class<? extends AutoMigrationSpec>, AutoMigrationSpec> autoMigrationSpecs) {
    final List<Migration> _autoMigrations = new ArrayList<Migration>();
    return _autoMigrations;
  }

  @Override
  public ParentDao parentDao() {
    if (_parentDao != null) {
      return _parentDao;
    } else {
      synchronized(this) {
        if(_parentDao == null) {
          _parentDao = new ParentDao_Impl(this);
        }
        return _parentDao;
      }
    }
  }

  @Override
  public ChildDao childDao() {
    if (_childDao != null) {
      return _childDao;
    } else {
      synchronized(this) {
        if(_childDao == null) {
          _childDao = new ChildDao_Impl(this);
        }
        return _childDao;
      }
    }
  }

  @Override
  public TeacherDao teacherDao() {
    if (_teacherDao != null) {
      return _teacherDao;
    } else {
      synchronized(this) {
        if(_teacherDao == null) {
          _teacherDao = new TeacherDao_Impl(this);
        }
        return _teacherDao;
      }
    }
  }
}
