package com.crecheconnect

import androidx.compose.runtime.Composable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.material3.Text
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.crecheconnect.model.User
import com.crecheconnect.model.UserRole
import com.crecheconnect.ui.admin.AdminDashboard
import com.crecheconnect.ui.auth.AuthScreen
import com.crecheconnect.ui.parent.AttendanceView
import com.crecheconnect.ui.parent.CalendarView
import com.crecheconnect.ui.parent.sampleAttendanceRecords

// Define navigation routes
sealed class Screen(val route: String) {
    object Auth : Screen("auth")
    object AdminDashboard : Screen("admin_dashboard")
    object ParentDashboard : Screen("parent_dashboard")
    object AttendanceView : Screen("attendance_view")
    object CalendarView : Screen("calendar_view")
}

@Composable
fun CrecheConnectNavHost(
    navController: NavHostController = rememberNavController(),
    startDestination: String = Screen.Auth.route // <- this must be Auth
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable(Screen.Auth.route) {
            AuthScreen(
                onLoginSuccess = { user: User ->
                    when (user.role) {
                        UserRole.ADMIN -> navController.navigate(Screen.AdminDashboard.route) {
                            popUpTo(Screen.Auth.route) { inclusive = true }
                        }
                        UserRole.PARENT -> navController.navigate(Screen.ParentDashboard.route) {
                            popUpTo(Screen.Auth.route) { inclusive = true }
                        }
                    }
                },
                onSignUpSuccess = { user: User ->
                    navController.navigate(Screen.ParentDashboard.route) {
                        popUpTo(Screen.Auth.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.AdminDashboard.route) {
            AdminDashboard(
                onManageEvents = { /* Navigate to events management */ },
                onTakeAttendance = { navController.navigate(Screen.AttendanceView.route) },
                onViewSubscriptions = { /* Navigate to subscriptions */ },
                onViewClassRoster = { /* Navigate to class roster */ }
            )
        }

        composable(Screen.ParentDashboard.route) {
            AttendanceView(
                attendanceRecords = sampleAttendanceRecords,
                childName = "Your Child"
            )
        }

        composable(Screen.AttendanceView.route) {
            AttendanceView(
                attendanceRecords = sampleAttendanceRecords,
                childName = "Your Child"
            )
        }

        composable(Screen.CalendarView.route) {
            CalendarView(
                onEventClick = { /* Handle event click */ },
                onBackToDashboard = { navController.popBackStack() }
            )
        }

        // Optional debug route — you can keep or remove this
        composable("debug") {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("Debug route: safe")
            }
        }
    }
}
