/**
 * Expo entry point. `registerRootComponent` wires the root on native
 * and, through @expo/metro-runtime, on web.
 *
 * The offline worker is registered here rather than inside a component:
 * it is a property of the document, not of any screen, and asking for it
 * once at start-up keeps it out of every render. It is a no-op anywhere
 * a service worker is not available, native included.
 */
import { registerRootComponent } from 'expo'
import { App } from './src/App'
import { registerOfflineWorker } from './src/lib/offline'

registerRootComponent(App)
registerOfflineWorker()
