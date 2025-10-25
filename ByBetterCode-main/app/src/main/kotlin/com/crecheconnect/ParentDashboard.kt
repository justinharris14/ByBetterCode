package com.crecheconnect

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.crecheconnect.model.DashboardStats
import com.crecheconnect.service.EventRepository
import com.crecheconnect.ui.admin.StatCard
import com.crecheconnect.ui.admin.ActionButton

@Composable
fun ParentDashboard(
    onViewEvents: () -> Unit = {},
    onMakePayment: () -> Unit = {},
    onViewAttendance: () -> Unit = {}
) {
    val events by EventRepository.events.collectAsState()
    val stats = remember(events) {
        DashboardStats(
            totalEvents = events.size,
            totalStudents = 1,
            activeSubscriptions = 1,
            todayAttendance = 1
        )
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        Text(
            text = "Dashboard",
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(16.dp)
        )

        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            contentPadding = PaddingValues(16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item { StatCard("Upcoming Events", stats.totalEvents.toString(), "📅") }
            item { StatCard("Your Child", stats.totalStudents.toString(), "👶") }
            item { StatCard("Subscription", stats.activeSubscriptions.toString(), "💳") }
            item { StatCard("Today's Attendance", "${stats.todayAttendance}/${stats.totalStudents}", "✅") }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Column(modifier = Modifier.padding(horizontal = 16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            ActionButton("View Events", "📅", onViewEvents)
            ActionButton("Make Payment", "💳", onMakePayment)
            ActionButton("View Attendance", "✅", onViewAttendance)
        }
    }
}
