const odbc = require('odbc');
const fs = require('fs');
const path = require('path');
const ini = require('ini');

// Read the configuration file
const configPath = `${process.env.HOME}/.scraper/scraper.conf`;
const config = ini.parse(fs.readFileSync(configPath, 'utf-8'));

// DB is SQL Server:
const connectionString = `Driver={SQL Server};Server=${config.DATABASE.DB_HOST};Database=${config.DATABASE.DB_NAME};Trusted_Connection=yes;`;

let connection = null;
let connectionTimer = null;
const idleTime = 60000; // 60 seconds

const resetConnectionTimer = () => {
  if (connectionTimer) clearTimeout(connectionTimer);
  connectionTimer = setTimeout(disconnectDatabase, idleTime);
};

const connectToDatabase = async () => {
  if (!connection) {
    connection = await odbc.connect(connectionString);
    resetConnectionTimer();
  }
  return connection;
};

const disconnectDatabase = async () => {
  if (connection) {
    await connection.close();
    connection = null;
  }
};


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


const readQueryFromFile = (filePath) => {
  const sqlQueryPath = path.join(__dirname, '..', '..', filePath);
  return fs.readFileSync(sqlQueryPath, 'utf-8');
};

const executeQueryFromFile = async (filePath, params = []) => {
  console.log("executeQueryFromFile: params:", params);
  console.log("executeQueryFromFile: params length:", params.length);

  const sqlQuery = readQueryFromFile(filePath);
  const connection = await connectToDatabase();
  try {
    const result = await connection.query(sqlQuery, params);
    resetConnectionTimer();
    console.log("executeQueryFromFile: :result:", result);
    return result;
  } catch (error) {
    console.error("executeQueryFromFile: : error:", error);
    throw error;
  }
};

const executeQueryFromString = async (queryString, params = []) => {
  const connection = await connectToDatabase();
  try {
    console.log("executeQueryFromString: params:", params);
    console.log("executeQueryFromString: params length:", params.length);
    const result = await connection.query(queryString, params);
    resetConnectionTimer();
    console.log("executeQueryFromString: result:", result);
    return result;
  } catch (error) {
    console.error("executeQueryFromString: error:", error);
    throw error;
  }
};

const getValidJobsAndSearchTerms = async () => {
  const result = await executeQueryFromFile('queries/jobs/getValidJobsAndSearchTerms.sql');
  console.log("result:", result);
  return result;
};

const getJobDetailsById = async (jobId) => {

  const result = await executeQueryFromFile('queries/jobs/getJobById.sql', [jobId]);
  const firstRow = result;

  return firstRow;
};

const getJobHtmlById = async (jobId) => {

  const result = await executeQueryFromFile('queries/jobs/getJobHtmlById.sql', [jobId]);
  console.log("result:", result);
  return result;
};

const getFilteredValidJobsAndSearchTerms = async (filterTerms) => {
  const headQueryFile = 'queries/jobs/getFilteredValidJobsAndSearchTerms1.sql';
  const tailQueryFile = 'queries/jobs/getFilteredValidJobsAndSearchTerms2.sql';
  const searchTerms = await getSearchTerms();
  console.log("getFilteredValidJobsAndSearchTerms: searchTerms:", searchTerms);
  const validTerms = filterTerms.filter(term => searchTerms.includes(term));

  let whereString = "";
  validTerms.forEach((term, idx) => {
    if (idx === 0) {
        whereString = `(CAST(vjt.term_text AS VARCHAR) = CAST('${term}' AS VARCHAR))\n`;
    } else {
        whereString += `OR (CAST(vjt.term_text AS VARCHAR) = CAST('${term}' AS VARCHAR))\n`;
    }
  });
  const headString = readQueryFromFile(headQueryFile);
  const tailString = readQueryFromFile(tailQueryFile);
  const queryString = headString + whereString + tailString;
  // const tempFilePath = 'tmp/filteredJobsAndSearchTerms.txt';
  // fs.writeFile(tempFilePath, queryString, (err) => {
  //   if (err) {
  //       console.error('Error writing to file:', err);
  //   } else {
  //       console.log('Query string saved to', tempFilePath);
  //   }
  // });
  const result = await executeQueryFromString(queryString, );
  console.log("getFilteredValidJobsAndSearchTerms: result:", result);

  return result;
};


// getSearchTerms
const getSearchTerms = async () => {
  const response = await executeQueryFromFile('queries/jobs/getSearchTerms.sql');
  console.log("response:", response);
  result = response.map(row => row.term_text);
  console.log("result:", result); 
  return result;
};


const updateJobField = async (jobId, field, value) => {
  // Check if the field is allowed
  if (!Object.values(AllowedFields).includes(field)) {
    throw new Error("Invalid field provided");
  }

  const sqlQuery = readQueryFromFile('queries/jobs/updateJobField.sql');
  const updatedSqlQuery = sqlQuery.replace('{FIELD}', field);

  // Pass parameters as an object
  const params = [ value, jobId ];

  return await executeQueryFromString(updatedSqlQuery, params);
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
