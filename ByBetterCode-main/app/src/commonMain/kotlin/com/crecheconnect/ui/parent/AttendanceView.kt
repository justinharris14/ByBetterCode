package com.crecheconnect.ui.parent

import android.net.Uri
import androidx.browser.customtabs.CustomTabsIntent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Cancel
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.crecheconnect.model.*
import androidx.compose.ui.platform.LocalContext


val sampleAttendanceRecords = listOf(
    AttendanceRecord(1, 1, "2024-01-01", true, 1),
    AttendanceRecord(2, 1, "2024-01-02", true, 1),
    AttendanceRecord(3, 1, "2024-01-03", false, 1),
    AttendanceRecord(4, 1, "2024-01-04", true, 1),
    AttendanceRecord(5, 1, "2024-01-05", true, 1)
)

@Composable
fun AttendanceView(
    attendanceRecords: List<AttendanceRecord> = sampleAttendanceRecords,
    childName: String = "Your Child"
) {
    var selectedTabIndex by remember { mutableStateOf(0) }
    val context = LocalContext.current

    // Stripe links
    val tuitionLink = "https://buy.stripe.com/test_bJe00ccYJdNb2Jx5zy7g401"
    val mealLink = "https://buy.stripe.com/test_8x24gsf6R10p3NB7HG7g400"

    // Mock current user
    val currentUser = User(
        id = 1L,
        name = "John Doe",
        email = "john.doe@example.com",
        password = "password123",
        role = UserRole.PARENT,
        phone = "+1234567890"
    )

    val tabTitles = listOf("Attendance", "Calendar", "Payment")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Header
        Text(
            text = "Parent Portal",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(16.dp)
        )

        // Tab Row
        TabRow(selectedTabIndex = selectedTabIndex) {
            tabTitles.forEachIndexed { index, title ->
                Tab(
                    selected = selectedTabIndex == index,
                    onClick = { selectedTabIndex = index },
                    text = { Text(title) }
                )
            }
        }

        // Main Content
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
        ) {
            when (selectedTabIndex) {
                0 -> AttendanceList(attendanceRecords, childName)
                1 -> CalendarView()
                2 -> {
                    // Stripe Payment Buttons
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Button(
                            onClick = {
                                val intent = CustomTabsIntent.Builder().build()
                                intent.launchUrl(context, Uri.parse(tuitionLink))
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Pay Tuition")
                        }

                        Button(
                            onClick = {
                                val intent = CustomTabsIntent.Builder().build()
                                intent.launchUrl(context, Uri.parse(mealLink))
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Pay Weekly Meal Plan")
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AttendanceList(records: List<AttendanceRecord>, childName: String) {
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
            Column(modifier = Modifier.padding(16.dp)) {
                val presentCount = records.count { it.isPresent }
                val totalCount = records.size
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
                    Text(text = "Present: $presentCount", style = MaterialTheme.typography.bodyMedium)
                    Text(text = "Total Days: $totalCount", style = MaterialTheme.typography.bodyMedium)
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
        LazyColumn(contentPadding = PaddingValues(16.dp)) {
            items(records) { record ->
                AttendanceItem(record)
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
                    imageVector = Icons.Default.CheckCircle,
                    contentDescription = "Present",
                    tint = Color.Green,
                    modifier = Modifier.size(24.dp)
                )
            } else {
                Icon(
                    imageVector = Icons.Default.Cancel,
                    contentDescription = "Absent",
                    tint = Color.Red,
                    modifier = Modifier.size(24.dp)
                )
            }
        }
    }
}
