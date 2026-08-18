const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT * FROM "Enrollment" LIMIT 10').then(res => console.log(res.rows)).catch(console.error).finally(() => pool.end());
