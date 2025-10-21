
10/21/25 Updated 
### **App Blueprint: "CrecheConnect"**

**1. Project Overview**

*   **Application Name:** CrecheConnect
*   **Platforms:** iOS & Android (Cross-Platform)
*   **Development Environment:** Android Studio (Narwhal 2025)
*   **Primary Languages:** Kotlin, Java
*   **Core Purpose:** A dual-role application for a creche. It provides **Parents** with a view-only dashboard for events and a subscription payment portal, while providing **Admins** with full management capabilities for events, student attendance, and subscription tracking.

**2. User Roles & Core Permissions**

| Role | Description | Key Permissions |
| :--- | :--- | :--- |
| **Parent** | Primary user. Views their child's information. | - View Event Calendar<br>- Purchase Food Subscription (Monthly/Yearly)<br>- View Child's Attendance History |
| **Admin** | Administrative staff with full system access. | - **Full CRUD (Create, Read, Update, Delete)** on Events<br>- Manage Student Rosters (Add/Remove)<br>- Manually Log Class Attendance<br>- View & Filter All Student Attendance<br>- Track Subscription Statuses |

*Note: The "Staff" role mentioned in the prompt is functionally an "Admin" in this context, as they perform administrative tasks like marking attendance.*

**3. System Architecture & Data Flow Diagram**

```
+-------------------+       +----------------------+       +--------------------+
|   Parent User     |<----->|   CrecheConnect App  |<----->|   Backend Server   |
|   (View Only)     |       |   (Frontend - KMM)   |       |   (Firebase/etc.)  |
+-------------------+       +----------------------+       +--------------------+
                                  ^                               ^
                                  |                               |
                                  v                               v
+-------------------+       +----------------------+       +--------------------+
|    Admin User     |<----->|  Stripe Payment API  |       |  Push Notification |
|   (Full Access)   |       |   (Integration)      |       |     Service        |
+-------------------+       +----------------------+       +--------------------+
```

**Diagram Explanation:**

*   **Three/two Roles:** The diagram shows two user interfaces (Parent, Admin) interacting with the same app, which enforces role-based permissions. The backend server is the third "role" as the central data authority.
*   **Stripe Integration:** Stripe sits as a dedicated, secure service between the app and the financial network. The app communicates with Stripe's API to handle payment intents and confirmations, without sensitive payment data touching the app's main backend directly.
*   **Notifications:** The Push Notification Service is triggered by the Backend Server. For example, when an Admin creates a new event, the server sends a push notification to all Parent devices.

**4. Screen-by-Screen Flow**

*   **Authentication Screen:**
    *   Login fields for Email/Password.
    *   "Sign Up" option for new parents.
    *   Role-based redirect upon login (Parent to Calendar, Admin to Dashboard).

*   **Parent Flow:**
    1.  **Calendar View (Home Screen):** A simple, scrollable calendar UI displaying events. Read-only.
    2.  **Subscription Screen:** A clean UI to select a plan (Monthly/Yearly) and initiate payment via Stripe.
    3.  **Attendance View:** A simple list or chart showing their child's attendance history.

*   **Admin Flow:**
    1.  **Admin Dashboard (Home Screen):** Overview with quick actions: "Manage Events," "Take Attendance," "View Subscriptions."
    2.  **Event Management Screen:** List of events with "Add," "Edit," and "Delete" buttons.
    3.  **Attendance Screen:**
        *   **Step 1:** Select a class (filtered into 3 classes: e.g., "Toddlers," "Pre-School," "Infants").
        *   **Step 2:** View a list of students in that class with simple checkboxes (Present/Absent).
        *   **Step 3:** "Submit" to save the attendance record for the day.
    4.  **Attendance History Screen:** A filterable graph/list to view any child's attendance over time (filters: Child's Name, Date Range, Class).

**5. Connection to Non-Functional Requirements**

*   **Security:**
    *   **Payments:** All financial transactions are handled by the Stripe API, ensuring PCI compliance. No credit card data is stored on the app's servers.
    *   **Data:** User authentication and role-based access control prevent parents from accessing admin functions or other children's data.
*   **Reliability:**
    *   **Alerts/Notifications:** The use of a robust, dedicated push notification service (e.g., Firebase Cloud Messaging) ensures alerts for new events or important updates are delivered reliably.
    *   **Data Integrity:** The backend server acts as a single source of truth, ensuring all users see consistent event and attendance data.
*   **Scalability:**
    *   The architecture separates concerns (Frontend, Backend, Payment API). This allows the backend (e.g., Firebase or a custom server) to be scaled independently to support more creches, parents, and data volume.

**6. Progress & Remaining Work**

| Status | Feature / Task | Details |
| :--- | :--- | :--- |
| ** In Progress** | Core App Features | Parent & Admin roles, basic navigation, calendar UI, attendance logging prototype. |
| **🟨 In Progress** | **Stripe Integration** | **High Priority.** Implement payment flow, subscription management, and confirmation handling. |
| **🟨 In Progress** | **Architecture Diagram** | **High Priority.** Finalize the diagram above for POE submission, ensuring it clearly shows data flow and security boundaries. |
| **📋 To Do** | **Attendance Graph Filters** | Implement the UI and logic for filtering attendance history by child, class, and date. |
| **📋 To Do** | **Play Store Assets** | Prepare final screenshots and promotional text for the app store listing. |

**7. Key Technical Considerations**

*   **State Management:** Use a robust pattern (like MVVM) to manage user state, event data, and attendance records efficiently.
*   **Offline Capability:** Consider caching the event calendar locally so parents can view it without an internet connection.
*   **Data Model:** The database schema should clearly separate `Users` (with a `role` field), `Events`, `Students` (linked to a parent user and a class), `AttendanceRecords`, and `Subscriptions`.

This blueprint provides a clear, actionable plan for completing the CrecheConnect app, aligning the technical implementation with the project's functional and non-functional goals.
