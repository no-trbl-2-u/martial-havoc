/**
 * Expo entry point. `registerRootComponent` wires the root on native
 * and, through @expo/metro-runtime, on web.
 */
import { registerRootComponent } from 'expo'
import { App } from './src/App'

registerRootComponent(App)
