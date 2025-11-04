package com.crecheconnect.ui.auth

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import com.crecheconnect.model.User
import com.crecheconnect.model.UserRole
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.ktx.Firebase
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

@Composable
fun AuthScreen(
    onLoginSuccess: (User) -> Unit,
    onSignUpSuccess: (User) -> Unit
) {
    var isLoginMode by remember { mutableStateOf(true) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    val useFakeAuth = true
    val scope = rememberCoroutineScope()
    val auth = Firebase.auth

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = if (isLoginMode) "Login" else "Sign Up Now",
            style = MaterialTheme.typography.headlineMedium
        )

        Spacer(modifier = Modifier.height(32.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            isError = errorMessage != null
        )

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            visualTransformation = PasswordVisualTransformation(),
            isError = errorMessage != null
        )

        if (!isLoginMode) {
            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Full Name") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = phone,
                onValueChange = { phone = it },
                label = { Text("Phone (Optional)") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
        }

        errorMessage?.let {
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = it,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodyMedium
            )
        }

        Spacer(modifier = Modifier.height(32.dp))

        Button(
            onClick = {
                errorMessage = null
                isLoading = true
                scope.launch {
                    if (useFakeAuth) {
                        // simulate sign in / sign up success
                        val role = if (email.contains("admin")) UserRole.ADMIN else UserRole.PARENT
                        val fakeUser = User(
                            id = 123L,
                            email = email,
                            password = password,
                            role = role,
                            name = if (name.isNotBlank()) name else "Demo User"
                        )
                        if (isLoginMode) onLoginSuccess(fakeUser) else onSignUpSuccess(fakeUser)
                        isLoading = false
                        return@launch
                    }
                    try {
                        if (isLoginMode) {
                            performLogin(auth, email, password, onLoginSuccess)
                        } else {
                            performSignUp(auth, email, password, name, phone, onSignUpSuccess)
                        }
                    } catch (e: Exception) {
                        errorMessage = e.message ?: "Authentication failed"
                    } finally {
                        isLoading = false
                    }
                }
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = !isLoading && email.isNotBlank() && password.isNotBlank() && (isLoginMode || name.isNotBlank())
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(24.dp),
                    color = MaterialTheme.colorScheme.onPrimary
                )
            } else {
                Text(text = if (isLoginMode) "Login" else "Sign Up")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        TextButton(
            onClick = { isLoginMode = !isLoginMode }
        ) {
            Text(text = if (isLoginMode) "Don't have an account? Sign Up" else "Already have an account? Login")
        }
    }
}

private suspend fun performLogin(
    auth: FirebaseAuth,
    email: String,
    password: String,
    onSuccess: (User) -> Unit
) {
    val authResult = auth.signInWithEmailAndPassword(email, password).await()
    val firebaseUser = authResult.user

    if (firebaseUser != null) {
        // In a real app, you'd fetch additional user data from Firestore
        // For demo, we'll create a user object based on email
        val role = when {
            email.contains("admin") -> UserRole.ADMIN
            else -> UserRole.PARENT
        }

        val user = User(
            id = firebaseUser.uid.hashCode().toLong(), // Simplified for demo
            email = firebaseUser.email ?: email,
            password = password, // Don't store password in real app
            role = role,
            name = firebaseUser.displayName ?: "User"
        )
        onSuccess(user)
    } else {
        throw Exception("Login failed")
    }
}

private suspend fun performSignUp(
    auth: FirebaseAuth,
    email: String,
    password: String,
    name: String,
    phone: String?,
    onSuccess: (User) -> Unit
) {
    val authResult = auth.createUserWithEmailAndPassword(email, password).await()
    val firebaseUser = authResult.user

    if (firebaseUser != null) {
        // Update the user's display name
        val profileUpdate = com.google.firebase.auth.UserProfileChangeRequest.Builder()
            .setDisplayName(name)
            .build()
        firebaseUser.updateProfile(profileUpdate).await()

        val user = User(
            id = firebaseUser.uid.hashCode().toLong(), // Simplified for demo
            email = firebaseUser.email ?: email,
            password = password, // Don't store password in real app
            role = UserRole.PARENT,
            name = name,
            phone = phone
        )
        onSuccess(user)
    } else {
        throw Exception("Sign up failed")
    }
}
