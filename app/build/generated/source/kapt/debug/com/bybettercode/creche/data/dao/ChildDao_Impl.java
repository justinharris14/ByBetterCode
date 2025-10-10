package com.bybettercode.creche.data.dao;

import android.database.Cursor;
import android.os.CancellationSignal;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.room.CoroutinesRoom;
import androidx.room.EntityDeletionOrUpdateAdapter;
import androidx.room.EntityInsertionAdapter;
import androidx.room.RoomDatabase;
import androidx.room.RoomSQLiteQuery;
import androidx.room.SharedSQLiteStatement;
import androidx.room.util.CursorUtil;
import androidx.room.util.DBUtil;
import androidx.sqlite.db.SupportSQLiteStatement;
import com.bybettercode.creche.models.Child;
import java.lang.Class;
import java.lang.Exception;
import java.lang.Long;
import java.lang.Object;
import java.lang.Override;
import java.lang.String;
import java.lang.SuppressWarnings;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.Callable;
import javax.annotation.processing.Generated;
import kotlin.Unit;
import kotlin.coroutines.Continuation;
import kotlinx.coroutines.flow.Flow;

@Generated("androidx.room.RoomProcessor")
@SuppressWarnings({"unchecked", "deprecation"})
public final class ChildDao_Impl implements ChildDao {
  private final RoomDatabase __db;

  private final EntityInsertionAdapter<Child> __insertionAdapterOfChild;

  private final EntityDeletionOrUpdateAdapter<Child> __deletionAdapterOfChild;

  private final EntityDeletionOrUpdateAdapter<Child> __updateAdapterOfChild;

  private final SharedSQLiteStatement __preparedStmtOfReassignTeacher;

  public ChildDao_Impl(@NonNull final RoomDatabase __db) {
    this.__db = __db;
    this.__insertionAdapterOfChild = new EntityInsertionAdapter<Child>(__db) {
      @Override
      @NonNull
      protected String createQuery() {
        return "INSERT OR REPLACE INTO `children` (`childId`,`parentId`,`name`,`dob`,`description`,`allergies`,`medicalHistory`,`assignedTeacherId`) VALUES (nullif(?, 0),?,?,?,?,?,?,?)";
      }

      @Override
      protected void bind(@NonNull final SupportSQLiteStatement statement,
          @NonNull final Child entity) {
        statement.bindLong(1, entity.getChildId());
        statement.bindLong(2, entity.getParentId());
        if (entity.getName() == null) {
          statement.bindNull(3);
        } else {
          statement.bindString(3, entity.getName());
        }
        if (entity.getDob() == null) {
          statement.bindNull(4);
        } else {
          statement.bindString(4, entity.getDob());
        }
        if (entity.getDescription() == null) {
          statement.bindNull(5);
        } else {
          statement.bindString(5, entity.getDescription());
        }
        if (entity.getAllergies() == null) {
          statement.bindNull(6);
        } else {
          statement.bindString(6, entity.getAllergies());
        }
        if (entity.getMedicalHistory() == null) {
          statement.bindNull(7);
        } else {
          statement.bindString(7, entity.getMedicalHistory());
        }
        if (entity.getAssignedTeacherId() == null) {
          statement.bindNull(8);
        } else {
          statement.bindLong(8, entity.getAssignedTeacherId());
        }
      }
    };
    this.__deletionAdapterOfChild = new EntityDeletionOrUpdateAdapter<Child>(__db) {
      @Override
      @NonNull
      protected String createQuery() {
        return "DELETE FROM `children` WHERE `childId` = ?";
      }

      @Override
      protected void bind(@NonNull final SupportSQLiteStatement statement,
          @NonNull final Child entity) {
        statement.bindLong(1, entity.getChildId());
      }
    };
    this.__updateAdapterOfChild = new EntityDeletionOrUpdateAdapter<Child>(__db) {
      @Override
      @NonNull
      protected String createQuery() {
        return "UPDATE OR ABORT `children` SET `childId` = ?,`parentId` = ?,`name` = ?,`dob` = ?,`description` = ?,`allergies` = ?,`medicalHistory` = ?,`assignedTeacherId` = ? WHERE `childId` = ?";
      }

      @Override
      protected void bind(@NonNull final SupportSQLiteStatement statement,
          @NonNull final Child entity) {
        statement.bindLong(1, entity.getChildId());
        statement.bindLong(2, entity.getParentId());
        if (entity.getName() == null) {
          statement.bindNull(3);
        } else {
          statement.bindString(3, entity.getName());
        }
        if (entity.getDob() == null) {
          statement.bindNull(4);
        } else {
          statement.bindString(4, entity.getDob());
        }
        if (entity.getDescription() == null) {
          statement.bindNull(5);
        } else {
          statement.bindString(5, entity.getDescription());
        }
        if (entity.getAllergies() == null) {
          statement.bindNull(6);
        } else {
          statement.bindString(6, entity.getAllergies());
        }
        if (entity.getMedicalHistory() == null) {
          statement.bindNull(7);
        } else {
          statement.bindString(7, entity.getMedicalHistory());
        }
        if (entity.getAssignedTeacherId() == null) {
          statement.bindNull(8);
        } else {
          statement.bindLong(8, entity.getAssignedTeacherId());
        }
        statement.bindLong(9, entity.getChildId());
      }
    };
    this.__preparedStmtOfReassignTeacher = new SharedSQLiteStatement(__db) {
      @Override
      @NonNull
      public String createQuery() {
        final String _query = "UPDATE children SET assignedTeacherId = ? WHERE childId = ?";
        return _query;
      }
    };
  }

  @Override
  public Object insert(final Child child, final Continuation<? super Long> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Long>() {
      @Override
      @NonNull
      public Long call() throws Exception {
        __db.beginTransaction();
        try {
          final Long _result = __insertionAdapterOfChild.insertAndReturnId(child);
          __db.setTransactionSuccessful();
          return _result;
        } finally {
          __db.endTransaction();
        }
      }
    }, $completion);
  }

  @Override
  public Object delete(final Child child, final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        __db.beginTransaction();
        try {
          __deletionAdapterOfChild.handle(child);
          __db.setTransactionSuccessful();
          return Unit.INSTANCE;
        } finally {
          __db.endTransaction();
        }
      }
    }, $completion);
  }

  @Override
  public Object update(final Child child, final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        __db.beginTransaction();
        try {
          __updateAdapterOfChild.handle(child);
          __db.setTransactionSuccessful();
          return Unit.INSTANCE;
        } finally {
          __db.endTransaction();
        }
      }
    }, $completion);
  }

  @Override
  public Object reassignTeacher(final long childId, final long teacherId,
      final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        final SupportSQLiteStatement _stmt = __preparedStmtOfReassignTeacher.acquire();
        int _argIndex = 1;
        _stmt.bindLong(_argIndex, teacherId);
        _argIndex = 2;
        _stmt.bindLong(_argIndex, childId);
        try {
          __db.beginTransaction();
          try {
            _stmt.executeUpdateDelete();
            __db.setTransactionSuccessful();
            return Unit.INSTANCE;
          } finally {
            __db.endTransaction();
          }
        } finally {
          __preparedStmtOfReassignTeacher.release(_stmt);
        }
      }
    }, $completion);
  }

  @Override
  public Flow<List<Child>> getChildrenForParent(final long parentId) {
    final String _sql = "SELECT * FROM children WHERE parentId = ? ORDER BY name";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 1);
    int _argIndex = 1;
    _statement.bindLong(_argIndex, parentId);
    return CoroutinesRoom.createFlow(__db, false, new String[] {"children"}, new Callable<List<Child>>() {
      @Override
      @NonNull
      public List<Child> call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfChildId = CursorUtil.getColumnIndexOrThrow(_cursor, "childId");
          final int _cursorIndexOfParentId = CursorUtil.getColumnIndexOrThrow(_cursor, "parentId");
          final int _cursorIndexOfName = CursorUtil.getColumnIndexOrThrow(_cursor, "name");
          final int _cursorIndexOfDob = CursorUtil.getColumnIndexOrThrow(_cursor, "dob");
          final int _cursorIndexOfDescription = CursorUtil.getColumnIndexOrThrow(_cursor, "description");
          final int _cursorIndexOfAllergies = CursorUtil.getColumnIndexOrThrow(_cursor, "allergies");
          final int _cursorIndexOfMedicalHistory = CursorUtil.getColumnIndexOrThrow(_cursor, "medicalHistory");
          final int _cursorIndexOfAssignedTeacherId = CursorUtil.getColumnIndexOrThrow(_cursor, "assignedTeacherId");
          final List<Child> _result = new ArrayList<Child>(_cursor.getCount());
          while (_cursor.moveToNext()) {
            final Child _item;
            final long _tmpChildId;
            _tmpChildId = _cursor.getLong(_cursorIndexOfChildId);
            final long _tmpParentId;
            _tmpParentId = _cursor.getLong(_cursorIndexOfParentId);
            final String _tmpName;
            if (_cursor.isNull(_cursorIndexOfName)) {
              _tmpName = null;
            } else {
              _tmpName = _cursor.getString(_cursorIndexOfName);
            }
            final String _tmpDob;
            if (_cursor.isNull(_cursorIndexOfDob)) {
              _tmpDob = null;
            } else {
              _tmpDob = _cursor.getString(_cursorIndexOfDob);
            }
            final String _tmpDescription;
            if (_cursor.isNull(_cursorIndexOfDescription)) {
              _tmpDescription = null;
            } else {
              _tmpDescription = _cursor.getString(_cursorIndexOfDescription);
            }
            final String _tmpAllergies;
            if (_cursor.isNull(_cursorIndexOfAllergies)) {
              _tmpAllergies = null;
            } else {
              _tmpAllergies = _cursor.getString(_cursorIndexOfAllergies);
            }
            final String _tmpMedicalHistory;
            if (_cursor.isNull(_cursorIndexOfMedicalHistory)) {
              _tmpMedicalHistory = null;
            } else {
              _tmpMedicalHistory = _cursor.getString(_cursorIndexOfMedicalHistory);
            }
            final Long _tmpAssignedTeacherId;
            if (_cursor.isNull(_cursorIndexOfAssignedTeacherId)) {
              _tmpAssignedTeacherId = null;
            } else {
              _tmpAssignedTeacherId = _cursor.getLong(_cursorIndexOfAssignedTeacherId);
            }
            _item = new Child(_tmpChildId,_tmpParentId,_tmpName,_tmpDob,_tmpDescription,_tmpAllergies,_tmpMedicalHistory,_tmpAssignedTeacherId);
            _result.add(_item);
          }
          return _result;
        } finally {
          _cursor.close();
        }
      }

      @Override
      protected void finalize() {
        _statement.release();
      }
    });
  }

  @Override
  public Object getChildById(final long childId, final Continuation<? super Child> $completion) {
    final String _sql = "SELECT * FROM children WHERE childId = ? LIMIT 1";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 1);
    int _argIndex = 1;
    _statement.bindLong(_argIndex, childId);
    final CancellationSignal _cancellationSignal = DBUtil.createCancellationSignal();
    return CoroutinesRoom.execute(__db, false, _cancellationSignal, new Callable<Child>() {
      @Override
      @Nullable
      public Child call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfChildId = CursorUtil.getColumnIndexOrThrow(_cursor, "childId");
          final int _cursorIndexOfParentId = CursorUtil.getColumnIndexOrThrow(_cursor, "parentId");
          final int _cursorIndexOfName = CursorUtil.getColumnIndexOrThrow(_cursor, "name");
          final int _cursorIndexOfDob = CursorUtil.getColumnIndexOrThrow(_cursor, "dob");
          final int _cursorIndexOfDescription = CursorUtil.getColumnIndexOrThrow(_cursor, "description");
          final int _cursorIndexOfAllergies = CursorUtil.getColumnIndexOrThrow(_cursor, "allergies");
          final int _cursorIndexOfMedicalHistory = CursorUtil.getColumnIndexOrThrow(_cursor, "medicalHistory");
          final int _cursorIndexOfAssignedTeacherId = CursorUtil.getColumnIndexOrThrow(_cursor, "assignedTeacherId");
          final Child _result;
          if (_cursor.moveToFirst()) {
            final long _tmpChildId;
            _tmpChildId = _cursor.getLong(_cursorIndexOfChildId);
            final long _tmpParentId;
            _tmpParentId = _cursor.getLong(_cursorIndexOfParentId);
            final String _tmpName;
            if (_cursor.isNull(_cursorIndexOfName)) {
              _tmpName = null;
            } else {
              _tmpName = _cursor.getString(_cursorIndexOfName);
            }
            final String _tmpDob;
            if (_cursor.isNull(_cursorIndexOfDob)) {
              _tmpDob = null;
            } else {
              _tmpDob = _cursor.getString(_cursorIndexOfDob);
            }
            final String _tmpDescription;
            if (_cursor.isNull(_cursorIndexOfDescription)) {
              _tmpDescription = null;
            } else {
              _tmpDescription = _cursor.getString(_cursorIndexOfDescription);
            }
            final String _tmpAllergies;
            if (_cursor.isNull(_cursorIndexOfAllergies)) {
              _tmpAllergies = null;
            } else {
              _tmpAllergies = _cursor.getString(_cursorIndexOfAllergies);
            }
            final String _tmpMedicalHistory;
            if (_cursor.isNull(_cursorIndexOfMedicalHistory)) {
              _tmpMedicalHistory = null;
            } else {
              _tmpMedicalHistory = _cursor.getString(_cursorIndexOfMedicalHistory);
            }
            final Long _tmpAssignedTeacherId;
            if (_cursor.isNull(_cursorIndexOfAssignedTeacherId)) {
              _tmpAssignedTeacherId = null;
            } else {
              _tmpAssignedTeacherId = _cursor.getLong(_cursorIndexOfAssignedTeacherId);
            }
            _result = new Child(_tmpChildId,_tmpParentId,_tmpName,_tmpDob,_tmpDescription,_tmpAllergies,_tmpMedicalHistory,_tmpAssignedTeacherId);
          } else {
            _result = null;
          }
          return _result;
        } finally {
          _cursor.close();
          _statement.release();
        }
      }
    }, $completion);
  }

  @NonNull
  public static List<Class<?>> getRequiredConverters() {
    return Collections.emptyList();
  }
}
