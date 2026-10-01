import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./anomiq.db")

# Automatically normalize postgres:// scheme if provided by Supabase/Heroku
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

def init_engine():
    global DATABASE_URL
    target_url = DATABASE_URL
    if "sqlite" not in target_url:
        try:
            connect_args = {}
            # If using Supabase / Remote Postgres without sslmode in URL query, set sslmode to require
            if "localhost" not in target_url and "127.0.0.1" not in target_url and "sslmode=" not in target_url:
                connect_args["sslmode"] = "require"

            # Enable prepared statement disable or pooler optimization if pgbouncer is enabled
            test_engine = create_engine(
                target_url,
                pool_size=10,
                max_overflow=10,
                pool_recycle=300,
                pool_pre_ping=True,
                connect_args=connect_args
            )
            with test_engine.connect() as conn:
                pass
            print(f"Connected to PostgreSQL database: {target_url.split('@')[-1] if '@' in target_url else 'PostgreSQL'}")
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
