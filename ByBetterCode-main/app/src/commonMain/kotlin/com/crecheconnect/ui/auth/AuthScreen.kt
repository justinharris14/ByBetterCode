package com.crecheconnect.ui.auth

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.crecheconnect.model.User
import com.crecheconnect.model.UserRole
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.ktx.Firebase
import com.google.firebase.auth.UserProfileChangeRequest
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.SetOptions
import com.google.firebase.firestore.ktx.firestore
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

/**
 * Complete, copy-pasteable AuthScreen.kt
 *
 * Notes:
 * - Do NOT store passwords in Firestore or return them from auth functions. Password fields are used only for
 *   sign-up / sign-in with FirebaseAuth; the User object returned to the app will have an empty password.
 * - Make sure Firestore is enabled in your Firebase console and rules allow authenticated users to
 *   write their own user doc.
 * - If you want to test without hitting Firebase, set useFakeAuth = true (it will create a fake user).
 */

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

    // Toggle for local testing. Set to false to use real Firebase Auth / Firestore.
    val useFakeAuth = false

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
                    try {
                        if (useFakeAuth) {
                            // simulate sign in / sign up success for local testing
                            val role = if (email.contains("admin", ignoreCase = true)) UserRole.ADMIN else UserRole.PARENT
                            val fakeUser = User(
                                id = 123L,
                                email = email,
                                password = "",
                                role = role,
                                name = if (name.isNotBlank()) name else "Demo User",
                                phone = if (phone.isNotBlank()) phone else null
                            )
                            if (isLoginMode) onLoginSuccess(fakeUser) else onSignUpSuccess(fakeUser)
                            isLoading = false
                            return@launch
                        }

                        if (isLoginMode) {
                            performLogin(auth, email.trim(), password, onLoginSuccess)
                        } else {
                            performSignUp(auth, email.trim(), password, name.trim(), phone.trim().ifBlank { null }, onSignUpSuccess)
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

/* -------------------------------------------
   Firebase + Firestore helpers (suspend)
   ------------------------------------------- */

private fun splitName(fullName: String?): Pair<String, String> {
    if (fullName.isNullOrBlank()) return Pair("", "")
    val parts = fullName.trim().split(Regex("\\s+"), limit = 2)
    val first = parts.getOrNull(0) ?: ""
    val last = parts.getOrNull(1) ?: ""
    return Pair(first, last)
}

private val firestore get() = Firebase.firestore

private suspend fun saveOrUpdateUserFirestore(
    uid: String,
    email: String,
    fullName: String?,
    phone: String?,
    role: String = "Parent-or-Admin",
    profilePhotoUrl: String? = null
) {
    val (firstName, lastName) = splitName(fullName)
    val userMap = hashMapOf<String, Any?>(
        "userID" to uid,
        "email" to email,
        "firstName" to firstName,
        "lastName" to lastName,
        // NOTE: your existing console has a typo "phoneNumer" - we keep it for compatibility
        "phoneNumer" to phone,
        "profilePhotoUrl" to profilePhotoUrl,
        "role" to role,
        // use server timestamp (merged so existing createdAt stays if present)
        "createdAt" to FieldValue.serverTimestamp()
    )
    firestore.collection("users").document(uid).set(userMap, SetOptions.merge()).await()
}

private suspend fun recordLoginEvent(uid: String, device: String? = "Android") {
    val loginMap = hashMapOf<String, Any?>(
        "userID" to uid,
        "timestamp" to FieldValue.serverTimestamp(),
        "device" to device
    )
    firestore.collection("users").document(uid).collection("logins").add(loginMap).await()
}

private suspend fun getUserFromFirestore(uid: String): User? {
    val doc = firestore.collection("users").document(uid).get().await()
    if (!doc.exists()) return null

    val roleStr = doc.getString("role") ?: "Parent-or-Admin"
    val role = when {
        roleStr.contains("admin", ignoreCase = true) -> UserRole.ADMIN
        else -> UserRole.PARENT
    }

    val first = doc.getString("firstName") ?: ""
    val last = doc.getString("lastName") ?: ""
    val name = listOf(first, last).filter { it.isNotBlank() }.joinToString(" ").ifBlank { doc.getString("displayName") ?: "" }

    return User(
        id = uid.hashCode().toLong(),
        email = doc.getString("email") ?: "",
        password = "", // never return password
        role = role,
        name = name,
        phone = doc.getString("phoneNumer")
    )
}

/* -------------------------------------------
   Sign up + Login (use FirebaseAuth + Firestore)
   ------------------------------------------- */

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
        // Update display name on Firebase Auth user
        val profileUpdate = UserProfileChangeRequest.Builder()
            .setDisplayName(name)
            .build()
        firebaseUser.updateProfile(profileUpdate).await()

        val uid = firebaseUser.uid

        val user = User(
            id = uid.hashCode().toLong(),
            email = firebaseUser.email ?: email,
            password = "", // don't persist password
            role = UserRole.PARENT, // default; change if you collect role during signup
            name = name,
            phone = phone
        )

        // Save/merge to Firestore (keeps compatibility with existing document structure)
        saveOrUpdateUserFirestore(uid, user.email, user.name, user.phone, role = "Parent-or-Admin")

        // Optionally record signup as a login event
        recordLoginEvent(uid, device = "Android (signup)")

        onSuccess(user)
    } else {
        throw Exception("Sign up failed")
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
        val uid = firebaseUser.uid

        // Try to fetch Firestore profile; if missing, fallback to minimal User created from Auth user
        val firestoreUser = try { getUserFromFirestore(uid) } catch (e: Exception) { null }

        val user = firestoreUser ?: User(
            id = uid.hashCode().toLong(),
            email = firebaseUser.email ?: email,
            password = "",
            role = if (email.contains("admin", ignoreCase = true)) UserRole.ADMIN else UserRole.PARENT,
            name = firebaseUser.displayName ?: ""
        )

        // Record every successful login
        recordLoginEvent(uid, device = "Android")

        onSuccess(user)
    } else {
        throw Exception("Login failed")
    }
}
