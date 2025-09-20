package com.bybettercode.creche.ui.childlist

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.activity.viewModels
import androidx.recyclerview.widget.LinearLayoutManager
import com.bybettercode.creche.data.db.AppDatabase
import com.bybettercode.creche.data.repository.ChildRepository
import com.bybettercode.creche.databinding.ActivityChildListBinding
import com.bybettercode.creche.viewmodel.ChildListViewModel
import com.bybettercode.creche.viewmodel.ChildListViewModelFactory

class ChildListActivity : AppCompatActivity(), ChildAdapter.OnChildClick {
    private lateinit var binding: ActivityChildListBinding
    private val viewModel: ChildListViewModel by viewModels {
        val db = AppDatabase.getInstance(applicationContext)
        ChildListViewModelFactory(ChildRepository(db.childDao()))
    }

    private var parentId: Long = -1L

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityChildListBinding.inflate(layoutInflater)
        setContentView(binding.root)

        parentId = intent.getLongExtra("parentId", -1L)
        if (parentId == -1L) finish()

        val adapter = ChildAdapter(this)
        binding.recyclerChildren.layoutManager = LinearLayoutManager(this)
        binding.recyclerChildren.adapter = adapter

        viewModel.childrenForParent.observe(this) { list ->
            adapter.submitList(list)
        }
        viewModel.loadForParent(parentId)
    }

    override fun onChildClick(childId: Long) {
        val intent = Intent(this, com.bybettercode.creche.ui.childprofile.ChildProfileActivity::class.java)
        intent.putExtra("childId", childId)
        startActivity(intent)
    }
}
