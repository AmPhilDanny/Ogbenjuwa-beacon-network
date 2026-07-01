import postgres from 'postgres';
const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
const [lgas] = await sql`SELECT COUNT(*) as count FROM lgas`;
const [wards] = await sql`SELECT COUNT(*) as count FROM wards`;
const [villages] = await sql`SELECT COUNT(*) as count FROM villages`;
const [users] = await sql`SELECT COUNT(*) as count FROM users WHERE email LIKE '%@ogbenjuwa.local'`;
console.log(`LGAs: ${lgas.count}, Wards: ${wards.count}, Villages: ${villages.count}, Seed users: ${users.count}`);
await sql.end();
