// Дополнительные функции для обновленного приложения с авторизацией

// Функции для управления формами
function showLoginForm() {
    const loginContainer = document.getElementById('auth_login_container');
    const registerContainer = document.getElementById('auth_register_container');
    const userContainer = document.getElementById('auth_user_container');
    
    if (loginContainer) loginContainer.style.display = 'flex';
    if (registerContainer) registerContainer.style.display = 'none';
    if (userContainer) userContainer.style.display = 'none';
    
    hideMessages();
}

function showRegisterForm() {
    const loginContainer = document.getElementById('auth_login_container');
    const registerContainer = document.getElementById('auth_register_container');
    const userContainer = document.getElementById('auth_user_container');
    
    if (loginContainer) loginContainer.style.display = 'none';
    if (registerContainer) registerContainer.style.display = 'flex';
    if (userContainer) userContainer.style.display = 'none';
    
    hideMessages();
}


function hideMessages() {
    const errorMessage = document.getElementById('error_message');
    const successMessage = document.getElementById('success_message');
    
    if (errorMessage) errorMessage.style.display = 'none';
    if (successMessage) successMessage.style.display = 'none';
}

function showError(message) {
    const errorMessage = document.getElementById('error_message');
    const successMessage = document.getElementById('success_message');
    
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
    if (successMessage) successMessage.style.display = 'none';
}

function showSuccess(message) {
    const successMessage = document.getElementById('success_message');
    const errorMessage = document.getElementById('error_message');
    
    if (successMessage) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
    }
    if (errorMessage) errorMessage.style.display = 'none';
}

// Функция для добавления обработчиков событий к формам авторизации
function addAuthFormEventListeners() {
    const loginPassword = document.getElementById('login_password');
    if (loginPassword) {
        loginPassword.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                loginUser();
            }
        });
    }
    
    const registerPasswordConfirm = document.getElementById('register_password_confirm');
    if (registerPasswordConfirm) {
        registerPasswordConfirm.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                registerUser();
            }
        });
    }
}

// Проверяем авторизацию при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Всегда показываем фон входа при загрузке
    document.querySelector('.login-background').style.display = 'block';
    
    // Проверяем, авторизован ли пользователь
    if (Auth.isAuthenticated()) {
        const user = Auth.getUser();
        if (user) {
            // Скрываем фон входа
            document.querySelector('.login-background').style.display = 'none';
            
            // Показываем анимацию загрузки
            loading_animation();
            
            // Запускаем приложение
            setTimeout(() => {
                Start_onload();
                updateUserProfile(); // Обновляем информацию в профиле
            }, 500);
        }
    } else {
        // Показываем форму входа
        showLoginForm();
    }
    
    // Добавляем обработчики Enter для форм
    addAuthFormEventListeners();
});

