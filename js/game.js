// game.js - движок визуальной новеллы

// Класс для управления игрой
class DetectiveGame {
    constructor() {
        this.initState();
        this.initElements();
        this.initGameData();
        this.bindEvents();
        this.startGame();
    }
    
    initState() {
        this.state = {
            currentScene: 'intro',
            hero: localStorage.getItem('detectiveCharacter') === 'male' ? 'alexey' : 'veronika',
            heroName: JSON.parse(localStorage.getItem('detectiveCharacterData'))?.name || 'Детектив',
            stats: {
                напор: 0,
                дипломатия: 0,
                цинизм: 0,
                рациональность: 0,
                восприимчивость: 0
            },
            choices: [],
            time: 'day',
            location: 'chernoborsk',
            textSpeed: 5,
            autoMode: false,
            autoSpeed: 0,
            musicVolume: 50,
            sfxVolume: 70,
            textTimer: null,
            isTyping: false,
            currentText: '',
            textIndex: 0
        };
        
        // Начальные характеристики
        if (this.state.hero === 'alexey') {
            this.state.stats.напор = 2;
            this.state.stats.рациональность = 2;
        } else {
            this.state.stats.дипломатия = 2;
            this.state.stats.восприимчивость = 2;
        }
    }
    
    initElements() {
        this.elements = {
            // Основные
            loadingScreen: document.getElementById('loading-screen'),
            gameScreen: document.getElementById('game-screen'),
            
            // Фон и спрайты
            sceneBg: document.getElementById('scene-bg'),
            spritesContainer: document.getElementById('sprites-container'),
            
            // Текст
            textWindow: document.getElementById('text-window'),
            characterName: document.getElementById('character-name'),
            textContent: document.getElementById('text-content'),
            
            // Выбор
            choicesWindow: document.getElementById('choices-window'),
            choicesContainer: document.getElementById('choices-container'),
            
            // Информация
            sceneInfoWindow: document.getElementById('scene-info-window'),
            sceneTitle: document.getElementById('scene-title'),
            sceneDescription: document.getElementById('scene-description'),
            timeDisplay: document.getElementById('time-display'),
            locationDisplay: document.getElementById('location-display'),
            
            // Кнопки
            skipBtn: document.getElementById('skip-btn'),
            autoBtn: document.getElementById('auto-btn'),
            saveBtn: document.getElementById('save-btn'),
            loadBtn: document.getElementById('load-btn'),
            settingsBtn: document.getElementById('settings-btn'),
            menuBtn: document.getElementById('menu-btn'),
            
            // Меню
            pauseMenu: document.getElementById('pause-menu'),
            resumeBtn: document.getElementById('resume-btn'),
            saveMenuBtn: document.getElementById('save-menu-btn'),
            loadMenuBtn: document.getElementById('load-menu-btn'),
            mainMenuBtn: document.getElementById('main-menu-btn'),
            settingsMenu: document.getElementById('settings-menu'),
            settingsBack: document.getElementById('settings-back'),
            settingsMenuBtn: document.getElementById('settings-menu-btn'),
            
            // Настройки
            musicVolume: document.getElementById('music-volume'),
            sfxVolume: document.getElementById('sfx-volume'),
            textSpeed: document.getElementById('text-speed'),
            autoSpeed: document.getElementById('auto-speed')
        };
    }
    
