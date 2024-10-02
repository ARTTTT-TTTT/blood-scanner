import pytest
from fastapi import status
from httpx import AsyncClient
from datetime import date, timedelta  # Import date and timedelta
from src.main import app  # Adjusted import statement

@pytest.mark.asyncio
async def test_update_user_blood_new_date():
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Create a user and log in to get the current_user context
        user_data = {
            "username": "user@example.com",
            "password": "1234"
        }
        # Replace with your actual user creation and login logic
        response = await client.post("/login", json=user_data)
        assert response.status_code == status.HTTP_200_OK
        current_user = response.json()

        # Get the current date and a new date (tomorrow)
        today_date = date.today()
        new_date = today_date + timedelta(days=1)

        # Prepare the blood data with a new date
        blood_data = {
            "blood": [
                {
                    "date": new_date.isoformat(),
                    "green": 1,
                    "normal": 2,
                    "red": 3,
                    "kun": 4
                }
            ]
        }

        # Send the PUT request to update the user's blood data
        response = await client.put("/", json=blood_data, headers={"Authorization": f"Bearer {current_user['token']}"})
        
        # Check the response status and data
        assert response.status_code == status.HTTP_200_OK
        updated_data = response.json()
        
        # Verify that the date has been updated correctly to the new date
        assert updated_data["blood"][0]["date"] == new_date.isoformat()
        assert updated_data["blood"][0]["green"] == 1
        assert updated_data["blood"][0]["normal"] == 2
        assert updated_data["blood"][0]["red"] == 3
        assert updated_data["blood"][0]["kun"] == 4
