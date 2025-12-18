import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env explicitly
dotenv.config({ path: path.join(process.cwd(), '.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("❌ DATABASE_URL is not defined in .env");
    process.exit(1);
}

const client = new Client({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

const createTables = async () => {
    try {
        await client.connect();
        console.log("✅ Connected to Neon PostgreSQL");

        // Enable UUID extension
        await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

        // Create User Table
        await client.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        "email" TEXT UNIQUE NOT NULL,
        "name" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "avatarUrl" TEXT,
        "phoneNumber" TEXT,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log("✅ User table created");

        // Create Item Table
        await client.query(`
      CREATE TABLE IF NOT EXISTS "Item" (
        "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "pricePerDay" DOUBLE PRECISION NOT NULL,
        "imageUrl" TEXT NOT NULL,
        "location" TEXT NOT NULL,
        "latitude" DOUBLE PRECISION NOT NULL,
        "longitude" DOUBLE PRECISION NOT NULL,
        "available" BOOLEAN DEFAULT true,
        "ownerId" UUID NOT NULL REFERENCES "User"("id"),
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log("✅ Item table created");

        // Create Rental Table
        await client.query(`
      CREATE TABLE IF NOT EXISTS "Rental" (
        "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        "itemId" UUID NOT NULL REFERENCES "Item"("id"),
        "renterId" UUID NOT NULL REFERENCES "User"("id"),
        "startDate" TIMESTAMP(3) NOT NULL,
        "endDate" TIMESTAMP(3) NOT NULL,
        "totalPrice" DOUBLE PRECISION NOT NULL,
        "status" TEXT DEFAULT 'PENDING_PAYMENT',
        "culqiToken" TEXT,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log("✅ Rental table created");

        // Create Review Table
        await client.query(`
      CREATE TABLE IF NOT EXISTS "Review" (
        "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        "rentalId" UUID UNIQUE NOT NULL REFERENCES "Rental"("id"),
        "itemId" UUID NOT NULL REFERENCES "Item"("id"),
        "reviewerId" UUID NOT NULL REFERENCES "User"("id"),
        "rating" INTEGER NOT NULL,
        "comment" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log("✅ Review table created");

        console.log("🚀 Database setup completed!");

    } catch (error) {
        console.error("❌ Error setting up database:", error);
    } finally {
        await client.end();
    }
};

createTables();