    initGameData() {
        this.characters = {
            alexey: {
                name: 'Алексей Новиков',
                sprite: 'assets/characters/alexey_novikov.png',
                color: '#aaa'
            },
            veronika: {
                name: 'Вероника Смирнова',
                sprite: 'assets/characters/veronika_smirnova.png',
                color: '#aaa'
            }
        };
        
        this.scenes = {
            intro: {
                id: 'intro',
                background: 'assets/locations/chernoborsk_bus_station.jpg',
                text: '',
                title: 'ЧЕРНОБОРСК. Автовокзал.',
                description: 'Холодный осенний ветер бьёт в лицо, когда вы выходите из автобуса. Автовокзал «Черноборск» — унылое одноэтажное здание из жёлтого кирпича с потухшей вывеской.',
                next: 'scene1',
                choices: []
            },
            
            scene1: {
                id: 'scene1',
                background: 'assets/locations/chernoborsk_bus_station.jpg',
                text: 'Вокруг — запах мокрого асфальта и дизеля. Лес стоит стеной, будто наблюдает за вами.',
                next: 'scene1_choice',
                choices: []
            },
            
            scene1_choice: {
                id: 'scene1_choice',
                background: 'assets/locations/chernoborsk_bus_station.jpg',
                text: '',
                choices: [
                    {
                        text: '«Добро пожаловать в ад». Потянуться за сигаретой.',
                        effects: { цинизм: 1 },
                        next: 'scene2'
                    },
                    {
                        text: 'Осмотреться. Заметить детали: отваливающуюся краску, пустую пачку «Беломора», одинокую лампочку под навесом.',
                        effects: { рациональность: 1 },
                        next: 'scene2'
                    },
                    {
                        text: 'Почувствовать озноб. Не от ветра — от места. Будто кто-то смотрит в спину.',
                        effects: { восприимчивость: 1 },
                        next: 'scene2'
                    }
                ]
            },
            
            scene2: {
                id: 'scene2',
                background: 'assets/locations/chernoborsk_bus_station.jpg',
                text: 'Из здания вокзала выходит молодой милиционер в не по размеру большой форме — сержант Егоров.',
                next: 'scene2_choice',
                choices: []
            },
            
            scene2_choice: {
                id: 'scene2_choice',
                background: 'assets/locations/chernoborsk_bus_station.jpg',
                text: '',
                choices: [
                    {
                        text: '«Вы Егоров? Везите на место». (Коротко, по-деловому)',
                        effects: { напор: 1 },
                        next: 'scene3'
                    },
                    {
                        text: '«Сержант Егоров? Спасибо, что встретили. Как дорога?» (Вежливо, пытаясь расположить)',
                        effects: { дипломатия: 1 },
                        next: 'scene3'
                    },
                    {
                        text: 'Молча кивнуть, бросить окурок и сесть в машину.',
                        effects: { цинизм: 1 },
                        next: 'scene3'
                    }
                ]
            },
            
            scene3: {
                id: 'scene3',
                background: 'assets/locations/abandoned_bathhouse.jpg',
                text: 'Баня стоит на окраине, среди бурьяна. Жёлтая лента хлопает на ветру. Внутри — запах плесени и чего-то кислого.',
                next: null,
                choices: []
            }
        };
    }
    
    bindEvents() {
        // Кнопки управления
        this.elements.skipBtn.addEventListener('click', () => this.skipText());
        this.elements.textWindow.addEventListener('click', () => this.handleTextClick());
        this.elements.sceneBg.addEventListener('click', () => this.handleTextClick());
        
        // Меню
        this.elements.menuBtn.addEventListener('click', () => this.showPauseMenu());
        this.elements.resumeBtn.addEventListener('click', () => this.hidePauseMenu());
        this.elements.mainMenuBtn.addEventListener('click', () => this.returnToMainMenu());
        
        // Настройки
        this.elements.settingsBtn.addEventListener('click', () => this.showSettings());
        this.elements.settingsBack.addEventListener('click', () => this.hideSettings());
        this.elements.settingsMenuBtn.addEventListener('click', () => {
            this.hidePauseMenu();
            this.showSettings();
        });
        
        // Сохранение/загрузка
        this.elements.saveBtn.addEventListener('click', () => this.saveGame());
        this.elements.loadBtn.addEventListener('click', () => this.loadGame());
        this.elements.saveMenuBtn.addEventListener('click', () => this.saveGame());
        this.elements.loadMenuBtn.addEventListener('click', () => this.loadGame());
        
        // Авторежим
        this.elements.autoBtn.addEventListener('click', () => this.toggleAutoMode());
        
        // Настройки звука
        this.elements.musicVolume.addEventListener('input', (e) => {
            this.state.musicVolume = e.target.value;
            this.updateMusicVolume();
        });
        
        this.elements.sfxVolume.addEventListener('input', (e) => {
            this.state.sfxVolume = e.target.value;
        });
        
        this.elements.textSpeed.addEventListener('input', (e) => {
            this.state.textSpeed = e.target.value;
        });
        
        this.elements.autoSpeed.addEventListener('change', (e) => {
            this.state.autoSpeed = parseInt(e.target.value);
        });
        
        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
    }
    
