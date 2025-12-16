// Create the Flexium DevTools panel
chrome.devtools.panels.create(
  'Flexium',
  'icons/icon16.png',
  'panel.html',
  (panel) => {
    console.log('[Flexium DevTools] Panel created')
  }
)
