package com.bybettercode.creche.ui.parentlist

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.bybettercode.creche.data.db.AppDatabase
import com.bybettercode.creche.data.repository.ChildRepository
import com.bybettercode.creche.data.repository.ParentRepository
import com.bybettercode.creche.databinding.ActivityAddParentBinding
import com.bybettercode.creche.models.Child
import com.bybettercode.creche.models.Parent
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.launch

private const val REQ_ADD_CHILD = 1001

class AddParentActivity : AppCompatActivity() {
    private lateinit var binding: ActivityAddParentBinding
    private val tempChildren = mutableListOf<Child>()
    private lateinit var adapter: TempChildAdapter

    private lateinit var parentRepo: ParentRepository
    private lateinit var childRepo: ChildRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAddParentBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // repos
        val db = AppDatabase.getInstance(applicationContext)
        parentRepo = ParentRepository(db.parentDao())
        childRepo = ChildRepository(db.childDao())

        // Recycler for temp children
        adapter = TempChildAdapter(tempChildren) { position ->
            // remove on delete
            tempChildren.removeAt(position)
            adapter.notifyItemRemoved(position)
        }
        binding.recyclerTempChildren.layoutManager = LinearLayoutManager(this)
        binding.recyclerTempChildren.adapter = adapter

        // Add Child button opens ChildEditActivity for result
        binding.btnAddChild.setOnClickListener {
            val intent = Intent(this, com.bybettercode.creche.ui.childprofile.ChildEditActivity::class.java)
            startActivityForResult(intent, REQ_ADD_CHILD)
        }

        // Save parent + children
        binding.btnSaveParent.setOnClickListener {
            val name = binding.etParentName.text.toString().trim()
            val phone = binding.etParentPhone.text.toString().trim()
            val email = binding.etParentEmail.text.toString().trim().ifEmpty { null }

            if (name.isEmpty() || phone.isEmpty()) {
                if (name.isEmpty()) binding.etParentName.error = "Required"
                if (phone.isEmpty()) binding.etParentPhone.error = "Required"
                return@setOnClickListener
            }

            // Launch coroutine to insert parent and children
            lifecycleScope.launch {
                // Insert parent and get generated id (Long)
                val idNumber = binding.etParentIdNumber.text.toString().trim().ifEmpty { null }

                val newParentId: Long = withContext(Dispatchers.IO) {
                    parentRepo.addParent(
                        Parent(
                            name = name,
                            phone = phone,
                            email = email,
                            idNumber = idNumber
                        )
                    )
                }

                // Insert each child with the correct parentId
                withContext(Dispatchers.IO) {
                    tempChildren.forEach { child ->
                        val childToInsert = child.copy(parentId = newParentId)
                        childRepo.addChild(childToInsert)
                    }
                }

                // Notify caller and finish
                setResult(Activity.RESULT_OK)
                finish()
            }
        }

        // Cancel button (outside coroutine)
        binding.btnCancel.setOnClickListener {
            finish()
        }
    }

    @Deprecated("startActivityForResult used for simplicity", ReplaceWith("registerForActivityResult"))
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == REQ_ADD_CHILD && resultCode == Activity.RESULT_OK && data != null) {
            // read child fields returned from ChildEditActivity
            val name = data.getStringExtra("name") ?: return
            val dob = data.getStringExtra("dob")
            val description = data.getStringExtra("description")
            val allergies = data.getStringExtra("allergies")
            val medicalHistory = data.getStringExtra("medicalHistory")
            val assignedTeacherId = if (data.hasExtra("assignedTeacherId")) data.getLongExtra("assignedTeacherId", 0L) else null

            // create Child object with parentId = 0L (will be set later)
            val newChild = Child(
                parentId = 0L,
                name = name,
                dob = dob,
                description = description,
                allergies = allergies,
                medicalHistory = medicalHistory,
                assignedTeacherId = assignedTeacherId?.takeIf { it > 0L }
            )
            tempChildren.add(newChild)
            adapter.notifyItemInserted(tempChildren.size - 1)
        }
    }
}
