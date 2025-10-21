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
import kotlinx.datetime.*

@Composable
fun EventDialog(
    selectedDate: LocalDate,
    event: Event? = null,
    onSave: (Event) -> Unit,
    onDelete: (Event) -> Unit,
    onDismiss: () -> Unit
) {
    var title by remember { mutableStateOf(event?.title ?: "") }
    var description by remember { mutableStateOf(event?.description ?: "") }
    var startTime by remember {
        mutableStateOf(
            event?.startTime?.let { LocalTime(it.hour, it.minute) }
                ?: LocalTime(9, 0)
        )
    }
    var endTime by remember {
        mutableStateOf(
            event?.endTime?.let { LocalTime(it.hour, it.minute) }
                ?: LocalTime(10, 0)
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

                // Time inputs
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = startTime.toString(),
                        onValueChange = {
                            try {
                                val parts = it.split(":")
                                if (parts.size == 2) {
                                    val hour = parts[0].toIntOrNull() ?: startTime.hour
                                    val minute = parts[1].toIntOrNull() ?: startTime.minute
                                    startTime = LocalTime(hour, minute)
                                }
                            } catch (e: Exception) {
                                // Invalid time format, keep current value
                            }
                        },
                        label = { Text("Start Time") },
                        modifier = Modifier.weight(1f),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text),
                        placeholder = { Text("HH:MM") }
                    )

                    OutlinedTextField(
                        value = endTime.toString(),
                        onValueChange = {
                            try {
                                val parts = it.split(":")
                                if (parts.size == 2) {
                                    val hour = parts[0].toIntOrNull() ?: endTime.hour
                                    val minute = parts[1].toIntOrNull() ?: endTime.minute
                                    endTime = LocalTime(hour, minute)
                                }
                            } catch (e: Exception) {
                                // Invalid time format, keep current value
                            }
                        },
                        label = { Text("End Time") },
                        modifier = Modifier.weight(1f),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text),
                        placeholder = { Text("HH:MM") }
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
                                    date = selectedDate,
                                    startTime = startTime,
                                    endTime = endTime
                                ) ?: Event(
                                    title = title,
                                    description = description.ifBlank { null },
                                    date = selectedDate,
                                    startTime = startTime,
                                    endTime = endTime,
                                    createdBy = 1L // In real app, get from current user
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
