// constants.ts
import { MindMirrorSettings } from './settings'

export const getApiBaseUrl = (settings: MindMirrorSettings): string => {
  return settings.isDevelopment
    ? settings.apiEndpoints.development
    : settings.apiEndpoints.production
}
