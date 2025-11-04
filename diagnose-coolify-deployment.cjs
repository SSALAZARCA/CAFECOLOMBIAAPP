#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Cargar variables de entorno de ambos .env (root y api)
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), 'api', '.env') });

function logSection(title) {
  console.log(`\n==================== ${title} ====================`);
}

function getEnvSummary() {
  const keys = [
    'PORT','NODE_ENV','HOST','VITE_API_URL','FRONTEND_URL','BACKEND_URL','JWT_SECRET',
    'DB_HOST','DB_PORT','DB_USER','DB_PASSWORD','DB_NAME',
    'MYSQL_HOST','MYSQL_PORT','MYSQL_USER','MYSQL_PASSWORD','MYSQL_DATABASE'
  ];
  const summary = {};
  for (const k of keys) {
    summary[k] = process.env[k] ? (k.toLowerCase().includes('password') ? '***set***' : process.env[k]) : '(not set)';
  }
  return summary;
}

async function checkHealth(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ ok: true, status: res.statusCode, body: data });
      });
    });
    req.on('error', (err) => resolve({ ok: false, error: err.message }));
    req.setTimeout(4000, () => { req.destroy(new Error('timeout')); });
  });
}

async function checkMySQL() {
  // Prefer DB_* family, fallback to MYSQL_* family
  const config = {
    host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
    user: process.env.DB_USER || process.env.MYSQL_USER,
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE,
    port: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '3306'),
    ssl: { rejectUnauthorized: false }
  };

  const missing = [];
  ['host','user','password','database'].forEach(k => { if (!config[k]) missing.push(k); });
  if (missing.length) {
    return { ok: false, error: `Missing MySQL config fields: ${missing.join(', ')}`, config };
  }

  try {
    const conn = await mysql.createConnection(config);
    await conn.ping();
    const [rows] = await conn.execute('SELECT 1 as test');
    await conn.end();
    return { ok: true, result: rows[0], config: { ...config, password: '***set***' } };
  } catch (err) {
    return { ok: false, error: err.message, config: { ...config, password: '***set***' } };
  }
}

async function main() {
  logSection('Environment Variables');
  console.table(getEnvSummary());

  const port = process.env.PORT || '3001';
  const base = `http://localhost:${port}`;

  logSection('Backend Health');
  const health = await checkHealth(`${base}/api/health`);
  console.log(health);

  logSection('API Base');
  const apiInfo = await checkHealth(`${base}/api`);
  console.log(apiInfo);

  logSection('MySQL Connectivity');
  const mysqlCheck = await checkMySQL();
  console.log(mysqlCheck);

  logSection('Summary');
  const issues = [];
  if (!health.ok) issues.push('Backend health endpoint failed');
  if (!mysqlCheck.ok) issues.push('MySQL connectivity failed');
  if ((process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD) ? false : true) issues.push('Database password is not set');
  if (!process.env.VITE_API_URL) issues.push('VITE_API_URL not set (frontend should use /api in Coolify)');

  if (issues.length === 0) {
    console.log('✅ All checks passed. Ready for Coolify deployment.');
  } else {
    console.log('❌ Issues detected:');
    for (const i of issues) console.log(`- ${i}`);
  }
}

main().catch(e => {
  console.error('Fatal diagnostic error:', e);
  process.exit(1);
});