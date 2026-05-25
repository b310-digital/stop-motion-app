import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import HomePage from './pages/HomePage'
import SettingsPage from './pages/SettingsPage'

// AnimatorPage carries the 813-LOC Animator model, gifenc, zip.js, file-saver
// and the MediaExport/Import/Recording services. Split it out via react-router's
// `lazy` route option so users who only visit '/' or '/settings' don't pay for
// the media stack on first load.
export const routes = [
  {
    path: '/',
    Component: App,
    children: [
      { index: true, Component: HomePage },
      {
        path: 'animator',
        lazy: async () => {
          const { default: Component } = await import('./pages/AnimatorPage')
          return { Component }
        },
      },
      { path: 'settings', Component: SettingsPage },
    ],
  },
]

export const router = createBrowserRouter(routes)
