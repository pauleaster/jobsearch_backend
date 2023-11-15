const express = require('express');
const cors = require('cors'); // Import CORS middleware
const jobRoutes = require('./routes/jobs');

const app = express();
app.use(express.json()); // Use the built-in JSON parser
const port = 3002;

app.use(cors()); // Use the CORS middleware

app.use('/api', jobRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
