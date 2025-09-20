package com.bybettercode.creche.ui.childprofile

import android.os.Bundle
import android.view.View
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.bybettercode.creche.data.db.AppDatabase
import com.bybettercode.creche.data.repository.ChildRepository
import com.bybettercode.creche.databinding.ActivityChildProfileBinding
import com.bybettercode.creche.models.Child
import com.bybettercode.creche.viewmodel.ChildProfileViewModel
import com.bybettercode.creche.viewmodel.ChildProfileViewModelFactory

class ChildProfileActivity : AppCompatActivity() {
    private lateinit var binding: ActivityChildProfileBinding
    private val viewModel: ChildProfileViewModel by viewModels {
        val db = AppDatabase.getInstance(applicationContext)
        ChildProfileViewModelFactory(ChildRepository(db.childDao()))
    }

    private var childId: Long = -1L
    // TODO: in real app, derive currentUser role; for now we simulate via intent extra
    private var isAdmin: Boolean = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityChildProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        childId = intent.getLongExtra("childId", -1L)
        isAdmin = intent.getBooleanExtra("isAdmin", false)

        viewModel.child.observe(this) { child ->
            if (child != null) showChild(child)
        }

        viewModel.loadChild(childId)

        binding.editButton.setOnClickListener {
            // TODO: open edit activity / dialog
        }

        binding.editButton.visibility = if (isAdmin) View.VISIBLE else View.GONE
    }

    private fun showChild(c: Child) {
        binding.childName.text = c.name
        binding.childDob.text = c.dob ?: ""
        binding.childDescription.text = c.description ?: ""
        binding.childAllergies.text = c.allergies ?: "None"
        binding.childMedicalHistory.text = c.medicalHistory ?: "None"
    }
}
