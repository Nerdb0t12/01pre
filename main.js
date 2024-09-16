// Main.js

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();

// Camera (Perspective Camera)
const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 10, 10);
scene.add(directionalLight);

// Floor
const floorGeometry = new THREE.PlaneGeometry(50, 50);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = - Math.PI / 2; // Rotate to make it horizontal
floor.position.y = -1;
scene.add(floor);

// Walls
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xdddddd });

// Back Wall
const backWallGeometry = new THREE.PlaneGeometry(50, 10);
const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
backWall.position.z = -25;
backWall.position.y = 4;
scene.add(backWall);

// Left Wall
const leftWallGeometry = new THREE.PlaneGeometry(50, 10);
const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
leftWall.rotation.y = Math.PI / 2;
leftWall.position.x = -25;
leftWall.position.y = 4;
scene.add(leftWall);

// Right Wall
const rightWallGeometry = new THREE.PlaneGeometry(50, 10);
const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
rightWall.rotation.y = - Math.PI / 2;
rightWall.position.x = 25;
rightWall.position.y = 4;
scene.add(rightWall);

// Ceiling (optional)
const ceilingGeometry = new THREE.PlaneGeometry(50, 50);
const ceiling = new THREE.Mesh(ceilingGeometry, floorMaterial);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = 9;
scene.add(ceiling);

// Player Group
const player = new THREE.Group();
player.position.set(0, 0, 0);
scene.add(player);

// Body
const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2);
const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.position.y = 1; // Raise above the ground
player.add(body);

// Head
const headGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
const head = new THREE.Mesh(headGeometry, headMaterial);
head.position.y = 2.5; // Place on top of the body
player.add(head);

// Arm
const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1);
const armMaterial = new THREE.MeshStandardMaterial({ color: 0xffc0cb });
const arm = new THREE.Mesh(armGeometry, armMaterial);
arm.position.set(0.5, 1.5, 0);
arm.rotation.z = - Math.PI / 4;
player.add(arm);

// Sword
const swordGeometry = new THREE.BoxGeometry(0.1, 0.1, 2);
const swordMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const sword = new THREE.Mesh(swordGeometry, swordMaterial);
sword.position.set(0, -0.5, 0.5);
sword.rotation.x = Math.PI / 2;
arm.add(sword);

// Camera Offset
const cameraOffset = new THREE.Vector3(0, 2, 5);

// Controls
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let mouseX = 0, mouseY = 0;

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

document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = - (event.clientY / window.innerHeight) * 2 + 1;
});

// Fruits and Bombs
const objects = [];

function createFruit() {
  const geometry = new THREE.SphereGeometry(0.3, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const fruit = new THREE.Mesh(geometry, material);
  fruit.position.set(
    (Math.random() - 0.5) * 10, // Random x position within a range
    0,                          // Start at floor level
    player.position.z - 10      // In front of the player
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
    0,
    player.position.z - 10
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

// Update Objects
function updateObjects() {
  objects.forEach((obj, index) => {
    // Move upwards
    obj.position.y += 0.2;

    // Move towards the player (optional)
    obj.position.z += 0.05;

    // Remove objects that go too high
    if (obj.position.y > 10) {
      scene.remove(obj);
      objects.splice(index, 1);
    }
  });
}

// Collision Detection
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

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // Move the player
  const speed = 0.1;
  if (moveForward) player.position.z -= speed;
  if (moveBackward) player.position.z += speed;
  if (moveLeft) player.position.x -= speed;
  if (moveRight) player.position.x += speed;

  // Update the camera to follow the player
  camera.position.copy(player.position).add(cameraOffset);
  camera.lookAt(player.position);

  // Update arm rotation based on mouse
  arm.rotation.z = mouseX * -0.5; // Adjust sensitivity as needed
  arm.rotation.x = mouseY * 0.5;

  // Update objects
  updateObjects();

  // Check collisions
  checkCollisions();

  renderer.render(scene, camera);
}

animate();

// Handle Window Resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
