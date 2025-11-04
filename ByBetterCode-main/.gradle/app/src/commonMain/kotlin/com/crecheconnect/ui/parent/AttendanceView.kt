package com.crecheconnect.ui.parent

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
import androidx.compose.foundation.background
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Cancel


// Sample attendance data for demonstration
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
        studentId = 1,
        date = "2024-01-04",
        isPresent = true,
        checkedBy = 1
    ),
    AttendanceRecord(
        id = 5,
        studentId = 1,
        date = "2024-01-05",
        isPresent = true,
        checkedBy = 1
    )
)

@Composable
fun AttendanceView(
    attendanceRecords: List<AttendanceRecord> = sampleAttendanceRecords,
    childName: String = "Your Child"
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Header
        Text(
            text = "$childName's Attendance",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(16.dp)
        )

        // Attendance Summary
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                val presentCount = attendanceRecords.count { it.isPresent }
                val totalCount = attendanceRecords.size
                val attendancePercentage = if (totalCount > 0) (presentCount.toFloat() / totalCount * 100).toInt() else 0

                Text(
                    text = "Attendance Summary",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 8.dp)
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Present: $presentCount",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Text(
                        text = "Total Days: $totalCount",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Text(
                        text = "$attendancePercentage%",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold,
                        color = if (attendancePercentage >= 80) Color.Green else Color.Red
                    )
                }
            }
        }

        // Attendance List
        LazyColumn(
            contentPadding = PaddingValues(16.dp)
        ) {
            items(attendanceRecords) { record ->
                AttendanceItem(record = record)
                Spacer(modifier = Modifier.height(8.dp))
            }
        }
    }
}

@Composable
fun AttendanceItem(record: AttendanceRecord) {
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
            Column {
                Text(
                    text = record.date,
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = if (record.isPresent) "Present" else "Absent",
                    style = MaterialTheme.typography.bodyMedium,
                    color = if (record.isPresent) Color.Green else Color.Red
                )
            }

            if (record.isPresent) {
                Icon(
                    imageVector = androidx.compose.material.icons.Icons.Default.CheckCircle,
                    contentDescription = "Present",
                    tint = Color.Green,
                    modifier = Modifier.size(24.dp)
                )
            } else {
                Icon(
                    imageVector = androidx.compose.material.icons.Icons.Default.Cancel,
                    contentDescription = "Absent",
                    tint = Color.Red,
                    modifier = Modifier.size(24.dp)
                )
            }
        }
    }
}
