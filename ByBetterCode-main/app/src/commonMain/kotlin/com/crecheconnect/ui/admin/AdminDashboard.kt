package com.crecheconnect.ui.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.crecheconnect.model.Event
import com.crecheconnect.model.Student
import com.crecheconnect.model.DashboardStats
import com.crecheconnect.model.Subscription
import com.crecheconnect.service.EventRepository
import kotlinx.coroutines.launch

@Composable
fun AdminDashboard(
    onManageEvents: () -> Unit = {},
    onTakeAttendance: () -> Unit = {},
    onViewSubscriptions: () -> Unit = {},
    onViewClassRoster: () -> Unit = {}
) {
    val events by EventRepository.events.collectAsState()
    val scope = rememberCoroutineScope()

    // Calculate real statistics from the shared data
    val stats = remember(events) {
        DashboardStats(
            totalEvents = events.size,
            totalStudents = 25, // In real app, this would come from a StudentRepository
            activeSubscriptions = 20, // In real app, this would come from a SubscriptionRepository
            todayAttendance = 22 // In real app, this would be calculated from today's attendance
        )
    }

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

        // Stats Cards
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

        Spacer(modifier = Modifier.height(32.dp))

        // Quick Actions
        Text(
            text = "Quick Actions",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 16.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))

        Column(
            modifier = Modifier.padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            ActionButton(
                text = "Manage Events",
                icon = "📅",
                onClick = onManageEvents
            )
            ActionButton(
                text = "Take Attendance",
                icon = "✅",
                onClick = onTakeAttendance
            )
            ActionButton(
                text = "Class Roster",
                icon = "👥",
                onClick = onViewClassRoster
            )
            ActionButton(
                text = "View Subscriptions",
                icon = "💳",
                onClick = onViewSubscriptions
            )
        }
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

@Composable
fun ActionButton(
    text: String,
    icon: String,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .clip(RoundedCornerShape(12.dp)),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.Start,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = icon,
                style = MaterialTheme.typography.headlineSmall,
                modifier = Modifier.padding(end = 16.dp)
            )
            Text(
                text = text,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
