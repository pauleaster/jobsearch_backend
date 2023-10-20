const express = require('express');
const router = express.Router();
const db = require('../db');

const handleAsyncRoute = (asyncFn) => {
  return async (req, res) => {
      try {
          const result = await asyncFn(req);
          res.json(result.rows);
      } catch (err) {
          console.error(err);
          res.status(500).json({ error: 'Failed to fetch data' });
      }
  };
};

router.get('/validJobsAndSearchTerms', handleAsyncRoute(async () => await db.getValidJobsAndSearchTerms()));

router.get('/job/:jobId', handleAsyncRoute(async (req) => await db.getJobDetailsById(req.params.jobId)));

// New endpoint to update specific fields of a job
router.patch('/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { field, value } = req.body;  // Field to update and its new value

    // Validate if the field is allowed to be updated
    if (!Object.values(db.AllowedFields).includes(field)) {
      return res.status(400).json({ error: 'Invalid field provided for update' });
    }

    const result = await db.updateJobField(jobId, field, value);

    if (result.rowCount === 0) {  // No rows updated, possibly invalid jobId
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ message: 'Update successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update job field' });
  }
});

module.exports = router;