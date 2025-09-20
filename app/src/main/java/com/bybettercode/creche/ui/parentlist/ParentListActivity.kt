package com.bybettercode.creche.ui.parentlist

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.activity.viewModels
import androidx.recyclerview.widget.LinearLayoutManager
import com.bybettercode.creche.data.db.AppDatabase
import com.bybettercode.creche.data.repository.ParentRepository
import com.bybettercode.creche.databinding.ActivityParentListBinding
import com.bybettercode.creche.viewmodel.ParentListViewModel
import com.bybettercode.creche.viewmodel.ParentListViewModelFactory

class ParentListActivity : AppCompatActivity(), ParentAdapter.OnParentClick {
    private lateinit var binding: ActivityParentListBinding
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

        viewModel.parents.observe(this) { list ->
            adapter.submitList(list)
        }

        binding.searchButton.setOnClickListener {
            val q = binding.searchEdit.text.toString()
            viewModel.setQuery(q)
        }
    }

    override fun onParentClick(parentId: Long) {
        val intent = Intent(this, com.bybettercode.creche.ui.childlist.ChildListActivity::class.java)
        intent.putExtra("parentId", parentId)
        startActivity(intent)
    }
}