    startGame() {
        // Скрываем загрузку, показываем игру
        this.elements.loadingScreen.style.display = 'none';
        this.elements.gameScreen.style.display = 'block';
        
        // Показываем первую сцену
        this.showScene('intro');
    }
    
    showScene(sceneId) {
        const scene = this.scenes[sceneId];
        if (!scene) return;
        
        this.state.currentScene = sceneId;
        
        // Обновляем фон
        if (scene.background) {
            this.elements.sceneBg.style.backgroundImage = `url('${scene.background}')`;
        }
        
        // Если это intro с заголовком
        if (scene.title && scene.description) {
            this.showSceneInfo(scene.title, scene.description);
            return;
        }
        
        // Показываем текст сцены
        if (scene.text) {
            this.showText(scene.text);
        }
        
        // Если сразу есть выбор
        if (scene.choices && scene.choices.length > 0 && !scene.text) {
            this.showChoices(scene.choices);
        }
    }
    
    showSceneInfo(title, description) {
        this.elements.sceneTitle.textContent = title;
        this.elements.sceneDescription.textContent = description;
        this.elements.sceneInfoWindow.style.display = 'block';
        
        // Автозакрытие через 3 секунды
        const closeInfo = () => {
            this.elements.sceneInfoWindow.style.display = 'none';
            const scene = this.scenes[this.state.currentScene];
            if (scene.next) {
                this.showScene(scene.next);
            }
        };
        
        setTimeout(closeInfo, 3000);
    }
    
    showText(text) {
        this.state.isTyping = true;
        this.state.currentText = text;
        this.state.textIndex = 0;
        this.elements.textContent.textContent = '';
        
        // Показываем имя персонажа (главного героя)
        const character = this.characters[this.state.hero];
        this.elements.characterName.textContent = character.name;
        this.elements.characterName.style.color = character.color;
        this.elements.characterName.style.display = 'block';
        
        // Начинаем печатать
        this.typeText();
    }
    
    typeText() {
        if (this.state.textIndex < this.state.currentText.length) {
            const char = this.state.currentText.charAt(this.state.textIndex);
            this.elements.textContent.textContent += char;
            this.state.textIndex++;
            
            // Следующий символ через некоторое время
            const speed = 110 - (this.state.textSpeed * 10);
            this.state.textTimer = setTimeout(() => {
                this.typeText();
            }, speed);
        } else {
            this.state.isTyping = false;
            this.onTextComplete();
        }
    }
    
    onTextComplete() {
        const scene = this.scenes[this.state.currentScene];
        
        // Если есть выбор после текста
        if (scene.choices && scene.choices.length > 0) {
            setTimeout(() => {
                this.showChoices(scene.choices);
            }, 300);
            return;
        }
        
        // Если есть следующая сцена и нет выбора
        if (scene.next && !scene.choices) {
            // В авторежиме переходим автоматически
            if (this.state.autoMode && this.state.autoSpeed > 0) {
                setTimeout(() => {
                    this.showScene(scene.next);
                }, this.state.autoSpeed * 1000);
            }
            // Иначе ждем клика пользователя
        }
    }
    
    skipText() {
        if (this.state.isTyping) {
            clearTimeout(this.state.textTimer);
            this.elements.textContent.textContent = this.state.currentText;
            this.state.isTyping = false;
            this.onTextComplete();
        } else {
            const scene = this.scenes[this.state.currentScene];
            if (scene.next && !scene.choices) {
                this.showScene(scene.next);
            }
        }
    }
    
    handleTextClick() {
        if (this.state.isTyping) {
            this.skipText();
        } else {
            const scene = this.scenes[this.state.currentScene];
            if (scene.next && !scene.choices) {
                this.showScene(scene.next);
            }
        }
    }
    
