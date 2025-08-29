# Business Calendar Backend

Backend сервер для приложения бизнес-календаря с поддержкой PostgreSQL.

## Установка и настройка

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка базы данных

#### Для Neon PostgreSQL (облачная БД):
```bash
# Выполнить SQL скрипт для создания таблиц
# Подключиться к Neon через psql или выполнить через их веб-интерфейс
psql -h your-neon-host -d neondb -U neondb_owner -f schema_neon.sql
```

#### Для локальной PostgreSQL:
```bash
# Подключиться к PostgreSQL
psql -U postgres

# Выполнить SQL скрипт
\i schema.sql
```

### 3. Настройка переменных окружения

Файл `.env` уже настроен для Neon PostgreSQL:
```env
# PostgreSQL Configuration (Neon)
PGHOST='your-neon-host'
PGDATABASE='neondb'
PGUSER='neondb_owner'
PGPASSWORD='your-password'
PGSSLMODE='require'
PGCHANNELBINDING='require'

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d
```

### 4. Запуск сервера

Для разработки:
```bash
npm run dev
```

Для продакшена:
```bash
npm start
```

## Для фронтенда (статические файлы)
Если нужно запустить только фронтенд локально:
```bash
# Запустить сервер http-server
http-server

# Ctrl + C остановить сервер
```

## API Endpoints

### Студенты
- `GET /students` - получить всех студентов
- `GET /students/:id` - получить студента по ID
- `POST /students` - создать студента
- `PATCH /students/:id` - обновить студента
- `DELETE /students/:id` - удалить студента

### Уроки
- `GET /lessons` - получить уроки
- `GET /lessons/:id` - получить урок по ID
- `POST /lessons` - создать урок
- `PATCH /lessons/:id` - обновить урок
- `DELETE /lessons/:id` - удалить урок

### Стили
- `GET /style` - получить настройки стиля
- `GET /style/:id` - получить стиль по ID
- `POST /style` - создать настройки стиля
- `PATCH /style/:id` - обновить настройки стиля

### Служебные
- `GET /status` - проверка состояния сервера
- `GET /db` - получить полный бэкап данных

## Поддерживаемые параметры запросов

- `q` - поиск по тексту
- `date_like` - фильтр по дате (частичное совпадение)
- `student_id` - фильтр по ID студента
- `date` - точное совпадение по дате
- `_sort` - сортировка по полю
- `_order` - порядок сортировки (asc/desc)
- `_limit` - лимит результатов
- `_start` - смещение для пагинации

## Миграция данных

Для миграции данных из JSON файла в PostgreSQL можно использовать отдельный скрипт или импортировать данные через API endpoints.