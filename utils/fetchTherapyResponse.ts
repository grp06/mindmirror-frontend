import { FetchTherapyResponseParams, TherapyResponse } from '../types'
import MyPlugin from '../main'
import { requestUrl } from 'obsidian'

export async function fetchTherapyResponse({
  prompt,
  noteRange,
  length,
  vibe,
  plugin,
}: FetchTherapyResponseParams): Promise<TherapyResponse> {
  try {
    const notes = await plugin.getRecentNotes(noteRange)
    const notesContent = notes.join('\n\n')

    const authToken = localStorage.getItem('accessToken')
    const userApiKey = (plugin as MyPlugin).settings.apiKey

    const endpoint = userApiKey ? 'openai_with_api_key' : 'openai'
    const headers = {
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : `Bearer ${userApiKey}`,
    }

    const response = await requestUrl({
      url: `https://trymindmirror.com/api/auth/${endpoint}/`,
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        prompt: prompt,
        notes_content: notesContent,
        length: length,
        vibe: vibe,
        user_api_key: userApiKey,
      }),
    })

    const data = response.json

    if (response.status !== 200) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Please check your API key or login status')
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
    }
  } catch (error) {
    console.error('Error in fetchTherapyResponse:', error)
    throw new Error(error.message || 'Failed to generate therapy response')
  }
}
