## 1. Overview  

**ADC_Karnal-EMIMS Frontend** is a React + TypeScript application designed for district, school, and teacher users to manage and visualize educational data. The application features role-based authentication, dashboards, data visualization, and CSV import/export for student marks.


## 2. Folder Structure 
```
src/
├── App.tsx                  # Root app component
├── main.tsx                 # React entry point
├── index.css                # Global styles
├── vite-env.d.ts            # Vite TypeScript environment declarations

├── components/              # Reusable UI components
│   ├── auth/                # Authentication components
│   │   ├── LoginForm.tsx    # Login form
│   │   ├── ProtectedRoute.tsx  # Wraps routes to enforce auth
│   │   └── RoleBasedComponent.tsx  # Conditional rendering by role
│   │
│   ├── dashboard/           # Dashboard widgets & charts
│   │   ├── AlertsWidget.tsx
│   │   ├── PerformanceChart.tsx
│   │   ├── StatCard.tsx
│   │   └── TeacherWorkload.tsx
│   │
│   ├── layout/              # Layout components
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── Layout.tsx       # Main layout wrapper (Sidebar + Header + Content)
│   │   └── Sidebar.tsx
│   │
│   ├── shared/              # Shared utility components
│   │   ├── DataTable.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ExportButton.tsx
│   │   ├── FileUpload.tsx
│   │   ├── FilterBar.tsx
│   │   └── LoadingSpinner.tsx
│   │
│   ├── ui/                  # Low-level UI primitives
│   │   ├── dialog.tsx
│   │   └── tabs.tsx
│   │
│   └── visualizations/      # Charts specific to performance & progress
│       ├── SchoolPerformanceChart.tsx
│       ├── StudentProgressChart.tsx
│       └── SubjectScoresByClass.tsx

├── contexts/                # React Context API for global state
│   ├── AuthContext.tsx      # Authentication & roles
│   ├── DataContext.tsx      # Table/filter states
│   └── SchoolContext.tsx    # School-related global data

├── lib/                     # Utility libraries & helpers
│   └── utils.ts             # Generic helper functions

├── pages/                   # Route-level page components
│   ├── Analytics.tsx
│   ├── ClassManagement.tsx
│   ├── Dashboard.tsx
│   ├── DataManagement.tsx
│   ├── NotFound.tsx
│   ├── Reports.tsx
│   ├── SchoolDetail.tsx
│   ├── Schools.tsx
│   ├── Settings.tsx
│   ├── Students.tsx
│   ├── Subjects.tsx
│   ├── TeacherDashboard.tsx
│   └── Teachers.tsx

├── services/                # API integration & business logic
│   ├── api.ts               # Axios instance & API helpers
│   └── auth.ts              # Auth-specific API calls

└── types/                   # TypeScript type definitions
    └── auth.ts
```

## 3. Authentication Flow

**Process:**

1. **User Login**: A user submits credentials via LoginForm.tsx, which triggers an API call to the backend's /auth/login endpoint.

2. **Token Storage**: Upon successful authentication, the backend returns a JWT token. This token is securely stored in the browser's localStorage for persistence.

3. **Global State**: The AuthContext consumes the token, updating the global state to reflect the user and isAuthenticated status, making this information accessible to any component.

4. **Route Protection**: The ProtectedRoute.tsx component is used to wrap routes that require authentication, automatically redirecting unauthenticated users to the login page.

5. **Role-Based Access**: The RoleBasesComponent.tsx component, along with AuthContext, handles conditional rendering and navigation based on the user's role (e.g., District Admin, School Admin, Teacher).

**Role-based navigation:**

**Roles	Default Dashboard**
- District Admin --> 	/district-dashboard
- School Admin	 -->    /school-dashboard
- Teacher	     -->    /teacher-dashboard

**Security:**

- JWT auto-attached to all API calls
- Role-based UI & route protection
- Secure logout clears all tokens

