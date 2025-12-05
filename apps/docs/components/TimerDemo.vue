<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { state } from 'flexium/core'
import { h, render } from 'flexium/dom'

const container = ref(null)
let timerInterval = null

function TimerDemo() {
  const [seconds, setSeconds] = state(0)
  const [isRunning, setIsRunning] = state(false)
  const [laps, setLaps] = state([])

  // Format time as mm:ss.ms
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = Math.floor(totalSeconds % 60)
    const ms = Math.floor((totalSeconds % 1) * 100)
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`
  }

  const startStop = () => {
    if (isRunning()) {
      // Stop
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
      setIsRunning(false)
    } else {
      // Start
      setIsRunning(true)
      timerInterval = setInterval(() => {
        setSeconds(s => s + 0.01)
      }, 10)
    }
  }

  const reset = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    setIsRunning(false)
    setSeconds(0)
    setLaps([])
  }

  const addLap = () => {
    if (isRunning()) {
      setLaps(prev => [seconds(), ...prev])
    }
  }

  return h('div', {
    style: {
      padding: '24px',
      background: '#f9fafb',
      borderRadius: '12px',
      maxWidth: '350px',
      margin: '0 auto',
      textAlign: 'center'
    }
  }, [
    h('h3', { style: { margin: '0 0 16px', color: '#374151' } }, ['Stopwatch']),

    // Timer display
    h('div', {
      style: {
        fontSize: '48px',
        fontWeight: '700',
        fontFamily: 'monospace',
        color: '#111827',
        margin: '20px 0',
        background: '#fff',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }
    }, [() => formatTime(seconds())]),

    // Buttons
    h('div', { style: { display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' } }, [
      // Start/Stop button - use a function to render reactively
      () => h('button', {
        onclick: startStop,
        style: {
          padding: '12px 24px',
          background: isRunning() ? '#ef4444' : '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '14px',
          minWidth: '100px',
          transition: 'background 0.2s'
        }
      }, [isRunning() ? 'Stop' : 'Start']),

      h('button', {
        onclick: addLap,
        style: {
          padding: '12px 24px',
          background: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '14px'
        }
      }, ['Lap']),

      h('button', {
        onclick: reset,
        style: {
          padding: '12px 24px',
          background: '#6b7280',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '14px'
        }
      }, ['Reset'])
    ]),

    // Laps
    h('div', {
      style: {
        maxHeight: '150px',
        overflowY: 'auto',
        textAlign: 'left'
      }
    }, [
      () => {
        const lapList = laps()
        if (lapList.length === 0) return null
        return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
          lapList.map((lap, i) =>
            h('div', {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: 'white',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'monospace'
              }
            }, [
              h('span', { style: { color: '#6b7280' } }, [`Lap ${lapList.length - i}`]),
              h('span', { style: { fontWeight: '600' } }, [formatTime(lap)])
            ])
          )
        )
      }
    ])
  ])
}

onMounted(() => {
  if (container.value) {
    render(TimerDemo(), container.value)
  }
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  if (container.value) {
    container.value.innerHTML = ''
  }
})
</script>

<template>
  <div class="demo-wrapper">
    <div ref="container"></div>
  </div>
</template>

<style scoped>
.demo-wrapper {
  margin: 20px 0;
}

.demo-wrapper :deep(button:hover) {
  filter: brightness(110%);
}

.demo-wrapper :deep(button:active) {
  filter: brightness(90%);
}
</style>
