import { getApiBaseUrl } from '@/constants'
import { Notice, requestUrl } from 'obsidian'
import { MindMirrorPlugin } from '../types'

export async function fetchUserEmail(
  authToken: string | null,
  setAuthToken: (token: string | null) => void,
  setEmail: (email: string) => void,
  plugin: MindMirrorPlugin
): Promise<void> {
  if (authToken) {
    try {
      const apiBaseUrl = getApiBaseUrl(plugin.settings)
      const response = await requestUrl({
        url: `${apiBaseUrl}/api/user_info/`,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.status === 200) {
        setEmail(response.json.email)
      } else {
        setAuthToken(null)
        setEmail('')
        new Notice('Failed to fetch user email')
      }
    } catch (error) {
      setAuthToken(null)
      setEmail('')
      new Notice('Error fetching user email')
    }
  }
}
