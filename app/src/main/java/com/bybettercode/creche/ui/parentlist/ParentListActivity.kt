package com.bybettercode.creche.ui.parentlist

import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.bybettercode.creche.data.db.AppDatabase
import com.bybettercode.creche.data.repository.ParentRepository
import com.bybettercode.creche.databinding.ActivityParentListBinding
import com.bybettercode.creche.viewmodel.ParentListViewModel
import com.bybettercode.creche.viewmodel.ParentListViewModelFactory

class ParentListActivity : AppCompatActivity(), ParentAdapter.OnParentClick {
    private lateinit var binding: ActivityParentListBinding

    // viewModel with factory
    private val viewModel: ParentListViewModel by viewModels {
        val db = AppDatabase.getInstance(applicationContext)
        ParentListViewModelFactory(ParentRepository(db.parentDao()))
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityParentListBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val adapter = ParentAdapter(this)
        binding.recyclerParents.layoutManager = LinearLayoutManager(this)
        binding.recyclerParents.adapter = adapter

        // Load all parents initially
        viewModel.loadAll()

        viewModel.parents.observe(this) { list ->
            Log.d("PARENT_LIST", "Parents observed: $list")
            adapter.submitList(list)
        }

        binding.searchButton.setOnClickListener {
            val q = binding.searchEdit.text.toString()
            viewModel.setQuery(q)
        }

        // Launch AddParentActivity when FAB clicked
        binding.fabAddParent.setOnClickListener {
            val intent = Intent(this, AddParentActivity::class.java)
            startActivity(intent)
        }
    }

    override fun onParentClick(parentId: Long) {
        // Sanity check: only open if valid id
        if (parentId <= 0L) {
            Log.e("PARENT_LIST", "Invalid parentId clicked: $parentId")
            return
        }
        val intent = Intent(this, com.bybettercode.creche.ui.childlist.ChildListActivity::class.java)
        intent.putExtra("parentId", parentId)
        startActivity(intent)
    }
}
