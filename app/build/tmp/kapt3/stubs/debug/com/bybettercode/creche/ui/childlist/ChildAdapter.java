package com.bybettercode.creche.ui.childlist;

@kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u00002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\u0002\n\u0002\b\u0002\n\u0002\u0010\b\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0005\u0018\u0000 \u00102\u0012\u0012\u0004\u0012\u00020\u0002\u0012\b\u0012\u00060\u0003R\u00020\u00000\u0001:\u0003\u0010\u0011\u0012B\r\u0012\u0006\u0010\u0004\u001a\u00020\u0005\u00a2\u0006\u0002\u0010\u0006J\u001c\u0010\u0007\u001a\u00020\b2\n\u0010\t\u001a\u00060\u0003R\u00020\u00002\u0006\u0010\n\u001a\u00020\u000bH\u0016J\u001c\u0010\f\u001a\u00060\u0003R\u00020\u00002\u0006\u0010\r\u001a\u00020\u000e2\u0006\u0010\u000f\u001a\u00020\u000bH\u0016R\u000e\u0010\u0004\u001a\u00020\u0005X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u0013"}, d2 = {"Lcom/bybettercode/creche/ui/childlist/ChildAdapter;", "Landroidx/recyclerview/widget/ListAdapter;", "Lcom/bybettercode/creche/models/Child;", "Lcom/bybettercode/creche/ui/childlist/ChildAdapter$VH;", "listener", "Lcom/bybettercode/creche/ui/childlist/ChildAdapter$OnChildClick;", "(Lcom/bybettercode/creche/ui/childlist/ChildAdapter$OnChildClick;)V", "onBindViewHolder", "", "holder", "position", "", "onCreateViewHolder", "parent", "Landroid/view/ViewGroup;", "viewType", "Companion", "OnChildClick", "VH", "app_debug"})
public final class ChildAdapter extends androidx.recyclerview.widget.ListAdapter<com.bybettercode.creche.models.Child, com.bybettercode.creche.ui.childlist.ChildAdapter.VH> {
    @org.jetbrains.annotations.NotNull()
    private final com.bybettercode.creche.ui.childlist.ChildAdapter.OnChildClick listener = null;
    @org.jetbrains.annotations.NotNull()
    private static final androidx.recyclerview.widget.DiffUtil.ItemCallback<com.bybettercode.creche.models.Child> DIFF = null;
    @org.jetbrains.annotations.NotNull()
    public static final com.bybettercode.creche.ui.childlist.ChildAdapter.Companion Companion = null;
    
    public ChildAdapter(@org.jetbrains.annotations.NotNull()
    com.bybettercode.creche.ui.childlist.ChildAdapter.OnChildClick listener) {
        super(null);
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.NotNull()
    public com.bybettercode.creche.ui.childlist.ChildAdapter.VH onCreateViewHolder(@org.jetbrains.annotations.NotNull()
    android.view.ViewGroup parent, int viewType) {
        return null;
    }
    
    @java.lang.Override()
    public void onBindViewHolder(@org.jetbrains.annotations.NotNull()
    com.bybettercode.creche.ui.childlist.ChildAdapter.VH holder, int position) {
    }
    
    @kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000\u0016\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\b\u0086\u0003\u0018\u00002\u00020\u0001B\u0007\b\u0002\u00a2\u0006\u0002\u0010\u0002R\u0014\u0010\u0003\u001a\b\u0012\u0004\u0012\u00020\u00050\u0004X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u0006"}, d2 = {"Lcom/bybettercode/creche/ui/childlist/ChildAdapter$Companion;", "", "()V", "DIFF", "Landroidx/recyclerview/widget/DiffUtil$ItemCallback;", "Lcom/bybettercode/creche/models/Child;", "app_debug"})
    public static final class Companion {
        
        private Companion() {
            super();
        }
    }
    
    @kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000\u0016\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0010\u0002\n\u0000\n\u0002\u0010\t\n\u0000\bf\u0018\u00002\u00020\u0001J\u0010\u0010\u0002\u001a\u00020\u00032\u0006\u0010\u0004\u001a\u00020\u0005H&\u00a8\u0006\u0006"}, d2 = {"Lcom/bybettercode/creche/ui/childlist/ChildAdapter$OnChildClick;", "", "onChildClick", "", "childId", "", "app_debug"})
    public static abstract interface OnChildClick {
        
        public abstract void onChildClick(long childId);
    }
    
    @kotlin.Metadata(mv = {1, 9, 0}, k = 1, xi = 48, d1 = {"\u0000\u001e\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\b\u0086\u0004\u0018\u00002\u00020\u0001B\r\u0012\u0006\u0010\u0002\u001a\u00020\u0003\u00a2\u0006\u0002\u0010\u0004J\u000e\u0010\u0005\u001a\u00020\u00062\u0006\u0010\u0007\u001a\u00020\bR\u000e\u0010\u0002\u001a\u00020\u0003X\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006\t"}, d2 = {"Lcom/bybettercode/creche/ui/childlist/ChildAdapter$VH;", "Landroidx/recyclerview/widget/RecyclerView$ViewHolder;", "b", "Lcom/bybettercode/creche/databinding/ItemChildBinding;", "(Lcom/bybettercode/creche/ui/childlist/ChildAdapter;Lcom/bybettercode/creche/databinding/ItemChildBinding;)V", "bind", "", "c", "Lcom/bybettercode/creche/models/Child;", "app_debug"})
    public final class VH extends androidx.recyclerview.widget.RecyclerView.ViewHolder {
        @org.jetbrains.annotations.NotNull()
        private final com.bybettercode.creche.databinding.ItemChildBinding b = null;
        
        public VH(@org.jetbrains.annotations.NotNull()
        com.bybettercode.creche.databinding.ItemChildBinding b) {
            super(null);
        }
        
        public final void bind(@org.jetbrains.annotations.NotNull()
        com.bybettercode.creche.models.Child c) {
        }
    }
}