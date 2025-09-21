package com.bybettercode.creche.ui.parentlist

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.bybettercode.creche.databinding.ItemTempChildBinding
import com.bybettercode.creche.models.Child

class TempChildAdapter(
    private val items: List<Child>,
    private val onDelete: (position: Int) -> Unit
) : RecyclerView.Adapter<TempChildAdapter.VH>() {

    inner class VH(private val b: ItemTempChildBinding) : RecyclerView.ViewHolder(b.root) {
        fun bind(position: Int) {
            val c = items[position]
            b.tvChildName.text = c.name
            b.btnRemove.setOnClickListener { onDelete(position) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH =
        VH(ItemTempChildBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun getItemCount(): Int = items.size

    override fun onBindViewHolder(holder: VH, position: Int) = holder.bind(position)
}
