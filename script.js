let background = document.querySelector('.background');
let character = document.querySelector('.character');
let instruction = document.querySelector('.instruction');
let positionX = 0;
let positionY = 0;
let isMoving = false;
let keysPressed = new Set();
const speed = 20;
let index = 1;
let frames = [
    'perso_arret_droite.png',  // À l'arrêt
    'perso_cours_gauche.png',
    'perso_cours_droite.png',
    'perso_bulle.png',
    'parachute_perso.png',
    'perso_kayak_gauche.png',
    'perso_kayak_droite.png'
];

// PARTIE KAYAK
const positions = [
    { x: 6200, y: -40 },
    { x: 6250, y: 20 },
    { x: 6300, y: 50 },
    { x: 6350, y: 70 },
    { x: 6400, y: 80 },
    { x: 6450, y: 85 },
    { x: 6500, y: 88 },
    { x: 6550, y: 89 },
    { x: 6600, y: 90 },
    { x: 6700, y: 95 },
    { x: 6800, y: 98 },
    { x: 6837, y: 100 },
    { x: 6900, y: 50 },
    { x: 6950, y: -50 },
    { x: 7026, y: -120 },
    { x: 7100, y: -200 },
    { x: 7161, y: -270 },
    { x: 7230, y: -310 },
    { x: 7306, y: -340 },
    { x: 7450, y: -340 },
    { x: 7600, y: -340 },
    { x: 7700, y: -320 },
    { x: 7831, y: -280 },
    { x: 7950, y: -260 },
    { x: 8100, y: -200 }
];
let positionIndex = -1; // Commence à -1 pour que positionIndex++ démarre à 0

// PARTIE SAUT ARBRE
const positions_arbre = [
    { x: 8300, y: -200 },
    { x: 8500, y: -200 },
    { x: 9000, y: -200 },
    { x: 9500, y: -200 },
    { x: 10000, y: -200 },
    { x: 10400, y: -300 }
];

let positionIndex_arbre = -1;

// Ajuster la taille du background en fonction de la taille de la fenêtre
// Pour la deuxieme partie (bleue)
window.addEventListener("load", adjustBackgroundSize);

function adjustBackgroundSize() {
    const backgrounds = [
        { selector: '.second_background1', src: 'second_background_1.png' },
        { selector: '.second_background2', src: 'second_background_2.png' },
        { selector: '.third_background1', src: 'troisiemmeback_1.png' },
        { selector: '.third_background2', src: 'troisiemmeback_2.png' }
    ];

    let previousRight = 6606;

    backgrounds.forEach(bg => {
        let element = document.querySelector(bg.selector);
        if (element) {
            let image = new Image();
            image.src = bg.src;

            image.onload = function () {
                let aspectRatio = image.width / image.height;
                let newWidth = window.innerHeight * aspectRatio;
                element.style.width = newWidth + "px";
                element.style.position = "absolute";
                element.style.left = previousRight + "px";
                previousRight += newWidth;
            };
        }
    });
}
document.querySelectorAll('.second_background1, .second_background2, .third_background1, .third_background2')
    .forEach(el => el.style.left = "");


window.addEventListener('resize', adjustBackgroundSize);
adjustBackgroundSize();


// Ajuster la position des instructions par rapport au personnage
function updateInstructionPosition() {
    let character = document.querySelector('.character');
    let instructions = document.querySelectorAll('.instruction');

    if (character) {
        let characterRect = character.getBoundingClientRect();

        instructions.forEach(instruction => {
            requestAnimationFrame(() => {
                instruction.style.left = (characterRect.right + 100) + "px";
                let middle = (characterRect.top + characterRect.bottom) / 2;
                instruction.style.top = (middle + window.scrollY) + "px";
            });
        });
    }
}

// Mettre à jour la position à chaque mouvement du personnage
document.addEventListener('keydown', updateInstructionPosition);
document.addEventListener('keyup', updateInstructionPosition);
window.addEventListener('resize', updateInstructionPosition);

// Pour la porte
let backgrounds = document.querySelectorAll('.second_background1, .second_background2');
let doorOpened = false;

function checkDoorProximity() {
    let characterRect = character.getBoundingClientRect();
    let door = document.querySelector('.porte');
    let doorRect = door.getBoundingClientRect();

    let distance = Math.abs(doorRect.left - characterRect.right);

    if (!doorOpened && distance < 100) {
        door.style.backgroundImage = "url('porte_ouverte.png')";
        doorOpened = true; // Marquer comme ouverte
        backgrounds.forEach(bg => bg.classList.add('blur-off'));
    }
}

document.addEventListener('keydown', checkDoorProximity);
document.addEventListener('keyup', checkDoorProximity);
window.addEventListener('resize', checkDoorProximity);

