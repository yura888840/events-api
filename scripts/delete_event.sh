#!/bin/bash

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <event_id>" >&2
  exit 1
fi

event_id="$1"
curl -i -X DELETE "http://localhost:3000/events/${event_id}" 