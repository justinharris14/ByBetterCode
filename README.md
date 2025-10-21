ByBetterCode(10/21/25)

I helped convert the mixed multiplatform setup into a working app by cleaning up the project structure and fixing plugin issues. I  resolved the Kotlin version mismatch between 1.9.22 and 1.9.24 in libs.versions.toml, then made sure the Compose compiler and dependencies were aligned. 

Fixed the file structure by moving misplaced resources and manifests from androidMain into app/src/main/res, ensured the AndroidManifest.xml had the right package name and launcher activity, and removed the old CrecheConnectNavHost file that was causing conflicts.
Adjusted the source sets so that commonMain code could be recognized, added missing Compose imports like Box, Modifier, fillMaxSize, and replaced the placeholder nav host with Navigation.kt so the app launches on the Auth screen.

To do:
Secure login with authentication (email/phone-based OTP or password).
Admin captures parent and child details (name, contact info, emergency contacts, allergies, medical history, etc.).
•	Admin assigns children to specific Teacher (Staff)
•	Admin can reassign child to different teacher.
Attendance : need to do graphs
Calendar Integration
Notifications for announcements 
Stripe gateway

TASKS DUE 24/10/25


Justin:
Stripe Integration:
 Parents can make payment for tuition and activities

@ZG:
Events & Notifications:
 Admin can add events
 Parents should receive Notifications for announcements made by admins

@~Cvszy 
Attendance:
 Only admins can edit attendance in any way
 Complete filters and add a graph (wow factor)
 Secure login via firebase 

@Nasar:
Capturing details (admin)
 Admin should capture details for parents and children, parents can only read
 Children should be "linked" to a parent

@~Khulekani Legend.:
Calendar integration:
Parents should be able to sync events into calendar
