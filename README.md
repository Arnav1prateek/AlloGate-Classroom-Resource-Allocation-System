# AlloGate Classroom Resource Allocation System

AlloGate is a role-based academic resource allocation platform designed to streamline how teaching resources are requested, reviewed, tracked, and maintained across classrooms and labs. The project digitizes a workflow that is often handled manually in colleges, reducing confusion around availability, approval status, and inventory usage.

Built as a browser-based prototype, the system supports three operational roles:

- `Faculty` for submitting and managing teaching resource requests
- `Admin` for reviewing requests, monitoring inventory, and generating reports
- `Manager / Lab Technician` for updating resource quantities and operational status

## Highlights

- Role-based login with dashboard redirection
- Resource request workflow with quantity validation
- Live resource availability and inventory views
- Modify and cancel flow for pending requests
- Request status tracking with auto-refresh
- Admin approval and rejection dashboard
- Notification system for request status changes
- Inventory maintenance for managers and lab technicians
- Utilization reports with filters, charts, and tables

## User Stories Covered

| Story | Feature Area | Status |
|---|---|---|
| US1 | User Login / Authentication | Complete |
| US2 | Request Teaching Resources | Complete |
| US3 | View Resource Availability | Complete |
| US4 | Modify or Cancel Request | Complete |
| US5 | Track Request Status | Complete |
| US6 | Review Resource Requests | Complete |
| US7 | View Resource Inventory | Complete |
| US8 | Request Notifications | Complete |
| US9 | Update Resource Status | Complete |
| US10 | View Utilization Reports | Complete |

## Tech Stack

### Frontend

- `React`
- `TypeScript`
- `Vite`
- `React Router`

### Styling and UI

- `Tailwind CSS`
- `Lucide React`
- `Radix UI` primitives
- `MUI` packages available in the project dependency set

### Data and Reporting

- `localStorage` as a mock persistence layer
- centralized client-side API and service logic
- `Recharts` for utilization analytics

## How the Prototype Handles Data

This version of AlloGate does not use a production database yet. Instead, it uses a structured browser-side persistence model based on `localStorage`.

The app maintains four primary data collections:

- `users`
- `resources`
- `resourceRequests`
- `notifications`

All business operations go through a centralized API layer in the app. That means authentication, request creation, approval, rejection, inventory updates, notifications, and reports are handled consistently in one place rather than being scattered across UI components.

This approach was chosen to:

- demonstrate the full workflow quickly for academic evaluation
- keep the prototype easy to run in any browser
- avoid backend deployment complexity during the project phase
- preserve a clean migration path to a real backend later

## Core Modules

### Faculty

- Login and role-based access
- Request teaching resources
- View resource availability
- Modify or cancel pending requests
- Track request status
- View notifications

### Admin

- Review all pending requests
- Approve or reject requests
- View complete inventory
- Monitor operational status
- Generate utilization reports

### Manager / Lab Technician

- Update resource quantity
- Update availability status
- Add maintenance or operational notes
- Reflect inventory changes immediately

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Faculty | `faculty@smartclass.edu` | `faculty123` |
| Admin | `admin@smartclass.edu` | `admin123` |
| Manager | `manager@smartclass.edu` | `manager123` |

## Running the Project

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

The Vite development server usually starts at:

```text
http://localhost:5173
```

## Recommended Test Flow

### 1. Faculty Workflow

- Log in as faculty
- Submit a resource request
- Check availability before and after submission
- Modify or cancel a pending request
- Track status updates and notifications

### 2. Admin Workflow

- Log in as admin
- Open the request review dashboard
- Approve or reject pending requests
- Check inventory and report updates

### 3. Manager Workflow

- Log in as manager
- Update resource quantity or operational status
- Mark a resource unavailable
- Verify that inventory reflects the change immediately

## Project Structure

```text
src/
  app/
    layouts/
    lib/
      api.ts
      db.ts
      types.ts
    pages/
      Login.tsx
      RequestResources.tsx
      ResourceAvailability.tsx
      ManageRequests.tsx
      RequestStatus.tsx
      ReviewRequests.tsx
      Inventory.tsx
      Notifications.tsx
      UpdateStatus.tsx
      Reports.tsx
```

## Functional Scope

The current version is a complete functional prototype, but it is not yet a production-grade full-stack deployment. It currently does not include:

- a live backend server
- a hosted relational or NoSQL database
- secure hashed authentication
- multi-user real-time synchronization across devices

## Future Improvements

- migrate to `Node.js + Express`, `Firebase`, or another backend stack
- connect to `Firestore`, `MongoDB`, or `PostgreSQL`
- add secure authentication and authorization tokens
- support real-time updates across users
- add timetable-aware booking and scheduling
- integrate email or push notifications

## License

This repository includes an MIT `LICENSE` file.
