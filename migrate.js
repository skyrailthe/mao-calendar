const fs = require('fs');
const pool = require('./database');

// Создаем пользователя по умолчанию для миграции
const DEFAULT_USER = {
    username: 'admin',
    email: 'admin@example.com', 
    password: 'admin123'
};

async function createDefaultUser() {
    const bcrypt = require('bcrypt');
    
    try {
        // Проверяем, существует ли уже пользователь
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE username = $1 OR email = $2',
            [DEFAULT_USER.username, DEFAULT_USER.email]
        );
        
        if (existingUser.rows.length > 0) {
            console.log('Default user already exists, using existing user');
            return existingUser.rows[0].id;
        }
        
        // Хешируем пароль
        const passwordHash = await bcrypt.hash(DEFAULT_USER.password, 10);
        
        // Создаем пользователя
        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
            [DEFAULT_USER.username, DEFAULT_USER.email, passwordHash]
        );
        
        console.log(`Created default user: ${DEFAULT_USER.username}`);
        return result.rows[0].id;
    } catch (error) {
        console.error('Error creating default user:', error);
        throw error;
    }
}

async function migrateStudents(dbData, userId) {
    console.log('Migrating students...');
    
    const studentIdMap = new Map(); // Для сопоставления старых и новых ID
    
    for (const oldStudent of dbData.students) {
        try {
            const result = await pool.query(
                'INSERT INTO students (name, current_cost, quantity_paid_lessons, birthday, status_switch, comment, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
                [
                    oldStudent.name,
                    oldStudent.curent_cost || '0₴',
                    parseInt(oldStudent.quantity_paid_lessons || '0'),
                    oldStudent.birthday || null,
                    oldStudent.status_switch === 'true' ? 'true' : 'false',
                    oldStudent.comment || '',
                    userId
                ]
            );
            
            studentIdMap.set(oldStudent.id.toString(), result.rows[0].id);
            console.log(`Migrated student: ${oldStudent.name} (old ID: ${oldStudent.id} -> new ID: ${result.rows[0].id})`);
        } catch (error) {
            console.error(`Error migrating student ${oldStudent.name}:`, error);
        }
    }
    
    return studentIdMap;
}

async function migrateLessons(dbData, userId, studentIdMap) {
    console.log('Migrating lessons...');
    
    for (const oldLesson of dbData.lessons) {
        try {
            // Преобразуем старый формат даты в новый
            const oldDate = oldLesson.date; // "11_01_2023_16:00" или "04_02_2023_після 15"
            const parts = oldDate.split('_');
            
            // Проверяем корректность формата даты
            if (parts.length < 3) {
                console.warn(`Invalid date format: ${oldDate}, skipping lesson`);
                continue;
            }
            
            const [day, month, year, ...timeParts] = parts;
            let time = '00:00';
            
            // Обрабатываем время - берем только первую часть если есть
            if (timeParts.length > 0) {
                const timeStr = timeParts[0];
                // Проверяем, что время в формате HH:MM
                if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
                    time = timeStr;
                } else if (/^\d{1,2}$/.test(timeStr)) {
                    time = `${timeStr.padStart(2, '0')}:00`;
                }
            }
            
            // Оставляем дату в старом формате как было
            const formattedDate = `${day.padStart(2, '0')}_${month.padStart(2, '0')}_${year}_${time}`;
            
            // Получаем новый ID студента
            const newStudentId = studentIdMap.get(oldLesson.student_id.toString());
            if (!newStudentId) {
                console.warn(`Student ID ${oldLesson.student_id} not found, skipping lesson`);
                continue;
            }
            
            // Конвертируем тип занятия: в старой системе нумерация с 0, в новой с 1
            let lessonType = '2'; // По умолчанию "Scheduled"
            if (oldLesson.type !== undefined && oldLesson.type !== null && oldLesson.type !== '') {
                lessonType = (parseInt(oldLesson.type) + 1).toString();
            }
            
            await pool.query(
                'INSERT INTO lessons (student_id, date, lesson_type, cost, note) VALUES ($1, $2, $3, $4, $5)',
                [
                    newStudentId,
                    formattedDate,
                    lessonType,
                    oldLesson.cost || '0₴',
                    oldLesson.comment || ''
                ]
            );
            
            console.log(`Migrated lesson for student ID ${newStudentId} on ${formattedDate}`);
        } catch (error) {
            console.error(`Error migrating lesson:`, error, oldLesson);
        }
    }
}

