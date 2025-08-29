const express = require('express');
const cors = require('cors');
const pool = require('./database');
const { authenticateToken, registerUser, loginUser, getUserProfile, updateUserProfile } = require('./auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (frontend)
app.use(express.static('.'));

// Helper function для парсинга query параметров
function parseQueryParams(req) {
    const { q, date_like, student_id, date, _sort, _order, _limit, _start } = req.query;
    return { q, date_like, student_id, date, _sort, _order, _limit, _start };
}


// AUTHENTICATION ENDPOINTS

// POST /auth/register - регистрация пользователя
app.post('/auth/register', async (req, res) => {
    try {
        const { username, email, password, birthday } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }
        
        const result = await registerUser({ username, email, password, birthday });
        res.status(201).json(result);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ error: error.message });
    }
});

// POST /auth/login - вход пользователя
app.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        
        const result = await loginUser(username, password);
        res.json(result);
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ error: error.message });
    }
});

// GET /auth/profile - получить профиль пользователя
app.get('/auth/profile', authenticateToken, async (req, res) => {
    try {
        const profile = await getUserProfile(req.user.id);
        res.json(profile);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: error.message });
    }
});

// PATCH /auth/profile - обновить профиль пользователя
app.patch('/auth/profile', authenticateToken, async (req, res) => {
    try {
        const updatedProfile = await updateUserProfile(req.user.id, req.body);
        
        // Получаем полные данные пользователя включая created_at
        const fullProfile = await getUserProfile(req.user.id);
        
        res.json({ 
            user: {
                id: updatedProfile.id,
                username: updatedProfile.username,
                email: updatedProfile.email,
                birthday: updatedProfile.birthday,
                created_at: fullProfile.created_at,
                updated_at: updatedProfile.updated_at
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(400).json({ error: error.message });
    }
});

// STUDENTS ENDPOINTS

// GET /students - получить всех студентов текущего пользователя с фильтрацией
app.get('/students', authenticateToken, async (req, res) => {
    try {
        const { q, _sort = 'name', _order = 'asc', _limit, _start } = parseQueryParams(req);
        
        let query = `
            SELECT s.id, s.user_id, s.name, s.current_cost, s.quantity_paid_lessons, 
                   s.birthday::text as birthday, s.comment, s.status_switch, s.created_at, s.updated_at,
                   COALESCE(
                       json_agg(
                           json_build_object(
                               'id', cd.id,
                               'date', cd.date,
                               'type', cd.type
                           )
                           ORDER BY cd.id
                       ) FILTER (WHERE cd.id IS NOT NULL), 
                       '[]'
                   ) as cost_date
            FROM students s
            LEFT JOIN cost_dates cd ON s.id = cd.student_id
            WHERE s.user_id = $1
        `;
        
        let params = [req.user.id];
        let paramCount = 1;
        
        if (q) {
            paramCount++;
            query += ` AND (s.name ILIKE $${paramCount} OR cd.date LIKE $${paramCount})`;
            params.push(`%${q}%`);
        }
        
        query += ` GROUP BY s.id, s.user_id, s.name, s.current_cost, s.quantity_paid_lessons, 
                     s.birthday, s.comment, s.status_switch, s.created_at, s.updated_at`;
        
        if (_sort) {
            query += ` ORDER BY s.${_sort} ${_order.toUpperCase()}`;
        }
        
        if (_limit) {
            paramCount++;
            query += ` LIMIT $${paramCount}`;
            params.push(parseInt(_limit));
        }
        
        if (_start) {
            paramCount++;
            query += ` OFFSET $${paramCount}`;
            params.push(parseInt(_start));
        }
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /students/:id - получить студента по ID (только своего)
app.get('/students/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT s.id, s.user_id, s.name, s.current_cost, s.quantity_paid_lessons, 
                   s.birthday::text as birthday, s.comment, s.status_switch, s.created_at, s.updated_at,
                   COALESCE(
                       json_agg(
                           json_build_object(
                               'id', cd.id,
                               'date', cd.date,
                               'type', cd.type
                           )
                           ORDER BY cd.id
                       ) FILTER (WHERE cd.id IS NOT NULL), 
                       '[]'
                   ) as cost_date
            FROM students s
            LEFT JOIN cost_dates cd ON s.id = cd.student_id
            WHERE s.id = $1 AND s.user_id = $2
            GROUP BY s.id, s.user_id, s.name, s.current_cost, s.quantity_paid_lessons, 
                     s.birthday, s.comment, s.status_switch, s.created_at, s.updated_at
        `;
        
        const result = await pool.query(query, [id, req.user.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /students - создать нового студента
app.post('/students', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const { name, current_cost = '', curent_cost = '', quantity_paid_lessons = 0, cost_date = [], birthday = '', comment = '' } = req.body;
        
        // Используем current_cost если есть, иначе curent_cost для обратной совместимости
        const finalCurrentCost = current_cost || curent_cost || '';
        
        // Создаем студента
        const studentQuery = `
            INSERT INTO students (user_id, name, current_cost, quantity_paid_lessons, birthday, comment)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        
        // Обрабатываем пустую дату рождения
        const finalBirthday = (birthday === '' || birthday === null || birthday === undefined) ? null : birthday;
        
        const studentResult = await client.query(studentQuery, [req.user.id, name, finalCurrentCost, quantity_paid_lessons, finalBirthday, comment]);
        const student = studentResult.rows[0];
        
        // Добавляем историю стоимости
        if (cost_date && cost_date.length > 0) {
            for (const costItem of cost_date) {
                const costQuery = `
                    INSERT INTO cost_dates (student_id, date, type)
                    VALUES ($1, $2, $3)
                `;
                await client.query(costQuery, [student.id, costItem.date, costItem.type]);
            }
        }
        
        await client.query('COMMIT');
        
        // Возвращаем студента с историей стоимости
        const finalQuery = `
            SELECT s.id, s.user_id, s.name, s.current_cost, s.quantity_paid_lessons, 
                   s.birthday::text as birthday, s.comment, s.status_switch, s.created_at, s.updated_at,
                   COALESCE(
                       json_agg(
                           json_build_object(
                               'id', cd.id,
                               'date', cd.date,
                               'type', cd.type
                           )
                           ORDER BY cd.id
                       ) FILTER (WHERE cd.id IS NOT NULL), 
                       '[]'
                   ) as cost_date
            FROM students s
            LEFT JOIN cost_dates cd ON s.id = cd.student_id
            WHERE s.id = $1
            GROUP BY s.id, s.user_id, s.name, s.current_cost, s.quantity_paid_lessons, 
                     s.birthday, s.comment, s.status_switch, s.created_at, s.updated_at
        `;
        
        const finalResult = await client.query(finalQuery, [student.id]);
        res.status(201).json(finalResult.rows[0]);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating student:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
});

// PATCH /students/:id - обновить студента (только своего)
app.patch('/students/:id', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const { id } = req.params;
        const updateData = req.body;
        
        // Проверяем, что студент принадлежит текущему пользователю
        const checkOwnership = await client.query('SELECT id FROM students WHERE id = $1 AND user_id = $2', [id, req.user.id]);
        
        if (checkOwnership.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Student not found' });
        }
        
        // Строим динамический запрос для обновления
        const setParts = [];
        const values = [];
        let paramCount = 0;
        
        // Разрешенные поля для обновления
        const allowedFields = ['name', 'current_cost', 'quantity_paid_lessons', 'birthday', 'comment', 'status_switch'];
        
        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key)) {
                paramCount++;
                setParts.push(`${key} = $${paramCount}`);
                // Обрабатываем null значения для даты рождения
                if (key === 'birthday' && (value === '' || value === null || value === undefined)) {
                    values.push(null);
                } else {
                    values.push(value);
                }
            }
        }
        
        if (setParts.length > 0) {
            paramCount++;
            values.push(id);
            
            const updateQuery = `
                UPDATE students 
                SET ${setParts.join(', ')}
                WHERE id = $${paramCount}
                RETURNING *
            `;
            
            console.log('Update query:', updateQuery);
            console.log('Update values:', values);
            
            try {
                await client.query(updateQuery, values);
            } catch (queryError) {
                console.error('Error executing update query:', queryError);
                console.error('Query:', updateQuery);
                console.error('Values:', values);
                throw queryError;
            }
        }
        
        // Обновляем историю стоимости, если она передана
        if (updateData.cost_date) {
            // Удаляем старые записи
            await client.query('DELETE FROM cost_dates WHERE student_id = $1', [id]);
            
            // Добавляем новые записи
            for (const costItem of updateData.cost_date) {
                const costQuery = `
                    INSERT INTO cost_dates (student_id, date, type)
                    VALUES ($1, $2, $3)
                `;
                await client.query(costQuery, [id, costItem.date, costItem.type]);
            }
        }
        
        await client.query('COMMIT');
        
        // Возвращаем обновленного студента
        const finalQuery = `
            SELECT s.id, s.user_id, s.name, s.current_cost, s.quantity_paid_lessons, 
                   s.birthday::text as birthday, s.comment, s.status_switch, s.created_at, s.updated_at,
                   COALESCE(
                       json_agg(
                           json_build_object(
                               'id', cd.id,
                               'date', cd.date,
                               'type', cd.type
                           )
                           ORDER BY cd.id
                       ) FILTER (WHERE cd.id IS NOT NULL), 
                       '[]'
                   ) as cost_date
            FROM students s
            LEFT JOIN cost_dates cd ON s.id = cd.student_id
            WHERE s.id = $1
            GROUP BY s.id, s.user_id, s.name, s.current_cost, s.quantity_paid_lessons, 
                     s.birthday, s.comment, s.status_switch, s.created_at, s.updated_at
        `;
        
        const result = await client.query(finalQuery, [id]);
        res.json(result.rows[0]);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating student:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
});

// DELETE /students/:id - удалить студента (только своего)
app.delete('/students/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query('DELETE FROM students WHERE id = $1 AND user_id = $2 RETURNING *', [id, req.user.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// LESSONS ENDPOINTS

// GET /lessons - получить уроки текущего пользователя с фильтрацией
app.get('/lessons', authenticateToken, async (req, res) => {
    try {
        const { date_like, student_id, date, _sort, _order, _limit, _start } = parseQueryParams(req);
        
        let query = `
            SELECT l.* 
            FROM lessons l
            JOIN students s ON l.student_id = s.id
            WHERE s.user_id = $1
        `;
        let params = [req.user.id];
        let conditions = [];
        let paramCount = 1;
        
        if (date_like) {
            paramCount++;
            conditions.push(`l.date LIKE $${paramCount}`);
            params.push(`%${date_like}%`);
        }
        
        if (student_id) {
            paramCount++;
            conditions.push(`l.student_id = $${paramCount}`);
            params.push(student_id);
        }
        
        if (date) {
            // Обработка множественных дат из URL параметров
            const dates = Array.isArray(date) ? date : [date];
            const dateConditions = [];
            for (const d of dates) {
                paramCount++;
                dateConditions.push(`l.date = $${paramCount}`);
                params.push(d);
            }
            if (dateConditions.length > 0) {
                conditions.push(`(${dateConditions.join(' OR ')})`);
            }
        }
        
        if (conditions.length > 0) {
            query += ` AND ${conditions.join(' AND ')}`;
        }
        
        if (_sort) {
            query += ` ORDER BY l.${_sort} ${_order ? _order.toUpperCase() : 'ASC'}`;
        }
        
        if (_limit) {
            paramCount++;
            query += ` LIMIT $${paramCount}`;
            params.push(parseInt(_limit));
        }
        
        if (_start) {
            paramCount++;
            query += ` OFFSET $${paramCount}`;
            params.push(parseInt(_start));
        }
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching lessons:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /lessons/:id - получить урок по ID (только свой)
app.get('/lessons/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT l.* 
            FROM lessons l
            JOIN students s ON l.student_id = s.id
            WHERE l.id = $1 AND s.user_id = $2
        `;
        
        const result = await pool.query(query, [id, req.user.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lesson not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching lesson:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /lessons - создать новый урок
app.post('/lessons', authenticateToken, async (req, res) => {
    try {
        const { student_id, date, lesson_type, note, cost } = req.body;
        
        // Проверяем, что студент принадлежит текущему пользователю
        const studentCheck = await pool.query('SELECT id FROM students WHERE id = $1 AND user_id = $2', [student_id, req.user.id]);
        
        if (studentCheck.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid student_id or student does not belong to current user' });
        }
        
        const query = `
            INSERT INTO lessons (student_id, date, lesson_type, note, cost)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        
        const result = await pool.query(query, [student_id, date, lesson_type, note, cost]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating lesson:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PATCH /lessons/:id - обновить урок (только свой)
app.patch('/lessons/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // Проверяем, что урок принадлежит текущему пользователю
        const ownershipCheck = await pool.query(`
            SELECT l.id 
            FROM lessons l
            JOIN students s ON l.student_id = s.id
            WHERE l.id = $1 AND s.user_id = $2
        `, [id, req.user.id]);
        
        if (ownershipCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Lesson not found' });
        }
        
        // Строим динамический запрос для обновления
        const setParts = [];
        const values = [];
        let paramCount = 0;
        
        for (const [key, value] of Object.entries(updateData)) {
            if (key !== 'id') {
                paramCount++;
                setParts.push(`${key} = $${paramCount}`);
                values.push(value);
            }
        }
        
        if (setParts.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        paramCount++;
        values.push(id);
        
        const query = `
            UPDATE lessons 
            SET ${setParts.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;
        
        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating lesson:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /lessons/:id - удалить урок (только свой)
app.delete('/lessons/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            DELETE FROM lessons 
            WHERE id = $1 AND student_id IN (
                SELECT id FROM students WHERE user_id = $2
            )
            RETURNING *
        `;
        
        const result = await pool.query(query, [id, req.user.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lesson not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error deleting lesson:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// STYLE ENDPOINTS

// GET /style - получить настройки стиля текущего пользователя
app.get('/style', authenticateToken, async (req, res) => {
    try {
        const { date } = req.query;
        
        let query = 'SELECT * FROM styles WHERE user_id = $1';
        let params = [req.user.id];
        
        if (date) {
            query += ' AND date = $2';
            params.push(date);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching styles:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /style/:id - получить стиль по ID (только свой)
app.get('/style/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query('SELECT * FROM styles WHERE id = $1 AND user_id = $2', [id, req.user.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Style not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching style:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /style - создать новую настройку стиля
app.post('/style', authenticateToken, async (req, res) => {
    try {
        const { date, styles } = req.body;
        
        console.log('Creating style with data:', { date, styles });
        console.log('req.body:', req.body);
        
        const query = `
            INSERT INTO styles (user_id, date, styles)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        
        const result = await pool.query(query, [req.user.id, date, JSON.stringify(styles)]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating style:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PATCH /style/:id - обновить настройку стиля (только свою)
app.patch('/style/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { date, styles } = req.body;
        
        console.log('Updating style with data:', { id, date, styles });
        console.log('req.body:', req.body);
        
        const setParts = [];
        const values = [];
        let paramCount = 0;
        
        if (date !== undefined) {
            paramCount++;
            setParts.push(`date = $${paramCount}`);
            values.push(date);
        }
        
        if (styles !== undefined) {
            paramCount++;
            setParts.push(`styles = $${paramCount}`);
            values.push(JSON.stringify(styles));
        }
        
        if (setParts.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        paramCount++;
        values.push(id);
        paramCount++;
        values.push(req.user.id);
        
        const query = `
            UPDATE styles 
            SET ${setParts.join(', ')}
            WHERE id = $${paramCount - 1} AND user_id = $${paramCount}
            RETURNING *
        `;
        
        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Style not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating style:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /style/:id - удалить настройку стиля (только свою)
app.delete('/style/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            DELETE FROM styles 
            WHERE id = $1 AND user_id = $2
            RETURNING *
        `;
        
        const result = await pool.query(query, [id, req.user.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Style not found' });
        }
        
        res.json({ message: 'Style deleted successfully', deleted: result.rows[0] });
    } catch (error) {
        console.error('Error deleting style:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// STATUS ENDPOINT (для проверки состояния сервера)
app.get('/status', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// DB ENDPOINT (для получения полного бэкапа пользователя - аналог json-server)
app.get('/db', authenticateToken, async (req, res) => {
    try {
        const studentsResult = await pool.query(`
            SELECT s.*, 
                   COALESCE(
                       json_agg(
                           json_build_object(
                               'id', cd.id,
                               'date', cd.date,
                               'type', cd.type
                           )
                           ORDER BY cd.id
                       ) FILTER (WHERE cd.id IS NOT NULL), 
                       '[]'
                   ) as cost_date
            FROM students s
            LEFT JOIN cost_dates cd ON s.id = cd.student_id
            WHERE s.user_id = $1
            GROUP BY s.id
            ORDER BY s.name
        `, [req.user.id]);
        
        const lessonsResult = await pool.query(`
            SELECT l.* 
            FROM lessons l
            JOIN students s ON l.student_id = s.id
            WHERE s.user_id = $1
            ORDER BY l.date, l.time_start
        `, [req.user.id]);
        
        const stylesResult = await pool.query('SELECT * FROM styles WHERE user_id = $1 ORDER BY date', [req.user.id]);
        
        res.json({
            students: studentsResult.rows,
            lessons: lessonsResult.rows,
            style: stylesResult.rows
        });
    } catch (error) {
        console.error('Error fetching database backup:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});