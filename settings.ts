// settings.ts
export interface MindMirrorSettings {
  isDevelopment: boolean
  apiKey: string
  apiEndpoints: {
    development: string
    production: string
  }
}

export const DEFAULT_SETTINGS: MindMirrorSettings = {
  isDevelopment: process.env.NODE_ENV === 'development',
  apiKey: '',
  apiEndpoints: {
    development: 'http://localhost:8000',
    production: 'https://api.trymindmirror.com',
  },
}
