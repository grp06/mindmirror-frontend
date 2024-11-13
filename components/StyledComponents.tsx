import styled, { keyframes } from 'styled-components'

export const Wrapper = styled.div`
  color: #f0f0f0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

export const InputItem = styled.div`
  margin-bottom: 10px;
  width: 100%;
`

export const Label = styled.label`
  color: #f0f0f0;
  font-weight: bold;
  font-size: 1rem;
`
export const Input = styled.input`
  background-color: #3a3a3a;
  color: #f0f0f0;
  border: 1px solid #555;
  padding: 6px 10px;
  border-radius: 4px;
  width: 100%;
  transition: border-color 0.3s ease;
  margin: 5px 0;
  &:focus {
    border-color: #4caf50;
    outline: none;
  }
`

export const Select = styled.select`
  background-color: #3a3a3a;
  color: #f0f0f0;
  border: 1px solid #555;
  padding: 6px 10px;
  border-radius: 4px;
  width: 100%;
  transition: border-color 0.3s ease;
  margin: 5px 0;
  &:focus {
    border-color: #4caf50;
    outline: none;
  }
`

export const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
`

export const Button = styled.button`
  background-color: #4caf50;
  color: #f0f0f0;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-weight: bold;
  &:hover {
    background-color: #45a049;
  }
`

export const RefreshButton = styled(Button)`
  margin: 5px 0;
  background-color: #45a049 !important;
`

export const SaveButton = styled.button`
  background-color: #2196f3;
  color: #f0f0f0;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 20px;

  &:hover {
    background-color: #1e88e5;
  }
`

export const TherapyModal = styled(Wrapper)<{ $isCollapsed: boolean }>`
  position: absolute;
  bottom: 35px;
  overflow-y: auto;
  right: 15px;
  width: 300px;
  background-color: #2c2c2c;
  padding: 20px 20px 20px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
  transform-origin: bottom right;
  transform: ${props => props.$isCollapsed ? 'scale(0)' : 'scale(1)'};
  opacity: ${props => props.$isCollapsed ? 0 : 1};
`

export const CollapseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  color: #f0f0f0;
  cursor: pointer;
  font-size: 16px;
  padding: 5px;
  z-index: 1;
  
  &:hover {
    opacity: 0.8;
  }
`

export const ResponseModalContainer = styled.div`
  position: absolute;
  top: 45px;
  max-height: 60vh;
  overflow-y: auto;
  right: 14px;
  background-color: #2c2c2c;
  border: 1px solid #555;
  padding: 27px 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-family: Arial, sans-serif;
  color: #f0f0f0;
  width: 360px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
`

export const ResponseContent = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  white-space: pre-wrap;
  line-height: 1.5;

  p {
    margin-bottom: 1em;
  }
`

export const ResponseActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #555;
`

export const ActionButton = styled.button`
  background-color: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #fff;
`
export const EmotionsActionButton = styled(ActionButton)`
  background-color: transparent !important;
  border: none;
  font-size: 24px;
  position: absolute;
  cursor: pointer;
  bottom: 7px;
  left: 5px;
`

export const Title = styled.h2`
  margin-top: 0;
  font-size: 1.1rem;
  color: #f0f0f0;
`

export const Content = styled.p`
  margin: 10px 0;
  font-size: 0.9rem;
  line-height: 1.5;
`

export const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`

export const ModalContent = styled.div`
  background: #2c2c2c;
  color: #f0f0f0;
  padding: 15px;
  border-radius: 8px;
  width: 300px;
  position: relative;
`

export const CloseButton = styled.button`
  position: absolute;
  top: 3px;
  right: 7px;
  background: none;
  border: none;
  font-size: 20px;
  padding: 0 7px;
  cursor: pointer;
  color: #888;
  &:hover {
    color: #333;
  }
`

export const EmailDisplay = styled.div`
  color: #f0f0f0;
  margin-top: 10px;
  font-size: 0.9rem;
`

export const ErrorMessage = styled.div`
  color: red;
  margin-bottom: 10px;
`

export const PlusButton = styled.button`
  background-color: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  margin-left: 10px;
  color: #fff; /* Adjust color as needed */
`

export const HeartButton = styled.button`
  background-color: transparent;
  border: none;
  color: #ff5ac0;
  font-size: 1.5em;
  cursor: pointer;
  margin: 0 5px;

  &:hover {
    color: darkred;
  }
`

export const ButtonWrapper = styled.div<{
  $backgroundColor: string
  $isActive?: boolean
}>`
  display: inline-block;
  background-color: ${(props) => props.$backgroundColor};
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 10px;
  font-weight: bold;
  padding: 6px 10px;
  width: 12%;
  margin: 5px;
  opacity: ${(props) => (props.$isActive ? 1 : 0.7)};
  text-align: center;
`

export const BarContainer = styled.div`
  display: flex;
  justify-content: space-around;
  position: fixed;
  bottom: 0px;
  background-color: #222;
  right: 325px;
  width: calc(80% - 325px);
  z-index: 1000;
  border-radius: 8px;
`

export const SecondaryPane = styled.div<{
  $isVisible: boolean
  $category: string
}>`
  display: ${(props) => (props.$isVisible ? 'flex' : 'none')};
  flex-wrap: wrap;
  background-color: #222;
  padding: 3px 10px;
  position: fixed;
  bottom: 35px;
  right: 317px;
  width: calc(80% - 317px);
  z-index: 999;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
`

export const FloatingEmoji = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 75px;
  right: 20px;
  font-size: 24px;
  cursor: pointer;
  z-index: 1001;
  display: ${(props) => (props.$isVisible ? 'block' : 'none')};
`

export const CloseEmotionsButton = styled.div`
  cursor: pointer;
  font-size: 20px;
  margin-left: 10px;
  align-self: center;
`

export const CustomInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

export const CustomInput = styled.input`
  width: 100%;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
`

export const AdvancedSettingsToggle = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-top: 10px;
`

export const ArrowIcon = styled.div<{ $isOpen: boolean }>`
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(90deg)')};
  margin-right: 5px;
  cursor: pointer;
`

export const AdvancedText = styled.span`
  font-size: 0.7rem;
  color: #f0f0f0;
  margin-top: 20px;
`

export const AdvancedSettingsContainer = styled.div`
  width: 100%;
`

// ... existing imports ...

export const CustomNotice = styled.div`
  background-color: #2d3748;
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-size: 16px;
  font-weight: 500;
  max-width: 400px;
  margin: 0 auto;
`

export const FloatingExpandButton = styled.button<{ $isCollapsed: boolean }>`
  position: fixed;
  bottom: 35px;
  right: 15px;
  background-color: #2c2c2c;
  padding: 8px;
  border-radius: 50%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  opacity: ${props => props.$isCollapsed ? 1 : 0};
  visibility: ${props => props.$isCollapsed ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
  z-index: 9999;
  pointer-events: ${props => props.$isCollapsed ? 'auto' : 'none'};
  color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 20px;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #3a3a3a;
  }
`

export const SignInPrompt = styled.div`
  position: fixed;
  bottom: 35px;
  right: 15px;
  background-color: #2c2c2c;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  color: #f0f0f0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
`

export const SignInText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #f0f0f0;
`