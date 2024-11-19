const messagesRouter = require('express').Router();
const { Message, User } = require('../../db/models');
const { verifyAccessToken } = require('../middleware/verifyToken');

// Получение всех сообщений общего чата
messagesRouter.get('/', verifyAccessToken, async (req, res) => {
  try {
    const messages = await Message.findAll({
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'surname', 'avatar']
        }
      ],
      order: [['createdAt', 'ASC']]
    });
    res.json(messages);
  } catch (error) {
    console.error('Ошибка при получении сообщений:', error);
    res.status(500).json({ error: 'Ошибка при получении сообщений' });
  }
});

// Обработка сокетов
const handleSocket = (io, socket) => {
  socket.on('general_message', async (data) => {
    try {
      const { senderId, content } = data;
      const message = await Message.create({
        sender_id: senderId,
        content
      });

      const messageWithSender = await Message.findByPk(message.id, {
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'name', 'surname', 'avatar']
          }
        ]
      });

      // Отправляем сообщение всем подключенным клиентам
      io.emit('new_message', {
        ...messageWithSender.toJSON(),
        isNew: true // добавляем флаг для новых сообщений
      });
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      socket.emit('message_error', { error: 'Ошибка при отправке сообщения' });
    }
  });
};

module.exports = { messagesRouter, handleSocket }; 