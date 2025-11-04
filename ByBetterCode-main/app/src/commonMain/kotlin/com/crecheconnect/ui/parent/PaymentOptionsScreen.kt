package com.crecheconnect.ui.parent

import android.content.Intent
import android.net.Uri
import androidx.browser.customtabs.CustomTabsIntent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import com.crecheconnect.ui.admin.ActionButton

@Composable
fun PaymentOptionsScreen(
    tuitionLink: String,
    mealLink: String,
    onBack: () -> Unit = {}
) {
    val context = LocalContext.current

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Make a Payment",
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(bottom = 24.dp)
        )

        // Tuition button - open link
        ActionButton(
            text = "Pay Tuition",
            icon = "💳",
            onClick = {
                val intent = CustomTabsIntent.Builder().build()
                intent.launchUrl(context, Uri.parse(tuitionLink))
            }
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Meal plan button - open link
        ActionButton(
            text = "Weekly Meal Plan",
            icon = "🍽️",
            onClick = {
                val intent = CustomTabsIntent.Builder().build()
                intent.launchUrl(context, Uri.parse(mealLink))
            }
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Optional share link row (tuition & meal sharing)
        Button(onClick = {
            // Share both links as an example
            val shareText = "Tuition payment: $tuitionLink\nWeekly meal plan: $mealLink"
            val shareIntent = Intent().apply {
                action = Intent.ACTION_SEND
                putExtra(Intent.EXTRA_TEXT, shareText)
                type = "text/plain"
            }
            context.startActivity(Intent.createChooser(shareIntent, "Share payment links"))
        }) {
            Text("Share Links")
        }

        Spacer(modifier = Modifier.height(16.dp))

        Button(onClick = onBack) {
            Text("Back")
        }
    }
}
