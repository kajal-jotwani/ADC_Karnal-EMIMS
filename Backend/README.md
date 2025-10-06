## 1. Overview 

The **EMIMS backend** is built with **FastAPI** and provides a robust, modular, and secure API layer to manage school and district-level educational data.

**Key functionalities include:**

- Role-Based Access Control (RBAC)
- Student attendance and performance tracking
- Teacher and school management
- Dashboard analytics for district administrators
- Secure authentication and session management

The system is designed with async I/O for high-performance operations and modular design for easy extensibility.

## 2. Folder Structure 
```
ADC_KARNAL_EMIMS/Backend
├── alembic/                     # Database migration folder (using Alembic for versioning)
│   ├── versions/                # Individual migration scripts
│   └── env.py                   # Alembic environment configuration
├── src/                         # Main application source code
│   ├── auth/                    # Authentication & authorization module
│   │   ├── routes.py            # API endpoints for login, signup, token refresh, etc.
│   │   ├── models.py            # Database models for users, roles, tokens, etc.
│   │   ├── dependencies.py      # Dependencies for auth routes (like token verification)
│   │   ├── security.py          # Security utilities (password hashing, JWT handling)
│   │   └── services.py          # Business logic for authentication
│   ├── db/                      # Database related logic
│   │   ├── main.py              # Database initialization and connection setup
│   ├── models/                  # Models for main application (students, teachers, etc.)
│   │   ├── main.py  
│   ├── routes/                  # API endpoints for app functionality
│   │   ├── analytics.py         # Analytics-related API endpoints
│   │   ├── attendance.py        # Attendance management endpoints
│   │   ├── classes.py           # Class management endpoints
│   │   ├── dashboard.py         # Dashboard-related endpoints
│   │   ├── exams.py             # Exam and assessment endpoints
│   │   ├── schools.py           # School management endpoints
│   │   ├── subjects.py          # Subjects management endpoints
│   │   ├── students.py          # Student-related endpoints
│   │   └── teachers.py          # Teacher-related endpoints
│   ├── __init__.py              # Makes src a Python package
│   ├── config.py                # Application configuration (settings, environment variables)
│   ├── middleware.py            # Custom middleware (e.g., logging, authentication checks)
│   ├── seed_auth_data.py        # Script to populate initial auth-related data (roles, admin user)
│   ├── seed_demo_data.py        # Script to populate demo/sample data for testing
├── requirements.txt             # Python dependencies for the project
├── alembic.ini                  # Alembic configuration file for database migrations
├── .env.example                 # Example environment variables file
├── Dockerfile                   # Docker configuration to containerize the backend
└── README.md                    # Project documentation and setup instructions
```

## 3. Database Models
![alt text](/public/database-model.png)

**Relationships**

- District → School: A district contains many schools.
- School → Class: A school has many classes.
- School → User / Teacher: A school employs many users and teachers.
- Class → Student: A class contains many students.
- Student → Marks / Attendance / Exam Marks: A student has many records for marks, attendance, and exam results.
- Teacher → Teacher Assignment: A teacher has multiple class and subject assignments.
- Subject → Teacher Assignment: A subject can be assigned to multiple teachers.

## 4. Authentication & Security 
The system uses JWT-based authentication with refresh tokens and role-based access control (RBAC).

**Features:**

- Password hashing using bcrypt
- Short-lived access tokens, long-lived refresh tokens
- Role enforcement: ADMIN, PRINCIPAL, TEACHER
- Device/IP logging for auditing
- Token revocation & unique jti identifiers

**Authentication Flow**

**User Registration**
- Admin/Principal creates user via /auth/register
- Passwords hashed & stored securely
- Roles assigned (teacher, principal, admin)

**Login**
- Credentials verified via /auth/login
- Access & Refresh tokens generated
- Device/IP logged

**Token Refresh**
- `/auth/refresh` endpoint generates new access token
Logout
- `/auth/logout` revokes refresh token

