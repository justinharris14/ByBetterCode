package com.crecheconnect.ui.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.filled.Event
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Subscriptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.crecheconnect.model.DashboardStats
import com.crecheconnect.model.Event
import com.crecheconnect.model.Student
import com.crecheconnect.model.Subscription
import com.crecheconnect.service.EventRepository
import com.crecheconnect.ui.admin.EventManagementScreen
import com.crecheconnect.ui.admin.AttendanceScreen
import com.crecheconnect.ui.admin.AttendanceHistoryScreen
import com.crecheconnect.ui.admin.ClassRosterScreen
import com.crecheconnect.ui.admin.AdminSubscriptionScreen

@Composable
fun AdminDashboard() {
    val events by EventRepository.events.collectAsState()

    // Calculate real statistics from the shared data
    val stats = remember(events) {
        DashboardStats(
            totalEvents = events.size,
            totalStudents = 25,
            activeSubscriptions = 20,
            todayAttendance = 22
        )
    }

    var selectedTabIndex by remember { mutableStateOf(0) }

    val tabTitles = listOf("Overview", "Events", "Attendance", "History", "Roster", "Subscriptions")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Header
        Text(
            text = "Admin Dashboard",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(16.dp)
        )

        // Main Content - Using simple Box without height constraints
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 80.dp) // Space for bottom navigation
        ) {
            when (selectedTabIndex) {
                0 -> {
                    // Overview Screen
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        contentPadding = PaddingValues(16.dp),
                        horizontalArrangement = Arrangement.spacedBy(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        item {
                            StatCard(
                                title = "Total Events",
                                value = stats.totalEvents.toString(),
                                icon = "📅"
                            )
                        }
                        item {
                            StatCard(
                                title = "Total Students",
                                value = stats.totalStudents.toString(),
                                icon = "👶"
                            )
                        }
                        item {
                            StatCard(
                                title = "Active Subscriptions",
                                value = stats.activeSubscriptions.toString(),
                                icon = "💳"
                            )
                        }
                        item {
                            StatCard(
                                title = "Today's Attendance",
                                value = "${stats.todayAttendance}/${stats.totalStudents}",
                                icon = "✅"
                            )
                        }
                    }
                }
                1 -> {
                    // Events Screen
                    EventManagementScreen()
                }
                2 -> {
                    // Attendance Screen
                    AttendanceScreen()
                }
                3 -> {
                    // History Screen
                    AttendanceHistoryScreen()
                }
                4 -> {
                    // Roster Screen
                    ClassRosterScreen()
                }
                5 -> {
                    // Subscriptions Screen
                    AdminSubscriptionScreen()
                }
            }
        }
    }

        // Bottom Navigation Bar
        NavigationBar(
            modifier = Modifier.fillMaxWidth()
        ) {
            NavigationBarItem(
                icon = {
                    Icon(Icons.Filled.Home, contentDescription = "Overview")
                },
                selected = selectedTabIndex == 0,
                onClick = { selectedTabIndex = 0 }
            )
            NavigationBarItem(
                icon = {
                    Icon(Icons.Filled.Event, contentDescription = "Events")
                },
                selected = selectedTabIndex == 1,
                onClick = { selectedTabIndex = 1 }
            )
            NavigationBarItem(
                icon = {
                    Icon(Icons.Filled.People, contentDescription = "Attendance")
                },
                selected = selectedTabIndex == 2,
                onClick = { selectedTabIndex = 2 }
            )
            NavigationBarItem(
                icon = {
                    Icon(Icons.Filled.History, contentDescription = "History")
                },
                selected = selectedTabIndex == 3,
                onClick = { selectedTabIndex = 3 }
            )
            NavigationBarItem(
                icon = {
                    Icon(Icons.AutoMirrored.Filled.List, contentDescription = "Roster")
                },
                selected = selectedTabIndex == 4,
                onClick = { selectedTabIndex = 4 }
            )
            NavigationBarItem(
                icon = {
                    Icon(Icons.Filled.CreditCard, contentDescription = "Subscriptions")
                },
                selected = selectedTabIndex == 5,
                onClick = { selectedTabIndex = 5 }
            )
        }
}

@Composable
fun StatCard(
    title: String,
    value: String,
    icon: String
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp)),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = icon,
                style = MaterialTheme.typography.displaySmall
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = title,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}