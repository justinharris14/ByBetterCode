package com.crecheconnect.ui.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.crecheconnect.model.Subscription
import com.crecheconnect.model.SubscriptionStatus
import com.crecheconnect.model.SubscriptionType
import com.crecheconnect.model.User
import com.crecheconnect.ui.admin.StatCard

// Sample subscriptions for demonstration
val sampleSubscriptions = listOf(
    Subscription(
        id = 1,
        userId = 1,
        type = SubscriptionType.MONTHLY,
        status = SubscriptionStatus.ACTIVE,
        startDate = "2024-01-01",
        endDate = "2024-02-01"
    ),
    Subscription(
        id = 2,
        userId = 2,
        type = SubscriptionType.YEARLY,
        status = SubscriptionStatus.ACTIVE,
        startDate = "2024-01-15",
        endDate = "2025-01-15"
    ),
    Subscription(
        id = 3,
        userId = 3,
        type = SubscriptionType.MONTHLY,
        status = SubscriptionStatus.INACTIVE,
        startDate = "2023-12-01",
        endDate = "2024-01-01"
    )
)

// Sample users for subscription lookup
val sampleUsers = listOf(
    User(id = 1, email = "parent1@example.com", password = "", name = "John Smith", role = com.crecheconnect.model.UserRole.PARENT),
    User(id = 2, email = "parent2@example.com", password = "", name = "Jane Doe", role = com.crecheconnect.model.UserRole.PARENT),
    User(id = 3, email = "parent3@example.com", password = "", name = "Mike Johnson", role = com.crecheconnect.model.UserRole.PARENT)
)

@Composable
fun AdminSubscriptionScreen() {
    var selectedStatus by remember { mutableStateOf<SubscriptionStatus?>(null) }
    var selectedType by remember { mutableStateOf<SubscriptionType?>(null) }

    val filteredSubscriptions = remember(selectedStatus, selectedType) {
        sampleSubscriptions.filter { subscription ->
            val matchesStatus = selectedStatus?.let { it == subscription.status } ?: true
            val matchesType = selectedType?.let { it == subscription.type } ?: true

            matchesStatus && matchesType
        }
    }

    val stats = remember(filteredSubscriptions) {
        val activeCount = filteredSubscriptions.count { it.status == SubscriptionStatus.ACTIVE }
        val inactiveCount = filteredSubscriptions.count { it.status == SubscriptionStatus.INACTIVE }
        val cancelledCount = filteredSubscriptions.count { it.status == SubscriptionStatus.CANCELED }
        val monthlyCount = filteredSubscriptions.count { it.type == SubscriptionType.MONTHLY }
        val yearlyCount = filteredSubscriptions.count { it.type == SubscriptionType.YEARLY }

        SubscriptionStats(
            totalSubscriptions = filteredSubscriptions.size,
            activeSubscriptions = activeCount,
            inactiveSubscriptions = inactiveCount,
            cancelledSubscriptions = cancelledCount,
            monthlySubscriptions = monthlyCount,
            yearlySubscriptions = yearlyCount
        )
    }

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
                text = "Subscription Management",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )

            // Filter button
            IconButton(
                onClick = { /* TODO: Show advanced filters */ }
            ) {
                Icon(
                    imageVector = Icons.Default.FilterList,
                    contentDescription = "Filters"
                )
            }
        }

        // Stats Cards
        Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            StatCard(
                title = "Total Subscriptions",
                value = stats.totalSubscriptions.toString(),
                icon = "💳"
            )
            StatCard(
                title = "Active",
                value = stats.activeSubscriptions.toString(),
                icon = "✅"
            )
        }
        Spacer(modifier = Modifier.height(16.dp))
        Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            StatCard(
                title = "Monthly Plans",
                value = stats.monthlySubscriptions.toString(),
                icon = "📅"
            )
            StatCard(
                title = "Yearly Plans",
                value = stats.yearlySubscriptions.toString(),
                icon = "📆"
            )
        }

        // Filters
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = "Filters",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                // Status Filter
                Text(
                    text = "Status",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    SubscriptionStatus.values().forEach { status ->
                        FilterChip(
                            selected = selectedStatus == status,
                            onClick = { selectedStatus = if (selectedStatus == status) null else status },
                            label = {
                                Text(
                                    text = status.name,
                                    color = when (status) {
                                        SubscriptionStatus.ACTIVE -> Color.Green
                                        SubscriptionStatus.INACTIVE -> Color.Red
                                        SubscriptionStatus.CANCELED -> Color.Gray
                                    }
                                )
                            }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Type Filter
                Text(
                    text = "Plan Type",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    SubscriptionType.values().forEach { type ->
                        FilterChip(
                            selected = selectedType == type,
                            onClick = { selectedType = if (selectedType == type) null else type },
                            label = { Text(type.name) }
                        )
                    }
                }
            }
        }

        // Subscriptions List
        LazyColumn(
            contentPadding = PaddingValues(16.dp)
        ) {
            items(filteredSubscriptions) { subscription ->
                SubscriptionManagementItem(
                    subscription = subscription,
                    user = sampleUsers.find { it.id == subscription.userId },
                    onStatusChange = { newStatus ->
                        // In real app, update subscription status
                        println("Update subscription ${subscription.id} to status $newStatus")
                    }
                )
                Spacer(modifier = Modifier.height(8.dp))
            }
        }
    }
}

@Composable
fun SubscriptionManagementItem(
    subscription: Subscription,
    user: User?,
    onStatusChange: (SubscriptionStatus) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = user?.name ?: "Unknown User",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = user?.email ?: "No email",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Column(
                    horizontalAlignment = Alignment.End
                ) {
                    Text(
                        text = subscription.type.name,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "$${if (subscription.type == SubscriptionType.MONTHLY) "29" else "299"}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Status: ${subscription.status.name}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = when (subscription.status) {
                            SubscriptionStatus.ACTIVE -> Color.Green
                            SubscriptionStatus.INACTIVE -> Color.Red
                            SubscriptionStatus.CANCELED -> Color.Gray
                        }
                    )
                    Text(
                        text = "${subscription.startDate} - ${subscription.endDate}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                // Status change buttons
                Row(
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    SubscriptionStatus.values().forEach { status ->
                        OutlinedButton(
                            onClick = { onStatusChange(status) },
                            colors = if (subscription.status == status) {
                                ButtonDefaults.outlinedButtonColors(
                                    containerColor = when (status) {
                                        SubscriptionStatus.ACTIVE -> Color.Green.copy(alpha = 0.1f)
                                        SubscriptionStatus.INACTIVE -> Color.Red.copy(alpha = 0.1f)
                                        SubscriptionStatus.CANCELED -> Color.Gray.copy(alpha = 0.1f)
                                    }
                                )
                            } else {
                                ButtonDefaults.outlinedButtonColors()
                            }
                        ) {
                            Text(
                                text = status.name.take(3),
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                    }
                }
            }
        }
    }
}

data class SubscriptionStats(
    val totalSubscriptions: Int,
    val activeSubscriptions: Int,
    val inactiveSubscriptions: Int,
    val cancelledSubscriptions: Int,
    val monthlySubscriptions: Int,
    val yearlySubscriptions: Int
)
