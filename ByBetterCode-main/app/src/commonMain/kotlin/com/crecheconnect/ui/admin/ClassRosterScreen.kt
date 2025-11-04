package com.crecheconnect.ui.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import com.crecheconnect.model.AttendanceRecord
import kotlinx.datetime.Clock
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime

// Sample students with class assignments
val sampleStudentsByClass = mapOf(
    "Toddlers" to listOf(
        Student(id = 1, name = "Alice Johnson", parentId = 1, className = "Toddlers"),
        Student(id = 2, name = "Bob Smith", parentId = 2, className = "Toddlers"),
        Student(id = 3, name = "Charlie Wilson", parentId = 3, className = "Toddlers")
    ),
    "Pre-School" to listOf(
        Student(id = 4, name = "Diana Prince", parentId = 4, className = "Pre-School"),
        Student(id = 5, name = "Eve Brown", parentId = 5, className = "Pre-School"),
        Student(id = 6, name = "Frank Miller", parentId = 6, className = "Pre-School")
    ),
    "Infants" to listOf(
        Student(id = 7, name = "Grace Lee", parentId = 7, className = "Infants"),
        Student(id = 8, name = "Henry Davis", parentId = 8, className = "Infants")
    )
)

// Attendance status for each student
data class StudentAttendanceStatus(
    val student: Student,
    val isPresent: Boolean = true,
    val lastUpdated: Long = System.currentTimeMillis()
)

@Composable
fun ClassRosterScreen() {
    var selectedClass by remember { mutableStateOf<String?>(null) }
    var attendanceStatuses by remember { mutableStateOf<Map<Long, Boolean>>(emptyMap()) }

    val classes = listOf("Toddlers", "Pre-School", "Infants")
    val allStudents = sampleStudentsByClass.values.flatten()

    // Initialize attendance statuses
    LaunchedEffect(Unit) {
        attendanceStatuses = allStudents.associate { it.id!! to true }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Class Roster",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.width(16.dp))

            // Summary badge
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            ) {
                Text(
                    text = "${attendanceStatuses.count { it.value }}/${allStudents.size} Present",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                )
            }
        }

        // Class Filter Tabs
        ScrollableTabRow(
            selectedTabIndex = selectedClass?.let { className ->
                classes.indexOf(className).takeIf { it >= 0 } ?: 0
            } ?: 0,
            modifier = Modifier.fillMaxWidth()
        ) {
            classes.forEach { className ->
                Tab(
                    selected = selectedClass == className,
                    onClick = { selectedClass = className },
                    text = {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = className,
                                style = MaterialTheme.typography.titleSmall
                            )
                            val classStudents = sampleStudentsByClass[className] ?: emptyList()
                            val presentCount = classStudents.count { student ->
                                attendanceStatuses[student.id] == true
                            }
                            Text(
                                text = "$presentCount/${classStudents.size}",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                )
            }
        }

        // Content Area
        if (selectedClass != null) {
            val classStudents = sampleStudentsByClass[selectedClass] ?: emptyList()

            if (classStudents.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No students in $selectedClass class",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp)
                ) {
                    items(classStudents) { student ->
                        ClassRosterItem(
                            student = student,
                            isPresent = attendanceStatuses[student.id] ?: true,
                            onAttendanceToggle = { isPresent ->
                                attendanceStatuses = attendanceStatuses.toMutableMap().apply {
                                    put(student.id!!, isPresent)
                                }
                            }
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                }
            }
        } else {
            // Show all classes overview when none selected
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                classes.forEach { className ->
                    val classStudents = sampleStudentsByClass[className] ?: emptyList()
                    val presentCount = classStudents.count { student ->
                        attendanceStatuses[student.id] == true
                    }

                    ClassOverviewCard(
                        className = className,
                        studentCount = classStudents.size,
                        presentCount = presentCount,
                        onClick = { selectedClass = className }
                    )
                }
            }
        }
    }
}

@Composable
fun ClassRosterItem(
    student: Student,
    isPresent: Boolean,
    onAttendanceToggle: (Boolean) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = student.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Parent ID: ${student.parentId}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                if (student.dateOfBirth != null) {
                    Text(
                        text = "DOB: ${student.dateOfBirth}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Column(
                horizontalAlignment = Alignment.End
            ) {
                Text(
                    text = if (isPresent) "Present" else "Absent",
                    style = MaterialTheme.typography.bodyMedium,
                    color = if (isPresent)
                        MaterialTheme.colorScheme.primary
                    else
                        MaterialTheme.colorScheme.error,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(8.dp))

                Switch(
                    checked = isPresent,
                    onCheckedChange = onAttendanceToggle
                )
            }
        }
    }
}

@Composable
fun ClassOverviewCard(
    className: String,
    studentCount: Int,
    presentCount: Int,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = className,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "$studentCount students",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Column(
                horizontalAlignment = Alignment.End
            ) {
                Text(
                    text = "$presentCount/$studentCount",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = "Present",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
