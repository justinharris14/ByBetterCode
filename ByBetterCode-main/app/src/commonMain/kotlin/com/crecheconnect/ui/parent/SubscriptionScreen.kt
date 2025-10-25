package com.crecheconnect.ui.parent

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.selection.selectable
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.crecheconnect.model.*
import kotlinx.datetime.Clock
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import kotlinx.datetime.plus
import kotlinx.datetime.DateTimeUnit

@Composable
fun SubscriptionScreen(
    currentUser: User?,
    onSubscriptionSuccess: (Subscription) -> Unit = {},
    onBackToCalendar: () -> Unit = {}
) {
    var selectedPlan by remember { mutableStateOf<SubscriptionType?>(null) }
    var showSuccessDialog by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Choose Your Subscription Plan",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 32.dp)
        )

        // Monthly Plan
        SubscriptionPlanCard(
            title = "Monthly Plan",
            price = "$29/month",
            description = "Perfect for short-term needs",
            features = listOf(
                "Access to all events",
                "Attendance tracking",
                "Email support"
            ),
            isSelected = selectedPlan == SubscriptionType.MONTHLY,
            onSelect = { selectedPlan = SubscriptionType.MONTHLY }
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Yearly Plan
        SubscriptionPlanCard(
            title = "Yearly Plan",
            price = "$299/year",
            description = "Best value for long-term commitment",
            features = listOf(
                "Access to all events",
                "Attendance tracking",
                "Email support",
                "Priority customer support",
                "2 months free!"
            ),
            isSelected = selectedPlan == SubscriptionType.YEARLY,
            onSelect = { selectedPlan = SubscriptionType.YEARLY }
        )

        Spacer(modifier = Modifier.height(32.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedButton(
                onClick = onBackToCalendar,
                modifier = Modifier.weight(1f)
            ) {
                Text("Back")
            }

            Button(
                onClick = {
                    selectedPlan?.let {
                        showSuccessDialog = true
                    }
                },
                modifier = Modifier.weight(1f),
                enabled = selectedPlan != null
            ) {
                Text(text = "Subscribe Now")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "* Subscription management available in admin panel",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.align(Alignment.CenterHorizontally)
        )
    }

    // Show success dialog when subscription is completed
    if (showSuccessDialog && selectedPlan != null && currentUser != null) {
        SubscriptionSuccessDialog(
            subscriptionType = selectedPlan!!,
            onConfirm = {
                showSuccessDialog = false
                // Create subscription object
                val subscription = Subscription(
                    userId = currentUser.id!!,
                    type = selectedPlan!!,
                    status = SubscriptionStatus.ACTIVE,
                    startDate = kotlinx.datetime.Clock.System.now().toLocalDateTime(TimeZone.currentSystemDefault()).date.toString(),
                    endDate = when (selectedPlan!!) {
                        SubscriptionType.MONTHLY -> Clock.System.now().plus(1, DateTimeUnit.MONTH, TimeZone.currentSystemDefault()).toLocalDateTime(TimeZone.currentSystemDefault()).date.toString()
                        SubscriptionType.YEARLY -> Clock.System.now().plus(1, DateTimeUnit.YEAR, TimeZone.currentSystemDefault()).toLocalDateTime(TimeZone.currentSystemDefault()).date.toString()
                    }
                )
                onSubscriptionSuccess(subscription)
            },
            onDismiss = { showSuccessDialog = false }
        )
    }
}

@Composable
fun SubscriptionSuccessDialog(
    subscriptionType: SubscriptionType,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Subscription Successful!") },
        text = {
            Text(
                "Your ${subscriptionType.name.lowercase()} subscription has been activated. " +
                "You now have access to all features."
            )
        },
        confirmButton = {
            Button(onClick = onConfirm) {
                Text("Continue")
            }
        }
    )
}

@Composable
fun SubscriptionPlanCard(
    title: String,
    price: String,
    description: String,
    features: List<String>,
    isSelected: Boolean,
    onSelect: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .selectable(
                selected = isSelected,
                onClick = onSelect,
                role = Role.RadioButton
            ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = if (isSelected) 8.dp else 4.dp
        )
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
                        text = title,
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = description,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Text(
                    text = price,
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            features.forEach { feature ->
                Row(
                    modifier = Modifier.padding(vertical = 2.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "✓",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.padding(end = 8.dp)
                    )
                    Text(
                        text = feature,
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }

            if (isSelected) {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Selected",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