**Password Management**
- `/auth/change-password` for active users
- Future: email-based password reset

## API Design and Endpoints

The API is organized into several modules, each handling a specific domain of the school management system.

**1. Auth 🔐**

- `POST /auth/register`: Create a new user account.
- `POST /auth/login`: Authenticate user and get tokens.
- `POST /auth/refresh`: Get new tokens with a refresh token.
- `POST /auth/logout`: Revoke a refresh token to log out. 
- `GET /auth/me`: Get current user info.
- `POST /auth/change-password`: Change the current user's password.
- `GET /auth/verify-token`: Verify if a token is valid.

**2. Schools 🏢**

- `POST /schools/`: Create a new school.
- `GET /schools/`: List all schools.
- `GET /schools/{school_id}`: Get details of a specific school.

**3. Classes 🎓**

- `POST /classes/`: Create a new class.
- `GET /classes/`: List all classes.
- `GET /classes/{class_id}`: Get details of a specific class.
- `DELETE /classes/{class_id}`: Delete a class.

**4. Teachers 🧑‍🏫**

- `GET /teachers/`: List all teachers.
- `POST /teachers/assignments`: Assign a teacher to a class and subject.
- `GET /teachers/{teacher_id}/classes`: Get all classes and subjects assigned to a teacher.
- `DELETE /teachers/assignments/{assignment_id}`: Remove a teacher's assignment.

**5. Students 🧑‍🎓**

- `POST /students/`: Create a new student.
- `GET /students/`: List all students.
- `GET /students/{student_id}`: Get details of a student.
- `PUT /students/{student_id}:` Update student details.
- `DELETE /students/{student_id}`: Delete a student.
- `POST /students/subjects`: Enroll a student in a subject.
- `POST /students/marks`: Record a student's marks.

**6. Subjects 📚**

- `POST /subjects/`: Create a new subject.
- `GET /subjects/`: List all subjects.
- `GET /subjects/{subject_id}`: Get details of a specific subject.
- `PUT /subjects/{subject_id}`: Update a subject.
- `DELETE /subjects/{subject_id}`: Delete a subject.

**7. Attendance 📅**
- `POST /attendance/`: Mark or update attendance for multiple students.
- `GET /attendance/class/{class_id}/date/{date}`: Get attendance for a class on a specific date.
- `GET /attendance/student/{student_id}/summary`: Get a student's attendance summary.

**8. Exams 📝**
- `POST /exams/`: Create a new exam.
- `GET /exams/teacher/{teacher_id}`: Get all exams created by a teacher.
- `POST /exams/marks`: Submit marks for multiple students for an exam.
- `GET /exams/{exam_id}/marks`: Get all marks for a specific exam.
- `GET /exams/student/{student_id}/performance:` Get a student's performance summary.


## Database Setup
- This app uses SQLAlchemy’s async engine and requires an async PostgreSQL driver (`asyncpg`).
- Your `.env` should have: 
 
  `DATABASE_URL=postgresql+asyncpg://username:password@host/dbname`

## Database Migrations

Alembic Commands
```
# Generate new migration
alembic revision --autogenerate -m "Add marks table"
# Apply migrations
alembic upgrade head
```

## Deployment
- Backend containerized with Docker
- Production: `gunicorn -k uvicorn.workers.UvicornWorker`
- .env used for environment-specific configs
- Future: CI/CD pipeline integration recommended

## Security Considerations
- Password hashing with bcrypt
- Expiring JWT tokens & refresh mechanism
- RBAC for API access
- Input validation with Pydantic
- HTTPS required in production
- Logging of failed login attempts

## Performance & Optimizations
- Async endpoints for high throughput
- PostgreSQL connection pooling
- Query optimization using **selectinload** for relations
- Caching planned with Redis for future improvements

## Future Improvements
- Real-time WebSocket notifications (attendance, marks updates)
- Admin dashboard for token & session management
- Password reset & email verification flows
- Security analytics & monitoring tools
- Integration with Government EMIS APIs
