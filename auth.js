const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('./database');

const SALT_ROUNDS = 10;

// Утилиты для работы с JWT
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

// Утилиты для работы с паролями
const hashPassword = async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

// Middleware для проверки авторизации
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = verifyToken(token);
        
        // Проверяем существование пользователя в БД
        const userResult = await pool.query(
            'SELECT id, username, email, birthday, is_active FROM users WHERE id = $1 AND is_active = true',
            [decoded.userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid token or user not found' });
        }

        req.user = userResult.rows[0];
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

// Функции для работы с пользователями
const registerUser = async (userData) => {
    const { username, email, password, birthday } = userData;
    
    // Проверяем, существует ли пользователь
    const existingUser = await pool.query(
        'SELECT id FROM users WHERE username = $1 OR email = $2',
        [username, email]
    );
    
    if (existingUser.rows.length > 0) {
        throw new Error('Username or email already exists');
    }
    
    // Хешируем пароль
    const passwordHash = await hashPassword(password);
    
    // Создаем пользователя
    const result = await pool.query(
        'INSERT INTO users (username, email, password_hash, birthday) VALUES ($1, $2, $3, $4) RETURNING id, username, email, birthday, created_at',
        [username, email, passwordHash, birthday]
    );
    
    const user = result.rows[0];
    const token = generateToken(user.id);
    
    return {
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            birthday: user.birthday,
            created_at: user.created_at
        },
        token
    };
};

const loginUser = async (username, password) => {
    // Ищем пользователя по username или email
    const result = await pool.query(
        'SELECT id, username, email, password_hash, birthday, is_active, created_at FROM users WHERE (username = $1 OR email = $1) AND is_active = true',
        [username]
    );
    
    if (result.rows.length === 0) {
        throw new Error('Invalid username or password');
    }
    
    const user = result.rows[0];
    
    // Проверяем пароль
    const isValid = await comparePassword(password, user.password_hash);
    
    if (!isValid) {
        throw new Error('Invalid username or password');
    }
    
    const token = generateToken(user.id);
    
    return {
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            birthday: user.birthday,
            created_at: user.created_at
        },
        token
    };
};

const getUserProfile = async (userId) => {
    const result = await pool.query(
        'SELECT id, username, email, birthday, created_at, updated_at FROM users WHERE id = $1 AND is_active = true',
        [userId]
    );
    
    if (result.rows.length === 0) {
        throw new Error('User not found');
    }
    
    return result.rows[0];
};

const updateUserProfile = async (userId, updateData) => {
    const { username, email, birthday, password } = updateData;
    
    const setParts = [];
    const values = [];
    let paramCount = 0;
    
    if (username !== undefined) {
        // Проверяем уникальность username
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE username = $1 AND id != $2',
            [username, userId]
        );
        
        if (existingUser.rows.length > 0) {
            throw new Error('Username already exists');
        }
        
        paramCount++;
        setParts.push(`username = $${paramCount}`);
        values.push(username);
    }
    
    if (email !== undefined) {
        // Проверяем уникальность email
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1 AND id != $2',
            [email, userId]
        );
        
        if (existingUser.rows.length > 0) {
            throw new Error('Email already exists');
        }
        
        paramCount++;
        setParts.push(`email = $${paramCount}`);
        values.push(email);
    }
    
    if (birthday !== undefined) {
        paramCount++;
        setParts.push(`birthday = $${paramCount}`);
        values.push(birthday);
    }
    
    if (password !== undefined) {
        const passwordHash = await hashPassword(password);
        paramCount++;
        setParts.push(`password_hash = $${paramCount}`);
        values.push(passwordHash);
    }
    
    if (setParts.length === 0) {
        throw new Error('No fields to update');
    }
    
    paramCount++;
    values.push(userId);
    
    const query = `
        UPDATE users 
        SET ${setParts.join(', ')}
        WHERE id = $${paramCount} AND is_active = true
        RETURNING id, username, email, birthday, updated_at
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
        throw new Error('User not found or update failed');
    }
    
    return result.rows[0];
};

module.exports = {
    generateToken,
    verifyToken,
    hashPassword,
    comparePassword,
    authenticateToken,
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile
};