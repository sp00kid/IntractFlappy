document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const gameArea = document.getElementById('game-area');
    const bird = document.getElementById('bird');
    const scoreDisplay = document.getElementById('score');
    const startButton = document.getElementById('start-button');
    const gameOverScreen = document.getElementById('game-over');
    const finalScoreDisplay = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-button');
    const instructionsPanel = document.querySelector('.instructions');
    const container = document.querySelector('.container');

    // Game variables
    let gameRunning = false;
    let gameSpeed = 2;
    let gravity = 0.25;
    let birdPosition = 50;
    let velocity = 0;
    let score = 0;
    let highScore = sessionStorage.getItem('highScore') || 0;
    let hasPlayedBefore = sessionStorage.getItem('hasPlayedBefore') === 'true';
    let pipes = [];
    let animationFrame;
    let lastPipeTime = 0;
    let pipeGap = 300;
    let minPipeHeight = 50;
    let glitchInterval;
    let timeBetweenPipes = 2000;
    
    // Audio context and sound system
    let audioCtx;
    let soundEnabled = false;
    
    // Initialize audio context on user interaction
    function initAudio() {
        if (audioCtx) return; // Already initialized
        
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
            soundEnabled = true;
            console.log('Audio initialized successfully');
        } catch (e) {
            console.error('Audio initialization failed:', e);
            soundEnabled = false;
        }
    }

    // Game area dimensions
    let gameWidth = window.innerWidth;
    let gameHeight = window.innerHeight;

    // Create high score element
    const highScoreDisplay = document.createElement('div');
    highScoreDisplay.id = 'high-score';
    highScoreDisplay.className = 'high-score';
    highScoreDisplay.textContent = `High Score: ${highScore}`;
    document.querySelector('.game-ui').appendChild(highScoreDisplay);
    
    // Create sound toggle button
    const soundToggle = document.createElement('button');
    soundToggle.id = 'sound-toggle';
    soundToggle.className = 'sound-toggle';
    soundToggle.innerHTML = '🔊';
    soundToggle.title = 'Toggle Sound';
    document.querySelector('.game-ui').appendChild(soundToggle);
    
    // Sound toggle event listener
    soundToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering game area click
        
        if (!audioCtx) {
            initAudio();
        } else {
            soundEnabled = !soundEnabled;
        }
        
        soundToggle.innerHTML = soundEnabled ? '🔊' : '🔇';
        
        // Resume audio context if it was suspended
        if (audioCtx && audioCtx.state === 'suspended' && soundEnabled) {
            audioCtx.resume();
        }
    });

    // Hide instructions if player has played before
    if (hasPlayedBefore && instructionsPanel) {
        instructionsPanel.classList.add('hidden');
    }

    // Update dimensions on window resize
    window.addEventListener('resize', () => {
        gameWidth = window.innerWidth;
        gameHeight = window.innerHeight;
    });

    // Initialize bird position
    function initBird() {
        birdPosition = gameHeight / 2;
        velocity = 0;
        bird.style.top = `${birdPosition}px`;
        bird.style.transform = 'translateY(-50%) rotate(0deg)';
    }

    // Create a new pipe pair with cyberpunk styling
    function createPipe() {
        // Calculate random height for top pipe
        const topPipeHeight = Math.floor(Math.random() * (gameHeight - pipeGap - minPipeHeight * 2)) + minPipeHeight;
        const bottomPipeHeight = gameHeight - topPipeHeight - pipeGap;

        // Create top pipe
        const topPipe = document.createElement('div');
        topPipe.className = 'pipe pipe-top';
        topPipe.style.height = `${topPipeHeight}px`;
        topPipe.style.left = `${gameWidth}px`;
        
        // Add cyberpunk glow animation
        const hue = Math.floor(Math.random() * 60) + 270; // Purple to pink hues
        topPipe.style.boxShadow = `0 0 10px hsl(${hue}, 100%, 50%)`;
        
        // Create bottom pipe
        const bottomPipe = document.createElement('div');
        bottomPipe.className = 'pipe pipe-bottom';
        bottomPipe.style.height = `${bottomPipeHeight}px`;
        bottomPipe.style.left = `${gameWidth}px`;
        
        // Add cyberpunk glow animation with slightly different hue
        const bottomHue = (hue + 20) % 360;
        bottomPipe.style.boxShadow = `0 0 10px hsl(${bottomHue}, 100%, 50%)`;
        
        // Add pipes to DOM and array
        gameArea.appendChild(topPipe);
        gameArea.appendChild(bottomPipe);
        pipes.push({
            top: topPipe,
            bottom: bottomPipe,
            passed: false,
            x: gameWidth
        });
    }

    // Move pipes and check for collisions
    function updatePipes() {
        for (let i = pipes.length - 1; i >= 0; i--) {
            const pipe = pipes[i];
            
            // Move pipe to the left
            pipe.x -= gameSpeed;
            pipe.top.style.left = `${pipe.x}px`;
            pipe.bottom.style.left = `${pipe.x}px`;

            // Check if pipe is passed
            if (!pipe.passed && pipe.x < 60) {
                pipe.passed = true;
                score++;
                scoreDisplay.textContent = `Score: ${score}`;
                
                // Play cyberpunk score sound
                playSound('score');
                
                // Add glitch effect on score
                addGlitchEffect();
                
                // Increase game speed every 5 points by 1.1x (10% increase)
                if (score % 5 === 0) {
                    gameSpeed *= 1.1;
                    timeBetweenPipes = Math.max(1500, timeBetweenPipes - 100);
                    addGlitchEffect(true);
                }
            }

            // Remove pipes that are off-screen
            if (pipe.x < -80) {
                gameArea.removeChild(pipe.top);
                gameArea.removeChild(pipe.bottom);
                pipes.splice(i, 1);
            } else if (checkCollision(pipe)) {
                gameOver();
                break;
            }
        }
    }

    // Add cyberpunk glitch effect
    function addGlitchEffect(strong = false) {
        const duration = strong ? 500 : 200;
        
        // Add glitch class to game area
        gameArea.classList.add('glitch');
        
        // Add glitch filter to score
        scoreDisplay.style.textShadow = '2px 2px #ff00ff, -2px -2px #00ffff';
        scoreDisplay.style.color = '#ffffff';
        
        // Remove glitch effect after duration
        setTimeout(() => {
            gameArea.classList.remove('glitch');
            scoreDisplay.style.textShadow = '0 0 10px #00ffff, 0 0 20px #00ffff';
            scoreDisplay.style.color = '#00ffff';
        }, duration);
    }

    // Play sound effects
    function playSound(type) {
        if (!soundEnabled || !audioCtx) return;
        
        // Check if context is suspended (browser autoplay policy)
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().then(() => {
                createAndPlaySound(type);
            }).catch(err => {
                console.error('Could not resume audio context:', err);
            });
        } else {
            createAndPlaySound(type);
        }
    }
    
    // Create and play a specific sound
    function createAndPlaySound(type) {
        try {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            switch(type) {
                case 'score':
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(440 + score * 20, audioCtx.currentTime);
                    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
                    oscillator.start();
                    oscillator.stop(audioCtx.currentTime + 0.3);
                    break;
                case 'jump':
                    oscillator.type = 'square';
                    oscillator.frequency.setValueAtTime(660, audioCtx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(330, audioCtx.currentTime + 0.2);
                    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
                    oscillator.start();
                    oscillator.stop(audioCtx.currentTime + 0.2);
                    break;
                case 'gameOver':
                    oscillator.type = 'sawtooth';
                    oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.5);
                    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
                    oscillator.start();
                    oscillator.stop(audioCtx.currentTime + 0.5);
                    break;
            }
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
        } catch (e) {
            console.error('Error playing sound:', e);
        }
    }

    // Check for collision with pipes or boundaries
    function checkCollision(pipe) {
        const birdRect = bird.getBoundingClientRect();
        const topPipeRect = pipe.top.getBoundingClientRect();
        const bottomPipeRect = pipe.bottom.getBoundingClientRect();
        
        // Reduce the effective hitbox size by creating a smaller collision area
        const collisionMargin = 10;
        const effectiveBirdRect = {
            left: birdRect.left + collisionMargin,
            right: birdRect.right - collisionMargin,
            top: birdRect.top + collisionMargin,
            bottom: birdRect.bottom - collisionMargin
        };

        // Check collision with top pipe
        if (
            effectiveBirdRect.right > topPipeRect.left &&
            effectiveBirdRect.left < topPipeRect.right &&
            effectiveBirdRect.top < topPipeRect.bottom
        ) {
            return true;
        }

        // Check collision with bottom pipe
        if (
            effectiveBirdRect.right > bottomPipeRect.left &&
            effectiveBirdRect.left < bottomPipeRect.right &&
            effectiveBirdRect.bottom > bottomPipeRect.top
        ) {
            return true;
        }

        // Check collision with top and bottom boundaries
        if (birdRect.top < 25 || birdRect.bottom > gameHeight - 25) {
            return true;
        }

        return false;
    }

    // Update bird position
    function updateBird() {
        velocity += gravity;
        velocity = Math.min(velocity, 8); // Cap falling speed
        birdPosition += velocity;
        
        bird.style.top = `${birdPosition}px`;

        // Rotate bird based on velocity
        const rotation = velocity * 1.5;
        bird.style.transform = `translateY(-50%) rotate(${rotation}deg)`;
        
        // Add cyberpunk glow effect based on velocity
        const glowIntensity = Math.abs(velocity) * 0.5;
        bird.style.filter = `drop-shadow(0 0 ${5 + glowIntensity}px #00ffff)`;
    }

    // Make the bird jump
    function jump() {
        if (gameRunning) {
            velocity = -8;
            playSound('jump');
        }
    }

    // Start cyberpunk background effects
    function startCyberpunkEffects() {
        // Create occasional glitch effects
        glitchInterval = setInterval(() => {
            if (Math.random() < 0.1) {
                addGlitchEffect(Math.random() < 0.3);
            }
        }, 3000);
    }

    // Game loop
    function gameLoop() {
        if (!gameRunning) return;

        updateBird();
        updatePipes();

        // Create new pipes at intervals
        const currentTime = Date.now();
        if (currentTime - lastPipeTime > timeBetweenPipes) {
            createPipe();
            lastPipeTime = currentTime;
        }

        animationFrame = requestAnimationFrame(gameLoop);
    }

    // Start the game
    function startGame() {
        if (gameRunning) return;
        
        // Initialize audio on first interaction
        if (!audioCtx) {
            initAudio();
            soundToggle.innerHTML = soundEnabled ? '🔊' : '🔇';
        }

        // Reset game state
        gameRunning = true;
        gameSpeed = 2;
        timeBetweenPipes = 2000;
        score = 0;
        scoreDisplay.textContent = `Score: ${score}`;
        highScoreDisplay.textContent = `High Score: ${highScore}`;
        
        // Clear existing pipes
        pipes.forEach(pipe => {
            gameArea.removeChild(pipe.top);
            gameArea.removeChild(pipe.bottom);
        });
        pipes = [];
        lastPipeTime = Date.now();

        // Hide UI elements
        startButton.style.display = 'none';
        gameOverScreen.classList.add('hidden');
        
        // Add game-running class to hide instructions
        container.classList.add('game-running');
        
        // Mark that player has played before
        if (!hasPlayedBefore) {
            sessionStorage.setItem('hasPlayedBefore', 'true');
            hasPlayedBefore = true;
        }

        // Initialize bird and start game loop
        initBird();
        createPipe();
        gameLoop();
        
        // Start cyberpunk effects
        startCyberpunkEffects();
        
        // Add initial glitch effect
        addGlitchEffect(true);
    }

    // Game over
    function gameOver() {
        gameRunning = false;
        cancelAnimationFrame(animationFrame);
        clearInterval(glitchInterval);
        
        // Add strong glitch effect
        addGlitchEffect(true);
        
        // Play game over sound
        playSound('gameOver');
        
        // Update high score if needed
        if (score > highScore) {
            highScore = score;
            sessionStorage.setItem('highScore', highScore);
            highScoreDisplay.textContent = `High Score: ${highScore}`;
            
            // Add extra glitch effect for new high score
            setTimeout(() => addGlitchEffect(true), 600);
        }
        
        // Show game over screen
        finalScoreDisplay.textContent = score;
        
        // Add high score to game over screen
        const highScoreElement = document.getElementById('final-high-score');
        if (highScoreElement) {
            highScoreElement.textContent = highScore;
        } else {
            const highScoreText = document.createElement('p');
            highScoreText.innerHTML = `High Score: <span id="final-high-score">${highScore}</span>`;
            
            // Insert high score before the restart button
            restartButton.parentNode.insertBefore(highScoreText, restartButton);
        }
        
        gameOverScreen.classList.remove('hidden');
        
        // Remove game-running class but keep instructions hidden after first play
        container.classList.remove('game-running');
        if (instructionsPanel && hasPlayedBefore) {
            instructionsPanel.classList.add('hidden');
        }
    }

    // Event listeners
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
    
    // Jump controls
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            jump();
            e.preventDefault(); // Prevent space from scrolling the page
        }
    });
    
    gameArea.addEventListener('click', jump);
    
    // Touch support for mobile
    gameArea.addEventListener('touchstart', (e) => {
        jump();
        e.preventDefault(); // Prevent default touch behavior
    });

    // Initialize bird position
    initBird();
    
    // Auto-start the game in fullscreen mode
    document.addEventListener('click', () => {
        if (!gameRunning) {
            startGame();
        }
    }, { once: true });
}); 