async function migrateStyles(dbData, userId) {
    console.log('Migrating styles...');
    
    for (const oldStyle of dbData.style) {
        try {
            // Преобразуем старый формат даты "01_2023" в новый "01_2023"
            const styleData = {
                calendar_light_color: oldStyle.calendar_light_color || '#c4cffd',
                calendar_dark_color: oldStyle.calendar_dark_color || '#a9a3ff',
                current_day_dark_color: oldStyle.curent_day_dark_color || '#3392fb',
                current_day_light_color: oldStyle.curent_day_light_color || '#ffffff',
                current_day_text_color: oldStyle.curent_day_text_color || '#000000',
                behind_table_color_background: oldStyle.behind_table_color_background || '#ffffff',
                top_panel_text_color: oldStyle.top_panel_text_color || '#000000',
                table_color_background: oldStyle.table_color_background || '#ffffff',
                background_month_picture_link: oldStyle.background_month_picture_link || '',
                background_month_picture_size: oldStyle.background_month_picture_size || 'cover',
                background_month_picture_position: oldStyle.background_month_picture_position || 'center',
                background_month_picture_repeat: oldStyle.background_month_picture_repeat || 'no-repeat',
                color_name_of_month: oldStyle.color_name_of_month || '#000000',
                text_color_head_of_table: oldStyle.text_color_head_of_table || '#000000',
                text_color_body_of_table: oldStyle.text_color_body_of_table || '#000000',
                background_picture_link: oldStyle.background_picture_link || '',
                background_picture_size: oldStyle.background_picture_size || '200px',
                background_picture_position: oldStyle.background_picture_position || 'none',
                background_picture_repeat: oldStyle.background_picture_repeat || 'repeat'
            };
            
            await pool.query(
                'INSERT INTO styles (date, styles, user_id) VALUES ($1, $2, $3)',
                [
                    oldStyle.date,
                    JSON.stringify(styleData),
                    userId
                ]
            );
            
            console.log(`Migrated style for date: ${oldStyle.date}`);
        } catch (error) {
            console.error(`Error migrating style:`, error, oldStyle);
        }
    }
}

async function migrateCostDates(dbData, studentIdMap) {
    console.log('Migrating cost dates...');
    
    for (const oldStudent of dbData.students) {
        if (oldStudent.cost_date && Array.isArray(oldStudent.cost_date)) {
            const newStudentId = studentIdMap.get(oldStudent.id.toString());
            if (!newStudentId) {
                console.warn(`Student ID ${oldStudent.id} not found, skipping cost dates`);
                continue;
            }
            
            for (const costDate of oldStudent.cost_date) {
                try {
                    await pool.query(
                        'INSERT INTO cost_dates (student_id, date, type) VALUES ($1, $2, $3)',
                        [
                            newStudentId,
                            costDate.date,
                            costDate.type
                        ]
                    );
                    
                    console.log(`Migrated cost date for student ID ${newStudentId}: ${costDate.date} (${costDate.type})`);
                } catch (error) {
                    console.error(`Error migrating cost date:`, error, costDate);
                }
            }
        }
    }
}

async function migrate() {
    try {
        console.log('Starting migration from db.json to PostgreSQL...');
        
        // Читаем данные из db.json
        const jsonData = fs.readFileSync('./db.json', 'utf8');
        const dbData = JSON.parse(jsonData);
        
        console.log(`Found ${dbData.students?.length || 0} students`);
        console.log(`Found ${dbData.lessons?.length || 0} lessons`);
        console.log(`Found ${dbData.style?.length || 0} styles`);
        console.log(`Found cost_date data in students`);
        
        // Создаем пользователя по умолчанию
        const userId = await createDefaultUser();
        
        // Мигрируем данные
        const studentIdMap = await migrateStudents(dbData, userId);
        await migrateLessons(dbData, userId, studentIdMap);
        await migrateStyles(dbData, userId);
        await migrateCostDates(dbData, studentIdMap);
        
        console.log('Migration completed successfully!');
        console.log(`\nDefault user credentials:`);
        console.log(`Username: ${DEFAULT_USER.username}`);
        console.log(`Password: ${DEFAULT_USER.password}`);
        
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
}

// Запускаем миграцию
migrate();