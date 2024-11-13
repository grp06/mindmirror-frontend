import React, {
  useEffect,
  useState,
  MouseEvent as ReactMouseEvent,
} from 'react'
import { useAppContext } from '../context/AppContext'
import {
  InputItem,
  Label,
  Select,
  TherapyModal,
  RefreshButton,
  EmotionsActionButton,
  AdvancedSettingsToggle,
  AdvancedSettingsContainer,
  ArrowIcon,
  AdvancedText,
  CollapseButton,
  FloatingExpandButton,
} from './StyledComponents'
import { faCaretRight, faCaretDown, faExpand, faCompress } from '@fortawesome/free-solid-svg-icons'
import ResponseModal from './ResponseModal'
import { therapyTypes, insightFilters, vibeOptions } from '../data'
import CustomizableDropdown from './CustomizableDropdown'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const DropdownContainer: React.FC = () => {
  const {
    authMessage,
    authToken,
    generateTherapyResponse,
    handleInsightFilterChange,
    handleNoteRangeChange,
    handleTherapyTypeChange,
    handleVibeChange,
    insightFilter,
    length,
    noteRange,
    setAuthMessage,
    therapyType,
    toggleEmotionsBar,
    vibe,
    setLength,
    isUIVisible,
  } = useAppContext()

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleAdvancedSettings = () => {
    setIsAdvancedOpen(!isAdvancedOpen)
  }

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  }

  useEffect(() => {
    if (!authToken) {
      setAuthMessage('Please authenticate')
    }
  }, [authToken, setAuthMessage])

  const handleCustomSubmit =
    (type: 'therapy' | 'insight' | 'vibe') => (value: string) => {
      switch (type) {
        case 'therapy':
          handleTherapyTypeChange({
            target: { value },
          } as React.ChangeEvent<HTMLSelectElement>)
          break
        case 'insight':
          handleInsightFilterChange({
            target: { value },
          } as React.ChangeEvent<HTMLSelectElement>)
          break
        case 'vibe':
          handleVibeChange({
            target: { value },
          } as React.ChangeEvent<HTMLSelectElement>)
          break
      }
    }

  useEffect(() => {
    console.log('isUIVisible changed:', isUIVisible);
  }, [isUIVisible]);

  if (!isUIVisible) return null;

  return (
    <>
      {authMessage && <div>{authMessage}</div>}
      <TherapyModal $isCollapsed={isCollapsed}>
        <CollapseButton onClick={toggleCollapse}>
          {isCollapsed ? '↙' : '↘'}
        </CollapseButton>
        <CustomizableDropdown
          label="Type of Therapy"
          options={therapyTypes}
          value={therapyType}
          onChange={(value) =>
            handleTherapyTypeChange({
              target: { value },
            } as React.ChangeEvent<HTMLSelectElement>)
          }
          onCustomSubmit={handleCustomSubmit('therapy')}
          placeholder="Enter your own therapy type"
        />
        <CustomizableDropdown
          label="Insight Filters"
          options={insightFilters}
          value={insightFilter}
          onChange={(value) =>
            handleInsightFilterChange({
              target: { value },
            } as React.ChangeEvent<HTMLSelectElement>)
          }
          onCustomSubmit={handleCustomSubmit('insight')}
          placeholder="Enter the insight you want"
        />

        {isAdvancedOpen && (
          <AdvancedSettingsContainer>
            <CustomizableDropdown
              label="Vibe"
              options={vibeOptions}
              value={vibe}
              onChange={(value) =>
                handleVibeChange({
                  target: { value },
                } as React.ChangeEvent<HTMLSelectElement>)
              }
              onCustomSubmit={handleCustomSubmit('vibe')}
              placeholder="Enter the therapist's vibe"
            />
            <InputItem>
              <Label htmlFor="length-dropdown">Length</Label>
              <Select
                id="length-dropdown"
                value={length}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLength(e.target.value)}
              >
                <option value="one sentence">One Sentence</option>
                <option value="three sentences">Three Sentences</option>
                <option value="one paragraph">One Paragraph</option>
                <option value="as long as possible">As Long As Possible</option>
              </Select>
            </InputItem>
            <InputItem>
              <Label htmlFor="note-range-dropdown">Note Range</Label>
              <Select
                id="note-range-dropdown"
                value={noteRange}
                onChange={handleNoteRangeChange}
              >
                <option value="just-todays-note">Just today's note</option>
                <option value="last2">Last 2 notes</option>
                <option value="last3">Last 3 notes</option>
                <option value="last5">Last 5 notes</option>
                <option value="last10">Last 10 notes</option>
                <option value="last20">Last 20 notes</option>{' '}
                <option value="last50">Last 50 notes</option>
              </Select>
            </InputItem>
          </AdvancedSettingsContainer>
        )}
        <RefreshButton onClick={generateTherapyResponse}>Refresh</RefreshButton>
        <EmotionsActionButton onClick={toggleEmotionsBar}>
          🫀
        </EmotionsActionButton>
        <AdvancedText>
          {isAdvancedOpen ? 'hide' : 'show'} advanced options
        </AdvancedText>
        <ArrowIcon $isOpen={isAdvancedOpen} onClick={toggleAdvancedSettings}>
          <FontAwesomeIcon icon={isAdvancedOpen ? faCaretDown : faCaretRight} />
        </ArrowIcon>
      </TherapyModal>
      <FloatingExpandButton 
        onClick={toggleCollapse} 
        $isCollapsed={isCollapsed}
        aria-label={isCollapsed ? "Expand therapy modal" : "Collapse therapy modal"}
      >
        <FontAwesomeIcon icon={isCollapsed ? faExpand : faCompress} />
      </FloatingExpandButton>
      <ResponseModal />
    </>
  )
}

export default DropdownContainer
