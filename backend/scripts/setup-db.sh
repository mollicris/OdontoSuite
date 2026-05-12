#!/bin/bash

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database..."
npm run seed

echo "✅ Database setup complete!"
