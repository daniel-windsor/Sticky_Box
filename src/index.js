import Phaser from "phaser";
import circle from './assets/circle.png'
import square from './assets/square.png'

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let graphics
let curve
let boxes
let points
let emitter
let camera

const game = new Phaser.Game(config);

function preload() {
  this.load.image('circle', circle)
  this.load.image('square', square)
}

function create() {
  // Setup environment
  emitter = new Phaser.Events.EventEmitter()
  camera = this.cameras.add(0, 0, 800, 600)
  camera.setBackgroundColor('#123456')
  graphics = this.add.graphics()


  // Set curve params
  const startPoint = new Phaser.Math.Vector2(50, 50)
  const controlPoint = new Phaser.Math.Vector2(400, 300)
  const endPoint = new Phaser.Math.Vector2(750, 550)

  curve = new Phaser.Curves.QuadraticBezier(startPoint, controlPoint, endPoint)
  

  // Instantiate boxes
  boxes = this.physics.add.group({
    collideWorldBounds: true,
  })

  const box0 = boxes.create(750, 50, 'square')
  const box1 = boxes.create(50, 550, 'square')

  boxes.getChildren().forEach(box => {
    box.setOrigin(0.5)
    box.setInteractive()
    this.input.setDraggable(box)
  })


  // Instantiate points
  points = this.physics.add.group({
    collideWorldBounds: true,
  })

  const point0 = points.create(curve.p0.x, curve.p0.y, 'circle', 0)
  const point1 = points.create(curve.p1.x, curve.p1.y, 'circle', 0)
  const point2 = points.create(curve.p2.x, curve.p2.y, 'circle', 0)

  points.getChildren().forEach(point => {
    point.setInteractive()
    this.input.setDraggable(point)
  })

  point0.setData('vector', curve.p0)
  point1.setData('vector', curve.p1)
  point2.setData('vector', curve.p2)


  // Handle drag
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    gameObject.x = dragX
    gameObject.y = dragY

    if (gameObject.data) {
      gameObject.data.get('vector').set(dragX, dragY)
    }
  })


  // Remove listener if not colliding
  this.input.on('dragend', (pointer, gameObject) => {
    emitter.removeListener('changeBackground')
  })


  // Stick together on collision
  this.physics.add.collider(points, boxes, (_point, _box) => {
    handleStick(_point, _box.x, _box.y)
  })


  // Trigger emit
  this.input.addListener('pointerup', () => {
    emitter.emit('changeBackground')
  })
}

function update() {
  graphics.clear()
  graphics.lineStyle(2, 0xffffff, 1)
  
  curve.draw(graphics)
}

// Stick box and point together and instantiate listener
function handleStick (gameObject, posX, posY) {
  gameObject.data.get('vector').set(posX, posY)
  gameObject.x = posX
  gameObject.y = posY
  
  emitter.addListener('changeBackground', handleColour, this)
}

function handleColour () {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  camera.setBackgroundColor(color)
}