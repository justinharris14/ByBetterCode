package com.crecheconnect.ui.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.crecheconnect.model.Student


data class StudentAttendance(
    val student: Student,
    val isPresent: Boolean = true
)

@Composable
fun AttendanceScreen(
    students: List<Student> = sampleStudents,
    onSubmitAttendance: (List<StudentAttendance>) -> Unit = {}
) {
    var selectedClass by remember { mutableStateOf<String?>(null) }
    var attendanceList by remember { mutableStateOf<List<StudentAttendance>>(emptyList()) }
    var isLoading by remember { mutableStateOf(false) }

    val classes = listOf("Toddlers", "Pre-School", "Infants")

    LaunchedEffect(selectedClass) {
        selectedClass?.let { className ->
            attendanceList = students.filter { it.className == className }
                .map { StudentAttendance(it) }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Header
        Text(
            text = "Take Attendance",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(16.dp)
        )

        // Step 1: Select Class
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
                    text = "Step 1: Select Class",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    classes.forEach { className ->
                        FilterChip(
                            selected = selectedClass == className,
                            onClick = { selectedClass = className },
                            label = { Text(className) }
                        )
                    }
                }
            }
        }

        // Step 2: Mark Attendance
        if (selectedClass != null && attendanceList.isNotEmpty()) {
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
                        text = "Step 2: Mark Attendance for $selectedClass",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )

                    LazyColumn {
                        items(attendanceList) { studentAttendance ->
                            AttendanceRow(
                                studentAttendance = studentAttendance,
                                onAttendanceChange = { updated ->
                                    attendanceList = attendanceList.map {
                                        if (it.student.id == updated.student.id) updated else it
                                    }
                                }
                            )
                        }
                    }
                }
            }

            // Step 3: Submit Button
            Spacer(modifier = Modifier.height(16.dp))
            Button(
                onClick = {
                    isLoading = true
                    onSubmitAttendance(attendanceList)
                    isLoading = false
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                enabled = !isLoading
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                } else {
                    Text(text = "Submit Attendance")
                }
            }
        }
    }
}

@Composable
fun AttendanceRow(
    studentAttendance: StudentAttendance,
    onAttendanceChange: (StudentAttendance) -> Unit
) {
    var isPresent by remember { mutableStateOf(studentAttendance.isPresent) }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text(
                text = studentAttendance.student.name,
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Parent ID: ${studentAttendance.student.parentId}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = if (isPresent) "Present" else "Absent",
                style = MaterialTheme.typography.bodyMedium,
                color = if (isPresent) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error,
                modifier = Modifier.padding(end = 8.dp)
            )
            Switch(
                checked = isPresent,
                onCheckedChange = {
                    isPresent = it
                    onAttendanceChange(studentAttendance.copy(isPresent = it))
                }
            )
        }
    }
}
