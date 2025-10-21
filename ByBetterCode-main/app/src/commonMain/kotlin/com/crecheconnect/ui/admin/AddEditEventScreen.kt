import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.crecheconnect.model.Event
import com.crecheconnect.service.EventRepository
import kotlinx.coroutines.launch
import kotlinx.datetime.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddEditEventScreen(
    eventToEdit: Event? = null,
    onSave: () -> Unit = {},
    onCancel: () -> Unit = {}
) {
    var title by remember { mutableStateOf(eventToEdit?.title ?: "") }
    var description by remember { mutableStateOf(eventToEdit?.description ?: "") }
    var selectedDate by remember {
        mutableStateOf(
            eventToEdit?.date ?: Clock.System.todayIn(TimeZone.currentSystemDefault())
        )
    }
    var startTime by remember {
        mutableStateOf(
            eventToEdit?.startTime ?: LocalTime(9, 0)
        )
    }
    var endTime by remember {
        mutableStateOf(
            eventToEdit?.endTime ?: LocalTime(10, 0)
        )
    }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val isEditing = eventToEdit != null
    val scope = rememberCoroutineScope()

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
                    if (title.isBlank()) {
                        errorMessage = "Please fill in all required fields"
                        return@Button
                    }

                    isLoading = true
                    errorMessage = null

                    val event = Event(
                        id = eventToEdit?.id,
                        title = title.trim(),
                        description = description.trim().takeIf { it.isNotBlank() },
                        date = selectedDate,
                        startTime = startTime,
                        endTime = endTime,
                        createdBy = 1 // In real app, get from current user
                    )

                    if (isEditing) {
                        scope.launch {
                            EventRepository.updateEvent(event)
                            isLoading = false
                            onSave()
                        }
                    } else {
                        scope.launch {
                            EventRepository.addEvent(event)
                            isLoading = false
                            onSave()
                        }
                    }
                },
                enabled = !isLoading && title.isNotBlank()
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

            // Date display (read-only, selected from calendar)
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Text(
                    text = selectedDate.toString(),
                    style = MaterialTheme.typography.bodyLarge,
                    modifier = Modifier.padding(16.dp)
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
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
                    label = { Text("Start Time *") },
                    modifier = Modifier.weight(1f),
                    placeholder = { Text("HH:MM") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text)
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
                    label = { Text("End Time *") },
                    modifier = Modifier.weight(1f),
                    placeholder = { Text("HH:MM") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text)
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
