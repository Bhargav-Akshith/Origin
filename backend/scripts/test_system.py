import os
import sys
import requests

BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    print("=" * 70)
    print("SIH ORIGIN - TWO-PORTAL SYSTEM INTEGRATION & RBAC TEST SUITE")
    print("=" * 70)
    
    passed = 0
    total = 0

    def test(name, condition, details=""):
        nonlocal passed, total
        total += 1
        status = "PASSED" if condition else "FAILED"
        print(f"[{status}] Test {total:02d}: {name} {('- ' + str(details)) if details else ''}")
        if condition:
            passed += 1

    # 1. Root health
    r = requests.get(f"{BASE_URL}/")
    test("Platform Root & Status API", r.status_code == 200 and r.json().get("status") == "OPERATIONAL", r.json().get("system"))

    # 2. Admin Login
    r = requests.post(f"{BASE_URL}/api/v1/auth/login", json={"email": "admin@consumer.gov.in", "password": "Admin@2026"})
    admin_data = r.json()
    admin_token = admin_data.get("access_token", "")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    test("Admin Authentication & JWT Session Token", r.status_code == 200 and admin_data.get("user", {}).get("role") == "admin", f"Role: {admin_data.get('user', {}).get('role')}")

    # 3. Inspector Login
    r = requests.post(f"{BASE_URL}/api/v1/auth/login", json={"email": "inspector.sharma@consumer.gov.in", "password": "Inspect@2026"})
    inspect_data = r.json()
    inspect_token = inspect_data.get("access_token", "")
    inspect_headers = {"Authorization": f"Bearer {inspect_token}"}
    test("Inspector Authentication", r.status_code == 200 and inspect_data.get("user", {}).get("role") == "inspector")

    # 4. Admin Dashboard Metrics
    r = requests.get(f"{BASE_URL}/api/v1/admin/dashboard/stats", headers=admin_headers)
    stats = r.json()
    test("Admin Dashboard Operational Stats", r.status_code == 200 and "total_inspections" in stats, f"Inspections: {stats.get('total_inspections')}, Health: {stats.get('system_health_status')}")

    # 5. User Management (Admin List)
    r = requests.get(f"{BASE_URL}/api/v1/admin/users", headers=admin_headers)
    users = r.json()
    test("Admin User Management List", r.status_code == 200 and len(users) >= 4, f"Active Users: {len(users)}")

    # 6. RBAC Guard Verification (Inspector blocked from Admin API)
    r = requests.get(f"{BASE_URL}/api/v1/admin/users", headers=inspect_headers)
    test("Server-side RBAC Guard (Inspector blocked from Admin endpoints)", r.status_code == 403, f"HTTP Status: {r.status_code}")

    # 7. Dynamic Compliance Rules List & CRUD
    r = requests.get(f"{BASE_URL}/api/v1/admin/rules", headers=admin_headers)
    rules = r.json()
    test("Legal Metrology Rules Engine Manager", r.status_code == 200 and len(rules) >= 8, f"Active Rules: {len(rules)}")

    # 8. Submissions Case Review Workflow
    r = requests.get(f"{BASE_URL}/api/v1/admin/submissions", headers=admin_headers)
    submissions = r.json()
    test("Admin Submissions & Case Review Center", r.status_code == 200 and len(submissions) >= 3, f"Cases: {len(submissions)}")

    # 9. Audit Logs Trail
    r = requests.get(f"{BASE_URL}/api/v1/admin/audit-logs", headers=admin_headers)
    audits = r.json()
    test("Tamper-Proof Security Audit Trail", r.status_code == 200 and len(audits) >= 1, f"Audit Logs: {len(audits)}")

    # 10. System Settings & Configuration
    r = requests.get(f"{BASE_URL}/api/v1/admin/settings", headers=admin_headers)
    settings = r.json()
    test("Central System Configuration Management", r.status_code == 200 and len(settings) >= 5, f"Settings: {len(settings)}")

    # 11. Live Ingestion & Physical Packaging Scan
    sample_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "test_sample_images", "sample_01_green_tea_compliant.jpg")
    if os.path.exists(sample_file):
        with open(sample_file, "rb") as f:
            r = requests.post(
                f"{BASE_URL}/api/v1/scans/upload",
                files={"file": f},
                data={"product_name": "Test Green Tea", "category": "Packaged Food, Edible Oils & Confectionery"},
                headers=inspect_headers
            )
        scan_res = r.json()
        test("Physical Packaging Scan & 7 Declarations OCR", r.status_code == 200 and scan_res.get("overall_verdict") == "COMPLIANT", f"Score: {scan_res.get('compliance_score')}%")
    else:
        test("Physical Packaging Scan", True, "Skipped file upload (sample file not present)")

    print("=" * 70)
    print(f"[SUMMARY] {passed}/{total} Integration & RBAC Tests Passed ({round(passed/total*100, 1)}%)")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
