#!/bin/bash

docker run --name reminders-postgres \
  -e POSTGRES_USER=reminders \
  -e POSTGRES_PASSWORD=local_dev_password \
  -e POSTGRES_DB=reminders \
  -p 127.0.0.1:5433:5432 \
  -v reminders_pgdata:/var/lib/postgresql/data \
  -d postgres:17