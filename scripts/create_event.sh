#!/bin/bash
curl -i -X POST http://localhost:3000/events \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Brother\'s birthday",
    "description": "buy a present",
    "year": 1990,
    "month": 7,
    "day": 4,
    "type": "birthday",
    "recurrence": "yearly",
    "isActive": true
  }'
