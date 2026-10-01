import sys
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_api():
    print("=== STARTING ANOMIQ FULL API INTEGRATION TEST ===")
    
    # 1. Health check
    res = client.get("/health")
    print(f"1. Health Check: {res.status_code} - {res.json()}")
    assert res.status_code == 200

    # 2. Get Facilities
    res = client.get("/api/facilities")
    print(f"2. Facilities: {res.status_code} - count: {len(res.json())}")
    assert res.status_code == 200
    facilities = res.json()
    assert len(facilities) > 0
    facility_id = facilities[0]["id"]
    print(f"   Selected Facility ID: {facility_id}")

    # 3. Get Anomalies
    res = client.get(f"/api/anomalies?facility_id={facility_id}")
    print(f"3. Anomalies list: {res.status_code} - count: {len(res.json())}")
    assert res.status_code == 200
    anomalies = res.json()
    assert len(anomalies) > 0
    anomaly_id = anomalies[0]["id"]
    print(f"   Selected Anomaly ID: {anomaly_id}")

    # 4. Get Active Anomalies
    res = client.get(f"/api/anomalies/active?facility_id={facility_id}")
    print(f"4. Active anomalies: {res.status_code} - count: {len(res.json())}")
    assert res.status_code == 200

    # 5. Create New Anomaly
    new_anomaly_payload = {
        "facility_id": facility_id,
        "title": "Automated Test Anomaly: Spindle bearing runout excursion",
        "machine_id": "CNC-TEST-09",
        "production_line": "Line A - Precision Machining",
        "severity": "CRITICAL",
        "description": "Integration test defect verification for real-time alert trigger.",
        "metric_name": "Vibration RMS",
        "metric_value": 9.4,
        "threshold_value": 4.5,
        "operator_name": "Antigravity CI",
        "industry": "AUTOMOTIVE"
    }
    res = client.post("/api/anomalies", json=new_anomaly_payload)
    print(f"5. Create Anomaly: {res.status_code}")
    assert res.status_code == 201
    created_anom = res.json()
    created_id = created_anom["id"]
    print(f"   Created Anomaly ID: {created_id}")

    # 6. Check Duplicate Detection
    res = client.post("/api/anomalies/check-duplicates", json={
        "title": "Spindle bearing runout excursion",
        "facility_id": facility_id,
        "time_window_hours": 24
    })
    print(f"6. Check Duplicate: {res.status_code} - is_duplicate: {res.json().get('is_duplicate_suspected')}")
    assert res.status_code == 200

    # 7. Test Voice Intake
    res = client.post("/api/ai/voice-intake", json={
        "transcript": "Spindle bearing on Line A is smoking and vibrating heavily with RMS over 8"
    })
    print(f"7. Voice Intake: {res.status_code} - Component: {res.json().get('machine_id')} - Severity: {res.json().get('severity')}")
    assert res.status_code == 200

    # 8. Test 5-Whys Step
    res = client.post("/api/ai/5-whys/step", json={
        "anomaly_id": created_id,
        "anomaly_title": "Spindle bearing runout excursion",
        "machine_id": "CNC-TEST-09",
        "production_line": "Line A - Precision Machining",
        "metric_name": "Vibration RMS",
        "metric_value": 9.4,
        "threshold_value": 4.5,
        "step": 1,
        "history": [],
        "technician_input": "Excessive vibration heard at start of shift"
    })
    print(f"8. 5-Whys Step: {res.status_code} - Question: {res.json().get('why_question')}")
    assert res.status_code == 200

    # 9. Test CAPA Generation for Anomaly
    res = client.post(f"/api/ai/capa/generate/{created_id}")
    print(f"9. CAPA Generation: {res.status_code} - Confidence: {res.json().get('ai_confidence')}%")
    assert res.status_code in (200, 201)
    capa_id = res.json()["id"]

    # 10. Test CAPA Review List
    res = client.get("/api/ai/capa-reviews")
    print(f"10. CAPA Reviews: {res.status_code} - count: {len(res.json())}")
    assert res.status_code == 200

    # 11. Test Notifications
    res = client.get(f"/api/notifications?facility_id={facility_id}")
    print(f"11. Notifications: {res.status_code} - count: {len(res.json())}")
    assert res.status_code == 200

    # 12. Test Analytics Dashboard
    res = client.get(f"/api/analytics/dashboard?facility_id={facility_id}")
    print(f"12. Dashboard Analytics: {res.status_code} - total: {res.json().get('total_anomalies')}")
    assert res.status_code == 200

    # 13. Test Analytics Trends
    res = client.get(f"/api/analytics/trends?facility_id={facility_id}")
    print(f"13. Analytics Trends: {res.status_code} - oee_health: {res.json().get('oee_health')}%")
    assert res.status_code == 200

    # 14. Sign-off / Closure Test
    res = client.post(f"/api/ai/capa/{capa_id}/sign-off", json={
        "review_status": "IMPLEMENTED",
        "reviewer_notes": "All checks validated and confirmed during test run."
    })
    print(f"14. Quality Sign-off: {res.status_code} - status: {res.json().get('review_status')}")
    assert res.status_code == 200

    # Clean up test anomaly
    del_res = client.delete(f"/api/anomalies/{created_id}")
    print(f"15. Cleanup Test Anomaly: {del_res.status_code}")
    assert del_res.status_code == 204

    print("=== ALL 15 INTEGRATION TESTS PASSED WITH 100% SUCCESS! ===")

if __name__ == "__main__":
    test_api()
