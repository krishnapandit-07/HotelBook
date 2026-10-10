import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hotelbook',
    waitForConnections: true,
    connectionLimit: 10,
    decimalNumbers: true,
    port: Number(process.env.DB_PORT || 3306),
    ssl: process.env.DB_SSL === "true"
        ? { minVersion: "TLSv1.2" }
        : undefined,
});

export default pool;