// Функция входа
async function loginUser() {
    hideMessages();
    
    const username = document.getElementById('login_username').value;
    const password = document.getElementById('login_password').value;
    
    if (!username || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    const loginBtn = document.getElementById('login_button');
    loginBtn.textContent = 'Logging in...';
    loginBtn.disabled = true;
    
    try {
        const response = await Auth.apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        if (response && response.ok) {
            const data = await response.json();
            
            Auth.setToken(data.token);
            Auth.setUser(data.user);
            
            // Скрываем фон входа
            document.querySelector('.login-background').style.display = 'none';
            
            // Показываем анимацию загрузки
            loading_animation();
            
            // Очищаем календарь и инициализируем заново
            setTimeout(() => {
                document.getElementById('calendar').innerHTML = '';
                Start_onload();
            }, 500);
        } else {
            const errorData = await response.json();
            showError(errorData.error || 'Ошибка входа');
        }
    } catch (error) {
        showError('Ошибка подключения к серверу');
        console.error('Login error:', error);
    } finally {
        loginBtn.textContent = 'Login';
        loginBtn.disabled = false;
    }
}

// Функция регистрации
async function registerUser() {
    hideMessages();
    
    const username = document.getElementById('register_username').value;
    const email = document.getElementById('register_email').value;
    const birthday = document.getElementById('register_birthday').value;
    const password = document.getElementById('register_password').value;
    const confirmPassword = document.getElementById('register_password_confirm').value;
    
    if (!username || !email || !password || !confirmPassword) {
        showError('Please fill in all required fields');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    const registerBtn = document.getElementById('register_button');
    registerBtn.textContent = 'Registering...';
    registerBtn.disabled = true;
    
    try {
        const response = await Auth.apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ 
                username, 
                email, 
                password,
                birthday: birthday || null
            })
        });
        
        if (response && response.ok) {
            const data = await response.json();
            
            Auth.setToken(data.token);
            Auth.setUser(data.user);
            
            // Скрываем фон входа
            document.querySelector('.login-background').style.display = 'none';
            
            // Показываем анимацию загрузки
            loading_animation();
            
            // Очищаем календарь и инициализируем заново
            setTimeout(() => {
                document.getElementById('calendar').innerHTML = '';
                Start_onload();
            }, 500);
        } else {
            const errorData = await response.json();
            showError(errorData.error || 'Ошибка регистрации');
        }
    } catch (error) {
        showError('Ошибка подключения к серверу');
        console.error('Registration error:', error);
    } finally {
        registerBtn.textContent = 'Register';
        registerBtn.disabled = false;
    }
}

// Функция выхода
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        Auth.removeToken();
        // Перезагружаем страницу - это автоматически покажет формы входа
        window.location.reload();
    }
}

// Функция обновления информации пользователя в профиле
function updateUserProfile() {
    const user = Auth.getUser();
    if (user) {
        const userElement = document.getElementById('current_user');
        const birthdayElement = document.getElementById('user_birthday');
        
        if (userElement) {
            userElement.textContent = user.username;
        }
        
        if (birthdayElement) {
            if (user.birthday) {
                const birthday = new Date(user.birthday);
                birthdayElement.textContent = `Birthday: ${birthday.toLocaleDateString()}`;
            } else {
                birthdayElement.textContent = '';
            }
        }
    }
}

// Функция показа профиля
function showProfile() {
    const user = Auth.getUser();
    if (user) {
        document.getElementById("ModalLabel").textContent = "User Profile";
        showProfileView(user);
        
        $('#myModal').modal('show');
    }
}

// Функция отображения профиля в режиме просмотра
function showProfileView(user) {
    document.getElementById("ModalBody").innerHTML = `
        <div class="profile-info">
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Birthday:</strong> ${user.birthday ? new Date(user.birthday).toLocaleDateString() : 'Not specified'}</p>
            <p><strong>Registration Date:</strong> ${user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Not available'}</p>
        </div>
    `;
    document.getElementById("ModalFooter").innerHTML = `
        <button type="button" class="btn btn-primary" onclick="showProfileEdit()">Edit</button>
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
    `;
}

// Функция отображения профиля в режиме редактирования
function showProfileEdit() {
    const user = Auth.getUser();
    if (user) {
        document.getElementById("ModalBody").innerHTML = `
            <div class="profile-edit">
                <div class="mb-3">
                    <label for="edit_username" class="form-label">Username:</label>
                    <input type="text" class="form-control" id="edit_username" value="${user.username}">
                </div>
                <div class="mb-3">
                    <label for="edit_email" class="form-label">Email:</label>
                    <input type="email" class="form-control" id="edit_email" value="${user.email}">
                </div>
                <div class="mb-3">
                    <label for="edit_birthday" class="form-label">Birthday:</label>
                    <input type="date" class="form-control" id="edit_birthday" value="${user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : ''}">
                </div>
                <div class="mb-3">
                    <label for="edit_password" class="form-label">New Password (leave empty to keep current):</label>
                    <input type="password" class="form-control" id="edit_password" placeholder="Enter new password">
                </div>
                <div class="mb-3">
                    <label for="edit_password_confirm" class="form-label">Confirm New Password:</label>
                    <input type="password" class="form-control" id="edit_password_confirm" placeholder="Confirm new password">
                </div>
            </div>
        `;
        document.getElementById("ModalFooter").innerHTML = `
            <button type="button" class="btn btn-success" onclick="saveProfile()">Save</button>
            <button type="button" class="btn btn-secondary" onclick="showProfile()">Cancel</button>
        `;
    }
}

