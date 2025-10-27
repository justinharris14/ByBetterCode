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
import kotlinx.datetime.Instant
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime

// Helper function to format datetime for display
fun formatEventDateTime(instant: Instant): String {
    val dateTime = instant.toLocalDateTime(TimeZone.currentSystemDefault())
    return "${dateTime.date} at ${dateTime.time}"
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddEditEventScreen(
    eventToEdit: Event? = null,
    onSave: () -> Unit = {},
    onCancel: () -> Unit = {}
) {
    var title by remember { mutableStateOf(eventToEdit?.title ?: "") }
    var description by remember { mutableStateOf(eventToEdit?.description ?: "") }
    var eventDateTime by remember {
        mutableStateOf(
            eventToEdit?.eventDateTime ?: kotlinx.datetime.Instant.fromEpochMilliseconds(System.currentTimeMillis())
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
                        eventDateTime = eventDateTime,
                        eventID = eventToEdit?.eventID ?: java.util.UUID.randomUUID().toString(),
                        Date = eventToEdit?.Date ?: "",
                        createByID = eventToEdit?.createByID ?: "uuidOfAdmin",
                        createdAt = eventToEdit?.createdAt ?: kotlinx.datetime.Instant.fromEpochMilliseconds(System.currentTimeMillis()),
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

            // Date/Time display
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Text(
                    text = eventDateTime.let { formatEventDateTime(it) } ?: "Select Date & Time",
                    style = MaterialTheme.typography.bodyLarge,
                    modifier = Modifier.padding(16.dp)
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
