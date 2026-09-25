import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./anomiq.db")

# Automatically fix postgres:// scheme if provided by Supabase/Heroku to postgresql+psycopg2://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
elif DATABASE_URL.startswith("postgresql://") and not DATABASE_URL.startswith("postgresql+"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

def init_engine():
    global DATABASE_URL
    target_url = DATABASE_URL
    if "sqlite" not in target_url:
        try:
            test_engine = create_engine(target_url, pool_pre_ping=True, pool_recycle=300)
            with test_engine.connect() as conn:
                pass
            return test_engine
        except Exception as e:
            print(f"Notice: PostgreSQL connection failed ({e}). Falling back to local SQLite (anomiq.db).")
            DATABASE_URL = "sqlite:///./anomiq.db"
            return create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        return create_engine(target_url, connect_args={"check_same_thread": False})

engine = init_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