    showChoices(choices) {
        this.elements.choicesContainer.innerHTML = '';
        
        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = `${index + 1}. ${choice.text}`;
            
            button.addEventListener('click', () => {
                this.makeChoice(choice);
            });
            
            this.elements.choicesContainer.appendChild(button);
        });
        
        this.elements.choicesWindow.style.display = 'block';
    }
    
    makeChoice(choice) {
        // Применяем эффекты
        if (choice.effects) {
            Object.entries(choice.effects).forEach(([stat, value]) => {
                this.state.stats[stat] += value;
            });
        }
        
        // Скрываем окно выбора
        this.elements.choicesWindow.style.display = 'none';
        
        // Сохраняем выбор
        this.state.choices.push({
            scene: this.state.currentScene,
            choice: choice.text,
            timestamp: new Date().toISOString()
        });
        
        // Переходим дальше
        if (choice.next) {
            this.showScene(choice.next);
        }
    }
    
    toggleAutoMode() {
        this.state.autoMode = !this.state.autoMode;
        this.elements.autoBtn.innerHTML = this.state.autoMode ? 
            '<i class="fas fa-pause"></i>' : 
            '<i class="fas fa-play"></i>';
    }
    
    showPauseMenu() {
        this.elements.pauseMenu.style.display = 'flex';
    }
    
    hidePauseMenu() {
        this.elements.pauseMenu.style.display = 'none';
    }
    
    showSettings() {
        // Загружаем текущие настройки в элементы
        this.elements.musicVolume.value = this.state.musicVolume;
        this.elements.sfxVolume.value = this.state.sfxVolume;
        this.elements.textSpeed.value = this.state.textSpeed;
        this.elements.autoSpeed.value = this.state.autoSpeed;
        
        this.elements.settingsMenu.style.display = 'flex';
    }
    
    hideSettings() {
        this.elements.settingsMenu.style.display = 'none';
        this.saveSettings();
    }
    
    returnToMainMenu() {
        if (confirm('Вернуться в главное меню? Прогресс будет сохранён.')) {
            this.saveGame();
            window.location.href = 'index.html';
        }
    }
    
    saveGame() {
        const saveData = {
            hero: this.state.hero,
            heroName: this.state.heroName,
            stats: this.state.stats,
            choices: this.state.choices,
            currentScene: this.state.currentScene,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('gameSave', JSON.stringify(saveData));
        this.saveSettings();
        
        // Визуальная обратная связь
        const originalHTML = this.elements.saveBtn.innerHTML;
        this.elements.saveBtn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            this.elements.saveBtn.innerHTML = originalHTML;
        }, 1000);
    }
    
    loadGame() {
        const saved = localStorage.getItem('gameSave');
        if (saved) {
            const saveData = JSON.parse(saved);
            Object.assign(this.state, saveData);
            this.showScene(this.state.currentScene);
            
            // Визуальная обратная связь
            const originalHTML = this.elements.loadBtn.innerHTML;
            this.elements.loadBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                this.elements.loadBtn.innerHTML = originalHTML;
            }, 1000);
        } else {
            alert('Сохранение не найдено');
        }
    }
    
    saveSettings() {
        const settings = {
            textSpeed: this.state.textSpeed,
            autoMode: this.state.autoMode,
            autoSpeed: this.state.autoSpeed,
            musicVolume: this.state.musicVolume,
            sfxVolume: this.state.sfxVolume
        };
        
        localStorage.setItem('gameSettings', JSON.stringify(settings));
    }
    
    loadSettings() {
        const saved = localStorage.getItem('gameSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            Object.assign(this.state, settings);
        }
    }
    
    handleKeyDown(e) {
        switch(e.key) {
            case 'Escape':
                e.preventDefault();
                if (this.elements.settingsMenu.style.display === 'flex') {
                    this.hideSettings();
                } else if (this.elements.pauseMenu.style.display === 'flex') {
                    this.hidePauseMenu();
                } else {
                    this.showPauseMenu();
                }
                break;
                
            case ' ':
                e.preventDefault();
                this.skipText();
                break;
                
            case '1':
            case '2':
            case '3':
                if (this.elements.choicesWindow.style.display === 'block') {
                    const index = parseInt(e.key) - 1;
                    const buttons = this.elements.choicesContainer.querySelectorAll('.choice-btn');
                    if (buttons[index]) {
                        buttons[index].click();
                    }
                }
                break;
                
            case 's':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.saveGame();
                }
                break;
                
            case 'l':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.loadGame();
                }
                break;
        }
    }
    
    updateMusicVolume() {
        const audio = document.getElementById('bg-music');
        if (audio) {
            audio.volume = this.state.musicVolume / 100;
        }
    }
}

// Инициализация игры после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    window.game = new DetectiveGame();
});