let back_transition;
let currentZone = 'start';

document.addEventListener('keydown', async (event) => {
    keysPressed.add(event.key);
    isMoving = keysPressed.size > 0;
    switch (currentZone) {
        case ('start'): // Zones 1 à 5
            handleGroundMovement(event);
            break;

        case ('kayak'): // Kayak
            handleKayakMovement(event);
            break;

        case ('arbres'): // Arbres
            await handleTreeMovement(event);
            break;
    }
    updateZone();
    background.style.transform = `translate(${-positionX}px, ${-positionY}px)`;
}
);
let change;
function updateZone() {
    let previousZone = currentZone;
    if (positionX < 6090) {
        currentZone = 'start';
    } else if (positionX >= 6090 && positionX <= 8100) {
        currentZone = 'kayak';
    } else if (positionX > 8100 && positionX <= 12700) {
        currentZone = 'arbres';
    }
    // Vérifie si on passe du kayak aux arbres
    if (previousZone !== currentZone) {
        resetCharacterState();
    }
}
let previousZone = 'start';
function resetCharacterState() {
    // Retire toutes les classes d'animation pour éviter les conflits
    character.classList.remove('kayak', 'floating', 'parachute', 'running', 'jump');
    // Réinitialise la transformation uniquement si on change de zone
    if (
        (currentZone === 'arbres' && previousZone === 'kayak') ||
        (currentZone === 'kayak' && previousZone === 'arbres')
    ) {
        character.style.transform = 'transform 0.5s';
    }
    else {
        character.style.transform = `translateY(${positionY}px)`;
    }

    // Réinitialise l'index de l'image et applique l'image par défaut
    index = 0;
    character.style.backgroundImage = `url('${frames[index]}')`;
}

// Gestion des déplacements au sol (Zones 1 à 5)
function handleGroundMovement(event) {
    if (positionY === 0 && positionX >= 0 && positionX <= 3400) { // Zone 1
        moveHorizontal(event, 0, 3400);
    }
    if (positionX === 3400 && positionY >= -1000 && positionY <= 0) { // Zone 2 (Bulle)
        moveVertical(event, -1000, 0);
    }
    if (positionX >= 3400 && positionX <= 4860 && positionY === -1000) { // Zone 3
        moveHorizontal(event, 3400, 4860);
    }
    if (positionX === 4860 && positionY >= -1000 && positionY <= 0) { // Zone 4
        moveVertical(event, -1000, 0);
    }
    if (positionY === 0 && positionX >= 4860 && positionX <= 6090) { // Zone 5
        moveHorizontal(event, 4860, 6090);
    }
    updateZone();
}


// Gestion des déplacements en kayak
function handleKayakMovement(event) {
    if (event.key === 'ArrowRight') {
        if (positionIndex < positions.length - 1) {
            positionIndex++;
            positionX = positions[positionIndex].x;
            character.style.transform = `translateY(${positions[positionIndex].y}px)`;
            animateCharacter('right');
        } else {
            positionX = 8300;
            character.style.transform = `translateY(${200}px)`;
        }
    } else if (event.key === 'ArrowLeft') {
        if (positionIndex > 0) {
            positionIndex--;
            positionX = positions[positionIndex].x;
            character.style.transform = `translateY(${positions[positionIndex].y}px)`;
            animateCharacter('left');
        } else {
            positionX = 6089;
        }
    }
    updateZone();
}

async function handleTreeMovement(event) {
    if (positionIndex_arbre === -1) {
        positionIndex_arbre = 0;
        resetCharacterState();
    }

    // Pour éviter toute action si la touche n'est pas correcte
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;

    if (event.key === 'ArrowRight' && positionIndex_arbre < positions_arbre.length - 1) {
        positionIndex_arbre++;
        let currentY = positions_arbre[positionIndex_arbre].y;
        let nextY = currentY - 100;

        character.style.transform = `translateY(${nextY}px)`;
        try {
            // Attendre la fin de la transition avant de continuer
            await waitForTransition();
            let finalY = positions_arbre[positionIndex_arbre].y;
            character.style.transform = `translateY(${finalY}px)`;
            positionX = positions_arbre[positionIndex_arbre].x;
            isMoving = true;
            animateCharacter('right');
        } catch (error) {
            console.error("Erreur lors de la transition: ", error);
        }
    }
    else if (event.key === 'ArrowLeft' && positionIndex_arbre > 0) {
        positionIndex_arbre--;
        let currentY = positions_arbre[positionIndex_arbre].y;
        let nextY = currentY - 100;
        character.style.transform = `translateY(${nextY}px)`;
        // Attendre la fin de la transition avant de continuer
        await waitForTransition();
        let finalY = positions_arbre[positionIndex_arbre].y;
        character.style.transform = `translateY(${finalY}px)`;
        positionX = positions_arbre[positionIndex_arbre].x;
        isMoving = true;
        animateCharacter('left'); // Animation du personnage

    }
    // Si la touche est "ArrowRight" et qu'on est déjà au dernier arbre
    else if (positionIndex_arbre === positions_arbre.length - 1 && event.key === 'ArrowRight') {
        character.style.transform = `translateY(${positions_arbre[positionIndex_arbre].y}px)`;
        positionX = positions_arbre[positionIndex_arbre].x;
    }
    // Si on est au début (pour la touche "ArrowLeft")
    else if (event.key === 'ArrowLeft' && positionIndex_arbre === 0) {
        positionX = 8100;
    }
    updateZone();
}

