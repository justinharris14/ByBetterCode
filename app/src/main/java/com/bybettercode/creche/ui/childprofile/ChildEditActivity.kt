package com.bybettercode.creche.ui.childprofile

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.bybettercode.creche.databinding.ActivityChildEditBinding

class ChildEditActivity : AppCompatActivity() {
    private lateinit var binding: ActivityChildEditBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityChildEditBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnSaveChild.setOnClickListener {
            val name = binding.etChildName.text.toString().trim()
            val dob = binding.etChildDob.text.toString().trim().ifEmpty { null }
            val description = binding.etChildDescription.text.toString().trim().ifEmpty { null }
            val allergies = binding.etChildAllergies.text.toString().trim().ifEmpty { null }
            val medicalHistory = binding.etChildMedicalHistory.text.toString().trim().ifEmpty { null }

            if (name.isEmpty()) {
                binding.etChildName.error = "Required"
                return@setOnClickListener
            }

            val result = Intent().apply {
                putExtra("name", name)
                putExtra("dob", dob)
                putExtra("description", description)
                putExtra("allergies", allergies)
                putExtra("medicalHistory", medicalHistory)
            }
            setResult(Activity.RESULT_OK, result)
            finish()
        }

        binding.btnCancelChild.setOnClickListener {
            setResult(Activity.RESULT_CANCELED)
            finish()
        }
    }
}
