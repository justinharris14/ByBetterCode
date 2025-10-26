package com.crecheconnect.ui.parent

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.crecheconnect.service.CacheManager
import com.crecheconnect.service.EventRepository
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material.icons.filled.Refresh
import kotlinx.coroutines.launch

@Composable
fun CalendarView(
    onEventClick: (Event) -> Unit = {},
    onBackToDashboard: () -> Unit = {}
) {
    val events by EventRepository.events.collectAsState()
    val cachedEvents by CacheManager.cachedEvents.collectAsState()
    val lastSyncTime by CacheManager.lastSyncTime.collectAsState()
    val isOnline by CacheManager.isOnline.collectAsState()
    val scope = rememberCoroutineScope()

    // Load cached data when view is created
    LaunchedEffect(Unit) {
        CacheManager.loadCachedData()
    }

    // Update cache when events change
    LaunchedEffect(events) {
        if (events.isNotEmpty()) {
            CacheManager.cacheEvents(events)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Header with status, refresh button, and back button
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedButton(
                onClick = onBackToDashboard
            ) {
                Text(text = "Back")
            }

            Column {
                Text(
                    text = "Event Calendar",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold
                )

                // Show online/offline status
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(top = 4.dp)
                ) {
                    val statusColor = if (isOnline) Color.Green else Color.Red
                    val statusText = if (isOnline) "Online" else "Offline"

                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(RoundedCornerShape(50))
                            .background(statusColor)
                    )

                    Spacer(modifier = Modifier.width(8.dp))

                    Text(
                        text = statusText,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    // Show last sync time if available
                    lastSyncTime?.let { syncTime ->
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Last sync: ${formatSyncTime(syncTime)}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            // Refresh button (only enabled when online)
            IconButton(
                onClick = {
                    if (isOnline) {
                        scope.launch {
                            EventRepository.refreshEvents()
                        }
                    }
                },
                enabled = isOnline
            ) {
                Icon(
                    imageVector = androidx.compose.material.icons.Icons.Default.Refresh,
                    contentDescription = "Refresh",
                    tint = if (isOnline) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // Show appropriate message when offline and no cached data
        if (!isOnline && cachedEvents.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = androidx.compose.material.icons.Icons.Default.CloudOff,
                        contentDescription = "Offline",
                        modifier = Modifier.size(64.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "You're currently offline",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold
                    )

                    Text(
                        text = "Calendar events will appear here once you're back online and data is synced.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(top = 8.dp)
                    )
                }
            }
        } else {
            // Calendar content
            val displayEvents = if (isOnline) events else cachedEvents

            if (displayEvents.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No events scheduled",
                        style = MaterialTheme.typography.headlineSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp)
                ) {
                    items(displayEvents) { event ->
                        EventCard(
                            event = event,
                            onClick = { onEventClick(event) }
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                }
            }
        }
    }
}

// Helper function to format sync time
fun formatSyncTime(timestamp: Long): String {
    val currentTime = System.currentTimeMillis()
    val diffMinutes = (currentTime - timestamp) / (1000 * 60)

    return when {
        diffMinutes < 1 -> "just now"
        diffMinutes < 60 -> "$diffMinutes minutes ago"
        diffMinutes < 1440 -> "${diffMinutes / 60} hours ago"
        else -> "${diffMinutes / 1440} days ago"
    }
}

@Composable
fun EventCard(
    event: Event,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .clip(RoundedCornerShape(12.dp)),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = event.title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "${event.date} • ${event.startTime} - ${event.endTime}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            event.description?.let {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = it,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
