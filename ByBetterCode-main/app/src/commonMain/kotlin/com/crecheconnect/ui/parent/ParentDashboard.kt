package com.crecheconnect.ui.parent

import android.net.Uri
import androidx.browser.customtabs.CustomTabsIntent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.platform.LocalContext
import com.crecheconnect.model.*

@Composable
fun ParentDashboard() {
    var selectedTabIndex by remember { mutableStateOf(0) }
    val context = LocalContext.current

    // Stripe links
    val tuitionLink = "https://buy.stripe.com/test_bJe00ccYJdNb2Jx5zy7g401"
    val mealLink = "https://buy.stripe.com/test_8x24gsf6R10p3NB7HG7g400"

    // Mock current user
    val currentUser = User(
        id = 1L,
        name = "John Doe",
        email = "john.doe@example.com",
        password = "password123",
        role = UserRole.PARENT,
        phone = "+1234567890"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Header
        Text(
            text = "Parent Dashboard",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(16.dp)
        )

        // Main Content
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
        ) {
            when (selectedTabIndex) {
                0 -> AttendanceView()
                1 -> CalendarView()
                2 -> {
                    // Stripe Payment Buttons
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Button(
                            onClick = {
                                val intent = CustomTabsIntent.Builder().build()
                                intent.launchUrl(context, Uri.parse(tuitionLink))
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Pay Tuition")
                        }

                        Button(
                            onClick = {
                                val intent = CustomTabsIntent.Builder().build()
                                intent.launchUrl(context, Uri.parse(mealLink))
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Pay Weekly Meal Plan")
                        }
                    }
                }
            }
        }

        // Bottom Navigation Bar
        NavigationBar(
            modifier = Modifier.fillMaxWidth()
        ) {
            NavigationBarItem(
                icon = { Icon(Icons.Filled.CheckCircle, contentDescription = "Attendance") },
                label = { Text("Attendance") },
                selected = selectedTabIndex == 0,
                onClick = { selectedTabIndex = 0 }
            )
            NavigationBarItem(
                icon = { Icon(Icons.Filled.CalendarMonth, contentDescription = "Calendar") },
                label = { Text("Calendar") },
                selected = selectedTabIndex == 1,
                onClick = { selectedTabIndex = 1 }
            )
            NavigationBarItem(
                icon = { Icon(Icons.Filled.CreditCard, contentDescription = "Payment") },
                label = { Text("Payment") },
                selected = selectedTabIndex == 2,
                onClick = { selectedTabIndex = 2 }
            )
        }
    }
}
