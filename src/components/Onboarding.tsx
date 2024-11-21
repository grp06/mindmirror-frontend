import React from 'react'
import { useAppContext } from '../context/AppContext'
import { OnboardingStep } from '../types'
import {
  OnboardingOverlay,
  OnboardingCard,
  OnboardingTitle,
  OnboardingSubtitle,
  OnboardingButton,
  OnboardingIcon,
} from './StyledComponents'

const Onboarding: React.FC = () => {
  const { onboarding, completeOnboarding, updateOnboardingStep } =
    useAppContext()

  if (!onboarding.isVisible) {
    return null
  }

  const getStepContent = () => {
    const today = new Date().toISOString().split('T')[0]

    switch (onboarding.currentStep) {
      case OnboardingStep.Privacy:
        return {
          title: 'Your Privacy Matters',
          subtitle:
            'Your journal entries are only sent to OpenAI for processing and are never stored on our servers',
          icon: '🔒',
        }
      case OnboardingStep.Usage:
        return {
          title: 'How to Use MindMirror',
          subtitle:
            'Write in your Daily Note and click refresh for AI feedback. Open the menu in the bottom right to customize your experience - choose different therapy styles, insight types, and adjust the tone of your feedback.',
          icon: '💡',
        }
      case OnboardingStep.Emotions:
        return {
          title: 'Track Your Emotions',
          subtitle:
            'Click the heart icon in the bottom right corner to open the emotions bar. Your selected emotions will be integrated into your therapy insights for more personalized feedback.',
          icon: '❤️',
        }
      case OnboardingStep.Complete:
        return {
          title: "You're All Set!",
          subtitle: `Start journaling now, or navigate to previous entries using dates like ${today} in Obsidian's left sidebar`,
          icon: '✨',
        }
      default:
        return null
    }
  }

  const content = getStepContent()
  if (!content) return null

  const handleNext = () => {
    const nextStepMap: Record<OnboardingStep, OnboardingStep> = {
      [OnboardingStep.Privacy]: OnboardingStep.Usage,
      [OnboardingStep.Usage]: OnboardingStep.Emotions,
      [OnboardingStep.Emotions]: OnboardingStep.Complete,
      [OnboardingStep.Complete]: OnboardingStep.None,
      [OnboardingStep.None]: OnboardingStep.None,
    }

    if (onboarding.currentStep === OnboardingStep.Complete) {
      completeOnboarding()
    } else {
      const nextStep = nextStepMap[onboarding.currentStep]
      updateOnboardingStep(nextStep)
    }
  }

  return (
    <OnboardingOverlay>
      <OnboardingCard>
        <OnboardingIcon>{content.icon}</OnboardingIcon>
        <OnboardingTitle>{content.title}</OnboardingTitle>
        <OnboardingSubtitle>{content.subtitle}</OnboardingSubtitle>
        <OnboardingButton onClick={handleNext}>
          {onboarding.currentStep === OnboardingStep.Complete
            ? 'Get Started'
            : 'Next'}
        </OnboardingButton>
      </OnboardingCard>
    </OnboardingOverlay>
  )
}

export default Onboarding
