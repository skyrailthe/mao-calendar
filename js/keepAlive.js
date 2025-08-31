// Keep-alive механизм для поддержания приложения на Render в активном состоянии

class KeepAlive {
    constructor() {
        this.intervalId = null;
        this.isActive = false;
        this.pingInterval = 10 * 60 * 1000; // 10 минут
        this.init();
    }

    init() {
        // Запуск ping при загрузке страницы
        this.start();
        
        // Остановка только при закрытии/перезагрузке страницы
        window.addEventListener('beforeunload', () => {
            this.stop();
        });
    }

    start() {
        if (this.isActive) {
            return;
        }

        this.isActive = true;
        console.log('KeepAlive started');
        
        // Первый ping сразу
        this.ping();
        
        // Установка интервала
        this.intervalId = setInterval(() => {
            this.ping();
        }, this.pingInterval);
    }

    stop() {
        if (!this.isActive) {
            return;
        }

        this.isActive = false;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        console.log('KeepAlive stopped');
    }

    async ping() {
        try {
            const response = await fetch('/ping', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Ping successful:', data.timestamp);
            } else {
                console.warn('Ping failed with status:', response.status);
            }
        } catch (error) {
            console.error('Ping error:', error);
        }
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.keepAlive = new KeepAlive();
});