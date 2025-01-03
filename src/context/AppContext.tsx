import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { fetchTherapyResponse } from '../utils/fetchTherapyResponse'

import { AppContextProps, AppProviderProps, ModalState, OnboardingState, OnboardingStep } from '../types'

import {
  handlePlusClick as handlePlusClickUI,
  handleHeartClick as handleHeartClickUI,
} from '../utils/uiInteractions'

import { MarkdownView } from 'obsidian'

const AppContext = createContext<AppContextProps | undefined>(undefined)

export const AppProvider: React.FC<AppProviderProps> = ({
  plugin,
  children,
}) => {
  const [authToken, setAuthToken] = useState<string | null>(
    localStorage.getItem('accessToken'),
  )
  const [apiKey, setApiKey] = useState(plugin.settings.apiKey)
  const [authMessage, setAuthMessage] = useState('')
  const [customInsightFilter, setCustomInsightFilter] = useState('')
  const [customTherapyType, setCustomTherapyType] = useState('')
  const [customVibe, setCustomVibe] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [insightFilter, setInsightFilter] = useState('Give Feedback')
  const [isCustomInsightFilter, setIsCustomInsightFilter] = useState(false)
  const [isCustomTherapyType, setIsCustomTherapyType] = useState(false)
  const [isCustomVibe, setIsCustomVibe] = useState(false)
  const [isEmotionsBarVisible, setIsEmotionsBarVisible] = useState(true)
  const [isTherapistThinking, setIsTherapistThinking] = useState(false)
  const [length, setLength] = useState('one paragraph')
  const [modalState, setModalState] = useState<ModalState>(ModalState.Initial)
  const [noteRange, setNoteRange] = useState('just-todays-note')

  const [result, setResult] = useState('')
  const [therapyType, setTherapyType] = useState('Cognitive Behavioral Therapy')
  const [vibe, setVibe] = useState('Neutral')

  const [isUIVisible, setIsUIVisible] = useState(false)

  const [onboarding, setOnboarding] = useState<OnboardingState>(() => ({
    isComplete: localStorage.getItem('onboardingComplete') === 'true',
    currentStep: OnboardingStep.None,
    isVisible: false
  }));

  const [reflectionsCount, setReflectionsCount] = useState<number>(0)

  const startOnboarding = useCallback(() => {
    const newState = {
      isComplete: false,
      currentStep: OnboardingStep.Privacy,
      isVisible: true
    };
    setOnboarding(newState);
    localStorage.setItem('onboardingComplete', 'false');
  }, []);

  const completeOnboarding = useCallback(() => {
    const newState = {
      isComplete: true,
      currentStep: OnboardingStep.None,
      isVisible: false
    };
    setOnboarding(newState);
    localStorage.setItem('onboardingComplete', 'true');
  }, []);

  const updateOnboardingStep = useCallback((nextStep: OnboardingStep) => {
    const newState = {
      ...onboarding,
      currentStep: nextStep,
      isVisible: true
    };
    setOnboarding(newState);
    localStorage.setItem('onboardingComplete', 'false');
  }, [onboarding]);

  useEffect(() => {
    const handleAuthStatus = (event: CustomEvent) => {
      setIsUIVisible(event.detail.isAuthenticated);
      
      if (event.detail.isAuthenticated) {
        const storedOnboarding = localStorage.getItem('onboardingComplete');
        
        if (!storedOnboarding || !JSON.parse(storedOnboarding)) {
          startOnboarding();
        }
      }
    };

    document.addEventListener('auth-status-changed', handleAuthStatus as EventListener);
    
    return () => {
      document.removeEventListener('auth-status-changed', handleAuthStatus as EventListener);
    };
  }, [startOnboarding]);

  const removeApiKey = useCallback(() => {
    setApiKey('')
    plugin.settings.apiKey = ''
    plugin.saveSettings()
  }, [plugin])

  useEffect(() => {
    const loadSettings = () => {
      setApiKey(plugin.settings.apiKey)
    }
    loadSettings()
  }, [plugin])

  useEffect(() => {
    setIsUIVisible(!!authToken);
  }, [authToken]);

  // migiht be able to delete
  // we were doing this because we wanted to constantly update that progress bar but we got rid of it.

  const generateTherapyResponse = async () => {
    try {
      const prompt = generatePrompt()
      setIsTherapistThinking(true)
      setModalState(ModalState.Show)
      setErrorMessage('')

      const result = await fetchTherapyResponse({
        prompt,
        noteRange,
        length,
        vibe,
        plugin,
      })

      setResult(result.content)
      setModalState(ModalState.Show)
      if (result.reflections_count !== undefined) {
        setReflectionsCount(result.reflections_count)
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to generate response')
    } finally {
      setIsTherapistThinking(false)
    }
  }

  const handleVibeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVibe(e.target.value)
  }

  const generatePrompt = (): string => {
    return `You are the world's top therapist, trained in ${therapyType}. Your only job is to ${insightFilter}. Your responses must always be ${length}. Your response must have the vibe of ${vibe}.`
  }

  const handleTherapyTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTherapyType(e.target.value)
  }

  const handleInsightFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setInsightFilter(e.target.value)
  }

  const handlePlusClick = async (advice: string) => {
    await handlePlusClickUI(plugin, advice)
  }

  const handleHeartClick = async (advice: string) => {
    await handleHeartClickUI(plugin, advice)
  }

  const toggleEmotionsBar = useCallback(() => {
    setIsEmotionsBarVisible((prev) => !prev)
  }, [])

  const closeEmotionsBar = useCallback(() => {
    setIsEmotionsBarVisible(false)
  }, [])

  const handleEmotionClick = useCallback(
    (emotion: string) => {
      const now = new Date()
      const formattedTime = now.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      })
      const formattedEmotion = `${emotion} - ${formattedTime}`
      plugin.handleEmotionClick(formattedEmotion)
    },
    [plugin],
  )

  const handleCloseModal = useCallback(() => {
    setModalState(ModalState.Hide)
  }, [])

  const handleShowModal = useCallback(() => {
    setModalState(ModalState.Show)
  }, [])

  const handleCustomTherapyTypeChange = (value: string) => {
    setCustomTherapyType(value)
  }

  const submitCustomTherapyType = () => {
    if (customTherapyType.trim() !== '') {
      setTherapyType(customTherapyType)
      setIsCustomTherapyType(false)
    }
  }

  const handleCustomInsightFilterChange = (value: string) => {
    setCustomInsightFilter(value)
  }

  const handleCustomVibeChange = (value: string) => {
    setCustomVibe(value)
  }

  const submitCustomInsightFilter = () => {
    setInsightFilter(customInsightFilter)
    setIsCustomInsightFilter(false)
  }

  const submitCustomVibe = () => {
    setVibe(customVibe)
    setIsCustomVibe(false)
  }

  const handleNoteRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newNoteRange = e.target.value
    setNoteRange(newNoteRange)
  }

  return (
    <AppContext.Provider
      value={{
        apiKey,
        authMessage,
        authToken,
        closeEmotionsBar,
        customInsightFilter,
        customTherapyType,
        customVibe,
        email,
        error,
        errorMessage,
        generatePrompt,
        generateTherapyResponse,
        handleCloseModal,
        handleCustomInsightFilterChange,
        handleCustomTherapyTypeChange,
        handleCustomVibeChange,
        handleEmotionClick,
        handleHeartClick,
        handleInsightFilterChange,
        handleNoteRangeChange,
        handlePlusClick,
        handleShowModal,
        handleTherapyTypeChange,
        handleVibeChange,
        insightFilter,
        isCustomInsightFilter,
        isCustomTherapyType,
        isCustomVibe,
        isEmotionsBarVisible,
        isTherapistThinking,
        length,
        modalState,
        noteRange,
        plugin,
        removeApiKey,
        result,
        setApiKey,
        setAuthMessage,
        setAuthToken,
        setCustomInsightFilter,
        setCustomTherapyType,
        setCustomVibe,
        setEmail,
        setError,
        setErrorMessage,
        setInsightFilter,
        setIsCustomInsightFilter,
        setIsCustomTherapyType,
        setIsCustomVibe,
        setLength,
        setModalState,
        setNoteRange,
        setResult,
        setTherapyType,
        setVibe,
        submitCustomInsightFilter,
        submitCustomTherapyType,
        submitCustomVibe,
        therapyType,
        toggleEmotionsBar,
        vibe,
        isUIVisible,
        setIsUIVisible,
        onboarding,
        startOnboarding,
        completeOnboarding,
        updateOnboardingStep,
        reflectionsCount,
        setReflectionsCount,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}

export { AppContext }
