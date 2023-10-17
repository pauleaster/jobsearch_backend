const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const ini = require('ini');

// Read the configuration file
const configPath = `${process.env.HOME}/.scraper/scraper.conf`;
const config = ini.parse(fs.readFileSync(configPath, 'utf-8'));

const pool = new Pool({
  user: config.DATABASE.DB_USER,
  host: config.DATABASE.DB_HOST,
  database: config.DATABASE.DB_NAME,
  password: config.DATABASE.DB_PASSWORD,
  port: parseInt(config.DATABASE.DB_PORT, 10),
});

const getValidJobsAndSearchTerms = async () => {
  const sqlQueryPath = path.join(__dirname, '..', '..', 'queries', 'jobs', 'getValidJobsAndSearchTerms.sql');
  const sqlQuery = fs.readFileSync(sqlQueryPath, 'utf-8');
  return await pool.query(sqlQuery);
};

module.exports = {
  getValidJobsAndSearchTerms,
};
