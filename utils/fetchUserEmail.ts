import { getApiBaseUrl } from '@/constants'
import { Notice, requestUrl } from 'obsidian'
import { MindMirrorPlugin } from '../types'
import { logRequest, logResponse, logError, loggedRequest } from './debugUtils'

export async function fetchUserEmail(
  authToken: string | null,
  setAuthToken: (token: string | null) => void,
  setEmail: (email: string) => void,
  plugin: MindMirrorPlugin,
  setReflectionsCount?: (count: number) => void
): Promise<void> {
  if (!authToken) {
    return;
  }

  try {
    const apiBaseUrl = getApiBaseUrl(plugin.settings)
    const url = `${apiBaseUrl}/api/user_info/`
    
    const options = {
      url,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }
    
    const response = await loggedRequest(options)

    if (response.status === 200) {
      setEmail(response.json.email)
      plugin.settings.email = response.json.email
      
      if (setReflectionsCount && response.json.reflections_count !== undefined) {
        setReflectionsCount(response.json.reflections_count)
        plugin.settings.reflectionsCount = response.json.reflections_count
      }
      
      await plugin.saveSettings()
    } else {
      // Clear invalid token
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setAuthToken(null)
      setEmail('')
      if (setReflectionsCount) {
        setReflectionsCount(0)
      }
      plugin.settings.email = ''
      plugin.settings.reflectionsCount = 0
      await plugin.saveSettings()
    }
  } catch (error) {
    // Clear invalid token on error
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setAuthToken(null)
    setEmail('')
    plugin.settings.email = ''
    plugin.settings.reflectionsCount = 0
    await plugin.saveSettings()
    throw error
  }
}
