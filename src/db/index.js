const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const ini = require('ini');

// Read the configuration file
const configPath = `${process.env.HOME}/.scraper/scraper.conf`;
const config = ini.parse(fs.readFileSync(configPath, 'utf-8'));

const AllowedFields = {
  TITLE: "title",
  JOB_URL: "job_url",
  COMMENTS: "comments",
  REQUIREMENTS: "requirements",
  FOLLOW_UP: "follow_up",
  HIGHLIGHT: "highlight",
  APPLIED: "applied",
  CONTACT: "contact",
  APPLICATION_COMMENTS: "application_comments",
};


const pool = new Pool({
  user: config.DATABASE.DB_USER,
  host: config.DATABASE.DB_HOST,
  database: config.DATABASE.DB_NAME,
  password: config.DATABASE.DB_PASSWORD,
  port: parseInt(config.DATABASE.DB_PORT, 10),
});

const readQueryFromFile = (filePath) => {
  const sqlQueryPath = path.join(__dirname, '..', '..', filePath);
  return fs.readFileSync(sqlQueryPath, 'utf-8');
};

const executeQueryFromFile = async (filePath, params = []) => {
  const sqlQuery = readQueryFromFile(filePath);
  result = await pool.query(sqlQuery, params);
  return result;
};

const executeQueryFromString = async (queryString, params = []) => {
  return await pool.query(queryString, params);
};

const getValidJobsAndSearchTerms = async () => {
  const result = await executeQueryFromFile('queries/jobs/getValidJobsAndSearchTerms.sql');
  return result.rows;
};

const getJobDetailsById = async (jobId) => {
  const result = await executeQueryFromFile('queries/jobs/getJobById.sql', [jobId]);
  return result.rows;
};

const getJobHtmlById = async (jobId) => {
  const result = await executeQueryFromFile('queries/jobs/getJobHtmlById.sql', [jobId]);
  return result.rows;
};


const updateJobField = async (jobId, field, value) => {
  // Check if the field is allowed
  if (!Object.values(AllowedFields).includes(field)) {
    throw new Error("Invalid field provided");
  }

  const sqlQuery = readQueryFromFile('queries/jobs/updateJobField.sql');
  const updatedSqlQuery = sqlQuery.replace('{FIELD}', field);

  return await executeQueryFromString(updatedSqlQuery, [value, jobId]);
};


module.exports = {
  getValidJobsAndSearchTerms,
  getJobDetailsById,
  getJobHtmlById,
  updateJobField,
  AllowedFields,
};
