import React, { useState, ChangeEvent, useEffect } from 'react'
import {
  ModalWrapper,
  ModalContent,
  Input,
  CloseButton,
  Button,
  ButtonContainer,
  ErrorMessage,
} from './StyledComponents'

interface EmailModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (
    username: string,
    password: string,
    isSignUp: boolean,
  ) => Promise<{ success: boolean; tokens?: { access_token: string; refresh_token: string; access_token_expiration: number } }>
  onForgotPassword: (email: string) => Promise<boolean>
  resetFormFields: () => void
  refreshToken: () => Promise<boolean>
}

const EmailModal: React.FC<EmailModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onForgotPassword,
  resetFormFields,
  refreshToken,
}) => {
  const [isSignUp, setIsSignUp] = useState(true)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const checkTokenExpiration = async () => {
      const expirationTime = localStorage.getItem('accessTokenExpiration');
      if (expirationTime && Date.now() >= parseInt(expirationTime)) {
        const success = await refreshToken();
        if (!success) {
          // Handle refresh failure (e.g., show login modal)
          onClose();
        }
      }
    };

    const intervalId = setInterval(checkTokenExpiration, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [refreshToken, onClose]);

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (isForgotPassword) {
      try {
        const success = await onForgotPassword(email)
        if (success) {
          setError('')
          resetFormFields()
          onClose()
        } else {
          setError('Failed to send password reset email. Please try again.')
        }
      } catch (error) {
        setError(error.message || 'An error occurred. Please try again.')
      }
      return
    }

    if (isSignUp && password !== repeatPassword) {
      setError('Passwords do not match')
      return
    }
    try {
      const result = await onSubmit(email, password, isSignUp)
      if (!result.success) {
        setError('Login failed. Please check your credentials.')
        return
      } else {
        setError('')
        resetFormFields()
        if (result.tokens) {
          localStorage.setItem('accessToken', result.tokens.access_token);
          localStorage.setItem('refreshToken', result.tokens.refresh_token);
          localStorage.setItem('accessTokenExpiration', result.tokens.access_token_expiration.toString());
        }
        onClose()
      }
    } catch (error) {
      setError(error.message || 'An error occurred. Please try again.')
    }
  }

  const handleClose = () => {
    resetFormFields()
    setIsForgotPassword(false)
    onClose()
  }

  const isSignUpDisabled =
    isSignUp &&
    (!email || !password || !repeatPassword || password !== repeatPassword)

  const renderForm = () => {
    if (isForgotPassword) {
      return (
        <>
          <h2>Forgot Password</h2>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
          />
          <ButtonContainer>
            <Button onClick={handleSubmit} disabled={!email}>
              Reset Password
            </Button>
            <Button onClick={() => setIsForgotPassword(false)}>
              Back to Sign In
            </Button>
          </ButtonContainer>
        </>
      )
    }

    return (
      <>
        <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
        />
        <Input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
        />
        {isSignUp && (
          <Input
            type="password"
            placeholder="Repeat your password"
            value={repeatPassword}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setRepeatPassword(e.target.value)
            }
          />
        )}
        <ButtonContainer>
          <Button onClick={handleSubmit} disabled={isSignUpDisabled}>
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
          <Button onClick={() => setIsSignUp(!isSignUp)}>
            Switch to {isSignUp ? 'Sign In' : 'Sign Up'}
          </Button>
          {!isSignUp && (
            <Button onClick={() => setIsForgotPassword(true)}>
              Forgot Password
            </Button>
          )}
        </ButtonContainer>
      </>
    )
  }

  return (
    <ModalWrapper>
      <ModalContent>
        <CloseButton onClick={handleClose}>X</CloseButton>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {renderForm()}
      </ModalContent>
    </ModalWrapper>
  )
}

export default EmailModal