import requests

def run_tests():
    base_url = "http://127.0.0.1:8000/api/v1"
    
    print("--------------------------------------------------")
    print("Starting End-to-End Backend Health Checks...")
    print("--------------------------------------------------")
    
    # 1. Login
    login_payload = {
        "email": "student@thinkplus.com",
        "password": "Password123!"
    }
    print("[1/5] Testing User Login (/auth/login)...")
    res = requests.post(f"{base_url}/auth/login", json=login_payload)
    if res.status_code != 200:
        print(f"[FAIL] Login failed with status {res.status_code}: {res.text}")
        return
    login_data = res.json()
    if not login_data.get("success"):
        print(f"[FAIL] Login returned success=False: {login_data}")
        return
    token = login_data["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[OK] Login successful! Token retrieved.")
    
    # 1.1 Test student/me
    print("[1.1] Testing Student Profile (/students/me)...")
    res = requests.get(f"{base_url}/students/me", headers=headers)
    if res.status_code != 200:
        print(f"[FAIL] Fetching student profile failed: {res.text}")
        return
    student_data = res.json().get("data", {})
    student_id = student_data.get("id")
    if not student_id:
        print(f"[FAIL] No student ID returned: {student_data}")
        return
    print(f"[OK] Student profile fetched successfully! Student ID: {student_id}")

    # 1.2 Test learning/sessions
    print("[1.2] Testing Student Sessions (/learning/sessions)...")
    res = requests.get(f"{base_url}/learning/sessions", headers=headers)
    if res.status_code != 200:
        print(f"[FAIL] Fetching student sessions failed: {res.text}")
        return
    sessions_list = res.json().get("data", [])
    print(f"[OK] Student sessions fetched successfully! Found {len(sessions_list)} sessions.")

    # 2. Get Topics
    print("[2/5] Testing Fetch Topics (/topics)...")
    res = requests.get(f"{base_url}/topics", headers=headers)
    if res.status_code != 200:
        print(f"[FAIL] Fetching topics failed: {res.text}")
        return
    topics_data = res.json()
    topics = topics_data.get("data", [])
    if not topics:
        print("[FAIL] No topics found in the database!")
        return
    topic_id = topics[0]["id"]
    print(f"[OK] Topics fetched successfully! Found topic: '{topics[0]['name']}' (ID: {topic_id})")
    
    # 3. Start Assessment Session
    print("[3/5] Testing Start Learning Session (/learning/sessions/start)...")
    start_payload = {"topic_id": topic_id}
    res = requests.post(f"{base_url}/learning/sessions/start", json=start_payload, headers=headers)
    if res.status_code != 200:
        print(f"[FAIL] Spawning session failed: {res.text}")
        return
    session_data = res.json()["data"]
    session_id = session_data["session"]["id"]
    first_question = session_data["first_question"]
    if not first_question:
        print("[FAIL] Spawning session returned no first question!")
        return
    question_id = first_question["id"]
    option_id = first_question["options"][0]["id"]
    print(f"[OK] Session started successfully! Session ID: {session_id}")
    print(f"   First Question: '{first_question['question_text']}'")
    
    # 4. Submit Answer
    print("[4/5] Testing Submit Answer (/learning/sessions/{session_id}/submit)...")
    submit_payload = {
        "question_id": question_id,
        "selected_option_id": option_id,
        "response_time_seconds": 15.0
    }
    res = requests.post(f"{base_url}/learning/sessions/{session_id}/submit", json=submit_payload, headers=headers)
    if res.status_code != 200:
        print(f"[FAIL] Submitting answer failed: {res.text}")
        return
    submit_res = res.json()["data"]
    print(f"[OK] Answer registered successfully! Is correct: {submit_res['is_correct']}")
    
    # 5. End Session
    print("[5/5] Testing End Learning Session (/learning/sessions/{session_id}/end)...")
    res = requests.post(f"{base_url}/learning/sessions/{session_id}/end", headers=headers)
    if res.status_code != 200:
        print(f"[FAIL] Ending session failed: {res.text}")
        return
    print("[OK] Session ended successfully!")
    
    print("--------------------------------------------------")
    print("SUCCESS: All backend REST API integration tests passed successfully!")
    print("--------------------------------------------------")

if __name__ == "__main__":
    run_tests()
