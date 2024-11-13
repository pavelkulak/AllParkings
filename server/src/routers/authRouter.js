const bcrypt = require('bcrypt');
const { User } = require('../../db/models');
const generateToken = require('../utils/generateToken');
const cookieConfig = require('../configs/cookieConfig');
const authRouter = require('express').Router();
const { verifyAccessToken } = require('../middleware/verifyToken');

authRouter.post('/signup', async (req, res) => {
  try {
    const { email, name, surname, patronymic, phone, password, role } =
      req.body;

    if (!email || !name || !surname || !phone || !password || !role) {
      return res.status(400).json({
        error: 'Не заполнены обязательные поля',
      });
    }

    if (!['user', 'owner'].includes(role)) {
      return res.status(400).json({
        error: 'Недопустимая роль пользователя',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser, created] = await User.findOrCreate({
      where: { email },
      defaults: {
        name,
        surname,
        patronymic: patronymic || null,
        phone,
        role,
        password: hashedPassword,
        avatar: null,
      },
    });

    if (!created) {
      return res.status(400).json({
        error: 'Пользователь с таким email уже существует',
      });
    }

    const user = {
      id: newUser.id,
      name: newUser.name,
      surname: newUser.surname,
      patronymic: newUser.patronymic,
      phone: newUser.phone,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
    };

    const { accessToken, refreshToken } = generateToken({ user });

    res
      .cookie('refreshToken', refreshToken, cookieConfig)
      .json({ accessToken, user });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({
      error: 'Ошибка сервера при регистрации',
    });
  }
});

authRouter.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    const foundUser = await User.findOne({ where: { email } });

    if (!foundUser) {
      return res.status(400).json({ error: 'Пользователь не найден' });
    }

    const isValid = await bcrypt.compare(password, foundUser.password);

    if (!isValid) {
      return res.status(400).json({ error: 'Неверный пароль' });
    }

    console.log('User found:', foundUser.toJSON());

    const user = {
      id: foundUser.id,
      name: foundUser.name,
      surname: foundUser.surname,
      patronymic: foundUser.patronymic,
      phone: foundUser.phone,
      email: foundUser.email,
      role: foundUser.role,
      avatar: foundUser.avatar,
    };

    console.log('User data being sent:', user);

    const { accessToken, refreshToken } = generateToken({ user });

    res
      .cookie('refreshToken', refreshToken, cookieConfig)
      .json({ accessToken, user });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
});

authRouter.post('/signout', async (req, res) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.status(200).json({ message: 'Успешный выход' });
  } catch (error) {
    console.error('Ошибка при выходе:', error);
    res.status(500).json({ error: 'Ошибка сервера при выходе' });
  }
});

authRouter.put('/profile', verifyAccessToken, async (req, res) => {
  try {
    const userId = res.locals.user.id;
    const { surname, name, patronymic, phone } = req.body;

    await User.update(
      { surname, name, patronymic, phone },
      { where: { id: userId } },
    );

    const updatedUser = await User.findByPk(userId);
    const user = {
      id: updatedUser.id,
      name: updatedUser.name,
      surname: updatedUser.surname,
      patronymic: updatedUser.patronymic,
      phone: updatedUser.phone,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
    };

    const { accessToken, refreshToken } = generateToken({ user });

    res
      .cookie('refreshToken', refreshToken, cookieConfig)
      .json({ accessToken, user });
  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error);
    res.status(500).json({ error: 'Ошибка при обновлении профиля' });
  }
});

module.exports = authRouter;
