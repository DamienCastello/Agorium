const passport = require('passport');

function authenticateJwt(req, res, next) {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
      if (err) {
        console.log('Authentication error:', err);
        return res.status(500).json({ error: 'An error occurred during authentication.' });
      }
      if (!user) {
        console.log('No user found:', info);
        return res.status(401).json({ error: 'Unauthorized. Invalid or missing token.' });
      }
      
      req.user = user;
      next();
    })(req, res, next);
  }
  
module.exports = { authenticateJwt };