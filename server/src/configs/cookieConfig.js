const jwtConfig = require('./jwtConfig');

module.exports = {
  access: {
    maxAge: jwtConfig.access.expiresIn,
    httpOnly: true,
    // ДОБАВЛЯЕМ ЭТО:
    secure: true,      // Обязательно для HTTPS/SSL
    sameSite: 'none',  // Обязательно для кросс-доменных запросов
  },
  refresh: {
    maxAge: jwtConfig.refresh.expiresIn,
    httpOnly: true,
    // ДОБАВЛЯЕМ ЭТО:
    secure: true,      // Обязательно для HTTPS/SSL
    sameSite: 'none',  // Обязательно для кросс-доменных запросов
  },
};