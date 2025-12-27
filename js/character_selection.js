document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const characterCards = document.querySelectorAll('.character-card');
    const selectButtons = document.querySelectorAll('.select-btn');
    const backBtn = document.getElementById('btn-back');
    const confirmPopup = document.getElementById('confirm-popup');
    const confirmClose = document.getElementById('confirm-close');
    const cancelBtn = document.getElementById('btn-cancel');
    const confirmBtn = document.getElementById('btn-confirm');
    const selectedCharacterName = document.getElementById('selected-character-name');
    
    // Эффект дождя
    initRainEffect();
    
    // Текущий выбранный персонаж
    let selectedCharacter = null;
    
    // Назначаем обработчики
    setupEventListeners();
    
    // Загружаем сохранённый выбор (если есть)
    loadSavedCharacter();
    
    function setupEventListeners() {
        // Выбор персонажа
        characterCards.forEach(card => {
            card.addEventListener('click', function(e) {
                if (!e.target.closest('.select-btn')) {
                    const character = this.dataset.character;
                    selectCharacter(character);
                }
            });
        });
        
        // Кнопки выбора
        selectButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const character = this.dataset.character;
                selectCharacter(character);
            });
        });
        
        // Кнопка возврата
        backBtn.addEventListener('click', function() {
            playSound();
            window.location.href = 'index.html';
        });
        
        // Закрытие попапа
        confirmClose.addEventListener('click', closeConfirmPopup);
        cancelBtn.addEventListener('click', closeConfirmPopup);
        
        // Подтверждение выбора
        confirmBtn.addEventListener('click', confirmSelection);
        
        // Закрытие попапа по клику на фон
        confirmPopup.addEventListener('click', function(e) {
            if (e.target === this) {
                closeConfirmPopup();
            }
        });
        
        // Обработка клавиатуры
        document.addEventListener('keydown', handleKeyPress);
    }
    
    function selectCharacter(character) {
        playSound();
        
        // Снимаем выделение со всех карточек
        characterCards.forEach(card => {
            card.classList.remove('active');
            card.style.transform = 'translateY(0)';
            card.style.borderColor = '#222';
        });
        
        // Выделяем выбранную карточку
        const selectedCard = document.querySelector(`.character-card[data-character="${character}"]`);
        if (selectedCard) {
            selectedCard.classList.add('active');
            selectedCard.style.transform = 'translateY(-10px)';
            selectedCard.style.borderColor = '#33ff66';
            // НЕ добавляем boxShadow
        }
        
        // Сохраняем выбор
        selectedCharacter = character;
        
        // Показываем попап подтверждения
        showConfirmPopup(character);
    }
    
    function showConfirmPopup(character) {
        // Устанавливаем имя персонажа с указанием возраста
        const characterNames = {
            male: 'АЛЕКСЕЙ ВОЛКОВ (28 лет)',
            female: 'ВЕРОНИКА СМИРНОВА (26 лет)'
        };
        
        selectedCharacterName.textContent = characterNames[character];
        
        // Показываем попап
        confirmPopup.classList.add('active');
    }
    
    function closeConfirmPopup() {
        playSound();
        confirmPopup.classList.remove('active');
        
        // Снимаем выделение
        if (selectedCharacter) {
            const selectedCard = document.querySelector(`.character-card[data-character="${selectedCharacter}"]`);
            if (selectedCard) {
                selectedCard.classList.remove('active');
                selectedCard.style.transform = 'translateY(0)';
                selectedCard.style.borderColor = '#222';
            }
            selectedCharacter = null;
        }
    }
    
    function confirmSelection() {
        playSound();
        
        if (!selectedCharacter) return;
        
        // Сохраняем выбор в localStorage
        localStorage.setItem('detectiveCharacter', selectedCharacter);
        localStorage.setItem('detectiveSelected', 'true');
        
        // Сохраняем полные данные персонажа
        const characterData = {
            male: {
                id: 'male',
                name: 'Алексей Волков',
                age: '28',
                height: '185 см',
                profession: 'Частный детектив'
            },
            female: {
                id: 'female',
                name: 'Вероника Смирнова',
                age: '26',
                height: '170 см',
                profession: 'Частный детектив'
            }
        };
        
        localStorage.setItem('detectiveCharacterData', JSON.stringify(characterData[selectedCharacter]));
        
        // Показываем сообщение о успешном выборе
        showSelectionSuccess();
    }
    
    function showSelectionSuccess() {
        // Скрываем попап подтверждения
        confirmPopup.classList.remove('active');
        
        // Показываем анимацию успеха
        const characterData = JSON.parse(localStorage.getItem('detectiveCharacterData'));
        
        // Создаем попап успеха
        const successPopup = document.createElement('div');
        successPopup.className = 'popup active';
        successPopup.innerHTML = `
            <div class="popup-content confirm-popup">
                <div class="popup-header">
                    <h3><i class="fas fa-check-circle" style="color: #33ff66;"></i> ВЫБОР ПОДТВЕРЖДЁН</h3>
                </div>
                <div class="popup-body" style="text-align: center;">
                    <div style="font-size: 60px; color: #33ff66; margin: 20px 0;">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h2 style="color: #33ff66; margin-bottom: 10px;">
                        ${characterData.name}
                    </h2>
                    <p style="color: #ccc; margin-bottom: 5px;">
                        ${characterData.age} • ${characterData.height} • ${characterData.profession}
                    </p>
                    <p style="color: #ccc; margin-bottom: 30px;">
                        Ваш детектив готов к расследованию.<br>
                        Начинаем историю...
                    </p>
                    <button id="btn-start" style="
                        background: #ff3300;
                        color: white;
                        border: none;
                        padding: 15px 40px;
                        font-size: 18px;
                        border-radius: 3px;
                        cursor: pointer;
                        font-weight: bold;
                        letter-spacing: 2px;
                        text-transform: uppercase;
                        border: 3px solid #000;
                        box-shadow: 0 5px 0 #000;
                        transition: all 0.3s ease;
                    ">
                        <i class="fas fa-play-circle"></i> НАЧАТЬ РАССЛЕДОВАНИЕ
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(successPopup);
        
        // Обработчик кнопки начала
        setTimeout(() => {
            const startBtn = document.getElementById('btn-start');
            if (startBtn) {
                startBtn.addEventListener('click', function() {
                    this.style.transform = 'translateY(2px)';
                    this.style.boxShadow = '0 3px 0 #000';
                    playSound();
                    setTimeout(() => {
                        startGame();
                    }, 150);
                });
                
                startBtn.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-2px)';
                    this.style.boxShadow = '0 7px 0 #000';
                });
                
                startBtn.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = '0 5px 0 #000';
                });
            }
            
            // Автоматический переход через 10 секунд
            setTimeout(() => {
                if (document.body.contains(successPopup)) {
                    startGame();
                }
            }, 10000);
        }, 100);
    }
    
    function startGame() {
        // Переходим к игре
        const characterData = JSON.parse(localStorage.getItem('detectiveCharacterData'));
        console.log(`Запуск игры с персонажем: ${characterData.name}`);
        window.location.href = 'game.html';
    }
    
    function loadSavedCharacter() {
        const savedCharacter = localStorage.getItem('detectiveCharacter');
        if (savedCharacter) {
            // Показываем сохранённый выбор
            const selectedCard = document.querySelector(`.character-card[data-character="${savedCharacter}"]`);
            
        }
    }
    
    function handleKeyPress(e) {
        switch(e.key) {
            case 'Escape':
                if (confirmPopup.classList.contains('active')) {
                    closeConfirmPopup();
                }
                break;
            case '1':
                selectCharacter('male');
                break;
            case '2':
                selectCharacter('female');
                break;
            case 'Enter':
                if (confirmPopup.classList.contains('active')) {
                    confirmSelection();
                }
                break;
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
    
    // Эффект дождя
    function initRainEffect() {
        const canvas = document.getElementById('rain-canvas');
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
                this.length = Math.random() * 20 + 10;
                this.speed = Math.random() * 6 + 4;
                this.opacity = Math.random() * 0.3 + 0.1;
                this.wind = Math.random() * 1 - 0.5;
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
        const dropCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 8000));
        
        for (let i = 0; i < dropCount; i++) {
            drops.push(new RainDrop());
        }
        
        function animate() {
            ctx.fillStyle = 'rgba(5, 5, 10, 0.1)';
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
});