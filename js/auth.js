// Модуль для работы с авторизацией
const API_URL = window.location.origin; // Автоматически использует текущий домен

// Утилиты для работы с токеном
const Auth = {
    // Получить токен из localStorage
    getToken() {
        return localStorage.getItem('token');
    },
    
    // Сохранить токен в localStorage
    setToken(token) {
        localStorage.setItem('token', token);
    },
    
    // Удалить токен из localStorage
    removeToken() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    
    // Получить данные пользователя
    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    
    // Сохранить данные пользователя
    setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    },
    
    // Проверить, авторизован ли пользователь
    isAuthenticated() {
        return !!this.getToken();
    },
    
    // Получить заголовки с авторизацией
    getAuthHeaders() {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    },
    
    // Выполнить API запрос с авторизацией
    async apiRequest(url, options = {}) {
        const config = {
            ...options,
            headers: {
                ...this.getAuthHeaders(),
                ...options.headers
            }
        };
        
        try {
            const response = await fetch(`${API_URL}${url}`, config);
            
            // Если токен невалидный, перенаправляем на страницу входа
            if (response.status === 401 || response.status === 403) {
                console.log('Unauthorized, logging out...');
                this.logout();
                return null;
            }
            
            return response;
        } catch (error) {
            console.error('API Request error:', error);
            throw error;
        }
    },
    
    // Выход из системы
    logout() {
        this.removeToken();
        // Перезагружаем текущую страницу вместо редиректа на login.html
        window.location.reload();
    },
    
    // Проверить авторизацию на странице
    checkAuth() {
        if (!this.isAuthenticated()) {
            // Показываем форму входа вместо редиректа
            if (typeof showLoginForm === 'function') {
                showLoginForm();
            }
        }
    }
};

// Обновленные функции для работы с API
async function fetchStudents(params = '') {
    try {
        const response = await Auth.apiRequest(`/students${params}`);
        if (response && response.ok) {
            return await response.json();
        } else if (response) {
            const errorText = await response.text();
            console.error('fetchStudents error response:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        } else {
            throw new Error('No response received from server');
        }
    } catch (error) {
        console.error('fetchStudents failed:', error);
        throw error;
    }
}

async function fetchStudent(id) {
    const response = await Auth.apiRequest(`/students/${id}`);
    if (response && response.ok) {
        return await response.json();
    }
    return null;
}

async function createStudent(studentData) {
    const response = await Auth.apiRequest('/students', {
        method: 'POST',
        body: JSON.stringify(studentData)
    });
    if (response && response.ok) {
        return await response.json();
    }
    throw new Error('Failed to create student');
}

async function updateStudent(id, studentData) {
    const response = await Auth.apiRequest(`/students/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(studentData)
    });
    if (response && response.ok) {
        return await response.json();
    }
    throw new Error('Failed to update student');
}

async function deleteStudent(id) {
    const response = await Auth.apiRequest(`/students/${id}`, {
        method: 'DELETE'
    });
    if (response && response.ok) {
        return await response.json();
    }
    throw new Error('Failed to delete student');
}

async function fetchLessons(params = '') {
    try {
        const response = await Auth.apiRequest(`/lessons${params}`);
        if (response && response.ok) {
            return await response.json();
        } else if (response) {
            const errorText = await response.text();
            console.error('fetchLessons error response:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        } else {
            throw new Error('No response received from server');
        }
    } catch (error) {
        console.error('fetchLessons failed:', error);
        throw error;
    }
}

async function fetchLesson(id) {
    const response = await Auth.apiRequest(`/lessons/${id}`);
    if (response && response.ok) {
        return await response.json();
    }
    return null;
}

async function createLesson(lessonData) {
    const response = await Auth.apiRequest('/lessons', {
        method: 'POST',
        body: JSON.stringify(lessonData)
    });
    if (response && response.ok) {
        return await response.json();
    }
    throw new Error('Failed to create lesson');
}

async function updateLesson(id, lessonData) {
    const response = await Auth.apiRequest(`/lessons/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(lessonData)
    });
    if (response && response.ok) {
        return await response.json();
    }
    throw new Error('Failed to update lesson');
}

async function deleteLesson(id) {
    const response = await Auth.apiRequest(`/lessons/${id}`, {
        method: 'DELETE'
    });
    if (response && response.ok) {
        return await response.json();
    }
    throw new Error('Failed to delete lesson');
}

async function fetchStyles(params = '') {
    const response = await Auth.apiRequest(`/style${params}`);
    if (response && response.ok) {
        return await response.json();
    }
    return [];
}

async function createStyle(styleData) {
    const response = await Auth.apiRequest('/style', {
        method: 'POST',
        body: JSON.stringify(styleData)
    });
    if (response && response.ok) {
        return await response.json();
    }
    throw new Error('Failed to create style');
}

async function updateStyle(id, styleData) {
    const response = await Auth.apiRequest(`/style/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(styleData)
    });
    if (response && response.ok) {
        return await response.json();
    }
    throw new Error('Failed to update style');
}

async function deleteStyle(id) {
    const response = await Auth.apiRequest(`/style/${id}`, {
        method: 'DELETE'
    });
    if (response && response.ok) {
        return await response.json();
    }
    throw new Error('Failed to delete style');
}

async function fetchDatabase() {
    const response = await Auth.apiRequest('/db');
    if (response && response.ok) {
        return await response.json();
    }
    return { students: [], lessons: [], style: [] };
}

async function checkServerStatus() {
    const response = await Auth.apiRequest('/status');
    if (response && response.ok) {
        return await response.json();
    }
    return null;
}