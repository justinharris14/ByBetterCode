plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("app.cash.sqldelight")
    id("com.google.gms.google-services")
}

android {
    namespace = "com.crecheconnect"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.crecheconnect"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }
    sourceSets {
        getByName("main") {
            // include multiplatform-style sources so Android sees them
            kotlin.srcDir("src/commonMain/kotlin")
            // if you have resources in commonMain
            resources.srcDir("src/commonMain/resources")
            // if your SQLDelight files are in src/commonMain/sqldelight and
            // you want them available to the Android build, include:
            // kotlin.srcDir("src/commonMain/sqldelight")
        }
    }
    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlin {
        jvmToolchain(17)
    }


    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
}

dependencies {
    // AndroidX core + UI
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.google.android.material)
    implementation(libs.androidx.constraintlayout)

    // Compose
    implementation(platform("androidx.compose:compose-bom:2024.09.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material")
    implementation("androidx.compose.material:material-icons-core")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.runtime:runtime")
    implementation("androidx.compose.runtime:runtime-livedata")
    implementation("androidx.compose.animation:animation")
    implementation("androidx.compose.animation:animation-core")
    debugImplementation("androidx.compose.ui:ui-tooling")

    // Activity + Navigation
    implementation("androidx.activity:activity-compose:1.9.0")
    implementation("androidx.navigation:navigation-compose:2.8.0")

    // Lifecycle
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.6.2")

    // KotlinX + Networking
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.3")
    implementation("io.ktor:ktor-client-core:2.3.4")
    implementation("io.ktor:ktor-client-android:2.3.4")
    implementation("io.ktor:ktor-client-content-negotiation:2.3.4")
    implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.4")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")

    // SQLDelight
    implementation("app.cash.sqldelight:android-driver:2.0.1")
    implementation("app.cash.sqldelight:coroutines-extensions:2.0.1")

    // Firebase
    implementation(platform("com.google.firebase:firebase-bom:33.3.0"))
    implementation("com.google.firebase:firebase-auth")
    implementation("com.google.firebase:firebase-firestore")
    implementation("com.google.firebase:firebase-messaging")
    implementation("com.google.firebase:firebase-analytics")

    // Kotlin datetime
    implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.4.1")

    // Testing
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.test.ext.junit)
    androidTestImplementation(libs.androidx.test.espresso.core)
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
}

sqldelight {
    databases {
        create("CrecheConnectDatabase") {
            packageName.set("com.crecheconnect.database")
        }
    }
}
