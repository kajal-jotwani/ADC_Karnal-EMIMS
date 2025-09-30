This project is Built as a part of Code for Gov tech - Dedicated Mentoring Program 2025

**Project Ticket** - https://github.com/Code4GovTech/C4GT/issues/471

**Orginization** - ADC Karnal

**Project Description**:
This project aims to enhance the management and monitoring of schools by providing insights into academic performance at different levels. District administrators will be able to view overall school performance, while schools can track the performance of their classes, and teachers can monitor individual student progress. The system will track daily attendance, student marks, and subject-level performance, helping educators make informed decisions to improve learning outcomes. The project is currently under development and will provide a structured platform for managing classes, teachers, students, and their academic data.

## Tech Stack 
This project is built with a modern full-stack architecture combining FastAPI (Python) for the backend and React (Vite) for the frontend.

### Frontend 
- **React 18** – UI library for building dynamic user interfaces
- **Vite** – Next-gen frontend tooling for fast development & builds
- **TailwindCSS** – Utility-first CSS framework for styling
- **shadcn/ui + Radix UI** – Accessible, composable UI components
- **React Router v6** – Routing & navigation
- **React Hook Form + Zod** – Form validation & schema enforcement
- **TanStack Table** – Data table handling & complex data rendering
- **Recharts** – Data visualization and charts
- **PapaParse + xlsx + FileSaver** – CSV/XLSX import/export handling
- **Axios** – API requests

### Backend
- **FastAPI** – High-performance Python web framework
- **SQLModel** – ORM + Pydantic + SQLAlchemy integration
- **PostgreSQL** – Relational database (SQLite supported for local dev)
- **Alembic** – Database migrations
- **Pydantic v2** – Data validation & settings management
- **Uvicorn + Gunicorn** – ASGI server for production & development
- **Auth stack**
    - JWT (PyJWT + python-jose)
    - Passlib + bcrypt for password hashing
    - OAuth2 for secure authentication flows

### Tooling and Developer Experience 
- **TypeScript** – Type safety for frontend
- **ESLint + TypeScript-ESLint** – Linting & code quality
- **Prettier (optional)** – Code formatting
- **Rich** – Better logging in backend
- **dotenv / pydantic-settings** – Config & environment variable management

## Key Features

The system is designed with role-based access control (RBAC). Each role has specific features tailored to their responsibilities.

### 🏛️ District Admin

- View overall district performance across all schools.
- Monitor and compare school-wise performance trends.
- Access high-level analytics to support decision-making.

### 🏫 School Admin / Principal

- View the overall performance of their school.
- Create and manage classes.
- Assign teachers to classes.
- Track class-level performance.
- Manage school-wide timetable and schedules.

### 👩‍🏫 Teacher

- Add and manage students in assigned classes.
- Record daily attendance for their classes.
- Upload and update student marks across subjects.
- Track student-level performance and progress.
- Upload and manage class timetables & schedules.

## Quick Start 

#### 🔧 Prerequisites
- Node.js >= 18
- Python >= 3.10
- PostgreSQL installed (SQLite works for local dev)

## Backend Setup 
Follow these steps to set up the backend locally.

1. **Navigate to backend directory**

```
cd backend
``` 

2. **Create & activate a virtual environment**

This isolates project dependencies from your system Python.
```
python -m venv venv

# Linux / macOS
source venv/bin/activate

# Windows
venv\Scripts\activate
```

3. **Install dependencies**

```
pip install -r requirements.txt
```

4. **Configure environment variables**

Copy the example .env file and update it with your local settings.
```
cp .env.example .env
```

5. **Run database migrations**

Apply the database schema and ensure tables are created.
```
alembic upgrade head
```

6. **Start the Development Server**

Run the FastAPI backend locally. You have two options:

Option 1: Using Uvicorn
```
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Option 2: Using FastAPI CLI
```
fastapi run src
```
💡 Tip: Both commands start the server with hot reload. Use FastAPI CLI if installed for convenience.


## 🎨 Frontend Setup
Follow these steps to set up the frontend locally. By default, the React frontend runs on ```localhost:5173``` (Vite dev server) and communicates with the FastAPI backend on ```localhost:8000```.

1. **Install dependencies**
```
npm install
```

2. **Start the development server**
```
npm run dev
```

## High level repository structure
This repository contains both frontend and backend code for the ADC Karnal Education Management System. Below is a high-level overview of the folder and file structure:

