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
import MyPlugin from '../main'
import { ExtendedApp } from '../types'
import styled from 'styled-components'
import { requestUrl } from 'obsidian'

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
`;

const showCustomNotice = (message: string) => {
  const notice = document.createElement('div');
  const root = createRoot(notice);
  root.render(<StyledNotice>{message}</StyledNotice>);
  document.body.appendChild(notice);

  setTimeout(() => {
    root.unmount();
    document.body.removeChild(notice);
  }, 3000);
};

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
  } = useAppContext()

  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchUserEmail(authToken, setAuthToken, setEmail)
  }, [authToken, setAuthToken, setEmail])

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

      const body = isSignUp
        ? { email, password1: password, password2: password }
        : { email, password }
      const response = await requestUrl({
        url: `https://trymindmirror.com/api/auth/${endpoint}`,
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
          detail: { isAuthenticated: true }
        });
        document.dispatchEvent(event);
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
      const response = await requestUrl({
        url: 'https://trymindmirror.com/api/auth/password/reset/',
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
        await requestUrl({
          url: 'https://trymindmirror.com/api/auth/logout/',
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        setAuthToken(null)
        setEmail('')
        setIsUIVisible(false)
        showCustomNotice('Signed out successfully')
        setIsModalOpen(false)
        
        const event = new CustomEvent('auth-status-changed', {
          detail: { isAuthenticated: false }
        });
        document.dispatchEvent(event);
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
      fetchUserEmail(storedToken, setAuthToken, setEmail)
    }
  }, [])

  const handleCloseModal = () => {
    setIsModalOpen(false)
    ;(plugin.app as ExtendedApp).setting.close()
  }

  const refreshToken = async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const response = await requestUrl({
        url: 'https://trymindmirror.com/api/auth/token/refresh/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      const data = response.json;
      if (data.access) {
        localStorage.setItem('accessToken', data.access);
        setAuthToken(data.access);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

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
      />
      {authToken && <EmailDisplay>Signed in as: {email}</EmailDisplay>}
    </Wrapper>
  )
}

export default class SettingsTab extends PluginSettingTab {
  plugin: MyPlugin
  root: Root | null = null

  constructor(app: ExtendedApp, plugin: MyPlugin) {
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
