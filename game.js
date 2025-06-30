document.addEventListener('DOMContentLoaded', () => {
  const scene = document.querySelector('a-scene');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const timerBar = document.getElementById('timerBar');
  const resultMessage = document.getElementById('resultMessage');
  const playButton = document.getElementById('playButton');
  const upButton = document.getElementById('upButton');
  const downButton = document.getElementById('downButton');
  const skyElement = document.querySelector('a-sky');

  // Startbildschirm-Elemente erstellen
  const startScreen = document.createElement('div');
  startScreen.id = 'startScreen';
  startScreen.style.position = 'absolute';
  startScreen.style.top = '0';
  startScreen.style.left = '0';
  startScreen.style.width = '100%';
  startScreen.style.height = '100%';
  startScreen.style.background = "url('szenebilder/startbildschirm.png') no-repeat center center";
  startScreen.style.backgroundSize = 'cover';
  startScreen.style.display = 'flex';
  startScreen.style.flexDirection = 'column';
  startScreen.style.justifyContent = 'center';
  startScreen.style.alignItems = 'center';
  startScreen.style.textAlign = 'center';
  startScreen.style.color = 'white';
  startScreen.style.fontFamily = "'Poppins', sans-serif"; // Schönere Schriftart
  startScreen.style.zIndex = '1000';

  const title = document.createElement('h1');
  title.textContent = 'Bubble Score';
  title.style.fontSize = '4rem';
  title.style.marginBottom = '30px';
  title.style.textShadow = '2px 2px 5px black';
  title.style.marginTop = '-100px'; // Nach oben verschoben

  const info = document.createElement('div');
  info.innerHTML = `
    <p>Schau dich um, sammle so viele Objekte wie möglich in 25 Sekunden!</p>
    <p>Klick auf Pfeile ↑ ↓, um zwischen den Szenen zu wechseln.</p>
  `;
  info.style.fontSize = '1.5rem';
  info.style.color = '#003366'; // Dunkelblau
  info.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'; // Leichter Canvas-Hintergrund
  info.style.padding = '10px 20px';
  info.style.borderRadius = '10px';
  info.style.marginBottom = '20px';

  const startButton = document.createElement('button');
  startButton.textContent = 'Start';
  startButton.style.padding = '15px 30px';
  startButton.style.fontSize = '1.8rem';
  startButton.style.color = 'white';
  startButton.style.backgroundColor = '#0056b3'; // Schönere Blautöne
  startButton.style.border = 'none';
  startButton.style.borderRadius = '10px';
  startButton.style.cursor = 'pointer';
  startButton.style.transition = 'background-color 0.3s';
  startButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
  startButton.addEventListener('mouseover', () => {
    startButton.style.backgroundColor = '#003d80';
  });
  startButton.addEventListener('mouseout', () => {
    startButton.style.backgroundColor = '#0056b3';
  });

  startButton.addEventListener('click', () => {
    // Entferne den Startbildschirm und starte das Spiel
    startScreen.style.display = 'none';
    document.querySelector('.hud-container').style.display = 'block'; // Zeige HUD an
    startGameRound();
  });

  startScreen.appendChild(title);
  startScreen.appendChild(info);
  startScreen.appendChild(startButton);
  document.body.appendChild(startScreen);

  // Verstecke HUD-Elemente, bis das Spiel startet
  document.querySelector('.hud-container').style.display = 'none';

  const trashItemsGargano = [
    { name: 'möwe', url: 'images/möwe.png' },
    { name: 'biene', url: 'images/biene.png' },
    { name: 'marienkäfer', url: 'images/marienkäfer.png' },
    { name: 'schmetterling2', url: 'images/schmetterling2.png' }
  ];

  const trashItemsUnderwater = [
    { name: 'hummer', url: 'images/hummer.png' },
    { name: 'muschel', url: 'images/muschel.png' },
    { name: 'fisch', url: 'images/fisch.png' },
    { name: 'qualle', url: 'images/qualle.png' }
  ];

  const clickSound = new Audio('sounds/coin-collision-sound-342335.mp3');
  const messageSound = new Audio('sounds/game-bonus-144751.mp3');
  const startRoundSound = new Audio('sounds/game-start-317318.mp3');
  const highScoreSound = new Audio('sounds/level-passed-143039.mp3');

  let score = 0;
  let highScore = 0;
  let gameDuration = 25;
  let timerRunning = false;
  let startTime = null;
  let isPaused = false;
  let interval = null;

  function preloadImages() {
    [...trashItemsGargano, ...trashItemsUnderwater].forEach(item => {
      const img = new Image();
      img.src = item.url;
    });
  }

  function spawnTrash() {
    if (isPaused) return;

    const isGarganoScene = skyElement.getAttribute('src') === 'szenebilder/Gargano360.jpg';
    const trashItems = isGarganoScene ? trashItemsGargano : trashItemsUnderwater;
    const emojiCount = Math.floor(Math.random() * 4) + 5;
    const shuffledTrashItems = [...trashItems].sort(() => Math.random() - 0.5);

    document.querySelectorAll('.trash').forEach(trash => {
      scene.removeChild(trash);
    });

    for (let i = 0; i < emojiCount; i++) {
      const item = shuffledTrashItems[i % trashItems.length];
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 4 + 6;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      const y = Math.random() * 2 + 1;

      const trash = document.createElement('a-image');
      trash.setAttribute('src', item.url);
      trash.setAttribute('position', `${x} ${y} ${z}`);
      trash.setAttribute('scale', '1 1 1');
      trash.setAttribute('look-at', '#cameraRig');
      trash.setAttribute('class', 'trash');

      if (isGarganoScene) {
        trash.setAttribute('animation__position', {
          property: 'position',
          dir: 'alternate',
          dur: 5000,
          easing: 'easeInOutSine',
          loop: true,
          to: `${x + 1} ${y + Math.sin(angle) * 0.5} ${z}`
        });
      } else {
        trash.setAttribute('animation__position', {
          property: 'position',
          dir: 'alternate',
          dur: 5000,
          easing: 'easeInOutSine',
          loop: true,
          to: `${x} ${y + 0.5} ${z}`
        });
      }

      trash.addEventListener('click', () => {
        if (trash.parentNode) scene.removeChild(trash);
        score++;
        updateScore();
        createBubbles(x, y, z);
        const clickSoundInstance = new Audio('sounds/coin-collision-sound-342335.mp3');
        clickSoundInstance.play().catch(error => {
          console.error('Sound konnte nicht abgespielt werden:', error);
        });
      });

      scene.appendChild(trash);

      setTimeout(() => {
        if (trash.parentNode) scene.removeChild(trash);
      }, 5000);
    }
  }

  function createBubbles(x, y, z) {
    const count = Math.floor(Math.random() * 4) + 2;
    const isGarganoScene = skyElement.getAttribute('src') === 'szenebilder/Gargano360.jpg';

    for (let i = 0; i < count; i++) {
      const bubble = document.createElement('a-sphere');
      bubble.setAttribute('radius', '0.1');
      bubble.setAttribute('color', isGarganoScene ? '#ffffff' : '#3399ff');
      bubble.setAttribute('opacity', isGarganoScene ? '0.5' : '0.8');
      const bx = x + (Math.random() - 0.5);
      const by = y + (Math.random() - 0.5);
      const bz = z + (Math.random() - 0.5);
      bubble.setAttribute('position', `${bx} ${by} ${bz}`);

      if (isGarganoScene) {
        bubble.setAttribute('animation', `property: position; to: ${bx + 2} ${by} ${bz}; dur: 3000; easing: easeOutQuad`);
        bubble.setAttribute('animation__scale', 'property: scale; to: 0.2 0.2 0.2; dur: 3000; easing: easeOutQuad');
      } else {
        bubble.setAttribute('animation', `property: position; to: ${bx} ${by + 3} ${bz}; dur: 3000; easing: easeOutQuad`);
      }

      scene.appendChild(bubble);

      setTimeout(() => {
        if (bubble.parentNode) scene.removeChild(bubble);
      }, 3000);
    }
  }

  function updateScore() {
    scoreDisplay.textContent = `Score: ${score} | Highscore: ${highScore}`;
  }

  function updateTimer() {
    if (isPaused) return;

    const elapsed = (Date.now() - startTime) / 1000;
    const remaining = Math.max(0, 1 - elapsed / gameDuration);
    timerBar.style.width = `${remaining * 100}%`;

    if (elapsed >= gameDuration) {
      endGame();
    } else {
      requestAnimationFrame(updateTimer);
    }
  }

  function endGame() {
    timerRunning = false;
    clearInterval(interval);

    let isNewHighScore = false;
    if (score > highScore) {
      highScore = score;
      isNewHighScore = true;
    }

    if (isNewHighScore) {
      highScoreSound.play();
    } else {
      messageSound.play();
    }

    // Zeige nur Score und Highscore nach Ablauf der Zeit
    resultMessage.style.display = 'flex';
    resultMessage.style.flexDirection = 'column';
    resultMessage.style.justifyContent = 'center';
    resultMessage.style.alignItems = 'center';
    resultMessage.style.textAlign = 'center';
    resultMessage.style.color = '#003366';
    resultMessage.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    resultMessage.style.padding = '20px';
    resultMessage.style.borderRadius = '10px';
    resultMessage.style.fontFamily = "'Poppins', sans-serif";
    resultMessage.innerHTML = `
      <p style="font-size: 1.5rem;">Your Score: <strong>${score}</strong></p>
      <p style="font-size: 1.5rem;">${isNewHighScore ? `<span style="color: green;">New Highscore: <strong>${highScore}</strong></span>` : `Highscore: <strong>${highScore}</strong>`}</p>
    `;

    setTimeout(() => {
      resultMessage.style.display = 'none';
      startGameRound();
    }, 5000);
  }

  function startGameRound() {
    timerRunning = true;
    score = 0;
    updateScore();
    startTime = Date.now();
    resultMessage.style.display = 'none';

    // Emojis direkt nach 0.5 Sekunden anzeigen
    setTimeout(() => {
      spawnTrash();
    }, 500);

    interval = setInterval(() => {
      if (!timerRunning) clearInterval(interval);
      else spawnTrash();
    }, 5000); // Alle 5 Sekunden neue Trash-Objekte

    requestAnimationFrame(updateTimer);
  }

  playButton.addEventListener('click', () => {
    isPaused = !isPaused;
    playButton.textContent = isPaused ? '▶' : '⏸';

    if (!isPaused && timerRunning) {
      startTime = Date.now() - (gameDuration * 1000 * (1 - parseFloat(timerBar.style.width) / 100));
      requestAnimationFrame(updateTimer);
    }
  });

  // Initialisiere die Buttons basierend auf der Szene
  if (skyElement.getAttribute('src') === 'szenebilder/Gargano360.jpg') {
    upButton.style.display = 'none';
    downButton.style.display = 'block';
  } else {
    downButton.style.display = 'none';
    upButton.style.display = 'block';
  }

  upButton.addEventListener('click', () => {
    skyElement.setAttribute('src', 'szenebilder/Gargano360.jpg');
    console.log('Hintergrundbild wurde auf Gargano360.jpg gewechselt!');
    upButton.style.display = 'none';
    downButton.style.display = 'block';
    spawnTrash();
  });

  downButton.addEventListener('click', () => {
    skyElement.setAttribute('src', 'szenebilder/Unterwasser360.jpg');
    console.log('Hintergrundbild wurde auf Unterwasser360.jpg gewechselt!');
    downButton.style.display = 'none';
    upButton.style.display = 'block';
    spawnTrash();
  });

  // Positioniere den Score rechts neben der Zeitleiste, verschiebe ihn nach oben und mache ihn dunkler
  scoreDisplay.style.position = 'absolute';
  scoreDisplay.style.top = '5px'; // Etwas nach oben verschoben
  scoreDisplay.style.right = '20px'; // Abstand vom rechten Rand bleibt gleich
  scoreDisplay.style.fontSize = '1.2rem';
  scoreDisplay.style.color = '#224466'; // Dunklerer Blauton für bessere Lesbarkeit
  scoreDisplay.style.fontFamily = "'Poppins', sans-serif"; // Einheitliche Schriftart
  scoreDisplay.style.textShadow = 'none'; // Entferne den Textschatten

  preloadImages();
  // Entferne den direkten Aufruf von startGameRound(), damit das Spiel erst nach dem Klick auf "Start" beginnt
  // startGameRound();
});