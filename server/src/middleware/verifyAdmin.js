// server/src/middleware/verifyAdmin.js
const verifyAdmin = (req, res, next) => {
    const { user } = res.locals;
    
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }
    
    next();
  };
  
  module.exports = { verifyAdmin };