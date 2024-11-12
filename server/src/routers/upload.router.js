const uploadRouter = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { User } = require('../../db/models');
const { verifyAccessToken } = require('../middleware/verifyToken');

// Создаем папку для изображений, если её нет
const uploadDir = path.join(__dirname, '..', 'img');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Настраиваем multer для загрузки файлов
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const userId = req.user.id;
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${userId}${ext}`);
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
    const avatarPath = `/img/avatar_${userId}${path.extname(req.file.originalname)}`;

    await User.update(
      { avatar: avatarPath },
      { where: { id: userId } }
    );

    res.json({ avatar: avatarPath });
  } catch (error) {
    console.error('Ошибка при загрузке аватара:', error);
    res.status(500).json({ error: 'Ошибка при загрузке аватара' });
  }
});

module.exports = uploadRouter;