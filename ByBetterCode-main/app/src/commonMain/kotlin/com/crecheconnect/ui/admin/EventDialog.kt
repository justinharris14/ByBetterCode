package com.crecheconnect.ui.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.crecheconnect.model.Event
import kotlinx.datetime.Instant
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime

@Composable
fun EventDialog(
    selectedDate: String,
    event: Event? = null,
    onSave: (Event) -> Unit,
    onDelete: (Event) -> Unit,
    onDismiss: () -> Unit
) {
    var title by remember { mutableStateOf(event?.title ?: "") }
    var description by remember { mutableStateOf(event?.description ?: "") }
    var eventDateTime by remember {
        mutableStateOf(
            event?.eventDateTime ?: kotlinx.datetime.Instant.fromEpochMilliseconds(System.currentTimeMillis())
        )
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(
            dismissOnBackPress = true,
            dismissOnClickOutside = true
        )
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surface)
                    .padding(16.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (event == null) "Add Event" else "Edit Event",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold
                    )

                    IconButton(onClick = onDismiss) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close"
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Date display (read-only)
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant
                    )
                ) {
                    Text(
                        text = selectedDate.toString(),
                        style = MaterialTheme.typography.bodyLarge,
                        modifier = Modifier.padding(12.dp)
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Title input
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Event Title") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Description input
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Description (Optional)") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 2,
                    maxLines = 4
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Date/Time display
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant
                    )
                ) {
                    Text(
                        text = formatEventDateTime(eventDateTime),
                        style = MaterialTheme.typography.bodyLarge,
                        modifier = Modifier.padding(16.dp)
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Action buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = {
                            if (title.isNotBlank()) {
                                val newEvent = event?.copy(
                                    title = title,
                                    description = description.ifBlank { null },
                                    eventDateTime = eventDateTime,
                                    eventID = event.eventID,
                                    Date = event.Date,
                                    createByID = event.createByID,
                                    createdAt = event.createdAt
                                ) ?: Event(
                                    title = title,
                                    description = description.ifBlank { null },
                                    eventDateTime = eventDateTime,
                                    eventID = java.util.UUID.randomUUID().toString(),
                                    Date = "",
                                    createByID = "uuidOfAdmin",
                                    createdAt = kotlinx.datetime.Instant.fromEpochMilliseconds(System.currentTimeMillis()),
                                    createdBy = 1L
                                )
                                onSave(newEvent)
                                onDismiss()
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        enabled = title.isNotBlank()
                    ) {
                        Text(if (event == null) "Create Event" else "Update Event")
                    }
                }
            }
        }
    }
}