// Функция сохранения профиля
async function saveProfile() {
    const username = document.getElementById('edit_username').value;
    const email = document.getElementById('edit_email').value;
    const birthday = document.getElementById('edit_birthday').value;
    const password = document.getElementById('edit_password').value;
    const confirmPassword = document.getElementById('edit_password_confirm').value;

    if (!username || !email) {
        showError('Username and email are required');
        return;
    }

    if (password && password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }

    try {
        const updateData = {
            username,
            email,
            birthday: birthday || null
        };

        if (password) {
            updateData.password = password;
        }

        const response = await Auth.apiRequest('/auth/profile', {
            method: 'PATCH',
            body: JSON.stringify(updateData)
        });

        if (response && response.ok) {
            const data = await response.json();
            Auth.setUser(data.user);
            
            showSuccess('Profile updated successfully');
            
            // Возвращаемся к просмотру профиля
            setTimeout(() => {
                showProfileView(data.user);
                updateUserProfile(); // Обновляем отображение в верхней части
            }, 1000);
        } else {
            const errorData = await response.json();
            showError(errorData.error || 'Failed to update profile');
        }
    } catch (error) {
        showError('Error connecting to server');
        console.error('Profile update error:', error);
    }
}

// Переопределяем старую функцию password_check для совместимости
function password_check() {
    // Эта функция больше не используется, но оставляем для совместимости
    console.warn('password_check() is deprecated. Use authentication system instead.');
}

// Переопределяем старые функции получения данных для работы с новым API
window.funct_get_data = function() {
    return new Promise(async (resolve, reject) => {
        try {
            const params = `?q=${number_month_of_calendar}_${number_year_of_calendar}&_sort=name&_order=asc`;
            const data = await fetchStudents(params);
            json_data = data; // Сохраняем в глобальную переменную для совместимости
            resolve(data);
        } catch (error) {
            console.error('funct_get_data: Error fetching students:', error);
            json_data = []; // Пустой массив при ошибке
            reject(error);
        }
    });
};

window.funct_get_lessons = function() {
    return new Promise(async (resolve, reject) => {
        try {
            const params = `?date_like=${number_month_of_calendar}_${number_year_of_calendar}`;
            const data = await fetchLessons(params);
            json_lessons = data; // Сохраняем в глобальную переменную для совместимости
            resolve(data);
        } catch (error) {
            console.error('funct_get_lessons: Error fetching lessons:', error);
            json_lessons = []; // Пустой массив при ошибке
            reject(error);
        }
    });
};

window.funct_get_style = function() {
    return new Promise(async (resolve, reject) => {
        try {
            const params = `?date=${number_month_of_calendar}_${number_year_of_calendar}`;
            const data = await fetchStyles(params);
            json_color_style = data; // Сохраняем в глобальную переменную для совместимости
            resolve(data);
        } catch (error) {
            console.error('Error fetching styles:', error);
            json_color_style = []; // Пустой массив при ошибке
            reject(error);
        }
    });
};

// Обновляем старые функции для работы с новым API

// Функция для получения студентов (обновленная версия)
async function getStudentsData() {
    try {
        const params = `?q=${number_month_of_calendar}_${number_year_of_calendar}&_sort=name&_order=asc`;
        return await fetchStudents(params);
    } catch (error) {
        console.error('Error fetching students:', error);
        return [];
    }
}

// Функция для получения уроков (обновленная версия) 
async function getLessonsData() {
    try {
        const params = `?date_like=${number_month_of_calendar}_${number_year_of_calendar}`;
        return await fetchLessons(params);
    } catch (error) {
        console.error('Error fetching lessons:', error);
        return [];
    }
}