## 4. State Management
The application uses a lightweight React Context API for state management, avoiding the overhead of libraries like Redux.

- AuthContext: Manages the authentication state, user roles, and related data.
- DataContext: Provides global access to core application data, such as a list of schools or classes, preventing prop drilling.
- SchoolContext: Manages state specific to the currently selected school.

## 5.UI & Styling
The user interface is built using a modern, component-based approach.

- **Frameworks**: Styling is handled with TailwindCSS for utility-first class management, and shadcn/ui provides pre-styled, accessible UI components.

- **Design**: The design is responsive, ensuring a consistent and user-friendly experience on various devices, from desktops to tablets.

- **Theming**: The application maintains a consistent visual identity through a defined color palette, typography, and spacing conventions. 

## 6. Data Visualization
Data is presented in a clear and intuitive way using charts and graphs powered by the Recharts library.

**Performance Charts:**

- **SchoolPerformanceChart.tsx**: Displays high-level school performance metrics.
- **StudentProgressChart.tsx**: Visualizes individual student progress over time.
- **SubjectScoresByClass.tsx**: Compares student scores across different subjects within a class.

## 7. Data Import & Export
The system provides functionality for efficient data handling.

- **Export**: Users can export data, such as student marks, into standard formats like .csv or .xlsx using `ExportButton.tsx` and libraries like xlsx and FileSaver.

- **Import**: The `FileUpload.tsx` component allows teachers to upload updated marks or other data via CSV files, which are parsed by the PapaParse library.

## 8. API Integration
The application communicates with the backend via a centralized API service.

- **Service Layer**: All API calls are defined in /services/api.ts and /services/auth.ts, creating a clean separation of concerns.

- **Axios**: An Axios instance is configured to automatically attach the JWT token to the Authorization header of every request, simplifying authenticated API calls.

## 9. Routing Architecture
- **Centralized Routing**: Routing is managed in App.tsx using react-router-dom.
- **Protected Routes**: The ProtectedRoute.tsx component is used to secure specific routes, ensuring only authenticated users can access them.
- **Role-Based Routing**: Different roles are directed to their respective dashboards (e.g., /teacher-dashboard, /school-dashboard).

## 10. Build and Deployment 
```
npm run dev  →  http://localhost:5173

# Production
npm run build
``` 
Production build served via Nginx or Node

Dockerized setup supported

## 11. Performance Optimizations

- **Lazy Loading**: Routes are lazy-loaded to reduce the initial bundle size.
- **Code Splitting**: The build process automatically splits code into smaller chunks.
- **Memoization**: React.memo and useCallback are used to memoize components and functions, preventing unnecessary re-renders.

## 12. Future Enhancements
- **Advanced Data Visualization**: Integrate heatmaps and drill-down charts for more detailed performance analysis.
- **Real-time Dashboard**: Implement WebSockets for live data updates on dashboards.
- **Offline Support**: Enable offline caching with Service Workers for data access without an internet connection.
- **Progressive Web App (PWA)**: Make the app installable with push notifications and other PWA features.
- **Multilingual Support**: Add i18n support for multiple languages, starting with Hindi.


## 13. Code Standards 
To ensure maintainability and scalability, the following standards are enforced:

- **TypeScript**: Strict typing is used throughout the codebase to catch errors early.
- **Linting & Formatting**: ESLint and Prettier are configured to maintain consistent code style and enforce best practices.
- **Component Structure**: Components are organized in a folder-based structure, grouping related files together.
- **Hooks**: The codebase follows modern React practices, using functional components and React Hooks extensively.
- **Validation**: Zod is used for robust runtime schema validation, ensuring data integrity.

###  Note on Code Style

For consistency with the rest of the project's existing code, I have used React.FC for the new components.

I am aware that React.FC is considered deprecated in modern React and TypeScript best practices. In future we plan to refactor the entire codebase to use the simpler function component syntax once the core features are stable and finalized.