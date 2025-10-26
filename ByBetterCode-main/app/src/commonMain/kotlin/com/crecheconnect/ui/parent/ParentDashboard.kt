package com.crecheconnect.ui.parent

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.crecheconnect.model.*

@Composable
fun ParentDashboard() {
    var selectedTabIndex by remember { mutableStateOf(0) }

    // Mock current user for demo purposes
    val currentUser = User(
        id = 1L,
        name = "John Doe",
        email = "john.doe@example.com",
        password = "password123",
        role = UserRole.PARENT,
        phone = "+1234567890"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Header
        Text(
            text = "Parent Dashboard",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(16.dp)
        )

        // Main Content
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
        ) {
            when (selectedTabIndex) {
                0 -> {
                    // Attendance Screen
                    AttendanceView()
                }
                1 -> {
                    // Calendar Screen
                    CalendarView()
                }
                2 -> {
                    // Subscription Screen
                    SubscriptionScreen(
                        currentUser = currentUser,
                        onSubscriptionSuccess = { subscription ->
                            // Handle subscription success
                            println("Subscription created: $subscription")
                        },
                        onBackToCalendar = {
                            selectedTabIndex = 1
                        }
                    )
                }
            }
        }

        // Bottom Navigation Bar
        NavigationBar(
            modifier = Modifier.fillMaxWidth()
        ) {
            NavigationBarItem(
                icon = {
                    Icon(Icons.Filled.CheckCircle, contentDescription = "Attendance")
                },
                label = { Text("Attendance") },
                selected = selectedTabIndex == 0,
                onClick = { selectedTabIndex = 0 }
            )
            NavigationBarItem(
                icon = {
                    Icon(Icons.Filled.CalendarMonth, contentDescription = "Calendar")
                },
                label = { Text("Calendar") },
                selected = selectedTabIndex == 1,
                onClick = { selectedTabIndex = 1 }
            )
            NavigationBarItem(
                icon = {
                    Icon(Icons.Filled.CreditCard, contentDescription = "Subscription")
                },
                label = { Text("Subscription") },
                selected = selectedTabIndex == 2,
                onClick = { selectedTabIndex = 2 }
            )
        }
    }
}
