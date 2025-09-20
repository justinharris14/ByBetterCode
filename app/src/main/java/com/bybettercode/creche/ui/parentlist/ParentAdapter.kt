package com.bybettercode.creche.ui.parentlist

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.bybettercode.creche.databinding.ItemParentBinding
import com.bybettercode.creche.models.Parent

class ParentAdapter(private val listener: OnParentClick) : ListAdapter<Parent, ParentAdapter.VH>(DIFF) {
    interface OnParentClick { fun onParentClick(parentId: Long) }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        VH(ItemParentBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun onBindViewHolder(holder: VH, position: Int) {
        val item = getItem(position)
        holder.bind(item)
    }

    inner class VH(private val b: ItemParentBinding) : RecyclerView.ViewHolder(b.root) {
        fun bind(p: Parent) {
            b.parentName.text = p.name
            b.parentPhone.text = p.phone
            b.root.setOnClickListener { listener.onParentClick(p.parentId) }
        }
    }

    companion object {
        private val DIFF = object : DiffUtil.ItemCallback<Parent>() {
            override fun areItemsTheSame(old: Parent, new: Parent) = old.parentId == new.parentId
            override fun areContentsTheSame(old: Parent, new: Parent) = old == new
        }
    }
}
