<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { state, effect } from 'flexium/core'
import { f, render } from 'flexium/dom'

const container = ref(null)

const GRID_SIZE = 15
const CELL_SIZE = 24
const CANVAS_WIDTH = GRID_SIZE * CELL_SIZE
const CANVAS_HEIGHT = GRID_SIZE * CELL_SIZE

function SnakeGame() {
  let canvasRef = null
  let animationId = null
  let lastTime = 0
  let cleanupAnimation = null

  // Use plain variables instead of state for game values
  let score = 0
  let highScore = 0
  let gameOver = false
  let paused = false
  let snake = [{ x: 7, y: 7 }]
  let direction = 'RIGHT'
  let nextDirection = 'RIGHT'
  let food = { x: 12, y: 7 }
  let moveTimer = 0

  const generateFood = () => {
    let newFood
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      }
    } while (snake.some(s => s.x === newFood.x && s.y === newFood.y))
    return newFood
  }

  const resetGame = () => {
    if (score > highScore) highScore = score
    score = 0
    gameOver = false
    paused = false
    snake = [{ x: 7, y: 7 }]
    direction = 'RIGHT'
    nextDirection = 'RIGHT'
    food = generateFood()
    moveTimer = 0
  }

  const moveSnake = () => {
    if (gameOver || paused) return

    const opposites = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' }
    if (nextDirection !== opposites[direction]) {
      direction = nextDirection
    }

    const head = snake[0]
    const moves = {
      UP: { x: head.x, y: head.y - 1 },
      DOWN: { x: head.x, y: head.y + 1 },
      LEFT: { x: head.x - 1, y: head.y },
      RIGHT: { x: head.x + 1, y: head.y }
    }
    const newHead = moves[direction]

    // Collision check
    if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
      gameOver = true
      return
    }
    if (snake.slice(1).some(s => s.x === newHead.x && s.y === newHead.y)) {
      gameOver = true
      return
    }

    const newSnake = [newHead, ...snake]
    if (newHead.x === food.x && newHead.y === food.y) {
      score = score + 1
      food = generateFood()
    } else {
      newSnake.pop()
    }
    snake = newSnake
  }

  const handleKeydown = (e) => {
    const tag = e.target.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) {
      return
    }

    const keyMap = {
      ArrowUp: 'UP', w: 'UP', W: 'UP',
      ArrowDown: 'DOWN', s: 'DOWN', S: 'DOWN',
      ArrowLeft: 'LEFT', a: 'LEFT', A: 'LEFT',
      ArrowRight: 'RIGHT', d: 'RIGHT', D: 'RIGHT'
    }
    if (keyMap[e.key]) {
      nextDirection = keyMap[e.key]
      e.preventDefault()
    }
    if (e.key === ' ') {
      if (gameOver) resetGame()
      else paused = !paused
      e.preventDefault()
    }
    if (e.key === 'Enter' && gameOver) {
      resetGame()
      e.preventDefault()
    }
  }

  // Setup keyboard listener and cleanup on mount
  effect(() => {
    document.addEventListener('keydown', handleKeydown)
    return () => {
      if (cleanupAnimation) cleanupAnimation()
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [])

  const renderGame = (ctx) => {
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    gradient.addColorStop(0, '#0f0f23')
    gradient.addColorStop(1, '#1a1a3e')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.lineWidth = 1
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL_SIZE, 0)
      ctx.lineTo(i * CELL_SIZE, CANVAS_HEIGHT)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * CELL_SIZE)
      ctx.lineTo(CANVAS_WIDTH, i * CELL_SIZE)
      ctx.stroke()
    }

    // Food with glow
    ctx.shadowColor = '#ff6b6b'
    ctx.shadowBlur = 15
    ctx.fillStyle = '#ff6b6b'
    ctx.beginPath()
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 3,
      0, Math.PI * 2
    )
    ctx.fill()
    ctx.shadowBlur = 0

    // Snake with gradient
    snake.forEach((segment, i) => {
      const isHead = i === 0
      const progress = 1 - (i / snake.length) * 0.5

      if (isHead) {
        ctx.shadowColor = '#4ade80'
        ctx.shadowBlur = 10
      }

      ctx.fillStyle = isHead ? '#4ade80' : `rgba(74, 222, 128, ${progress})`

      const padding = isHead ? 1 : 2
      ctx.beginPath()
      ctx.roundRect(
        segment.x * CELL_SIZE + padding,
        segment.y * CELL_SIZE + padding,
        CELL_SIZE - padding * 2,
        CELL_SIZE - padding * 2,
        isHead ? 6 : 4
      )
      ctx.fill()
      ctx.shadowBlur = 0

      // Eyes on head
      if (isHead) {
        ctx.fillStyle = '#000'
        const eyeOffset = { UP: [[-4, -2], [4, -2]], DOWN: [[-4, 2], [4, 2]], LEFT: [[-2, -4], [-2, 4]], RIGHT: [[2, -4], [2, 4]] }
        const eyes = eyeOffset[direction] || eyeOffset.RIGHT
        eyes.forEach(([ox, oy]) => {
          ctx.beginPath()
          ctx.arc(
            segment.x * CELL_SIZE + CELL_SIZE / 2 + ox,
            segment.y * CELL_SIZE + CELL_SIZE / 2 + oy,
            2, 0, Math.PI * 2
          )
          ctx.fill()
        })
      }
    })

    // Game over overlay
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      ctx.fillStyle = '#ff6b6b'
      ctx.font = 'bold 28px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30)

      ctx.fillStyle = '#fff'
      ctx.font = '20px system-ui'
      ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 5)

      if (score >= highScore && score > 0) {
        ctx.fillStyle = '#fbbf24'
        ctx.font = '16px system-ui'
        ctx.fillText('🏆 New High Score!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 35)
      }

      ctx.fillStyle = '#888'
      ctx.font = '14px system-ui'
      ctx.fillText('Press SPACE or ENTER to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 65)
    } else if (paused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 28px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
      ctx.fillStyle = '#888'
      ctx.font = '14px system-ui'
      ctx.fillText('Press SPACE to continue', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30)
    }
  }

  const gameLoop = (time) => {
    if (!lastTime) lastTime = time
    const delta = (time - lastTime) / 1000
    lastTime = time

    if (!gameOver && !paused) {
      moveTimer += delta
      const speed = Math.max(0.06, 0.12 - (score * 0.003))
      if (moveTimer >= speed) {
        moveSnake()
        moveTimer = 0
      }
    }

    if (canvasRef) {
      const ctx = canvasRef.getContext('2d')
      renderGame(ctx)
    }

    animationId = requestAnimationFrame(gameLoop)
  }

  return f('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      padding: '24px',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)',
      borderRadius: '16px'
    }
  }, [
    // Score header
    f('div', {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        color: 'white',
        fontSize: '14px'
      }
    }, [
      f('div', { style: { display: 'flex', gap: '24px' } }, [
        f('span', {}, ['Score: ', f('strong', { style: { color: '#4ade80', fontSize: '18px' } }, [score])]),
        f('span', {}, ['Best: ', f('strong', { style: { color: '#fbbf24' } }, [highScore])])
      ]),
      f('span', { style: { color: '#888' } }, ['Arrow Keys / WASD'])
    ]),

    // Canvas
    f('canvas', {
      ref: (el) => {
        canvasRef = el
        if (el) {
          // Start game loop when canvas is created
          animationId = requestAnimationFrame(gameLoop)
          cleanupAnimation = () => {
            if (animationId) cancelAnimationFrame(animationId)
          }
        }
      },
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      style: {
        borderRadius: '12px',
        cursor: 'pointer'
      }
    }),

    // Buttons
    f('div', { style: { display: 'flex', gap: '8px' } }, [
      f('button', {
        onclick: () => {
          if (!gameOver) paused = !paused
        },
        style: {
          padding: '8px 20px',
          background: '#374151',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px'
        }
      }, ['⏸️ Pause']),
      f('button', {
        onclick: resetGame,
        style: {
          padding: '8px 20px',
          background: '#4ade80',
          color: '#000',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600'
        }
      }, ['🔄 New Game'])
    ])
  ])
}

onMounted(() => {
  if (container.value) {
    render(SnakeGame, container.value)
  }
})

onUnmounted(() => {
  if (container.value) {
    container.value.innerHTML = ''
  }
})
</script>

<template>
  <div class="showcase-wrapper">
    <div ref="container" class="flexium-container"></div>
  </div>
</template>

<style scoped>
.showcase-wrapper {
  margin: 40px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
}
.flexium-container :deep(button:hover) {
  filter: brightness(110%);
  transform: scale(1.02);
}
</style>
