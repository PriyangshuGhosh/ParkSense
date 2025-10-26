import express from 'express';
const router = express.Router();

// simple ping
router.get('/ping', (req, res) => res.json({ ok: true }));

export default router;