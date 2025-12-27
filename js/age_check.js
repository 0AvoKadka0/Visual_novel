// Проверка возраста и безопасность
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, не прошло ли слишком много времени с последней проверки
    const verifyTime = localStorage.getItem('ageVerifyTime');
    const currentTime = Date.now();
    
    // Если прошло больше 30 дней, снова спрашиваем возраст
    if (verifyTime && (currentTime - parseInt(verifyTime)) > 30 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem('detectiveAgeVerified');
        localStorage.removeItem('ageVerifyTime');
    }
    
    // Защита от обхода проверки через DevTools
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    const originalClear = localStorage.clear;
    
    localStorage.setItem = function(key, value) {
        if (key === 'detectiveAgeVerified' && value !== 'true') {
            console.warn('Попытка изменить возрастную проверку отклонена');
            return;
        }
        originalSetItem.call(this, key, value);
    };
    
    localStorage.removeItem = function(key) {
        if (key === 'detectiveAgeVerified' || key === 'ageVerifyTime') {
            if (!confirm('Удаление этих данных потребует повторной возрастной проверки. Продолжить?')) {
                return;
            }
        }
        originalRemoveItem.call(this, key);
    };
    
    localStorage.clear = function() {
        if (!confirm('Очистка всех данных потребует повторной возрастной проверки. Продолжить?')) {
            return;
        }
        originalClear.call(this);
        location.reload();
    };
    
    // Предотвращаем копирование и вставку в поля возраста
    document.addEventListener('paste', function(e) {
        if (e.target.id === 'age-input') {
            e.preventDefault();
        }
    });
    
    // Логируем попытки обхода
    const originalConsole = console.log;
    console.log = function(...args) {
        if (args.some(arg => 
            typeof arg === 'string' && 
            arg.toLowerCase().includes('age') &&
            arg.toLowerCase().includes('bypass'))) {
            console.warn('Обнаружена попытка обхода возрастной проверки');
        }
        originalConsole.apply(console, args);
    };
});