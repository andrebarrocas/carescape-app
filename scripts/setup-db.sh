#!/bin/bash

# Create database and enable PostGIS
psql postgres -f prisma/init.sql

# Set up environment variables in package.json instead of .env.local
echo "Adding environment variables to package.json..."
node -e '
const fs = require("fs");
const package = JSON.parse(fs.readFileSync("package.json"));
package.prisma = package.prisma || {};
package.prisma.seed = "ts-node prisma/seed.ts";
package.scripts = package.scripts || {};
package.scripts.dev = `EMAIL_SERVER_HOST=localhost EMAIL_SERVER_PORT=1025 EMAIL_FROM=noreply@example.com DATABASE_URL=postgresql://postgres:postgres@localhost:5432/carespace?schema=public ${package.scripts.dev || "next dev"}`;
fs.writeFileSync("package.json", JSON.stringify(package, null, 2));
'

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run migrations
echo "Running database migrations..."
npx prisma migrate dev --name init

# Install and start Mailhog for local email testing
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "Installing Mailhog for email testing..."
  brew install mailhog
  echo "Starting Mailhog..."
  brew services start mailhog
  echo "Mailhog UI available at http://localhost:8025"
else
  echo "Please install Mailhog manually for your operating system"
fi 