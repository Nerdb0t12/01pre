// Create the scene
const scene = new THREE.Scene();

// Create the camera (First-Person Perspective)
const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.z = 5;

// Create the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Directional Light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 10, 0);
scene.add(directionalLight);
// Sword Geometry
const swordGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2);
const swordMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const sword = new THREE.Mesh(swordGeometry, swordMaterial);
sword.position.set(0, -0.5, -1);
scene.add(sword);
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;

document.addEventListener('keydown', (event) => {
  switch(event.key) {
    case 'w': moveForward = true; break;
    case 's': moveBackward = true; break;
    case 'a': moveLeft = true; break;
    case 'd': moveRight = true; break;
  }
});

document.addEventListener('keyup', (event) => {
  switch(event.key) {
    case 'w': moveForward = false; break;
    case 's': moveBackward = false; break;
    case 'a': moveLeft = false; break;
    case 'd': moveRight = false; break;
  }
});
function createRoom() {
  const roomSize = 20;
  const geometry = new THREE.BoxGeometry(roomSize, roomSize, roomSize);
  const material = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.BackSide });
  const room = new THREE.Mesh(geometry, material);
  scene.add(room);
}

createRoom();
const objects = [];

function createFruit() {
  const geometry = new THREE.SphereGeometry(0.3, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const fruit = new THREE.Mesh(geometry, material);
  fruit.position.set(
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10,
    camera.position.z - 20
  );
  fruit.isBomb = false;
  scene.add(fruit);
  objects.push(fruit);
}

function createBomb() {
  const geometry = new THREE.OctahedronGeometry(0.3);
  const material = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const bomb = new THREE.Mesh(geometry, material);
  bomb.position.set(
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10,
    camera.position.z - 20
  );
  bomb.isBomb = true;
  scene.add(bomb);
  objects.push(bomb);
}

function launchObjects() {
  if (Math.random() < 0.8) {
    createFruit();
  } else {
    createBomb();
  }
}

setInterval(launchObjects, 1000);
function updateObjects() {
  objects.forEach((obj, index) => {
    obj.position.z += 0.2;

    // Remove objects that pass the camera
    if (obj.position.z > camera.position.z + 1) {
      scene.remove(obj);
      objects.splice(index, 1);
    }
  });
}
function checkCollisions() {
  const swordBox = new THREE.Box3().setFromObject(sword);

  objects.forEach((obj, index) => {
    const objBox = new THREE.Box3().setFromObject(obj);

    if (swordBox.intersectsBox(objBox)) {
      if (obj.isBomb) {
        alert('Game Over! You sliced a bomb.');
        location.reload(); // Restart the game
      } else {
        // Increase score (implement scoring system)
        console.log('Fruit sliced!');
      }

      // Remove the object
      scene.remove(obj);
      objects.splice(index, 1);
    }
  });
}
function animate() {
  requestAnimationFrame(animate);

  // Move the player
  if (moveForward) camera.position.z -= 0.1;
  if (moveBackward) camera.position.z += 0.1;
  if (moveLeft) camera.position.x -= 0.1;
  if (moveRight) camera.position.x += 0.1;

  // Update objects
  updateObjects();

  // Check collisions
  checkCollisions();

  renderer.render(scene, camera);
}

animate();
document.addEventListener('mousemove', (event) => {
  const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  const mouseY = - (event.clientY / window.innerHeight) * 2 + 1;

  sword.position.x = mouseX * 2;
  sword.position.y = mouseY * 2;
});
