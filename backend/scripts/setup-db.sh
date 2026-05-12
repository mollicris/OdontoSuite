#!/bin/bash

echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Only seed in development or first deploy
if [ "$NODE_ENV" != "production" ] || [ ! -f ".seeded" ]; then
  echo "🌱 Seeding database..."
  npm run seed
  touch .seeded
else
  echo "⏭️  Skipping seed in production"
fi

echo "✅ Database setup complete!"
