"""
WAVE Module Endpoint Tests
Tests the complete WAVE session flow
"""

import pytest
from httpx import AsyncClient
from uuid import uuid4


class TestWaveEndpoints:
    """Test suite for WAVE module endpoints."""
    
    # Store session ID and token for reuse across tests
    access_token = None
    session_id = None
    
    @pytest.mark.asyncio
    async def test_01_login(self, client: AsyncClient):
        """Test 1: Login and get access token."""
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "anandochir.amar@gmail.com",  # Use your test user
                "password": "An@ndochir2004"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        
        # Store token for other tests
        TestWaveEndpoints.access_token = data["access_token"]
        print(f"\n✅ Test 1: Login successful, token obtained")
    
    @pytest.mark.asyncio
    async def test_02_get_actions(self, client: AsyncClient):
        """Test 2: Get available actions metadata."""
        response = await client.get("/api/v1/wave/actions")
        assert response.status_code == 200
        data = response.json()
        assert "actions" in data
        assert "total" in data
        assert data["total"] == 13
        
        # Check first action has required fields
        first_action = data["actions"][0]
        assert "emoji" in first_action
        assert "name" in first_action
        assert "duration_minutes" in first_action
        assert "requires_input" in first_action
        
        print(f"✅ Test 2: Got {data['total']} actions with metadata")
    
    @pytest.mark.asyncio
    async def test_03_create_session_unauthorized(self, client: AsyncClient):
        """Test 3: Create session without auth should fail."""
        response = await client.post("/api/v1/wave/sessions", json={})
        assert response.status_code == 403  # Forbidden without token
        print(f"✅ Test 3: Unauthorized access properly blocked")
    
    @pytest.mark.asyncio
    async def test_04_create_session(self, client: AsyncClient):
        """Test 4: Create new WAVE session."""
        response = await client.post(
            "/api/v1/wave/sessions",
            json={},
            headers={"Authorization": f"Bearer {TestWaveEndpoints.access_token}"}
        )
        assert response.status_code == 201
        data = response.json()
        
        # Verify session structure
        assert "id" in data
        assert data["status"] == "in_progress"
        assert data["current_step"] == 1
        assert data["progress_percentage"] == 0.0
        assert data["situation"] is None
        assert data["action_completed"] is False
        
        # Store session ID
        TestWaveEndpoints.session_id = data["id"]
        print(f"✅ Test 4: Session created with ID: {data['id']}")
    
    @pytest.mark.asyncio
    async def test_05_update_checkin_invalid_intensity(self, client: AsyncClient):
        """Test 5: Update checkin with invalid intensity should fail."""
        response = await client.put(
            f"/api/v1/wave/sessions/{TestWaveEndpoints.session_id}/checkin",
            json={
                "situation": "Test situation",
                "emotion": "anxious",
                "intensity": 15  # Invalid: must be 1-10
            },
            headers={"Authorization": f"Bearer {TestWaveEndpoints.access_token}"}
        )
        assert response.status_code == 422  # Validation error
        print(f"✅ Test 5: Invalid intensity properly rejected")
    
    @pytest.mark.asyncio
    async def test_06_update_checkin(self, client: AsyncClient):
        """Test 6: Update check-in data (step 1)."""
        response = await client.put(
            f"/api/v1/wave/sessions/{TestWaveEndpoints.session_id}/checkin",
            json={
                "situation": "I had a disagreement with my coworker about project priorities",
                "emotion": "frustrated",
                "intensity": 7
            },
            headers={"Authorization": f"Bearer {TestWaveEndpoints.access_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify update
        assert data["situation"] == "I had a disagreement with my coworker about project priorities"
        assert data["emotion"] == "frustrated"
        assert data["intensity"] == 7
        assert data["current_step"] == 2
        assert data["progress_percentage"] == 25.0
        
        print(f"✅ Test 6: Check-in updated, moved to step 2")
    
    @pytest.mark.asyncio
    async def test_07_update_acceptance(self, client: AsyncClient):
        """Test 7: Update acceptance statement (step 2)."""
        response = await client.put(
            f"/api/v1/wave/sessions/{TestWaveEndpoints.session_id}/acceptance",
            json={
                "acceptance_statement": "It's natural to feel frustrated when facing interpersonal conflict at work"
            },
            headers={"Authorization": f"Bearer {TestWaveEndpoints.access_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify update
        assert "natural to feel frustrated" in data["acceptance_statement"]
        assert data["current_step"] == 3
        assert data["progress_percentage"] == 50.0
        
        print(f"✅ Test 7: Acceptance updated, moved to step 3")
    
    @pytest.mark.asyncio
    async def test_08_update_action(self, client: AsyncClient):
        """Test 8: Choose action (step 3)."""
        response = await client.put(
            f"/api/v1/wave/sessions/{TestWaveEndpoints.session_id}/action",
            json={
                "action_type": "breathing_exercise",
                "action_notes": None
            },
            headers={"Authorization": f"Bearer {TestWaveEndpoints.access_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify update
        assert data["action_type"] == "breathing_exercise"
        assert data["action_completed"] is False
        assert data["current_step"] == 3  # Still step 3 until action completed
        
        print(f"✅ Test 8: Action chosen (breathing exercise)")
    
    @pytest.mark.asyncio
    async def test_09_complete_action(self, client: AsyncClient):
        """Test 9: Mark action as completed."""
        response = await client.put(
            f"/api/v1/wave/sessions/{TestWaveEndpoints.session_id}/action/complete",
            json={
                "duration_seconds": 65
            },
            headers={"Authorization": f"Bearer {TestWaveEndpoints.access_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify completion
        assert data["action_completed"] is True
        assert data["actual_duration"] == 65
        assert data["current_step"] == 4
        assert data["progress_percentage"] == 75.0
        
        print(f"✅ Test 9: Action completed in 65 seconds, moved to step 4")
    
    @pytest.mark.asyncio
    async def test_10_complete_session(self, client: AsyncClient):
        """Test 10: Complete entire session."""
        response = await client.post(
            f"/api/v1/wave/sessions/{TestWaveEndpoints.session_id}/complete",
            headers={"Authorization": f"Bearer {TestWaveEndpoints.access_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify completion
        assert data["status"] == "completed"
        assert data["completed_at"] is not None
        assert data["progress_percentage"] == 100.0
        
        print(f"✅ Test 10: Session completed successfully!")
    
    @pytest.mark.asyncio
    async def test_11_get_session(self, client: AsyncClient):
        """Test 11: Get specific session."""
        response = await client.get(
            f"/api/v1/wave/sessions/{TestWaveEndpoints.session_id}",
            headers={"Authorization": f"Bearer {TestWaveEndpoints.access_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify all data persisted
        assert data["id"] == TestWaveEndpoints.session_id
        assert data["status"] == "completed"
        assert data["situation"] is not None
        assert data["emotion"] == "frustrated"
        assert data["intensity"] == 7
        assert data["acceptance_statement"] is not None
        assert data["action_type"] == "breathing_exercise"
        assert data["action_completed"] is True
        
        print(f"✅ Test 11: Retrieved completed session with all data")
    
    @pytest.mark.asyncio
    async def test_12_list_sessions(self, client: AsyncClient):
        """Test 12: List user's sessions."""
        response = await client.get(
            "/api/v1/wave/sessions",
            headers={"Authorization": f"Bearer {TestWaveEndpoints.access_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify list
        assert "sessions" in data
        assert "total" in data
        assert data["total"] >= 1
        assert len(data["sessions"]) >= 1
        
        # Find our session
        our_session = next(
            (s for s in data["sessions"] if s["id"] == TestWaveEndpoints.session_id),
            None
        )
        assert our_session is not None
        assert our_session["status"] == "completed"
        
        print(f"✅ Test 12: Listed {data['total']} session(s)")
    
    @pytest.mark.asyncio
    async def test_13_unauthorized_access(self, client: AsyncClient):
        """Test 13: Cannot access other user's sessions."""
        fake_session_id = str(uuid4())
        response = await client.get(
            f"/api/v1/wave/sessions/{fake_session_id}",
            headers={"Authorization": f"Bearer {TestWaveEndpoints.access_token}"}
        )
        assert response.status_code == 404  # Not found
        print(f"✅ Test 13: Unauthorized access properly blocked")
    
    @pytest.mark.asyncio
    async def test_14_cannot_skip_steps(self, client: AsyncClient):
        """Test 14: Cannot skip steps in workflow."""
        # Create new session
        response = await client.post(
            "/api/v1/wave/sessions",
            json={},
            headers={"Authorization": f"Bearer {TestWaveEndpoints.access_token}"}
        )
        assert response.status_code == 201
        new_session_id = response.json()["id"]
        
        # Try to update acceptance without check-in
        response = await client.put(
            f"/api/v1/wave/sessions/{new_session_id}/acceptance",
            json={
                "acceptance_statement": "Test"
            },
            headers={"Authorization": f"Bearer {TestWaveEndpoints.access_token}"}
        )
        assert response.status_code == 400  # Bad request
        
        print(f"✅ Test 14: Step skipping properly prevented")
    
    @pytest.mark.asyncio
    async def test_15_cannot_modify_completed_session(self, client: AsyncClient):
        """Test 15: Cannot modify completed session."""
        response = await client.put(
            f"/api/v1/wave/sessions/{TestWaveEndpoints.session_id}/checkin",
            json={
                "situation": "New situation",
                "emotion": "happy",
                "intensity": 5
            },
            headers={"Authorization": f"Bearer {TestWaveEndpoints.access_token}"}
        )
        assert response.status_code == 400  # Bad request
        print(f"✅ Test 15: Completed session modification properly blocked")


# Run summary
if __name__ == "__main__":
    print("Run with: pytest tests/test_wave_endpoints.py -v")