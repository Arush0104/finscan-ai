const express = require('express');
const path = require('path');
const pool = require('../db/pool');
const requireAuth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, filename, mimetype } = req.file;
    const fileType = path.extname(originalname).toLowerCase().replace('.', ''); 
    const userId = req.userId; 

    const result = await pool.query(
      `INSERT INTO documents (user_id, filename, file_type, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING *`,
      [userId, filename, fileType]
    );

    const document = result.rows[0];

    res.status(201).json({
      message: 'File uploaded successfully',
      document
    });

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});


router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM documents WHERE user_id = $1 ORDER BY uploaded_at DESC',
      [req.userId]
    );
    res.json({ documents: result.rows });
  } catch (err) {
    console.error('Fetch documents error:', err);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

module.exports = router;