require('dotenv').config();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const cors = require('cors');


const { PORT } = process.env;

const tokensRouter = require('./routers/token.router');
<<<<<<< HEAD
=======

>>>>>>> dev
const authRouter = require('./routers/authRouter');

const parkingLotsRouter = require('./routers/parkingLots.router');

const corsConfig = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
};
app.use(cors(corsConfig));

app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/auth', authRouter);

app.use('/api/tokens', tokensRouter);

app.use('/api/parking-lots', parkingLotsRouter);






app.listen(PORT, () => {
  console.log(`Server started at ${PORT} port`);
});
