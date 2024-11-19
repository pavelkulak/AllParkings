'use strict';
const { hashSync } = require('bcrypt');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'Users',
      [
        {
          name: 'Админ',
          surname: 'Админов',
          patronymic: 'Админович',
          phone: '9999999999',
          role: 'admin',
          email: 'admin@admin.ru',
          password: hashSync('qwerty123', 10),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Владелец',
          surname: 'Владельцов',
          patronymic: 'Владельцович',
          phone: '9999999999',
          role: 'owner',
          email: 'owner@owner.ru',
          password: hashSync('qwerty123', 10),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Водитель',
          surname: 'Водителев',
          patronymic: 'Водителевич',
          phone: '9999999999',
          role: 'user',
          email: 'user@user.ru',
          password: hashSync('qwerty123', 10),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  },
};
