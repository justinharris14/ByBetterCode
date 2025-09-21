package com.bybettercode.creche.ui.childprofile

import android.app.Activity
import android.app.DatePickerDialog
import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.bybettercode.creche.databinding.ActivityChildEditBinding
import java.time.LocalDate
import java.time.Period
import java.time.ZoneId
import java.util.Calendar
import java.time.format.DateTimeFormatter

class ChildEditActivity : AppCompatActivity() {
    private lateinit var binding: ActivityChildEditBinding

    // We'll store the selected dob as ISO "yyyy-MM-dd"
    private var selectedDobIso: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityChildEditBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // when DOB field clicked, show date picker
        binding.tvChildDob.setOnClickListener {
            showDatePicker()
        }

        binding.btnSaveChild.setOnClickListener {
            val name = binding.etChildName.text.toString().trim()
            val dob = selectedDobIso
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

    private fun showDatePicker() {
        // default to today if no date chosen
        val cal = Calendar.getInstance()
        val year = cal.get(Calendar.YEAR)
        val month = cal.get(Calendar.MONTH)
        val day = cal.get(Calendar.DAY_OF_MONTH)

        DatePickerDialog(this, { _, y, m, d ->
            // m is 0-based month
            val selected = LocalDate.of(y, m + 1, d)
            selectedDobIso = selected.format(DateTimeFormatter.ISO_LOCAL_DATE) // yyyy-MM-dd
            binding.tvChildDob.text = selectedDobIso

            // compute age in years
            val today = LocalDate.now(ZoneId.systemDefault())
            val period = Period.between(selected, today)
            val years = period.years
            val months = period.months
            binding.tvChildAge.text = when {
                years > 0 -> "Age: $years years"
                months > 0 -> "Age: $months months"
                else -> "Age: <1 month"
            }
        }, year, month, day).show()
    }
}
