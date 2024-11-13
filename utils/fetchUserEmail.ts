import { Notice, requestUrl } from 'obsidian'

export async function fetchUserEmail(
  authToken: string | null,
  setAuthToken: (token: string | null) => void,
  setEmail: (email: string) => void
): Promise<void> {
  if (authToken) {
    try {
      const response = await requestUrl({
        url: 'https://trymindmirror.com/api/auth/user_info/',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.status === 200) {
        setEmail(response.json.email)
      } else {
        console.error('Failed to fetch user email')
        setAuthToken(null)
        setEmail('')
        new Notice('Failed to fetch user email')
      }
    } catch (error) {
      console.error('Error fetching user email:', error)
      setAuthToken(null)
      setEmail('')
      new Notice('Error fetching user email')
    }
  }
}
