export default function handler(req, res) {
  console.log('Simple Health check request received:', req.method);
  
  try {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString() 
    });
    console.log('Simple Health check response sent');
  } catch (error) {
    console.error('Simple Health check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
