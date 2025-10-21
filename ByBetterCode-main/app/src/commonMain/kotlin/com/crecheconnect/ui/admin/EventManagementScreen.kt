package com.crecheconnect.ui.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.crecheconnect.model.Event
import com.crecheconnect.service.EventRepository
import kotlinx.coroutines.launch
import kotlinx.datetime.*

@Preview
@Composable
fun EventManagementScreen(
    onAddEvent: () -> Unit = {},
    onEditEvent: (Event) -> Unit = {}
) {
    val events by EventRepository.events.collectAsState()
    val isLoading by EventRepository.isLoading.collectAsState()
    val error by EventRepository.error.collectAsState()
    val scope = rememberCoroutineScope()

    // Calendar state
    var selectedDate by remember { mutableStateOf(Clock.System.todayIn(TimeZone.currentSystemDefault())) }
    var showEventDialog by remember { mutableStateOf(false) }
    var selectedEvent by remember { mutableStateOf<Event?>(null) }

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
                text = "Event Management",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.width(16.dp))

            Button(
                onClick = {
                    selectedEvent = null
                    showEventDialog = true
                }
            ) {
                Text(text = "+")
            }
        }

        // Loading indicator
        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        }

        // Error display
        error?.let { errorMessage ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.errorContainer
                )
            ) {
                Text(
                    text = errorMessage,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onErrorContainer,
                    modifier = Modifier.padding(16.dp)
                )
            }
        }

        // Calendar
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            EventCalendar(
                selectedDate = selectedDate,
                events = events,
                onDateSelected = { date ->
                    selectedDate = date
                },
                onAddEvent = { date ->
                    selectedDate = date
                    selectedEvent = null
                    showEventDialog = true
                },
                onEventClick = { event ->
                    selectedEvent = event
                    showEventDialog = true
                },
                modifier = Modifier.padding(16.dp)
            )
        }

        // Selected date events
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .weight(4.0f) // Increased weight to make it longer
                .padding(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Text(
                    text = "Events for ${selectedDate.dayOfMonth.toString().padStart(2, '0')}/${selectedDate.monthNumber.toString().padStart(2, '0')}/${selectedDate.year}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 12.dp)
                )

                val dayEvents = events.filter { event -> event.date == selectedDate }

                if (dayEvents.isEmpty()) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "No events scheduled for this day",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                } else {
                    LazyColumn {
                        items(dayEvents) { event ->
                            EventItem(
                                event = event,
                                onEdit = {
                                    selectedEvent = event
                                    showEventDialog = true
                                },
                                onDelete = {
                                    scope.launch {
                                        event.id?.let { eventId ->
                                            EventRepository.deleteEvent(eventId)
                                        }
                                    }
                                }
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                        }
                    }
                }
            }
        }
    }

    // Event Dialog
    if (showEventDialog) {
        EventDialog(
            selectedDate = selectedDate,
            event = selectedEvent,
            onSave = { newEvent ->
                scope.launch {
                    if (newEvent.id == null) {
                        EventRepository.addEvent(newEvent)
                    } else {
                        EventRepository.updateEvent(newEvent)
                    }
                    showEventDialog = false
                    selectedEvent = null
                }
            },
            onDelete = { eventToDelete ->
                scope.launch {
                    eventToDelete.id?.let { eventId ->
                        EventRepository.deleteEvent(eventId)
                    }
                    showEventDialog = false
                    selectedEvent = null
                }
            },
            onDismiss = {
                showEventDialog = false
                selectedEvent = null
            }
        )
    }
}

@Composable
fun EventItem(
    event: com.crecheconnect.model.Event,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp)),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(
                modifier = Modifier.weight(1f)
            ) {
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
                event.description?.let { description ->
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = description,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            Spacer(modifier = Modifier.width(8.dp))

            Row {
                IconButton(
                    onClick = onEdit
                ) {
                    Icon(
                        imageVector = Icons.Default.Edit,
                        contentDescription = "Edit Event",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
                IconButton(
                    onClick = onDelete
                ) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Delete Event",
                        tint = MaterialTheme.colorScheme.error
                    )
                }
            }
        }
    }
}