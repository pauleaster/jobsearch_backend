const odbc = require('odbc');
const fs = require('fs');
const path = require('path');
const ini = require('ini');

// Read the configuration file
const configPath = `${process.env.HOME}/.scraper/scraper.conf`;
const config = ini.parse(fs.readFileSync(configPath, 'utf-8'));

// DB is SQL Server:
const connectionString = `Driver={SQL Server};Server=${config.DATABASE.DB_HOST};Database=${config.DATABASE.DB_NAME};Trusted_Connection=yes;`;


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


// Connect to the database using Windows Authentication
const connectToDatabase = async () => {
  return await odbc.connect(connectionString);
};

const readQueryFromFile = (filePath) => {
  const sqlQueryPath = path.join(__dirname, '..', '..', filePath);
  return fs.readFileSync(sqlQueryPath, 'utf-8');
};

const executeQueryFromFile = async (filePath, params = []) => {
  console.log("params:", params);
  console.log("params length:", params.length);

  const sqlQuery = readQueryFromFile(filePath);
  try {
    const connection = await connectToDatabase();
    const result = await connection.query(sqlQuery, params);
    await connection.close();
    return result;
  } catch (error) {
    console.error("error:", error);
    throw error;
  }
};

const executeQueryFromString = async (queryString, params = []) => {
  try {
    const connection = await connectToDatabase();
    const result = await connection.query(queryString, params);
    await connection.close();
    return result;
  } catch (error) {
    console.error("error:", error);
    throw error;
  }
};

const getValidJobsAndSearchTerms = async () => {
  const result = await executeQueryFromFile('queries/jobs/getValidJobsAndSearchTerms.sql');
  return result.rows;
};

const getJobDetailsById = async (jobId) => {

  const params = { jobId: jobId };

  const result = await executeQueryFromFile('queries/jobs/getJobById.sql', params);
  return result.rows;
};

const getJobHtmlById = async (jobId) => {

  const params = { jobId: jobId };

  const result = await executeQueryFromFile('queries/jobs/getJobHtmlById.sql', params);
  return result.rows;
};

const getFilteredValidJobsAndSearchTerms = async (filterTerms) => {
  const queryFile = 'queries/jobs/getFilteredValidJobsAndSearchTerms.sql';
  const params = filterTerms && filterTerms.length > 0 ? [filterTerms] : [];
  const result = await executeQueryFromFile(queryFile, params);
  return result.rows;
};

// getSearchTerms
const getSearchTerms = async () => {
  const response = await executeQueryFromFile('queries/jobs/getSearchTerms.sql');
  result = response.rows.map(row => row.term_text);
  return result;
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
  getFilteredValidJobsAndSearchTerms,
  getJobDetailsById,
  getJobHtmlById,
  getSearchTerms,
  updateJobField,
  AllowedFields,
};
