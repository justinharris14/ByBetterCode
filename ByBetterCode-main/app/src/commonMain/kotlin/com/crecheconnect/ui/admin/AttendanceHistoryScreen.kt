package com.crecheconnect.ui.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.crecheconnect.model.AttendanceRecord
import com.crecheconnect.model.Student
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Cancel

// Sample attendance records for demonstration
val sampleAttendanceRecords = listOf(
    AttendanceRecord(
        id = 1,
        studentId = 1,
        date = "2024-01-01",
        isPresent = true,
        checkedBy = 1
    ),
    AttendanceRecord(
        id = 2,
        studentId = 1,
        date = "2024-01-02",
        isPresent = true,
        checkedBy = 1
    ),
    AttendanceRecord(
        id = 3,
        studentId = 1,
        date = "2024-01-03",
        isPresent = false,
        checkedBy = 1
    ),
    AttendanceRecord(
        id = 4,
        studentId = 2,
        date = "2024-01-01",
        isPresent = true,
        checkedBy = 1
    ),
    AttendanceRecord(
        id = 5,
        studentId = 2,
        date = "2024-01-02",
        isPresent = false,
        checkedBy = 1
    ),
    AttendanceRecord(
        id = 6,
        studentId = 3,
        date = "2024-01-01",
        isPresent = true,
        checkedBy = 1
    ),
    AttendanceRecord(
        id = 7,
        studentId = 3,
        date = "2024-01-02",
        isPresent = true,
        checkedBy = 1
    )
)


@Composable
fun AttendanceHistoryScreen(
    students: List<Student> = sampleStudents,
    attendanceRecords: List<AttendanceRecord> = sampleAttendanceRecords
) {
    var selectedStudent by remember { mutableStateOf<Student?>(null) }
    var selectedClass by remember { mutableStateOf<String?>(null) }
    var startDate by remember { mutableStateOf("") }
    var endDate by remember { mutableStateOf("") }

    val filteredRecords = remember(selectedStudent, selectedClass, startDate, endDate) {
        attendanceRecords.filter { record ->
            val student = students.find { it.id == record.studentId }
            val matchesStudent = selectedStudent?.let { it.id == record.studentId } ?: true
            val matchesClass = selectedClass?.let { student?.className == it } ?: true
            val matchesDateRange = if (startDate.isNotEmpty() && endDate.isNotEmpty()) {
                record.date >= startDate && record.date <= endDate
            } else true

            matchesStudent && matchesClass && matchesDateRange
        }
    }

    val groupedRecords = filteredRecords.groupBy { it.studentId }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Header
        Text(
            text = "Attendance History",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(16.dp)
        )

        // Filters
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = "Filters",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                // Student Filter
                OutlinedTextField(
                    value = selectedStudent?.name ?: "",
                    onValueChange = { /* TODO: Implement student selection */ },
                    label = { Text("Student Name") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 8.dp),
                    readOnly = true
                )

                // Class Filter
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf("Toddlers", "Pre-School", "Infants").forEach { className ->
                        FilterChip(
                            selected = selectedClass == className,
                            onClick = { selectedClass = if (selectedClass == className) null else className },
                            label = { Text(className) }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Date Range
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = startDate,
                        onValueChange = { startDate = it },
                        label = { Text("Start Date") },
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = endDate,
                        onValueChange = { endDate = it },
                        label = { Text("End Date") },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // Results
        LazyColumn(
            contentPadding = PaddingValues(16.dp)
        ) {
            groupedRecords.forEach { (studentId, records) ->
                item {
                    val student = students.find { it.id == studentId }
                    if (student != null) {
                        StudentAttendanceHistory(
                            student = student,
                            records = records
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                    }
                }
            }
        }
    }
}

@Composable
fun StudentAttendanceHistory(
    student: Student,
    records: List<AttendanceRecord>
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = student.name,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(bottom = 8.dp)
            )

            Text(
                text = "Class: ${student.className}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            records.forEach { record ->
                AttendanceHistoryItem(record = record)
            }

            val presentCount = records.count { it.isPresent }
            val totalCount = records.size
            val percentage = if (totalCount > 0) (presentCount.toFloat() / totalCount * 100).toInt() else 0

            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Attendance: $presentCount/$totalCount ($percentage%)",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Bold,
                color = if (percentage >= 80) Color.Green else Color.Red
            )
        }
    }
}

@Composable
fun AttendanceHistoryItem(record: AttendanceRecord) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = formatDate(record.date),
            style = MaterialTheme.typography.bodyMedium
        )
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = if (record.isPresent) "Present" else "Absent",
                style = MaterialTheme.typography.bodyMedium,
                color = if (record.isPresent) Color.Green else Color.Red
            )
            Spacer(modifier = Modifier.width(8.dp))
            if (record.isPresent) {
                Icon(
                    imageVector = androidx.compose.material.icons.Icons.Default.CheckCircle,
                    contentDescription = "Present",
                    tint = Color.Green,
                    modifier = Modifier.size(16.dp)
                )
            } else {
                Icon(
                    imageVector = androidx.compose.material.icons.Icons.Default.Cancel,
                    contentDescription = "Absent",
                    tint = Color.Red,
                    modifier = Modifier.size(16.dp)
                )
            }
        }
    }
}

private fun formatDate(dateString: String): String {
    val parts = dateString.split("-")
    if (parts.size == 3) {
        return "${parts[2]}/${parts[1]}/${parts[0]}"
    }
    return dateString
}
