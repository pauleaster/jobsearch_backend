const { Connection, Request, TYPES } = require('tedious');
const msnodesqlv8 = require("msnodesqlv8");
const fs = require('fs');
const path = require('path');
const ini = require('ini');

// Read the configuration file
const configPath = `${process.env.HOME}/.scraper/scraper.conf`;
const config = ini.parse(fs.readFileSync(configPath, 'utf-8'));

const AllowedFields = {
  TITLE: { name: "title", type: "VarChar" },
  JOB_URL: { name: "job_url", type: "VarChar" },
  COMMENTS: { name: "comments", type: "VarChar" },
  REQUIREMENTS: { name: "requirements", type: "VarChar" },
  FOLLOW_UP: { name: "follow_up", type: "VarChar" },
  HIGHLIGHT: { name: "highlight", type: "VarChar" },
  APPLIED: { name: "applied", type: "VarChar" },
  CONTACT: { name: "contact", type: "VarChar" },
  APPLICATION_COMMENTS: { name: "application_comments", type: "VarChar" },
};



// Function to create the database configuration
const createDbConfig = (config) => {
  if (config.DATABASE.AUTH_METHOD === 'WINDOWS_AUTH') {
      return {
          server: config.DATABASE.DB_HOST,
          options: {
              database: config.DATABASE.DB_NAME,
              port: parseInt(config.DATABASE.DB_PORT, 10),
              driver: "msnodesqlv8",
              trustedConnection: true
          },
      };
  } else {
      return {
          server: config.DATABASE.DB_HOST,
          authentication: {
              type: 'default',
              options: {
                  userName: config.DATABASE.DB_USER,
                  password: config.DATABASE.DB_PASSWORD,
              },
          },
          options: {
              database: config.DATABASE.DB_NAME,
              port: parseInt(config.DATABASE.DB_PORT, 10),
          },
      };
  }
}

// Create the database configuration using the existing config object
const dbConfig = createDbConfig(config);

const executeQuery = async (sql, params = []) => {
  return new Promise((resolve, reject) => {
    // Use dbConfig instead of config
    const connection = new Connection(dbConfig);

    connection.on('connect', err => {
      if (err) {
        console.log('Connection Error:', err);
        connection.close();
        reject(err);
      } else {
        const request = new Request(sql, (err, rowCount, rows) => {
          connection.close();  // Ensure the connection is closed after query execution
          if (err) {
            console.log('Query Execution Error:', err)
            reject(err);
          } else {
            resolve(rows); // Process rows as needed
          }
        });

        // Add parameters
        params.forEach(param => {
          request.addParameter(param.name, TYPES.VarChar, param.value);
        });

        connection.execSql(request);
      }
    });

    connection.connect();
  });
};



const readQueryFromFile = (filePath) => {
  const sqlQueryPath = path.join(__dirname, '..', '..', filePath);
  return fs.readFileSync(sqlQueryPath, 'utf-8');
};

const executeQueryFromFile = async (filePath, params = []) => {
  console.log("params:", params);
  console.log("params length:", params.length);
  // console.log("params is an array:", Array.isArray(params));
  const sqlQuery = readQueryFromFile(filePath);
  // console.log("sqlQuery:", sqlQuery);
  result = await executeQuery (sqlQuery, params);
  return result;
};

const executeQueryFromString = async (queryString, params = []) => {
  return await executeQuery (queryString, params);
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


const updateJobField = async (jobId, fieldKey, value) => {
  // Check if the field is allowed
  if (!AllowedFields[fieldKey]) {
    throw new Error("Invalid field provided");
  }

  const field = AllowedFields[fieldKey];
  const sqlQuery = readQueryFromFile('queries/jobs/updateJobField.sql');
  const updatedSqlQuery = sqlQuery.replace('{FIELD}', `[${field}]`);

  return await executeQueryFromString(updatedSqlQuery, [{name: 'value', type: 'VarChar', value: value}, {name: 'jobId', type: 'Int', value: jobId}]);
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
