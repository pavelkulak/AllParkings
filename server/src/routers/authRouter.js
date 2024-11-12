const bcrypt = require('bcrypt');
const { User } = require('../../db/models');
const generateToken = require('../utils/generateToken');
const cookieConfig = require('../configs/cookieConfig');
const authRouter = require('express').Router();

authRouter.post('/signup', async (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) return res.sendStatus(400);
  const pass = await bcrypt.hash(password, 10);
  const [newUser, created] = await User.findOrCreate({
    where: { email },
    defaults: { name, pass },
  });
  if (!created) return res.sendStatus(400);
  const user = newUser.get();
  delete user.pass;
  const { accessToken, refreshToken } = generateToken({ user });
  res
    .cookie('refreshToken', refreshToken, cookieConfig)
    .json({ accessToken, user });
});

authRouter.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.sendStatus(400);
  const foundUser = await User.findOne({ where: { email } });
  if (!foundUser) return res.sendStatus(400);
  const isValid = await bcrypt.compare(password, foundUser.pass);
  if (!isValid) return res.sendStatus(400);
  const user = foundUser.get();
  delete user.pass;
  const { accessToken, refreshToken } = generateToken({ user });
  res
    .cookie('refreshToken', refreshToken, cookieConfig)
    .json({ accessToken, user });
});

authRouter.post('/signout', async (req, res) => {
  res.clearCookie('refreshToken').sendStatus(200);
});

module.exports = authRouter;
