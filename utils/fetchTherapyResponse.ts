import { FetchTherapyResponseParams, TherapyResponse } from '../types'
import MindMirrorPlugin from '../main'
import { requestUrl } from 'obsidian'
import { getApiBaseUrl } from '../constants'

export async function fetchTherapyResponse({
  prompt,
  noteRange,
  length,
  vibe,
  plugin,
}: FetchTherapyResponseParams): Promise<TherapyResponse> {
  try {
    const userApiKey = (plugin as MindMirrorPlugin).settings.apiKey
    const endpoint = userApiKey ? 'openai_with_api_key' : 'openai'
    const API_BASE_URL = getApiBaseUrl(plugin.settings)
    const apiUrl = `${API_BASE_URL}/api/${endpoint}/`

    const notes = await plugin.getRecentNotes(noteRange)
    const notesContent = notes.join('\n\n')

    const authToken = localStorage.getItem('accessToken')
    const headers = {
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : `Bearer ${userApiKey}`,
    }

    const response = await requestUrl({
      url: apiUrl,
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        prompt: prompt,
        notes_content: notesContent,
        length: length,
        vibe: vibe,
        user_api_key: userApiKey,
      }),
    }).catch((error) => {
      throw error
    })

    const data = response.json

    if (response.status !== 200) {
      if (response.status === 401) {
        throw new Error(
          'Unauthorized: Please check your API key or login status'
        )
      }
      throw new Error(data.error || `Server error: ${response.status}`)
    }

    if (!data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from server')
    }

    return {
      content: data.choices[0].message.content,
      remaining_budget: data.remaining_budget || 0,
      spending_limit: data.spending_limit || 0,
      reflections_count: data.reflections_count || 0,
    }
  } catch (error) {
    throw new Error(error.message || 'Failed to generate therapy response')
  }
}
