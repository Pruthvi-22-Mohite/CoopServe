import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ONLINE',
    platform: 'CoopServe API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

export default router;
