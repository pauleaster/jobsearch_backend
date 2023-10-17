const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/validJobsAndSearchTerms', async (req, res) => {
  try {
      const result = await db.getValidJobsAndSearchTerms();
      res.json(result.rows);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch data' });
  }
});

module.exports = router;