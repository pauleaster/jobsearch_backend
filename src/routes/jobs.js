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


module.exports = router;