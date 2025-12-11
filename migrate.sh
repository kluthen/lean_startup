#!/bin/sh

apt-get install postgresql-client

psql -U postgres -d postgres -h db -f migrations/251209_1110_init.sql
psql -U postgres -d postgres -h db -f migrations/251211_1000_user_profiles.sql
psql -U postgres -d postgres -h db -f migrations/251211_1415_symptoms.sql

npm install 

npx tsx server/scripts/seed_users.ts
npx tsx server/scripts/seed_symptoms.ts