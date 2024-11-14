// constants.ts
import { MindMirrorSettings } from './settings'

// Temporary override for testing production endpoints
export const FORCE_PRODUCTION = false

export const getApiBaseUrl = (settings: MindMirrorSettings): string => {
  if (!settings?.apiEndpoints) {
    throw new Error('Invalid settings: apiEndpoints is required')
  }

  return FORCE_PRODUCTION || !settings.isDevelopment
    ? settings.apiEndpoints.production
    : settings.apiEndpoints.development
}
