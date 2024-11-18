require('dotenv').config();
const morgan = require('morgan');
const { Message, User } = require('../db/models');
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
  }
});

const { PORT } = process.env;

const tokensRouter = require('./routers/token.router');
const authRouter = require('./routers/authRouter');

const parkingLotsRouter = require('./routers/parkingLots.router');

const bookingsRouter = require('./routers/bookingsRouter');

const reviewsRouter = require('./routers/reviewsRouter');

const uploadRouter = require('./routers/upload.router');

const favoritesRouter = require('./routers/favoritesRouter');

const { messagesRouter, handleSocket } = require('./routers/messages.router');

const corsConfig = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
};
app.use(cors(corsConfig));

app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/img', express.static(path.join(__dirname, '../img')));

app.use('/api/auth', authRouter);

app.use('/api/tokens', tokensRouter);

app.use('/api/parking-lots', parkingLotsRouter);

app.use('/api/bookings', bookingsRouter);

app.use('/api/reviews', reviewsRouter);

app.use('/api/upload', uploadRouter);

app.use('/api/messages', messagesRouter);

app.use('/api/favorites', favoritesRouter);

// Обработка подключений Socket.IO
io.on('connection', (socket) => {
  console.log('Пользователь подключился');
  handleSocket(io, socket);
  
  socket.on('disconnect', () => {
    console.log('Пользователь отключился');
  });
});

// Изменим app.listen на server.listen
server.listen(PORT, () => {
  console.log(`Server started at ${PORT} port`);
});
