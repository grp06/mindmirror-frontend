// constants.ts
import { MindMirrorSettings } from './settings'

export const getApiBaseUrl = (settings: MindMirrorSettings): string => {
  if (!settings?.apiEndpoints) {
    throw new Error('Invalid settings: apiEndpoints is required');
  }
  
  return settings.isDevelopment
    ? settings.apiEndpoints.development
    : settings.apiEndpoints.production
}
