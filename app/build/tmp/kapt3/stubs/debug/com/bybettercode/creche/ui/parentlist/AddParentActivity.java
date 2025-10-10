package com.bybettercode.creche.ui.parentlist;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000J\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010!\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u0002\n\u0000\n\u0002\u0010\b\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\u0018\u00002\u00020\u0001B\u0005\u00a2\u0006\u0002\u0010\u0002J\"\u0010\u000e\u001a\u00020\u000f2\u0006\u0010\u0010\u001a\u00020\u00112\u0006\u0010\u0012\u001a\u00020\u00112\b\u0010\u0013\u001a\u0004\u0018\u00010\u0014H\u0015J\u0012\u0010\u0015\u001a\u00020\u000f2\b\u0010\u0016\u001a\u0004\u0018\u00010\u0017H\u0014R\u000e\u0010\u0003\u001a\u00020\u0004X\u0082.\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0005\u001a\u00020\u0006X\u0082.\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0007\u001a\u00020\bX\u0082.\u00a2\u0006\u0002\n\u0000R\u000e\u0010\t\u001a\u00020\nX\u0082.\u00a2\u0006\u0002\n\u0000R\u0014\u0010\u000b\u001a\b\u0012\u0004\u0012\u00020\r0\fX\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u0018"}, d2 = {"Lcom/bybettercode/creche/ui/parentlist/AddParentActivity;", "Landroidx/appcompat/app/AppCompatActivity;", "()V", "adapter", "Lcom/bybettercode/creche/ui/parentlist/TempChildAdapter;", "binding", "Lcom/bybettercode/creche/databinding/ActivityAddParentBinding;", "childRepo", "Lcom/bybettercode/creche/data/repository/ChildRepository;", "parentRepo", "Lcom/bybettercode/creche/data/repository/ParentRepository;", "tempChildren", "", "Lcom/bybettercode/creche/models/Child;", "onActivityResult", "", "requestCode", "", "resultCode", "data", "Landroid/content/Intent;", "onCreate", "savedInstanceState", "Landroid/os/Bundle;", "app_debug"})
public final class AddParentActivity extends androidx.appcompat.app.AppCompatActivity {
    private com.bybettercode.creche.databinding.ActivityAddParentBinding binding;
    @org.jetbrains.annotations.NotNull()
    private final java.util.List<com.bybettercode.creche.models.Child> tempChildren = null;
    private com.bybettercode.creche.ui.parentlist.TempChildAdapter adapter;
    private com.bybettercode.creche.data.repository.ParentRepository parentRepo;
    private com.bybettercode.creche.data.repository.ChildRepository childRepo;
    
    public AddParentActivity() {
        super();
    }
    
    @java.lang.Override()
    protected void onCreate(@org.jetbrains.annotations.Nullable()
    android.os.Bundle savedInstanceState) {
    }
    
    @java.lang.Override()
    @java.lang.Deprecated()
    protected void onActivityResult(int requestCode, int resultCode, @org.jetbrains.annotations.Nullable()
    android.content.Intent data) {
    }
}