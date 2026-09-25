import datetime
import random
from database import engine, SessionLocal
import models

def seed_database():
    print("Creating tables if not present...")
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        existing_count = db.query(models.Anomaly).count()
        if existing_count >= 20:
            print(f"Database already contains {existing_count} anomalies. Seeding skipped.")
            return

        print("Clearing prior seed data for fresh initialization...")
        db.query(models.CapaAction).delete()
        db.query(models.Anomaly).delete()
        db.commit()

        demo_anomalies = [
            # Line A - Precision Machining
            {
                "title": "Spindle bearing harmonic vibration spike",
                "machine_id": "CNC-MILL-01",
                "production_line": "Line A - Precision Machining",
                "severity": "CRITICAL",
                "status": "CAPA_PENDING",
                "description": "High acoustic resonance detected at 3800 RPM. Spindle radial runout measured at 0.045mm exceeding 0.005mm spec.",
                "metric_name": "Vibration RMS (mm/s)",
                "metric_value": 8.7,
                "threshold_value": 4.5,
                "operator_name": "Rajesh Kumar",
                "hours_ago": 1.2
            },
            {
                "title": "Coolant delivery line pressure depletion",
                "machine_id": "CNC-LATHE-02",
                "production_line": "Line A - Precision Machining",
                "severity": "HIGH",
                "status": "INVESTIGATING",
                "description": "Internal through-spindle coolant flow dropped by 45%, leading to excessive tool nose wear on carbide inserts.",
                "metric_name": "Coolant Pressure (bar)",
                "metric_value": 11.2,
                "threshold_value": 25.0,
                "operator_name": "Sunil Verma",
                "hours_ago": 2.5
            },
            {
                "title": "Axis backlash deviation in X-ball screw",
                "machine_id": "CNC-MILL-03",
                "production_line": "Line A - Precision Machining",
                "severity": "MEDIUM",
                "status": "OPEN",
                "description": "Linear scale feedback mismatch against rotary encoder during rapid traverse movements.",
                "metric_name": "Backlash (microns)",
                "metric_value": 28.0,
                "threshold_value": 10.0,
                "operator_name": "Kavita Rao",
                "hours_ago": 5.0
            },
            {
                "title": "Cutting tool excessive flank temperature",
                "machine_id": "CNC-MILL-04",
                "production_line": "Line A - Precision Machining",
                "severity": "HIGH",
                "status": "RESOLVED",
                "description": "Infrared optical sensor recorded 420°C on end-mill periphery during titanium roughing pass.",
                "metric_name": "Tool Temp (°C)",
                "metric_value": 425.0,
                "threshold_value": 350.0,
                "operator_name": "Amit Shah",
                "hours_ago": 8.0
            },

            # Line B - Hydraulic Press & Stamping
            {
                "title": "Main ram hydraulic manifold pressure collapse",
                "machine_id": "PRESS-HYD-01",
                "production_line": "Line B - Hydraulic Press & Stamping",
                "severity": "CRITICAL",
                "status": "OPEN",
                "description": "Press ton capacity decayed from 400 tons to 240 tons midway through deep-draw cycle.",
                "metric_name": "Cylinder Pressure (bar)",
                "metric_value": 135.0,
                "threshold_value": 220.0,
                "operator_name": "Manoj Tiwari",
                "hours_ago": 0.8
            },
            {
                "title": "Die bolster thermal expansion misalignment",
                "machine_id": "STAMP-PRESS-02",
                "production_line": "Line B - Hydraulic Press & Stamping",
                "severity": "MEDIUM",
                "status": "CAPA_PENDING",
                "description": "Uneven thermal gradient across upper bed caused burr formation on stamped sheet steel edges.",
                "metric_name": "Bed Delta T (°C)",
                "metric_value": 18.5,
                "threshold_value": 8.0,
                "operator_name": "Deepak Joshi",
                "hours_ago": 3.8
            },
            {
                "title": "Hydraulic oil fluid contamination & particulate spike",
                "machine_id": "PRESS-HYD-03",
                "production_line": "Line B - Hydraulic Press & Stamping",
                "severity": "HIGH",
                "status": "OPEN",
                "description": "In-line laser particle counter signaled ISO cleanliness drop to 22/19/16, threatening proportional servo valves.",
                "metric_name": "Particle Count (>4um)",
                "metric_value": 1850.0,
                "threshold_value": 600.0,
                "operator_name": "Rohan Mehra",
                "hours_ago": 6.1
            },
            {
                "title": "Counterbalance nitrogen accumulator decay",
                "machine_id": "STAMP-PRESS-04",
                "production_line": "Line B - Hydraulic Press & Stamping",
                "severity": "LOW",
                "status": "RESOLVED",
                "description": "Slow pre-charge pressure decay observed over weekly logging window. Nitrogen refilled to 85 bar.",
                "metric_name": "N2 Pressure (bar)",
                "metric_value": 72.0,
                "threshold_value": 80.0,
                "operator_name": "Alok Mishra",
                "hours_ago": 14.0
            },

            # Line C - Robotic Welding
            {
                "title": "Electrode tip thermal breakdown & spatter excursion",
                "machine_id": "WELD-ROBOT-01",
                "production_line": "Line C - Robotic Welding",
                "severity": "CRITICAL",
                "status": "OPEN",
                "description": "Severe resistance spot welding blowout resulting in incomplete nugget formation on floor-pan seams.",
                "metric_name": "Tip Temp (°C)",
                "metric_value": 890.0,
                "threshold_value": 750.0,
                "operator_name": "Anita Roy",
                "hours_ago": 1.5
            },
            {
                "title": "Shielding argon gas flow rate restriction",
                "machine_id": "WELD-ROBOT-02",
                "production_line": "Line C - Robotic Welding",
                "severity": "HIGH",
                "status": "CAPA_PENDING",
                "description": "Flow meter recorded 6.5 L/min during MIG welding, creating surface porosity in structural weld bead.",
                "metric_name": "Argon Flow (L/min)",
                "metric_value": 6.5,
                "threshold_value": 14.0,
                "operator_name": "Karthik Nair",
                "hours_ago": 4.2
            },
            {
                "title": "Joint 4 servo motor current torque deviation",
                "machine_id": "WELD-ROBOT-03",
                "production_line": "Line C - Robotic Welding",
                "severity": "MEDIUM",
                "status": "INVESTIGATING",
                "description": "Repeated torque saturation alerts on wrist axis during high-speed repositioning trajectory.",
                "metric_name": "Peak Current (A)",
                "metric_value": 24.8,
                "threshold_value": 18.0,
                "operator_name": "Pooja Reddy",
                "hours_ago": 7.4
            },
            {
                "title": "Wire feeder drive roll slippage",
                "machine_id": "WELD-ROBOT-04",
                "production_line": "Line C - Robotic Welding",
                "severity": "LOW",
                "status": "RESOLVED",
                "description": "Inconsistent filler wire delivery caused intermittent arc extinguish. Rollers cleaned and tension re-zeroed.",
                "metric_name": "Feed Rate (m/min)",
                "metric_value": 7.2,
                "threshold_value": 9.5,
                "operator_name": "Harish Patel",
                "hours_ago": 18.0
            },

            # Line D - Thermal Treatment & Coating
            {
                "title": "Quench tank agitation impeller motor failure",
                "machine_id": "FURNACE-TH-01",
                "production_line": "Line D - Thermal Treatment & Coating",
                "severity": "CRITICAL",
                "status": "OPEN",
                "description": "Agitation loss created localized steam pockets, leading to soft-spot anomalies in case-hardened pinions.",
                "metric_name": "Oil Velocity (m/s)",
                "metric_value": 0.2,
                "threshold_value": 1.4,
                "operator_name": "Vikas Malhotra",
                "hours_ago": 2.0
            },
            {
                "title": "Atmosphere furnace oxygen lambda sensor offset",
                "machine_id": "FURNACE-TH-02",
                "production_line": "Line D - Thermal Treatment & Coating",
                "severity": "HIGH",
                "status": "CAPA_PENDING",
                "description": "Carbon potential dropped to 0.45% CP from 0.85% CP target. Decarburization risk on bearing races.",
                "metric_name": "Carbon Potential (%)",
                "metric_value": 0.45,
                "threshold_value": 0.80,
                "operator_name": "Siddharth Sen",
                "hours_ago": 5.7
            },
            {
                "title": "Powder coat electrostatic voltage collapse",
                "machine_id": "COAT-BOOTH-03",
                "production_line": "Line D - Thermal Treatment & Coating",
                "severity": "MEDIUM",
                "status": "INVESTIGATING",
                "description": "Corona charging voltage dropped to 28 kV, causing uneven dry film thickness on bracket assembly.",
                "metric_name": "High Voltage (kV)",
                "metric_value": 28.0,
                "threshold_value": 65.0,
                "operator_name": "Farhan Ali",
                "hours_ago": 9.2
            },
            {
                "title": "Curing oven exhaust duct draft pressure loss",
                "machine_id": "FURNACE-TH-04",
                "production_line": "Line D - Thermal Treatment & Coating",
                "severity": "LOW",
                "status": "RESOLVED",
                "description": "Differential pressure across particulate filter indicated clogging. Filter media replaced.",
                "metric_name": "Diff Pressure (Pa)",
                "metric_value": 310.0,
                "threshold_value": 220.0,
                "operator_name": "Gaurav Singh",
                "hours_ago": 22.0
            },

            # Line E - Assembly & Quality Verification
            {
                "title": "Multi-spindle nutrunner rundown angle overrun",
                "machine_id": "AUTO-TORQUE-01",
                "production_line": "Line E - Assembly & Quality Verification",
                "severity": "CRITICAL",
                "status": "OPEN",
                "description": "Fastener #4 exceeded torque-angle window by 35 degrees, indicating cross-threaded hub fastener.",
                "metric_name": "Rundown Angle (deg)",
                "metric_value": 165.0,
                "threshold_value": 130.0,
                "operator_name": "Meera Iyer",
                "hours_ago": 0.5
            },
            {
                "title": "Automated optical inspection telecentric lens distortion",
                "machine_id": "AOI-INSPECT-02",
                "production_line": "Line E - Assembly & Quality Verification",
                "severity": "HIGH",
                "status": "CAPA_PENDING",
                "description": "Camera calibration target calibration error exceeded 0.08mm. False positive defect rate reached 12%.",
                "metric_name": "Pixel Residual (px)",
                "metric_value": 4.2,
                "threshold_value": 1.5,
                "operator_name": "Naveen Chawla",
                "hours_ago": 3.1
            },
            {
                "title": "Pneumatic pick-and-place vacuum gripper leakage",
                "machine_id": "ROBOT-ASSY-03",
                "production_line": "Line E - Assembly & Quality Verification",
                "severity": "MEDIUM",
                "status": "RESOLVED",
                "description": "Suction cup lip wear caused part drop during transfer onto outgoing conveyor belt.",
                "metric_name": "Vacuum Level (-kPa)",
                "metric_value": 42.0,
                "threshold_value": 75.0,
                "operator_name": "Suresh Raina",
                "hours_ago": 11.5
            },
            {
                "title": "End-of-line acoustic resonance testing outlier",
                "machine_id": "EOL-TEST-04",
                "production_line": "Line E - Assembly & Quality Verification",
                "severity": "LOW",
                "status": "INVESTIGATING",
                "description": "Gearbox sub-assembly exhibited acoustic harmonic peak at 2.4 kHz during 1500 RPM spin bench verification.",
                "metric_name": "Sound SPL (dBA)",
                "metric_value": 82.5,
                "threshold_value": 76.0,
                "operator_name": "Tarun Kapoor",
                "hours_ago": 15.0
            }
        ]

        now = datetime.datetime.utcnow()
        inserted_anomalies = []

        for row in demo_anomalies:
            detected_time = now - datetime.timedelta(hours=row["hours_ago"])
            anom = models.Anomaly(
                title=row["title"],
                machine_id=row["machine_id"],
                production_line=row["production_line"],
                severity=row["severity"],
                status=row["status"],
                description=row["description"],
                metric_name=row["metric_name"],
                metric_value=row["metric_value"],
                threshold_value=row["threshold_value"],
                operator_name=row["operator_name"],
                detected_at=detected_time,
                resolved_at=now - datetime.timedelta(hours=row["hours_ago"]/2) if row["status"] == "RESOLVED" else None
            )
            db.add(anom)
            inserted_anomalies.append(anom)

        db.commit()

        # Add initial CAPA records for items with CAPA_PENDING status
        for anom in inserted_anomalies:
            db.refresh(anom)
            if anom.status in ["CAPA_PENDING", "INVESTIGATING"] and anom.id in [1, 2, 6, 10]:
                capa = models.CapaAction(
                    anomaly_id=anom.id,
                    root_cause=f"Primary mechanical degradation in {anom.machine_id}: Excessive fatigue wear on key moving assemblies causing {anom.metric_name} deviation.",
                    corrective_action=f"Lockout/Tagout {anom.machine_id}. Replace worn subcomponents, flush lubrication fluid, and recalibrate precision sensors to OEM factory tolerances.",
                    preventive_action=f"Implement high-resolution edge vibration and temperature monitoring with automated early-warning telemetry trips before threshold violation.",
                    ai_confidence=random.uniform(91.5, 96.5),
                    review_status="PENDING_REVIEW" if anom.id != 1 else "APPROVED",
                    reviewer_notes="Reviewed by Senior Quality Lead. Action item cleared for upcoming scheduled downtime window." if anom.id == 1 else None,
                    generated_at=anom.detected_at + datetime.timedelta(minutes=15)
                )
                db.add(capa)

        db.commit()
        print(f"Successfully seeded {len(demo_anomalies)} manufacturing anomalies and CAPA records into database!")

    except Exception as e:
        db.rollback()
        print(f"Seeding error: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
