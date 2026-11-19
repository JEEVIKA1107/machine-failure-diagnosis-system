import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Default to local SQLite database, or use DATABASE_URL from environment (e.g. on Render persistent disk)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./machine_diagnosis.db")

# For SQLite, ensure parent directory exists and check_same_thread=False
connect_args = {}
if DATABASE_URL.startswith("sqlite:///"):
    connect_args["check_same_thread"] = False
    db_file_path = DATABASE_URL.replace("sqlite:///", "")
    db_dir = os.path.dirname(db_file_path)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
