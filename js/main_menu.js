// ==================== МУЗЫКАЛЬНАЯ СИСТЕМА С ТРЕКАМИ ====================

const MusicSystem = {
    // Список треков (4 трека с простыми названиями)
    tracks: [
        {
            id: 1,
            name: 'Трек 1',
            file: 'music/main_menu_theme_track_1.mp3',
            mood: 'Детектив'
        },
        {
            id: 2,
            name: 'Трек 2', 
            file: 'music/main_menu_theme_track_2.mp3',
            mood: 'Нуар'
        },
        {
            id: 3,
            name: 'Трек 3',
            file: 'music/main_menu_theme_track_3.mp3',
            mood: 'Тайна'
        },
        {
            id: 4,
            name: 'Трек 4',
            file: 'music/main_menu_theme_track_4.mp3',
            mood: 'Напряжение'
        }
    ],
    
    // Текущее состояние
    currentTrack: 0, // Начинаем с первого трека
    isPlaying: false,
    volume: 0.5,
    autoPlay: true, // Автовоспроизведение включено
    shuffle: true, // По умолчанию случайный порядок
    isInitialized: false,
    isFirstPlay: true, // Флаг первого воспроизведения
    
    // Инициализация
    init() {
        console.log('🎵 Инициализация музыкальной системы...');
        
        // Загружаем сохранённые настройки
        this.loadSettings();
        
        // Обновляем интерфейс
        this.updateUI();
        this.updateTracksList();
        
        this.isInitialized = true;
        
        // Автозапуск если включен
        if (this.autoPlay) {
            console.log('🎵 Автовоспроизведение включено');
            this.startAutoplay();
        }
        
        // Логирование доступных треков
        console.log(`🎵 Доступно треков: ${this.tracks.length}`);
        this.tracks.forEach((track, index) => {
            console.log(`  ${index + 1}. ${track.name} (${track.file})`);
        });
    },
    
    // Автозапуск музыки
    startAutoplay() {
        // Всегда начинаем с первого трека при первом запуске
        if (this.isFirstPlay) {
            this.currentTrack = 0; // Первый трек
            console.log('🎵 Первый запуск - начинаем с Трека 1');
        }
        
        this.isPlaying = true;
        this.isFirstPlay = false;
        
        // Запускаем музыку с небольшой задержкой
        setTimeout(() => {
            this.startMusic();
        }, 1500); // Задержка 1.5 секунды для загрузки страницы
    },
    
    // Загрузка настроек
    loadSettings() {
        const savedVolume = localStorage.getItem('musicVolume');
        const savedTrack = localStorage.getItem('musicCurrentTrack');
        const savedState = localStorage.getItem('musicPlaying');
        const savedAutoPlay = localStorage.getItem('musicAutoPlay');
        const savedShuffle = localStorage.getItem('musicShuffle');
        const savedFirstPlay = localStorage.getItem('musicFirstPlay');
        
        if (savedVolume !== null) {
            this.volume = parseFloat(savedVolume);
        }
        
        if (savedTrack !== null) {
            const trackIndex = parseInt(savedTrack);
            if (trackIndex >= 0 && trackIndex < this.tracks.length) {
                this.currentTrack = trackIndex;
            }
        }
        
        if (savedState === 'true') {
            this.isPlaying = true;
        }
        
        if (savedAutoPlay !== null) {
            this.autoPlay = savedAutoPlay === 'true';
        } else {
            // По умолчанию автовоспроизведение включено
            this.autoPlay = true;
        }
        
        if (savedShuffle !== null) {
            this.shuffle = savedShuffle === 'true';
        } else {
            // По умолчанию случайный порядок
            this.shuffle = true;
        }
        
        if (savedFirstPlay !== null) {
            this.isFirstPlay = savedFirstPlay === 'true';
        }
    },
    
    // Сохранение настроек
    saveSettings() {
        localStorage.setItem('musicVolume', this.volume.toString());
        localStorage.setItem('musicCurrentTrack', this.currentTrack.toString());
        localStorage.setItem('musicPlaying', this.isPlaying.toString());
        localStorage.setItem('musicAutoPlay', this.autoPlay.toString());
        localStorage.setItem('musicShuffle', this.shuffle.toString());
        localStorage.setItem('musicFirstPlay', this.isFirstPlay.toString());
    },
    
    // Включить/выключить музыку
    toggle() {
        const bgMusic = document.getElementById('bg-music');
        
        if (this.isPlaying) {
            // Выключаем
            bgMusic.pause();
            this.isPlaying = false;
            console.log('🎵 Музыка остановлена');
        } else {
            // Включаем
            this.isPlaying = true;
            this.startMusic();
            console.log('🎵 Музыка включена');
        }
        
        this.saveSettings();
        this.updateUI();
    },
    
    // Запуск музыки
    startMusic() {
        if (!this.isPlaying || this.tracks.length === 0) return;
        
        const bgMusic = document.getElementById('bg-music');
        const track = this.tracks[this.currentTrack];
        
        // Устанавливаем источник
        bgMusic.src = track.file;
        bgMusic.volume = this.volume;
        bgMusic.loop = false; // Не зацикливаем, чтобы работало переключение
        
        // Пытаемся воспроизвести
        const playPromise = bgMusic.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log(`🎵 Играет: ${track.name}`);
                this.updateUI();
                this.updateNowPlaying();
                
                // Обработка окончания трека
                bgMusic.onended = () => {
                    if (this.isPlaying) {
                        this.nextTrack();
                    }
                };
            }).catch(error => {
                console.log('🎵 Ошибка воспроизведения:', error);
                this.showMusicHint();
                
                // Если автовоспроизведение заблокировано, ждём клика
                document.addEventListener('click', () => {
                    if (this.isPlaying && bgMusic.paused) {
                        this.startMusic();
                    }
                }, { once: true });
            });
        }
    },
    
    // Следующий трек
    nextTrack() {
        if (this.tracks.length <= 1) return;
        
        if (this.shuffle) {
            // Случайный трек (но не повторяем текущий)
            let newTrack;
            let attempts = 0;
            do {
                newTrack = Math.floor(Math.random() * this.tracks.length);
                attempts++;
            } while (newTrack === this.currentTrack && this.tracks.length > 1 && attempts < 10);
            this.currentTrack = newTrack;
            console.log('🎵 Случайный выбор следующего трека:', this.currentTrack + 1);
        } else {
            // Следующий по порядку
            this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
            console.log('🎵 Следующий трек по порядку:', this.currentTrack + 1);
        }
        
        if (this.isPlaying) {
            this.startMusic();
        } else {
            this.updateUI();
            this.updateNowPlaying();
        }
        
        this.saveSettings();
    },
    
    // Предыдущий трек
    prevTrack() {
        if (this.tracks.length <= 1) return;
        
        if (this.shuffle) {
            // В случайном режиме - просто следующий случайный
            this.nextTrack();
        } else {
            // Предыдущий по порядку
            this.currentTrack = (this.currentTrack - 1 + this.tracks.length) % this.tracks.length;
            
            if (this.isPlaying) {
                this.startMusic();
            } else {
                this.updateUI();
                this.updateNowPlaying();
            }
            
            this.saveSettings();
        }
    },
    
    // Выбрать конкретный трек
    selectTrack(trackIndex) {
        if (trackIndex < 0 || trackIndex >= this.tracks.length) return;
        
        this.currentTrack = trackIndex;
        
        if (this.isPlaying) {
            this.startMusic();
        } else {
            this.updateUI();
            this.updateNowPlaying();
        }
        
        this.saveSettings();
        this.updateTracksList();
    },
    
    // Изменить громкость
    setVolume(newVolume) {
        this.volume = newVolume / 100;
        const bgMusic = document.getElementById('bg-music');
        if (bgMusic) {
            bgMusic.volume = this.volume;
        }
        this.saveSettings();
        this.updateUI();
    },
    
    // Переключить автовоспроизведение
    toggleAutoPlay() {
        this.autoPlay = !this.autoPlay;
        this.saveSettings();
        this.updateUI();
        
        if (this.autoPlay && !this.isPlaying) {
            this.isPlaying = true;
            this.startMusic();
        }
    },
    
    // Переключить случайный порядок
    toggleShuffle() {
        this.shuffle = !this.shuffle;
        this.saveSettings();
        this.updateUI();
        
        console.log(`🎵 Режим переключения треков: ${this.shuffle ? 'СЛУЧАЙНЫЙ' : 'ПО ПОРЯДКУ'}`);
    },
    
    // Показать подсказку
    showMusicHint() {
        // Обновляем статус в интерфейсе
        const status = document.getElementById('current-track-status');
        if (status) {
            status.textContent = 'Кликните для запуска музыки';
            status.style.color = '#ff9966';
        }
    },
    
    // Обновить основной интерфейс
    updateUI() {
        const musicIcon = document.getElementById('music-icon');
        const musicLabel = document.getElementById('music-label');
        const musicDesc = document.getElementById('music-desc');
        const musicBtn = document.getElementById('btn-music-control');
        const volumeSlider = document.getElementById('music-volume');
        const volumeValue = document.getElementById('volume-value');
        const playPauseBtn = document.getElementById('btn-play-pause');
        const autoPlayCheck = document.getElementById('auto-play');
        const shuffleCheck = document.getElementById('shuffle-mode');
        
        // Обновление кнопки в меню
        if (this.isPlaying) {
            if (musicIcon) musicIcon.innerHTML = '<i class="fas fa-volume-up"></i>';
            if (musicLabel) musicLabel.textContent = 'МУЗЫКА';
            if (musicDesc) musicDesc.textContent = 'Включена';
            if (musicBtn) musicBtn.classList.add('music-on');
            if (musicBtn) musicBtn.classList.remove('music-off');
        } else {
            if (musicIcon) musicIcon.innerHTML = '<i class="fas fa-volume-mute"></i>';
            if (musicLabel) musicLabel.textContent = 'МУЗЫКА';
            if (musicDesc) musicDesc.textContent = 'Выключена';
            if (musicDesc) musicDesc.style.color = '#ff6666';
            if (musicBtn) musicBtn.classList.add('music-off');
            if (musicBtn) musicBtn.classList.remove('music-on');
        }
        
        // Обновление попапа музыки
        if (volumeSlider) {
            volumeSlider.value = this.volume * 100;
        }
        
        if (volumeValue) {
            volumeValue.textContent = Math.round(this.volume * 100) + '%';
        }
        
        if (playPauseBtn) {
            playPauseBtn.innerHTML = this.isPlaying ? 
                '<i class="fas fa-pause"></i>' : 
                '<i class="fas fa-play"></i>';
            playPauseBtn.title = this.isPlaying ? 'Пауза' : 'Воспроизвести';
        }
        
        if (autoPlayCheck) {
            autoPlayCheck.checked = this.autoPlay;
            autoPlayCheck.title = this.autoPlay ? 'Автовоспроизведение включено' : 'Автовоспроизведение выключено';
        }
        
        if (shuffleCheck) {
            shuffleCheck.checked = this.shuffle;
            shuffleCheck.title = this.shuffle ? 'Случайный порядок треков' : 'Последовательный порядок треков';
        }
        
        this.updateNowPlaying();
    },
    
    // Обновить информацию о текущем треке
    updateNowPlaying() {
        const trackName = document.getElementById('current-track-name');
        const trackStatus = document.getElementById('current-track-status');
        
        if (this.tracks.length === 0) {
            if (trackName) trackName.textContent = 'Треки не найдены';
            if (trackStatus) trackStatus.textContent = 'Добавьте файлы в папку music/';
            return;
        }
        
        const track = this.tracks[this.currentTrack];
        
        if (trackName) {
            trackName.textContent = `${this.currentTrack + 1}. ${track.name}`;
        }
        
        if (trackStatus) {
            if (this.isPlaying) {
                const mode = this.shuffle ? '♻️ Случайный порядок' : '➡️ По порядку';
                trackStatus.textContent = `Сейчас играет • ${mode}`;
                trackStatus.style.color = '#33ff66';
            } else {
                trackStatus.textContent = 'Готов к воспроизведению';
                trackStatus.style.color = '#aaa';
            }
        }
    },
    
    // Обновить список треков в попапе
    updateTracksList() {
        const tracksContainer = document.getElementById('tracks-container');
        if (!tracksContainer) return;
        
        tracksContainer.innerHTML = '';
        
        this.tracks.forEach((track, index) => {
            const trackElement = document.createElement('div');
            trackElement.className = `track-item ${index === this.currentTrack ? 'active' : ''}`;
            trackElement.innerHTML = `
                <div class="track-item-info">
                    <span class="track-item-number">${index + 1}.</span>
                    <span class="track-item-name">${track.name}</span>
                    ${index === 0 ? '<span class="first-track-badge" style="margin-left: 10px; background: rgba(51, 255, 102, 0.2); color: #33ff66; padding: 2px 8px; border-radius: 10px; font-size: 11px;">Первый при запуске</span>' : ''}
                </div>
                <div class="track-item-mood">${track.mood}</div>
            `;
            
            trackElement.addEventListener('click', () => {
                this.selectTrack(index);
                playSound();
            });
            
            tracksContainer.appendChild(trackElement);
        });
    },
    
    // Сбросить настройки воспроизведения
    resetPlayback() {
        this.currentTrack = 0;
        this.isFirstPlay = true;
        this.saveSettings();
        console.log('🎵 Настройки воспроизведения сброшены к начальным');
    }
};

