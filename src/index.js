const express = require('express');
const jobRoutes = require('./routes/jobs');

const app = express();
const port = 3001;

app.use('/api', jobRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
