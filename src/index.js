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
let point0
let point1
let box
let emitter
let camera
let p0Join = false
let p1Join = false

const game = new Phaser.Game(config);

function preload() {
  this.load.image('circle', circle)
  this.load.image('square', square)
}

function create() {
  emitter = new Phaser.Events.EventEmitter()
  camera = this.cameras.add(0, 0, 800, 600)
  camera.setBackgroundColor('#123456')
  graphics = this.add.graphics()
  
  box = this.physics.add.image(400, 300, 'square', 0).setOrigin(0.5).setInteractive()
  curve = new Phaser.Curves.Line([100, 100, 500, 500])
  point0 = this.physics.add.image(curve.p0.x, curve.p0.y, 'circle', 0).setInteractive()
  point1 = this.physics.add.image(curve.p1.x, curve.p1.y, 'circle', 0).setInteractive()

  point0.name = 'dragHandle'
  point1.name = 'dragHandle'
  box.name = 'box'

  point0.setData('vector', curve.p0)
  point1.setData('vector', curve.p1)

  this.input.setDraggable([ point0, point1, box ])

  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    gameObject.x = dragX
    gameObject.y = dragY

    if (p0Join && gameObject.name === 'box') {
      handleStick(point0, dragX, dragY)
    }

    if (p1Join && gameObject.name === 'box') {
      handleStick(point1, dragX, dragY)
    }

    if (gameObject.data) {
      gameObject.data.get('vector').set(dragX, dragY)
    }
  })

  this.input.on('dragend', (pointer, gameObject) => {
    if (!p0Join && !p1Join) {
      emitter.removeListener('changeBackground')
    }
  })

  this.physics.add.collider(point0, box, () => {
    p0Join = true
    handleStick(point0, box.x, box.y)
  })

  this.physics.add.collider(point1, box, () => {
    p1Join = true
    handleStick(point1, box.x, box.y)
  })

  this.input.addListener('pointerup', () => {
    emitter.emit('changeBackground')
  })
}

function update() {
  graphics.clear()
  graphics.lineStyle(2, 0xffffff, 1)
  
  curve.draw(graphics)

  if (point0.x !== box.x && point0.y !== box.y) {
    p0Join = false
  }

  if (point1.x !== box.x && point1.y !== box.y) {
    p1Join = false
  }
}

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