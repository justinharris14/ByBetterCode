package com.crecheconnect.ui.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.crecheconnect.model.Event
import com.crecheconnect.service.EventRepository
import kotlinx.datetime.Clock
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddEditEventScreen(
    eventToEdit: Event? = null,
    onSave: () -> Unit = {},
    onCancel: () -> Unit = {}
) {
    var title by remember { mutableStateOf(eventToEdit?.title ?: "") }
    var description by remember { mutableStateOf(eventToEdit?.description ?: "") }
    var date by remember { mutableStateOf(eventToEdit?.date ?: "") }
    var startTime by remember { mutableStateOf(eventToEdit?.startTime ?: "") }
    var endTime by remember { mutableStateOf(eventToEdit?.endTime ?: "") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val isEditing = eventToEdit != null

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
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedButton(
                onClick = onCancel
            ) {
                Text(text = "Cancel")
            }

            Text(
                text = if (isEditing) "Edit Event" else "Add Event",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )

            Button(
                onClick = {
                    // Validation
                    if (title.isBlank() || date.isBlank() || startTime.isBlank() || endTime.isBlank()) {
                        errorMessage = "Please fill in all required fields"
                        return@Button
                    }

                    isLoading = true
                    errorMessage = null

                    val event = Event(
                        id = eventToEdit?.id,
                        title = title.trim(),
                        description = description.trim().takeIf { it.isNotBlank() },
                        date = date,
                        startTime = startTime,
                        endTime = endTime,
                        createdBy = 1, // In real app, get from current user
                        createdAt = if (isEditing) eventToEdit?.createdAt else Clock.System.now()
                    )

                    if (isEditing) {
                        EventRepository.updateEvent(event)
                    } else {
                        EventRepository.addEvent(event)
                    }

                    isLoading = false
                    onSave()
                },
                enabled = !isLoading && title.isNotBlank() && date.isNotBlank() && startTime.isNotBlank() && endTime.isNotBlank()
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(16.dp),
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                } else {
                    Text(text = "Save")
                }
            }
        }

        // Error display
        errorMessage?.let { error ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.errorContainer
                )
            ) {
                Text(
                    text = error,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onErrorContainer,
                    modifier = Modifier.padding(16.dp)
                )
            }
        }

        // Form
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            OutlinedTextField(
                value = title,
                onValueChange = { title = it },
                label = { Text("Event Title *") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            OutlinedTextField(
                value = description,
                onValueChange = { description = it },
                label = { Text("Description") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 2,
                maxLines = 4
            )

            OutlinedTextField(
                value = date,
                onValueChange = { date = it },
                label = { Text("Date (YYYY-MM-DD) *") },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("e.g., 2024-01-15") },
                singleLine = true
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                OutlinedTextField(
                    value = startTime,
                    onValueChange = { startTime = it },
                    label = { Text("Start Time *") },
                    modifier = Modifier.weight(1f),
                    placeholder = { Text("e.g., 10:00") },
                    singleLine = true
                )

                OutlinedTextField(
                    value = endTime,
                    onValueChange = { endTime = it },
                    label = { Text("End Time *") },
                    modifier = Modifier.weight(1f),
                    placeholder = { Text("e.g., 11:00") },
                    singleLine = true
                )
            }

            Spacer(modifier = Modifier.weight(1f))

            // Info text
            Text(
                text = "* Required fields",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            if (isEditing) {
                Text(
                    text = "Changes will be visible to all parents immediately.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            } else {
                Text(
                    text = "New events will be visible to all parents immediately.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
