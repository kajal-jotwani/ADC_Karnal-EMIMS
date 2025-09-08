**Database Setup**
- This app uses SQLAlchemy’s async engine and requires an async PostgreSQL driver (`asyncpg`).
- Your `.env` should have: 
 
  `DATABASE_URL=postgresql+asyncpg://username:password@host/dbname`
