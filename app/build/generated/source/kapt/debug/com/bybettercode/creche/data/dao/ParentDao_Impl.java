package com.bybettercode.creche.data.dao;

import android.database.Cursor;
import androidx.annotation.NonNull;
import androidx.room.CoroutinesRoom;
import androidx.room.EntityDeletionOrUpdateAdapter;
import androidx.room.EntityInsertionAdapter;
import androidx.room.RoomDatabase;
import androidx.room.RoomSQLiteQuery;
import androidx.room.util.CursorUtil;
import androidx.room.util.DBUtil;
import androidx.sqlite.db.SupportSQLiteStatement;
import com.bybettercode.creche.models.Parent;
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
public final class ParentDao_Impl implements ParentDao {
  private final RoomDatabase __db;

  private final EntityInsertionAdapter<Parent> __insertionAdapterOfParent;

  private final EntityDeletionOrUpdateAdapter<Parent> __deletionAdapterOfParent;

  private final EntityDeletionOrUpdateAdapter<Parent> __updateAdapterOfParent;

  public ParentDao_Impl(@NonNull final RoomDatabase __db) {
    this.__db = __db;
    this.__insertionAdapterOfParent = new EntityInsertionAdapter<Parent>(__db) {
      @Override
      @NonNull
      protected String createQuery() {
        return "INSERT OR REPLACE INTO `parents` (`parentId`,`name`,`phone`,`email`,`idNumber`) VALUES (nullif(?, 0),?,?,?,?)";
      }

      @Override
      protected void bind(@NonNull final SupportSQLiteStatement statement,
          @NonNull final Parent entity) {
        statement.bindLong(1, entity.getParentId());
        if (entity.getName() == null) {
          statement.bindNull(2);
        } else {
          statement.bindString(2, entity.getName());
        }
        if (entity.getPhone() == null) {
          statement.bindNull(3);
        } else {
          statement.bindString(3, entity.getPhone());
        }
        if (entity.getEmail() == null) {
          statement.bindNull(4);
        } else {
          statement.bindString(4, entity.getEmail());
        }
        if (entity.getIdNumber() == null) {
          statement.bindNull(5);
        } else {
          statement.bindString(5, entity.getIdNumber());
        }
      }
    };
    this.__deletionAdapterOfParent = new EntityDeletionOrUpdateAdapter<Parent>(__db) {
      @Override
      @NonNull
      protected String createQuery() {
        return "DELETE FROM `parents` WHERE `parentId` = ?";
      }

      @Override
      protected void bind(@NonNull final SupportSQLiteStatement statement,
          @NonNull final Parent entity) {
        statement.bindLong(1, entity.getParentId());
      }
    };
    this.__updateAdapterOfParent = new EntityDeletionOrUpdateAdapter<Parent>(__db) {
      @Override
      @NonNull
      protected String createQuery() {
        return "UPDATE OR ABORT `parents` SET `parentId` = ?,`name` = ?,`phone` = ?,`email` = ?,`idNumber` = ? WHERE `parentId` = ?";
      }

      @Override
      protected void bind(@NonNull final SupportSQLiteStatement statement,
          @NonNull final Parent entity) {
        statement.bindLong(1, entity.getParentId());
        if (entity.getName() == null) {
          statement.bindNull(2);
        } else {
          statement.bindString(2, entity.getName());
        }
        if (entity.getPhone() == null) {
          statement.bindNull(3);
        } else {
          statement.bindString(3, entity.getPhone());
        }
        if (entity.getEmail() == null) {
          statement.bindNull(4);
        } else {
          statement.bindString(4, entity.getEmail());
        }
        if (entity.getIdNumber() == null) {
          statement.bindNull(5);
        } else {
          statement.bindString(5, entity.getIdNumber());
        }
        statement.bindLong(6, entity.getParentId());
      }
    };
  }

