const uploadRouter = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { User } = require('../../db/models');
const { verifyAccessToken } = require('../middleware/verifyToken');
const generateToken = require('../utils/generateToken');
const { cookieConfig } = require('../configs/cookieConfig');

const uploadDir = path.join(__dirname, '../../img')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const tempName = Date.now() + path.extname(file.originalname);
    cb(null, tempName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB макс
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Недопустимый формат файла'));
    }
  }
});

uploadRouter.post('/avatar', verifyAccessToken, upload.single('avatar'), async (req, res) => {
  try {
    const userId = res.locals.user.id;

    const currentUser = await User.findByPk(userId);

    if (currentUser.avatar) {
      const oldAvatarPath = path.join(uploadDir, path.basename(currentUser.avatar));
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    const oldPath = path.join(uploadDir, req.file.filename);
    const newFileName = `avatar_${userId}${path.extname(req.file.originalname)}`;
    const newPath = path.join(uploadDir, newFileName);

    fs.renameSync(oldPath, newPath);
    const avatarPath = `/api/img/${newFileName}`;

    await User.update(
      { avatar: avatarPath },
      { where: { id: userId } }
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
      avatar: updatedUser.avatar
    };

    const { accessToken, refreshToken } = generateToken({ user });

    res
      .cookie('refreshToken', refreshToken, cookieConfig)
      .json({ accessToken, user });

  } catch (error) {
    console.error('Ошибка при загрузке аватара:', error);
    res.status(500).json({ error: 'Ошибка при загрузке аватара' });
  }
});

uploadRouter.delete('/avatar', verifyAccessToken, async (req, res) => {
  try {
    const userId = res.locals.user.id;
    
    const currentUser = await User.findByPk(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (currentUser.avatar) {
      const avatarPath = path.join(uploadDir, path.basename(currentUser.avatar));
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    await User.update(
      { avatar: null },
      { where: { id: userId } }
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
      avatar: updatedUser.avatar
    };

    const { accessToken, refreshToken } = generateToken({ user });

    res
      .cookie('refreshToken', refreshToken, cookieConfig)
      .json({ accessToken, user });

  } catch (error) {
    console.error('Ошибка при удалении аватара:', error);
    res.status(500).json({ message: 'Ошибка при удалении аватара' });
  }
});

module.exports = uploadRouter;