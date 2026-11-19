"""
Comprehensive API integration tests using FastAPI TestClient and an in-memory SQLite database.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.seed_data import seed_database

# In-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_database(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app)


def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"


def test_get_machines(client):
    response = client.get("/api/machines")
    assert response.status_code == 200
    machines = response.json()
    assert len(machines) >= 5
    machine_ids = [m["id"] for m in machines]
    assert "MAC-001" in machine_ids
    assert "MAC-005" in machine_ids


def test_get_machine_detail(client):
    response = client.get("/api/machines/MAC-001")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "MAC-001"
    assert "CNC Milling" in data["machine_type"]
    assert data["latest_reading"] is not None


def test_create_and_update_machine(client):
    new_machine = {
        "id": "MAC-TEST-99",
        "machine_name": "Robotic Welding Cell 99",
        "machine_type": "Robotic Welder",
        "location": "Fabrication Bay C",
        "status": "HEALTHY",
    }
    # Create
    create_res = client.post("/api/machines", json=new_machine)
    assert create_res.status_code == 201
    assert create_res.json()["id"] == "MAC-TEST-99"

    # Update
    update_res = client.put("/api/machines/MAC-TEST-99", json={"status": "WARNING"})
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "WARNING"

    # Delete
    del_res = client.delete("/api/machines/MAC-TEST-99")
    assert del_res.status_code == 204


def test_api_diagnose_healthy(client):
    payload = {
        "machine_id": "MAC-001",
        "machine_name": "CNC Milling Center 01",
        "temperature": 45.0,
        "vibration": "NORMAL",
        "pressure": 50.0,
        "motor_speed": 1500.0,
        "power_consumption": 8.5,
    }
    response = client.post("/api/diagnose", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["overall_status"] == "HEALTHY"
    assert data["confidence_score"] >= 95.0
    assert len(data["matched_rules"]) == 0
    assert data["id"] is not None


def test_api_diagnose_critical_failure(client):
    payload = {
        "machine_id": "MAC-005",
        "machine_name": "High-Pressure Gas Turbine 05",
        "temperature": 100.0,
        "vibration": "HIGH",
        "pressure": 10.0,
        "motor_speed": 400.0,
        "power_consumption": 18.5,
    }
    response = client.post("/api/diagnose", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["overall_status"] == "CRITICAL"
    assert data["confidence_score"] >= 90.0
    assert len(data["matched_rules"]) >= 4
    assert len(data["recommendations"]) >= 4


def test_get_diagnoses_list_and_detail(client):
    list_res = client.get("/api/diagnoses")
    assert list_res.status_code == 200
    items = list_res.json()
    assert len(items) > 0

    first_id = items[0]["id"]
    detail_res = client.get(f"/api/diagnoses/{first_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["id"] == first_id
    assert "input_readings" in detail


def test_get_rules(client):
    response = client.get("/api/rules")
    assert response.status_code == 200
    rules = response.json()
    assert len(rules) >= 7
    rule_ids = [r["id"] for r in rules]
    assert "RULE_001" in rule_ids
    assert "RULE_007" in rule_ids


def test_dashboard_stats(client):
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    stats = response.json()
    assert stats["total_machines"] >= 5
    assert stats["total_diagnoses"] >= 5
    assert "recent_failures" in stats


def test_reports_and_csv_export(client):
    # Analytics
    reports_res = client.get("/api/reports")
    assert reports_res.status_code == 200
    rep_data = reports_res.json()
    assert rep_data["total_diagnoses"] >= 5
    assert len(rep_data["severity_distribution"]) == 3

    # CSV Download
    csv_res = client.get("/api/reports/export-csv")
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "Diagnosis ID,Timestamp" in csv_res.text
