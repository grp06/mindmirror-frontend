import React, { useState, useEffect } from 'react'
import { App, PluginSettingTab, Notice } from 'obsidian'
import { createRoot, Root } from 'react-dom/client'
import { useAppContext, AppProvider } from '../context/AppContext'
import EmailModal from './EmailModal'
import {
  Wrapper,
  InputItem,
  Label,
  Input,
  ButtonContainer,
  Button,
  SaveButton,
  EmailDisplay,
} from './StyledComponents'
import { fetchUserEmail } from '../utils/fetchUserEmail'
import MindMirrorPlugin from '../main'
import { ExtendedApp } from '../types'
import styled from 'styled-components'
import { requestUrl } from 'obsidian'
import { getApiBaseUrl } from '../constants'

const StyledNotice = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 24px;
  background: var(--background-primary);
  color: var(--text-normal);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
  border-left: 4px solid var(--interactive-accent);

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`

const HelpSection = styled.div`
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--background-modifier-border);
`

const FAQItem = styled.div`
  margin-bottom: 24px;
`

const Question = styled.h3`
  color: var(--text-normal);
  margin-bottom: 8px;
  font-size: 1.1em;
`

const Answer = styled.div`
  color: var(--text-muted);
  
  ol {
    margin-left: 20px;
  }
  
  li {
    margin-bottom: 4px;
  }
