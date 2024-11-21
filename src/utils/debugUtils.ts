const DEBUG = process.env.NODE_ENV === 'development'

export const logRequest = (url: string, options: any) => {
  if (DEBUG) {
    console.log('🌐 Request:', {
      url,
      method: options.method,
      headers: options.headers,
      body: options.body
    })
  }
}

export const logResponse = (response: any) => {
  if (DEBUG) {
    console.log('✅ Response:', {
      status: response.status,
      data: response.json
    })
  }
}

export const logError = (error: any) => {
  if (DEBUG) {
    console.error('❌ Error:', error)
  }
}

import { requestUrl } from 'obsidian'

export async function loggedRequest(options: any) {
  console.log('🌐 Request:', {
    url: options.url,
    method: options.method,
    headers: options.headers,
    body: options.body
  })
  
  try {
    const response = await requestUrl(options)
    console.log('✅ Response:', {
      status: response.status,
      data: response.json
    })
    return response
  } catch (error) {
    console.error('❌ Request failed:', error)
    throw error
  }
} 