// Service Worker Registration
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker registered:', registration)

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                if (confirm('New version available! Reload to update?')) {
                  window.location.reload()
                }
              }
            })
          }
        })
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    })
  }
}

// Install Prompt
export function setupInstallPrompt() {
  let deferredPrompt: any = null
  const installBanner = document.getElementById('install-banner')
  const installButton = document.getElementById('install-button')
  const dismissButton = document.getElementById('dismiss-button')

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault()
    // Stash the event so it can be triggered later
    deferredPrompt = e
    // Show install banner
    if (installBanner) {
      installBanner.classList.add('show')
    }
  })

  if (installButton) {
    installButton.addEventListener('click', async () => {
      if (!deferredPrompt) {
        return
      }

      // Show the install prompt
      deferredPrompt.prompt()

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice
      console.log(`User response to the install prompt: ${outcome}`)

      // Clear the deferredPrompt
      deferredPrompt = null

      // Hide banner
      if (installBanner) {
        installBanner.classList.remove('show')
      }
    })
  }

  if (dismissButton) {
    dismissButton.addEventListener('click', () => {
      if (installBanner) {
        installBanner.classList.remove('show')
      }
    })
  }

  // Detect if app is installed
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed')
    if (installBanner) {
      installBanner.classList.remove('show')
    }
  })
}
