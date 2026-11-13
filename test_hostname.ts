import "dotenv/config";
import pg from "pg";

const { Client } = pg;

// Test with autoSelectFamily: false or custom lookup
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  // Disable Node's dual-stack autoSelectFamily which attempts IPv6 on Windows
});

async function run() {
  try {
    console.log("Connecting with DATABASE_URL...");
    await client.connect();
    console.log("SUCCESS! Connected via DATABASE_URL!");
    const res = await client.query("SELECT 1 as test;");
    console.log("Query Result:", res.rows);
  } catch (err) {
    console.error("HOSTNAME_ERROR:", err);
  } finally {
    await client.end();
  }
}

run();