`

const showCustomNotice = (message: string) => {
  const notice = document.createElement('div')
  const root = createRoot(notice)
  root.render(<StyledNotice>{message}</StyledNotice>)
  document.body.appendChild(notice)

  setTimeout(() => {
    root.unmount()
    document.body.removeChild(notice)
  }, 3000)
}

const SettingsTabContent: React.FC = () => {
  const {
    apiKey,
    setApiKey,
    authToken,
    setAuthToken,
    email,
    setEmail,
    setError,
    plugin,
    removeApiKey,
    setIsUIVisible,
    startOnboarding,
  } = useAppContext()

  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchUserEmail(authToken, setAuthToken, setEmail, plugin)
  }, [authToken, setAuthToken, setEmail, plugin])

  const handleSaveButtonClick = async () => {
    plugin.settings.apiKey = apiKey
    await plugin.saveSettings()
    ;(plugin.app as ExtendedApp).setting.close()
  }

  const handleRemoveApiKey = () => {
    removeApiKey()
    showCustomNotice('API key removed successfully')
  }

  const handleAuthSubmit = async (
    email: string,
    password: string,
    isSignUp: boolean
  ): Promise<{
    success: boolean
    tokens?: {
      access_token: string
      refresh_token: string
      access_token_expiration: number
    }
  }> => {
    try {
      const endpoint = isSignUp ? 'registration/' : 'login/'
      const apiBaseUrl = getApiBaseUrl(plugin.settings)

      const body = isSignUp
        ? { email, password1: password, password2: password }
        : { email, password }
      const response = await requestUrl({
        url: `${apiBaseUrl}/api/${endpoint}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = response.json

      if (data.access_token && data.refresh_token) {
        localStorage.setItem('accessToken', data.access_token)
        localStorage.setItem('refreshToken', data.refresh_token)
        setAuthToken(data.access_token)
        setEmail('')

        handleCloseModal()
        setTimeout(() => {
          showCustomNotice(
            isSignUp ? 'Successfully signed up!' : 'Successfully logged in!'
          )
        }, 100)
        const event = new CustomEvent('auth-status-changed', {
          detail: { isAuthenticated: true },
        })
        document.dispatchEvent(event)
        return {
          success: true,
          tokens: {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            access_token_expiration: Date.now() + 30 * 24 * 60 * 60 * 1000,
          },
        }
      } else if (data.error) {
        console.error('Auth failed:', data.error)
        showCustomNotice(data.error || 'Authentication failed')
        return { success: false }
      } else {
        console.error('Unexpected response format:', data)
        showCustomNotice('Unexpected server response')
        return { success: false }
      }
    } catch (error) {
      console.error('Auth error:', error)
      showCustomNotice(error.message || 'Authentication failed')
      return { success: false }
    }
  }

  const handleForgotPassword = async (email: string) => {
    try {
      const apiBaseUrl = getApiBaseUrl(plugin.settings)
      const response = await requestUrl({
        url: `${apiBaseUrl}/api/password/reset/`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      if (response.status === 200) {
        showCustomNotice('Password reset email sent successfully')
        return true
      } else {
        const errorData = await response.json()
        const errorMessage = Object.values(errorData).flat().join(', ')
        showCustomNotice(errorMessage || 'Failed to send password reset email')
        return false
      }
    } catch (error) {
      console.error('Password reset failed:', error)
      showCustomNotice(error.message || 'Failed to send password reset email')
      return false
    }
  }
  const handleAuthButtonClick = async () => {
    if (authToken) {
      try {
        const apiBaseUrl = getApiBaseUrl(plugin.settings)
        await requestUrl({
          url: `${apiBaseUrl}/api/logout/`,
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('onboardingComplete')
        setAuthToken(null)
        setEmail('')
        setIsUIVisible(false)
        showCustomNotice('Signed out successfully')
        setIsModalOpen(false)

        const event = new CustomEvent('auth-status-changed', {
          detail: { isAuthenticated: false },
        })
        document.dispatchEvent(event)
      } catch (error) {
        console.error('Logout failed:', error)
        showCustomNotice('Logout failed')
      }
    } else {
      setIsModalOpen(true)
    }
  }

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken')
    if (storedToken) {
      setAuthToken(storedToken)
      fetchUserEmail(storedToken, setAuthToken, setEmail, plugin)
    }
  }, [])

  const handleCloseModal = () => {
    setIsModalOpen(false)
    ;(plugin.app as ExtendedApp).setting.close()
  }

  const refreshToken = async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) return false

    try {
      const apiBaseUrl = getApiBaseUrl(plugin.settings)
      const response = await requestUrl({
        url: `${apiBaseUrl}/api/token/refresh/`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      })

      const data = response.json
      if (data.access) {
        localStorage.setItem('accessToken', data.access)
        setAuthToken(data.access)
        return true
      }
      return false
    } catch (error) {
      console.error('Token refresh failed:', error)
      return false
    }
  }

  const faqData = [
    {
      question: 'How do I get started?',
      answer: [
        'Download and install Obsidian from their official website',
        'Open Obsidian and go to Settings',
        'Navigate to the "Community Plugins" tab',
        'Click the purple "Browse" button',
        'Search for "Mind Mirror" and install the plugin',
        'In Obsidian settings, scroll down the left sidebar to find "Mind Mirror"',
        'Click on Mind Mirror and create your account',
        'Start using Mind Mirror for free!'
      ],
    },
    {
      question: 'What is Mind Mirror?',
      answer: "Mind Mirror is an AI-powered journaling companion that provides insights and reflections based on your writing. It's designed to enhance your self-reflection practice with customizable therapy styles and approaches.",
    },
    {
      question: 'How does Mind Mirror work?',
      answer: 'Mind Mirror uses advanced AI to analyze your journal entries and provide thoughtful responses based on your chosen therapy style. Simply write your thoughts, and Mind Mirror will offer insights, questions, and perspectives to help deepen your self-reflection practice.',
    },
    {
      question: 'Is my data private and secure?',
      answer: 'Yes, your privacy is our top priority. All journal entries are encrypted, and we never share your personal data with third parties. You have complete control over your data, including the ability to delete it at any time.',
    },
    {
      question: 'How much does Mind Mirror cost?',
      answer: "Mind Mirror offers a free tier with basic features and a premium subscription for advanced features. Visit our pricing page for detailed information about our subscription plans and what's included in each tier.",
    },
    {
      question: 'Using Your Own OpenAI API Key',
      answer: "You can use Mind Mirror with your own OpenAI API key for unlimited usage, or use our provided API key for limited free access. To use your own key, simply paste it in the field above and click 'Save Settings'."
    }
  ]

  return (
    <Wrapper>
      <InputItem>
        <Label>OpenAI API Key</Label>
        <Input
          type="text"
          value={apiKey}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setApiKey(e.target.value)
          }
          placeholder="Enter your API key"
        />
      </InputItem>
      <ButtonContainer>
        <Button onClick={handleAuthButtonClick}>
          {authToken ? 'Sign Out' : 'Sign up or Sign in'}
        </Button>
        <SaveButton onClick={handleSaveButtonClick}>Save Settings</SaveButton>
        {apiKey && <Button onClick={removeApiKey}>Remove API Key</Button>}
        {authToken && (
          <Button onClick={() => {
            console.log('Restart Tutorial button clicked');
            localStorage.removeItem('onboardingComplete');
            console.log('onboardingComplete removed from localStorage');
            startOnboarding();
            console.log('startOnboarding called from button');
            
            // Dispatch auth event to trigger re-render
            const event = new CustomEvent('auth-status-changed', {
              detail: { isAuthenticated: true }
            });
            document.dispatchEvent(event);
            
            (plugin.app as ExtendedApp).setting.close();
          }}>
            Restart Tutorial
          </Button>
        )}
      </ButtonContainer>
      <EmailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAuthSubmit}
        onForgotPassword={handleForgotPassword}
        resetFormFields={() => {
          setEmail('')
          setError('')
        }}
        refreshToken={refreshToken}
        startOnboarding={startOnboarding}
      />
      {authToken && <EmailDisplay>Signed in as: {email}</EmailDisplay>}
      
      <HelpSection>
        {faqData.map((item, index) => (
          <FAQItem key={index}>
            <Question>{item.question}</Question>
            <Answer>
              {Array.isArray(item.answer) ? (
                <ol>
                  {item.answer.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              ) : (
                <p>{item.answer}</p>
              )}
            </Answer>
          </FAQItem>
        ))}
      </HelpSection>
    </Wrapper>
  )
}

export default class SettingsTab extends PluginSettingTab {
  plugin: MindMirrorPlugin
  root: Root | null = null

  constructor(app: ExtendedApp, plugin: MindMirrorPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this
    if (this.root) {
      this.root.unmount()
    }
    containerEl.empty()
    this.root = createRoot(containerEl)
    this.root.render(
      <AppProvider plugin={this.plugin}>
        <SettingsTabContent />
      </AppProvider>
    )
  }
}
