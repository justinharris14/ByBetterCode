package com.bybettercode.creche.ui.childlist

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.bybettercode.creche.databinding.ItemChildBinding
import com.bybettercode.creche.models.Child

class ChildAdapter(private val listener: OnChildClick) : ListAdapter<Child, ChildAdapter.VH>(DIFF) {
    interface OnChildClick { fun onChildClick(childId: Long) }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        VH(ItemChildBinding.inflate(LayoutInflater.from(parent.context), parent, false))

    override fun onBindViewHolder(holder: VH, position: Int) { holder.bind(getItem(position)) }

    inner class VH(private val b: ItemChildBinding) : RecyclerView.ViewHolder(b.root) {
        fun bind(c: Child) {
            b.childName.text = c.name
            b.childDob.text = c.dob ?: ""
            b.root.setOnClickListener { listener.onChildClick(c.childId) }
        }

    }

    companion object {
        private val DIFF = object : DiffUtil.ItemCallback<Child>() {
            override fun areItemsTheSame(old: Child, new: Child) = old.childId == new.childId
            override fun areContentsTheSame(old: Child, new: Child) = old == new
        }
    }
}