// Функция для получения настроек стиля (обновленная версия)
async function getStyleData() {
    try {
        const params = `?date=${number_month_of_calendar}_${number_year_of_calendar}`;
        return await fetchStyles(params);
    } catch (error) {
        console.error('Error fetching styles:', error);
        return [];
    }
}

// Обновленная функция для удаления студента
async function deleteStudentNew(studentId) {
    try {
        modal_loading_animation();
        
        // Получаем все уроки студента
        const lessons = await fetchLessons(`?student_id=${studentId}`);
        
        if (lessons.length > 0) {
            // Удаляем все уроки студента
            for (const lesson of lessons) {
                await deleteLesson(lesson.id);
            }
        }
        
        // Удаляем студента
        await deleteStudent(studentId);
        
        // Перезагружаем календарь
        Start_onload();
        $('#myModal').modal('hide');
        
        return true;
    } catch (error) {
        console.error('Error deleting student:', error);
        alert('Error deleting student');
        return false;
    }
}

// Обновленная функция для создания студента
async function createStudentNew(studentData) {
    try {
        modal_loading_animation();
        
        const newStudent = await createStudent(studentData);
        
        // Перезагружаем календарь
        Start_onload();
        $('#myModal').modal('hide');
        
        return newStudent;
    } catch (error) {
        console.error('Error creating student:', error);
        alert('Error creating student');
        throw error;
    }
}

// Обновленная функция для обновления студента
async function updateStudentNew(studentId, studentData) {
    try {
        modal_loading_animation();
        
        const updatedStudent = await updateStudent(studentId, studentData);
        
        // Перезагружаем календарь
        Start_onload();
        $('#myModal').modal('hide');
        
        return updatedStudent;
    } catch (error) {
        console.error('Error updating student:', error);
        alert('Error updating student');
        throw error;
    }
}

// Обновленная функция для создания урока
async function createLessonNew(lessonData) {
    try {
        modal_loading_animation();
        
        const newLesson = await createLesson(lessonData);
        
        // Перезагружаем календарь
        Start_onload();
        $('#myModal').modal('hide');
        
        return newLesson;
    } catch (error) {
        console.error('Error creating lesson:', error);
        alert('Error creating lesson');
        throw error;
    }
}

// Обновленная функция для обновления урока
async function updateLessonNew(lessonId, lessonData) {
    try {
        modal_loading_animation();
        
        const updatedLesson = await updateLesson(lessonId, lessonData);
        
        // Перезагружаем календарь
        Start_onload();
        $('#myModal').modal('hide');
        
        return updatedLesson;
    } catch (error) {
        console.error('Error updating lesson:', error);
        alert('Error updating lesson');
        throw error;
    }
}

// Обновленная функция для удаления урока
async function deleteLessonNew(lessonId) {
    try {
        modal_loading_animation();
        
        await deleteLesson(lessonId);
        
        // Перезагружаем календарь
        Start_onload();
        $('#myModal').modal('hide');
        
        return true;
    } catch (error) {
        console.error('Error deleting lesson:', error);
        alert('Error deleting lesson');
        return false;
    }
}

// Обновленная функция для сохранения настроек стиля
async function saveStyleNew(styleData) {
    try {
        modal_loading_animation();
        
        const newStyle = await createStyle({
            date: `${number_month_of_calendar}_${number_year_of_calendar}`,
            styles: styleData
        });
        
        // Перезагружаем календарь
        Start_onload();
        $('#myModal').modal('hide');
        
        return newStyle;
    } catch (error) {
        console.error('Error saving style:', error);
        alert('Error saving style');
        throw error;
    }
}

// Функция для проверки статуса сервера
async function checkServerStatusNew() {
    try {
        const status = await checkServerStatus();
        return status && status.status === 'OK';
    } catch (error) {
        console.error('Server status check failed:', error);
        return false;
    }
}