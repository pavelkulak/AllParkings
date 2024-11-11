const tokensRouter = require('express').Router();
const cookieConfig = require('../configs/cookieConfig');
const { verifyRefreshToken } = require('../middleware/verifyToken');
const generateToken = require('../utils/generateToken');

tokensRouter.get('/refresh', verifyRefreshToken, (req, res) => {
  const { user } = res.locals;
  const { accessToken, refreshToken } = generateToken({ user });

  res
    .status(200)
    .cookie('refreshToken', refreshToken, cookieConfig)
    .json({ user, accessToken });
});

module.exports = tokensRouter;
