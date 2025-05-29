import jwt from 'jsonwebtoken';

export function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token provided.' });
  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token.' });
  }
}

export function admin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
  next();
}
