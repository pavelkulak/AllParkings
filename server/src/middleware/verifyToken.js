const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyRefreshToken = (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    const { user } = jwt.verify(refreshToken, process.env.SECRET_REFRESH_TOKEN);
    res.locals.user = user;
    next();
  } catch (error) {
    console.log('Invalid refresh token');
    res.sendStatus(401);
  }
};

const verifyAccessToken = (req, res, next) => {
  try {
    const accessToken = req.headers.authorization.split(' ')[1];
    const { user } = jwt.verify(accessToken, process.env.SECRET_ACCESS_TOKEN);
    res.locals.user = user;
    next();
  } catch (error) {
    console.log('Invalid access token');
    res.sendStatus(401);
  }
};

module.exports = { verifyRefreshToken, verifyAccessToken };