function waitForTransition() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, 300);
    });
}


// Fonctions utilitaires pour les déplacements
function moveHorizontal(event, minX, maxX) {
    if (event.key === 'ArrowRight' && positionX < maxX) {
        positionX += speed;
        animateCharacter('right');
    } else if (event.key === 'ArrowLeft' && positionX >= minX + speed && positionX != minX) {
        positionX -= speed;
        animateCharacter('left');
    } else if (event.key === 'ArrowLeft' && positionX < minX + speed) {
        positionX = minX;
        animateCharacter('left');
    }
}

function moveVertical(event, minY, maxY) {
    if (event.key === 'ArrowUp' && positionY > minY) {
        positionY -= speed;
        animateCharacter();
    } else if (event.key === 'ArrowDown' && positionY < maxY) {
        positionY += speed;
        animateCharacter();
    }
}

// Événement pour les touches relâchées
document.addEventListener('keyup', (event) => {
    // Supprimer la touche relâchée de l'ensemble
    keysPressed.delete(event.key);
    // Si plus aucune touche n'est enfoncée, réinitialiser l'animation
    if (keysPressed.size === 0) {
        isMoving = false;  // Le personnage n'est plus en mouvement
    }
});

function animateCharacter(direction) {
    let scale;
    character.classList.remove('floating', 'running', 'parachute');
    instruction.style.visibility = 'hidden';
    if (currentZone !== 'kayak') {
        if (isMoving) {
            if (direction == 'right') {
                index = 2;
            } else if (direction == 'left') {
                index = 1;
            }
            if (positionX < 6090)
                character.classList.add('running');
        }
        else {
            index = 0;
            scale = 'scale(1)';
        }

        if (positionX >= 3400 && positionX < 4860) {
            index = 3;
            scale = 'scale(1.3)';
            character.classList.remove('running');
            character.classList.add('floating');
        }
        if (((positionY >= -1000 && positionY < -50) || positionY === 0) && positionX === 4860) {
            index = 4;
            scale = 'scale(1.9)';
            character.classList.add('parachute');
            character.classList.remove('floating');
        }
        character.style.transform = scale;
        character.style.backgroundImage = `url('${frames[index]}')`;

        switch (true) {
            case (positionX === 3400 && positionY <= 0 && positionY >= -50):
            case (positionY === -1000 && positionX >= 3400 && positionX <= 3500):
            case (positionX === 4860 && positionY <= -900 && positionY >= -1000):
            case (positionX === 4860 && positionY <= 0 && positionY >= -50):
                instruction.style.visibility = 'visible';
                break;
            default:
                instruction.style.visibility = 'hidden';
        }
    } else { // Zone Kayak
        if (isMoving) {
            if (direction == 'right') {
                index = 6;
            } else if (direction == 'left') {
                index = 5;
            }
            character.style.backgroundImage = `url('${frames[index]}')`;
        }

    }
}

window.addEventListener('load', () => {
    let launchCount = 0;

    function launchFireworks() {
        if (launchCount < 3) {
            for (let i = 0; i < 3; i++) {
                let x = Math.random() * window.innerWidth;
                let y = Math.random() * (window.innerHeight / 2);
                createFirework(x, y);
            }
            launchCount++;
            setTimeout(launchFireworks, 1000);
        }
    }

    setTimeout(launchFireworks, 1000);
});

function createFirework(x, y) {
    const container = document.querySelector('.fireworks');

    for (let i = 0; i < 80; i++) {
        const spark = document.createElement('div');
        spark.classList.add('spark');
        spark.style.left = `${x}px`;
        spark.style.top = `${y}px`;

        let colors = ['red', 'yellow', 'blue', 'green', 'purple', 'orange', 'white'];
        spark.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * 200 + 50;
        spark.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
        spark.style.setProperty('--y', `${Math.sin(angle) * distance}px`);

        container.appendChild(spark);
    }

    setTimeout(() => container.innerHTML = '', 1000);
}
