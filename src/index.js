const express = require('express');
const cors = require('cors'); // Import CORS middleware
const jobRoutes = require('./routes/jobs');

const app = express();
const port = 3001;

app.use(cors()); // Use the CORS middleware

app.use('/api', jobRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
