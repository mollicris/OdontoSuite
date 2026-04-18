#!/bin/bash

# Get JWT token first (using test credentials)
echo "🔑 Authenticating..."
LOGIN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dentist@clinic.com",
    "password": "secret"
  }')

TOKEN=$(echo $LOGIN | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to authenticate. Response:"
  echo $LOGIN
  exit 1
fi

echo "✅ Got token: ${TOKEN:0:20}..."

# Create appointment
echo -e "\n📝 Creating appointment..."
curl -X POST http://localhost:3000/appointments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clinicId": "53441192-0b41-44dd-8743-c3a1fde6a57b",
    "patientId": "539ccf44-0be3-494e-8aa2-a27793fb7ad7",
    "dentistId": "fa07faa1-65be-4bad-a887-0de07e29b355",
    "serviceId": "73922c9b-0d92-4995-8c11-936204632296",
    "startTime": "2026-04-20T09:00:00Z",
    "endTime": "2026-04-20T09:30:00Z",
    "notes": "Test appointment"
  }' | jq '.'
