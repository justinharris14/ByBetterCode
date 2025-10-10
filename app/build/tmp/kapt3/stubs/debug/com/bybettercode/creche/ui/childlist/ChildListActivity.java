package com.bybettercode.creche.ui.childlist;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u00002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\t\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0005\n\u0002\u0010\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0000\u0018\u00002\u00020\u00012\u00020\u0002B\u0005\u00a2\u0006\u0002\u0010\u0003J\u0010\u0010\u000e\u001a\u00020\u000f2\u0006\u0010\u0010\u001a\u00020\u0007H\u0016J\u0012\u0010\u0011\u001a\u00020\u000f2\b\u0010\u0012\u001a\u0004\u0018\u00010\u0013H\u0014R\u000e\u0010\u0004\u001a\u00020\u0005X\u0082.\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0006\u001a\u00020\u0007X\u0082\u000e\u00a2\u0006\u0002\n\u0000R\u001b\u0010\b\u001a\u00020\t8BX\u0082\u0084\u0002\u00a2\u0006\f\n\u0004\b\f\u0010\r\u001a\u0004\b\n\u0010\u000b\u00a8\u0006\u0014"}, d2 = {"Lcom/bybettercode/creche/ui/childlist/ChildListActivity;", "Landroidx/appcompat/app/AppCompatActivity;", "Lcom/bybettercode/creche/ui/childlist/ChildAdapter$OnChildClick;", "()V", "binding", "Lcom/bybettercode/creche/databinding/ActivityChildListBinding;", "parentId", "", "viewModel", "Lcom/bybettercode/creche/viewmodel/ChildListViewModel;", "getViewModel", "()Lcom/bybettercode/creche/viewmodel/ChildListViewModel;", "viewModel$delegate", "Lkotlin/Lazy;", "onChildClick", "", "childId", "onCreate", "savedInstanceState", "Landroid/os/Bundle;", "app_debug"})
public final class ChildListActivity extends androidx.appcompat.app.AppCompatActivity implements com.bybettercode.creche.ui.childlist.ChildAdapter.OnChildClick {
    private com.bybettercode.creche.databinding.ActivityChildListBinding binding;
    @org.jetbrains.annotations.NotNull()
    private final kotlin.Lazy viewModel$delegate = null;
    private long parentId = -1L;
    
    public ChildListActivity() {
        super();
    }
    
    private final com.bybettercode.creche.viewmodel.ChildListViewModel getViewModel() {
        return null;
    }
    
    @java.lang.Override()
    protected void onCreate(@org.jetbrains.annotations.Nullable()
    android.os.Bundle savedInstanceState) {
    }
    
    @java.lang.Override()
    public void onChildClick(long childId) {
    }
}