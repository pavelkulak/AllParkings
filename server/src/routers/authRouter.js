const bcrypt = require('bcrypt');
const { User } = require('../../db/models');
const generateToken = require('../utils/generateToken');
const cookieConfig = require('../configs/cookieConfig');
const authRouter = require('express').Router();

authRouter.post('/signup', async (req, res) => {
    try {
        const { 
            email, 
            name, 
            surname, 
            patronymic, 
            phone, 
            password, 
            role 
        } = req.body;

        // Проверяем обязательные поля
        if (!email || !name || !surname || !phone || !password || !role) {
            return res.status(400).json({ 
                error: 'Не заполнены обязательные поля' 
            });
        }

        // Проверяем допустимость роли
        if (!['user', 'owner'].includes(role)) {
            return res.status(400).json({ 
                error: 'Недопустимая роль пользователя' 
            });
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создаем пользователя
        const [newUser, created] = await User.findOrCreate({
            where: { email },
            defaults: {
                name,
                surname,
                patronymic: patronymic || null,
                phone,
                role,
                password: hashedPassword
            }
        });

        if (!created) {
            return res.status(400).json({ 
                error: 'Пользователь с таким email уже существует' 
            });
        }

        // Готовим данные пользователя для отправки
        const user = {
            id: newUser.id,
            name: newUser.name,
            surname: newUser.surname,
            patronymic: newUser.patronymic,
            phone: newUser.phone,
            email: newUser.email,
            role: newUser.role,
            avatar: newUser.avatar
        };

        // Генерируем токены
        const { accessToken, refreshToken } = generateToken({ user });

        res
            .cookie('refreshToken', refreshToken, cookieConfig)
            .json({ accessToken, user });

    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ 
            error: 'Ошибка сервера при регистрации' 
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
            avatar: foundUser.avatar
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
            sameSite: 'strict'
        });
        res.status(200).json({ message: 'Успешный выход' });
    } catch (error) {
        console.error('Ошибка при выходе:', error);
        res.status(500).json({ error: 'Ошибка сервера при выходе' });
    }
});

module.exports = authRouter;