// ==================== ОСНОВНОЙ КОД МЕНЮ ====================

document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const mainMenu = document.getElementById('main-menu');
    const ageCheck = document.getElementById('age-check');
    const musicPopup = document.getElementById('music-popup');
    const settingsPopup = document.getElementById('settings-popup');
    
    // Кнопки
    const ageYes = document.getElementById('age-yes');
    const ageNo = document.getElementById('age-no');
    const btnNew = document.getElementById('btn-new');
    const btnContinue = document.getElementById('btn-continue');
    const btnLoad = document.getElementById('btn-load');
    const btnGallery = document.getElementById('btn-gallery');
    const btnSettings = document.getElementById('btn-settings');
    const btnMusicControl = document.getElementById('btn-music-control');
    const btnDossier = document.getElementById('btn-dossier');
    const btnCredits = document.getElementById('btn-credits');
    const btnExit = document.getElementById('btn-exit');
    const popupClose = document.querySelectorAll('.popup-close');
    
    // Инициализация
    initMenu();
    
    function initMenu() {
        // Проверяем возраст
        if (localStorage.getItem('detectiveAgeVerified') === 'true') {
            showMainMenu();
        } else {
            showAgeCheck();
        }
        
        // Инициализируем музыкальную систему
        MusicSystem.init();
        
        // Проверяем сохранения
        checkSaves();
        
        // Назначаем обработчики
        setupEventListeners();
        
        // Инициализируем эффекты
        initRainEffect();
    }
    
    function showAgeCheck() {
        ageCheck.classList.add('active');
        mainMenu.classList.remove('active');
    }
    
    function showMainMenu() {
        ageCheck.classList.remove('active');
        mainMenu.classList.add('active');
        initRainEffect();
    }
    
    function setupEventListeners() {
        // Возрастная проверка
        ageYes.addEventListener('click', confirmAge);
        ageNo.addEventListener('click', exitGame);
        
        // Основные кнопки меню
        btnNew.addEventListener('click', () => handleButtonClick('new'));
        btnContinue.addEventListener('click', () => handleButtonClick('continue'));
        btnLoad.addEventListener('click', () => handleButtonClick('load'));
        btnGallery.addEventListener('click', () => handleButtonClick('gallery'));
        btnSettings.addEventListener('click', () => handleButtonClick('settings'));
        btnMusicControl.addEventListener('click', () => handleButtonClick('music'));
        btnDossier.addEventListener('click', () => handleButtonClick('dossier'));
        btnCredits.addEventListener('click', () => handleButtonClick('credits'));
        btnExit.addEventListener('click', exitGame);
        
        // Обработчики для музыкального попапа
        setupMusicPopupEvents();
        
        // Закрытие попапов
        popupClose.forEach(btn => {
            btn.addEventListener('click', function() {
                const popup = this.closest('.popup');
                if (popup) {
                    popup.classList.remove('active');
                    playSound();
                }
            });
        });
        
        // Закрытие попапа по клику на фон
        musicPopup.addEventListener('click', function(e) {
            if (e.target === this) {
                closePopup(musicPopup);
            }
        });
        
        settingsPopup.addEventListener('click', function(e) {
            if (e.target === this) {
                closePopup(settingsPopup);
            }
        });
        
        // Обработка клика по всему документу для запуска музыки
        document.addEventListener('click', function initMusicOnClick() {
            // Если музыка должна играть, но не играет из-за блокировки браузера
            if (MusicSystem.isPlaying) {
                const bgMusic = document.getElementById('bg-music');
                if (bgMusic && bgMusic.paused && bgMusic.currentTime === 0) {
                    console.log('🎵 Запуск музыки по клику пользователя');
                    MusicSystem.startMusic();
                }
            }
            // Удаляем обработчик после первого клика
            document.removeEventListener('click', initMusicOnClick);
        });
        
        // Обработка клавиатуры
        document.addEventListener('keydown', handleKeyPress);
    }
    
    function setupMusicPopupEvents() {
        const btnPlayPause = document.getElementById('btn-play-pause');
        const btnPrevTrack = document.getElementById('btn-prev-track');
        const btnNextTrack = document.getElementById('btn-next-track');
        const volumeSlider = document.getElementById('music-volume');
        const autoPlayCheck = document.getElementById('auto-play');
        const shuffleCheck = document.getElementById('shuffle-mode');
        
        if (btnPlayPause) {
            btnPlayPause.addEventListener('click', function() {
                playSound();
                MusicSystem.toggle();
            });
        }
        
        if (btnPrevTrack) {
            btnPrevTrack.addEventListener('click', function() {
                playSound();
                MusicSystem.prevTrack();
            });
        }
        
        if (btnNextTrack) {
            btnNextTrack.addEventListener('click', function() {
                playSound();
                MusicSystem.nextTrack();
            });
        }
        
        if (volumeSlider) {
            volumeSlider.addEventListener('input', function() {
                MusicSystem.setVolume(this.value);
            });
        }
        
        if (autoPlayCheck) {
            autoPlayCheck.addEventListener('change', function() {
                MusicSystem.toggleAutoPlay();
                playSound();
            });
        }
        
        if (shuffleCheck) {
            shuffleCheck.addEventListener('change', function() {
                MusicSystem.toggleShuffle();
                playSound();
            });
        }
    }
    
    function confirmAge() {
        playSound();
        localStorage.setItem('detectiveAgeVerified', 'true');
        localStorage.setItem('ageVerifyTime', Date.now());
        showMainMenu();
    }
    
    function handleButtonClick(action) {
        playSound();
        
        switch(action) {
            case 'new':
                startNewGame();
                break;
            case 'continue':
                if (!btnContinue.disabled) continueGame();
                break;
            case 'load':
                loadGame();
                break;
            case 'gallery':
                showGallery();
                break;
            case 'settings':
                showSettings();
                break;
            case 'music':
                showMusicPopup();
                break;
            case 'dossier':
                showDossier();
                break;
            case 'credits':
                showCredits();
                break;
        }
    }
    
    function showMusicPopup() {
        musicPopup.classList.add('active');
        MusicSystem.updateUI();
        MusicSystem.updateTracksList();
    }
    
    function showSettings() {
        settingsPopup.classList.add('active');
    }
    
    function closePopup(popupElement) {
        playSound();
        popupElement.classList.remove('active');
    }
    
    function startNewGame() {
        alert('НОВОЕ ДЕЛО\n\nФункция в разработке. В следующем обновлении:\n• Выбор персонажа детектива\n• Первое расследование\n• Система улик и подозреваемых');
    }
    
    function continueGame() {
        alert('ПРОДОЛЖИТЬ РАССЛЕДОВАНИЕ\n\nЗагрузка последнего сохранения...');
    }
    
    function loadGame() {
        alert('ЗАГРУЗИТЬ ДЕЛО\n\nМеню загрузки сохранений будет в следующем обновлении.');
    }
    
    function showGallery() {
        alert('АРХИВ ДЕЛА\n\nЗдесь будут найденные улики и материалы расследования.');
    }
    
    function showDossier() {
        alert('ДОСЬЕ\n\nДосье подозреваемых и собранные улики будут доступны здесь.');
    }
    
    function showCredits() {
        alert('АВТОРЫ\n\nВедущий разработчик: AvoKadka\nПомощники: AI друзья\n\nСпециальная благодарность:\n• Сообществу разработчиков\n• Тестерам проекта\n• Всем, кто верит в детективные истории');
    }
    
    function exitGame() {
        playSound();
        if (confirm('Вы уверены, что хотите выйти из игры?')) {
            alert('Расследование приостановлено. Возвращайтесь!');
        }
    }
    
    function checkSaves() {
        let hasSaves = false;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('detective_save_')) {
                hasSaves = true;
                break;
            }
        }
        
        if (hasSaves) {
            btnContinue.disabled = false;
            btnContinue.querySelector('.btn-desc').textContent = 'Продолжить расследование';
        }
    }
    
    function playSound() {
        try {
            const clickSound = document.getElementById('click-sound');
            clickSound.currentTime = 0;
            clickSound.volume = 0.7;
            clickSound.play();
        } catch (e) {
            console.error('Ошибка воспроизведения звука:', e);
        }
    }
    
    function handleKeyPress(e) {
        switch(e.key) {
            case 'Escape':
                if (musicPopup.classList.contains('active')) {
                    closePopup(musicPopup);
                } else if (settingsPopup.classList.contains('active')) {
                    closePopup(settingsPopup);
                }
                break;
            case '1':
            case 'Enter':
                if (mainMenu.classList.contains('active')) {
                    startNewGame();
                }
                break;
            case 'm':
            case 'M':
                if (mainMenu.classList.contains('active')) {
                    showMusicPopup();
                }
                break;
            case 'ArrowRight':
                if (musicPopup.classList.contains('active')) {
                    MusicSystem.nextTrack();
                }
                break;
            case 'ArrowLeft':
                if (musicPopup.classList.contains('active')) {
                    MusicSystem.prevTrack();
                }
                break;
            case ' ':
                if (musicPopup.classList.contains('active')) {
                    MusicSystem.toggle();
                    e.preventDefault();
                }
                break;
        }
    }
    
    // Эффект дождя на канвасе
    function initRainEffect() {
        const canvas = document.getElementById('rain-effect');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        class RainDrop {
            constructor() {
                this.reset();
            }
            
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * -canvas.height;
                this.length = Math.random() * 25 + 15;
                this.speed = Math.random() * 8 + 4;
                this.opacity = Math.random() * 0.4 + 0.2;
                this.wind = Math.random() * 2 - 1;
            }
            
            update() {
                this.y += this.speed;
                this.x += this.wind;
                
                if (this.y > canvas.height || 
                    this.x < -50 || 
                    this.x > canvas.width + 50) {
                    this.reset();
                }
            }
            
            draw() {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x + this.wind * 2, this.y + this.length);
                ctx.strokeStyle = `rgba(100, 150, 255, ${this.opacity})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
        
        const drops = [];
        const dropCount = Math.min(150, Math.floor((canvas.width * canvas.height) / 8000));
        
        for (let i = 0; i < dropCount; i++) {
            drops.push(new RainDrop());
        }
        
        function animate() {
            ctx.fillStyle = 'rgba(5, 5, 20, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            drops.forEach(drop => {
                drop.update();
                drop.draw();
            });
            
            requestAnimationFrame(animate);
        }
        
        animate();
        
        window.addEventListener('resize', function() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }
    
    // Функция для сброса проверки возраста
    window.resetAgeCheck = function() {
        localStorage.removeItem('detectiveAgeVerified');
        localStorage.removeItem('ageVerifyTime');
        localStorage.removeItem('musicVolume');
        localStorage.removeItem('musicCurrentTrack');
        localStorage.removeItem('musicPlaying');
        localStorage.removeItem('musicAutoPlay');
        localStorage.removeItem('musicShuffle');
        localStorage.removeItem('musicFirstPlay');
        alert('✓ Все настройки сброшены!\nСтраница перезагрузится.');
        location.reload();
    };
    
    // Функция для сброса музыкальных настроек
    window.resetMusicSettings = function() {
        MusicSystem.resetPlayback();
        alert('✓ Музыкальные настройки сброшены!\nПри следующем запуске начнётся с Трека 1.');
        MusicSystem.updateUI();
        MusicSystem.updateTracksList();
    };
    
    // Функция для отладки музыки
    window.debugMusic = function() {
        console.log('🎵 Отладка музыкальной системы:');
        console.log('- Треков:', MusicSystem.tracks.length);
        console.log('- Текущий трек:', MusicSystem.currentTrack + 1, MusicSystem.tracks[MusicSystem.currentTrack]?.name);
        console.log('- Играет:', MusicSystem.isPlaying);
        console.log('- Громкость:', MusicSystem.volume);
        console.log('- Автовоспроизведение:', MusicSystem.autoPlay);
        console.log('- Случайный порядок:', MusicSystem.shuffle);
        console.log('- Первое воспроизведение:', MusicSystem.isFirstPlay);
        
        const bgMusic = document.getElementById('bg-music');
        console.log('- Аудио элемент:', {
            src: bgMusic?.src,
            paused: bgMusic?.paused,
            currentTime: bgMusic?.currentTime,
            duration: bgMusic?.duration
        });
    };
});