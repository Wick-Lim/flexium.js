<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { state } from 'flexium/core'
import { f, render } from 'flexium/dom'
import { Image, Text, Column, Row, Pressable } from 'flexium/primitives'

const container = ref(null)

function ImageDemo() {
  const [loadState, setLoadState] = state('idle')
  const [errorState, setErrorState] = state('idle')
  const [currentImage, setCurrentImage] = state(0)

  const images = [
    'https://picsum.photos/seed/flexium1/400/300',
    'https://picsum.photos/seed/flexium2/400/300',
    'https://picsum.photos/seed/flexium3/400/300',
    'https://picsum.photos/seed/flexium4/400/300',
  ]

  const nextImage = () => {
    setCurrentImage(i => (i + 1) % images.length)
    setLoadState('loading')
  }

  const prevImage = () => {
    setCurrentImage(i => (i - 1 + images.length) % images.length)
    setLoadState('loading')
  }

  return Column({ gap: 24, style: { padding: '20px' } }, [
    // Title
    f('h3', {
      style: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 0,
        marginBottom: '8px',
      }
    }, ['Image Component']),

    // Basic image
    f('h4', {
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '8px',
      }
    }, ['Basic Image']),

    Image({
      src: 'https://picsum.photos/seed/flexium-basic/400/300',
      alt: 'Placeholder image',
      style: {
        borderRadius: '8px',
        width: '100%',
        maxWidth: '400px',
        height: 'auto',
        border: '2px solid #e5e7eb',
      }
    }),

    // Different sizes
    f('h4', {
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151',
        marginTop: '16px',
        marginBottom: '8px',
      }
    }, ['Different Sizes']),

    Row({ gap: 12, wrap: true }, [
      Column({ gap: 4, align: 'center' }, [
        Image({
          src: 'https://picsum.photos/seed/flexium-small/100/100',
          alt: 'Small image',
          width: 100,
          height: 100,
          style: {
            borderRadius: '8px',
            border: '2px solid #e5e7eb',
          }
        }),
        Text({
          style: {
            fontSize: '12px',
            color: '#6b7280',
          }
        }, ['100x100'])
      ]),

      Column({ gap: 4, align: 'center' }, [
        Image({
          src: 'https://picsum.photos/seed/flexium-medium/150/150',
          alt: 'Medium image',
          width: 150,
          height: 150,
          style: {
            borderRadius: '8px',
            border: '2px solid #e5e7eb',
          }
        }),
        Text({
          style: {
            fontSize: '12px',
            color: '#6b7280',
          }
        }, ['150x150'])
      ]),

      Column({ gap: 4, align: 'center' }, [
        Image({
          src: 'https://picsum.photos/seed/flexium-large/200/200',
          alt: 'Large image',
          width: 200,
          height: 200,
          style: {
            borderRadius: '8px',
            border: '2px solid #e5e7eb',
          }
        }),
        Text({
          style: {
            fontSize: '12px',
            color: '#6b7280',
          }
        }, ['200x200'])
      ]),
    ]),

    // Rounded images
    f('h4', {
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151',
        marginTop: '16px',
        marginBottom: '8px',
      }
    }, ['Border Radius Variations']),

    Row({ gap: 12, wrap: true, align: 'center' }, [
      Column({ gap: 4, align: 'center' }, [
        Image({
          src: 'https://picsum.photos/seed/flexium-rounded1/120/120',
          alt: 'Slightly rounded',
          width: 120,
          height: 120,
          style: {
            borderRadius: '8px',
            border: '2px solid #e5e7eb',
          }
        }),
        Text({
          style: {
            fontSize: '12px',
            color: '#6b7280',
          }
        }, ['Rounded (8px)'])
      ]),

      Column({ gap: 4, align: 'center' }, [
        Image({
          src: 'https://picsum.photos/seed/flexium-rounded2/120/120',
          alt: 'More rounded',
          width: 120,
          height: 120,
          style: {
            borderRadius: '16px',
            border: '2px solid #e5e7eb',
          }
        }),
        Text({
          style: {
            fontSize: '12px',
            color: '#6b7280',
          }
        }, ['Rounded (16px)'])
      ]),

      Column({ gap: 4, align: 'center' }, [
        Image({
          src: 'https://picsum.photos/seed/flexium-circle/120/120',
          alt: 'Circle',
          width: 120,
          height: 120,
          style: {
            borderRadius: '50%',
            border: '2px solid #e5e7eb',
          }
        }),
        Text({
          style: {
            fontSize: '12px',
            color: '#6b7280',
          }
        }, ['Circle (50%)'])
      ]),
    ]),

    // Image with loading state
    f('h4', {
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151',
        marginTop: '16px',
        marginBottom: '8px',
      }
    }, ['Image Gallery with Loading State']),

    Column({ gap: 12, style: { width: '100%', maxWidth: '400px' } }, [
      f('div', {
        style: {
          position: 'relative',
          width: '100%',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '2px solid #e5e7eb',
        }
      }, [
        Image({
          src: () => images[currentImage()],
          alt: 'Gallery image',
          onLoad: () => setLoadState('loaded'),
          onError: () => setLoadState('error'),
          style: {
            width: '100%',
            height: 'auto',
            display: 'block',
          }
        }),
        // Loading overlay
        () => loadState() === 'loading' ? f('div', {
          style: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(243, 244, 246, 0.8)',
          }
        }, [
          Text({
            style: {
              fontSize: '16px',
              fontWeight: '600',
              color: '#6b7280',
            }
          }, ['Loading...'])
        ]) : null
      ]),

      // Gallery controls
      Row({ gap: 8, justify: 'between', align: 'center' }, [
        Pressable({
          onPress: prevImage,
          style: {
            padding: '8px 16px',
            backgroundColor: '#4f46e5',
            borderRadius: '6px',
            cursor: 'pointer',
          }
        }, [
          Text({
            style: {
              color: 'white',
              fontWeight: '600',
              fontSize: '14px',
            }
          }, ['← Previous'])
        ]),

        Text({
          style: {
            fontSize: '14px',
            color: '#6b7280',
          }
        }, [() => `${currentImage() + 1} / ${images.length}`]),

        Pressable({
          onPress: nextImage,
          style: {
            padding: '8px 16px',
            backgroundColor: '#4f46e5',
            borderRadius: '6px',
            cursor: 'pointer',
          }
        }, [
          Text({
            style: {
              color: 'white',
              fontWeight: '600',
              fontSize: '14px',
            }
          }, ['Next →'])
        ]),
      ]),
    ]),

    // Error state example
    f('h4', {
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151',
        marginTop: '16px',
        marginBottom: '8px',
      }
    }, ['Error Handling']),

    Column({ gap: 8, style: { width: '100%', maxWidth: '300px' } }, [
      f('div', {
        style: {
          position: 'relative',
          backgroundColor: '#fef2f2',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '2px solid #fecaca',
          minHeight: '150px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }
      }, [
        Image({
          src: 'https://invalid-url-that-will-fail.com/image.jpg',
          alt: 'This will fail to load',
          onError: () => setErrorState('error'),
          style: {
            width: '100%',
            height: 'auto',
            display: () => errorState() === 'error' ? 'none' : 'block',
          }
        }),
        // Error message
        () => errorState() === 'error' ? Column({ gap: 8, align: 'center', style: { padding: '20px' } }, [
          Text({
            style: {
              fontSize: '32px',
            }
          }, ['❌']),
          Text({
            style: {
              fontSize: '14px',
              fontWeight: '600',
              color: '#dc2626',
              textAlign: 'center',
            }
          }, ['Failed to load image'])
        ]) : null
      ]),
      Text({
        style: {
          fontSize: '12px',
          color: '#6b7280',
          fontStyle: 'italic',
        }
      }, ['This image will intentionally fail to load'])
    ]),

    // Info text
    f('p', {
      style: {
        marginTop: '16px',
        color: '#6b7280',
        fontSize: '14px',
        fontStyle: 'italic',
      }
    }, ['The Image component provides a cross-platform way to display images with loading and error state handling.'])
  ])
}

onMounted(() => {
  if (container.value) {
    const app = ImageDemo()
    render(app, container.value)
  }
})

onUnmounted(() => {
  if (container.value) {
    container.value.innerHTML = ''
  }
})
</script>

<template>
  <div class="demo-wrapper">
    <div ref="container" class="flexium-container"></div>
  </div>
</template>

<style scoped>
.demo-wrapper {
  margin: 40px 0;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
}
</style>