  @Override
  public Object insert(final Parent parent, final Continuation<? super Long> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Long>() {
      @Override
      @NonNull
      public Long call() throws Exception {
        __db.beginTransaction();
        try {
          final Long _result = __insertionAdapterOfParent.insertAndReturnId(parent);
          __db.setTransactionSuccessful();
          return _result;
        } finally {
          __db.endTransaction();
        }
      }
    }, $completion);
  }

  @Override
  public Object delete(final Parent parent, final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        __db.beginTransaction();
        try {
          __deletionAdapterOfParent.handle(parent);
          __db.setTransactionSuccessful();
          return Unit.INSTANCE;
        } finally {
          __db.endTransaction();
        }
      }
    }, $completion);
  }

  @Override
  public Object update(final Parent parent, final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        __db.beginTransaction();
        try {
          __updateAdapterOfParent.handle(parent);
          __db.setTransactionSuccessful();
          return Unit.INSTANCE;
        } finally {
          __db.endTransaction();
        }
      }
    }, $completion);
  }

  @Override
  public Flow<List<Parent>> getAllParents() {
    final String _sql = "SELECT * FROM parents ORDER BY name";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 0);
    return CoroutinesRoom.createFlow(__db, false, new String[] {"parents"}, new Callable<List<Parent>>() {
      @Override
      @NonNull
      public List<Parent> call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfParentId = CursorUtil.getColumnIndexOrThrow(_cursor, "parentId");
          final int _cursorIndexOfName = CursorUtil.getColumnIndexOrThrow(_cursor, "name");
          final int _cursorIndexOfPhone = CursorUtil.getColumnIndexOrThrow(_cursor, "phone");
          final int _cursorIndexOfEmail = CursorUtil.getColumnIndexOrThrow(_cursor, "email");
          final int _cursorIndexOfIdNumber = CursorUtil.getColumnIndexOrThrow(_cursor, "idNumber");
          final List<Parent> _result = new ArrayList<Parent>(_cursor.getCount());
          while (_cursor.moveToNext()) {
            final Parent _item;
            final long _tmpParentId;
            _tmpParentId = _cursor.getLong(_cursorIndexOfParentId);
            final String _tmpName;
            if (_cursor.isNull(_cursorIndexOfName)) {
              _tmpName = null;
            } else {
              _tmpName = _cursor.getString(_cursorIndexOfName);
            }
            final String _tmpPhone;
            if (_cursor.isNull(_cursorIndexOfPhone)) {
              _tmpPhone = null;
            } else {
              _tmpPhone = _cursor.getString(_cursorIndexOfPhone);
            }
            final String _tmpEmail;
            if (_cursor.isNull(_cursorIndexOfEmail)) {
              _tmpEmail = null;
            } else {
              _tmpEmail = _cursor.getString(_cursorIndexOfEmail);
            }
            final String _tmpIdNumber;
            if (_cursor.isNull(_cursorIndexOfIdNumber)) {
              _tmpIdNumber = null;
            } else {
              _tmpIdNumber = _cursor.getString(_cursorIndexOfIdNumber);
            }
            _item = new Parent(_tmpParentId,_tmpName,_tmpPhone,_tmpEmail,_tmpIdNumber);
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
  public Flow<List<Parent>> searchParents(final String query) {
    final String _sql = "SELECT * FROM parents WHERE name LIKE '%' || ? || '%' OR phone LIKE '%' || ? || '%' ORDER BY name";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 2);
    int _argIndex = 1;
    if (query == null) {
      _statement.bindNull(_argIndex);
    } else {
      _statement.bindString(_argIndex, query);
    }
    _argIndex = 2;
    if (query == null) {
      _statement.bindNull(_argIndex);
    } else {
      _statement.bindString(_argIndex, query);
    }
    return CoroutinesRoom.createFlow(__db, false, new String[] {"parents"}, new Callable<List<Parent>>() {
      @Override
      @NonNull
      public List<Parent> call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfParentId = CursorUtil.getColumnIndexOrThrow(_cursor, "parentId");
          final int _cursorIndexOfName = CursorUtil.getColumnIndexOrThrow(_cursor, "name");
          final int _cursorIndexOfPhone = CursorUtil.getColumnIndexOrThrow(_cursor, "phone");
          final int _cursorIndexOfEmail = CursorUtil.getColumnIndexOrThrow(_cursor, "email");
          final int _cursorIndexOfIdNumber = CursorUtil.getColumnIndexOrThrow(_cursor, "idNumber");
          final List<Parent> _result = new ArrayList<Parent>(_cursor.getCount());
          while (_cursor.moveToNext()) {
            final Parent _item;
            final long _tmpParentId;
            _tmpParentId = _cursor.getLong(_cursorIndexOfParentId);
            final String _tmpName;
            if (_cursor.isNull(_cursorIndexOfName)) {
              _tmpName = null;
            } else {
              _tmpName = _cursor.getString(_cursorIndexOfName);
            }
            final String _tmpPhone;
            if (_cursor.isNull(_cursorIndexOfPhone)) {
              _tmpPhone = null;
            } else {
              _tmpPhone = _cursor.getString(_cursorIndexOfPhone);
            }
            final String _tmpEmail;
            if (_cursor.isNull(_cursorIndexOfEmail)) {
              _tmpEmail = null;
            } else {
              _tmpEmail = _cursor.getString(_cursorIndexOfEmail);
            }
            final String _tmpIdNumber;
            if (_cursor.isNull(_cursorIndexOfIdNumber)) {
              _tmpIdNumber = null;
            } else {
              _tmpIdNumber = _cursor.getString(_cursorIndexOfIdNumber);
            }
            _item = new Parent(_tmpParentId,_tmpName,_tmpPhone,_tmpEmail,_tmpIdNumber);
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

  @NonNull
  public static List<Class<?>> getRequiredConverters() {
    return Collections.emptyList();
  }
}
