import React, { useRef, useEffect, ReactNode } from 'react'
import { useAppContext } from '../context/AppContext'
import EmotionsBar from './EmotionsBar'
import {
	ResponseModalContainer,
	ResponseContent,
	ResponseActions,
	ActionButton,
	CloseButton,
} from './StyledComponents'
import { ModalState } from '../types'

const ResponseModal: React.FC = () => {
	const {
		result,
		handlePlusClick,
		handleHeartClick,
		isEmotionsBarVisible,
		closeEmotionsBar,
		handleEmotionClick,
		handleCloseModal,
		modalState,
		isTherapistThinking,
		errorMessage,
	} = useAppContext()

	const modalRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				modalRef.current &&
				!modalRef.current.contains(event.target as Node)
			) {
				closeEmotionsBar()
			}
		}

		if (isEmotionsBarVisible) {
			document.addEventListener('mousedown', handleClickOutside)
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [isEmotionsBarVisible, closeEmotionsBar])
	if (modalState === ModalState.Hide) return null

	const formatMarkdown = (text: string): ReactNode[] => {
		const lines = text.split('\n');
		let formattedContent: ReactNode[] = [];
		let listItems: ReactNode[] = [];

		// Remove triple dashes at the beginning and end
		if (lines[0].trim() === '---') lines.shift();
		if (lines[lines.length - 1].trim() === '---') lines.pop();

		const processListItems = () => {
			if (listItems.length > 0) {
				formattedContent.push(<ul key={formattedContent.length}>{listItems}</ul>);
				listItems = [];
			}
		};

		const formatLine = (line: string): string => {
			// Bold
			line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
			// Italic
			line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
			return line;
			};

		lines.forEach((line, index) => {
			// Headers
			if (line.startsWith('# ')) {
				processListItems();
				formattedContent.push(<h1 key={index}>{formatLine(line.slice(2))}</h1>);
			} else if (line.startsWith('## ')) {
				processListItems();
				formattedContent.push(<h2 key={index}>{formatLine(line.slice(3))}</h2>);
			} else if (line.startsWith('### ')) {
				processListItems();
				formattedContent.push(<h3 key={index}>{formatLine(line.slice(4))}</h3>);
			} else if (line.startsWith('#### ')) {
				processListItems();
				formattedContent.push(<h4 key={index}>{formatLine(line.slice(5))}</h4>);
			} else if (line.startsWith('##### ')) {
				processListItems();
				formattedContent.push(<h5 key={index}>{formatLine(line.slice(6))}</h5>);
			} else if (line.startsWith('- ')) {
				listItems.push(<li key={index} dangerouslySetInnerHTML={{ __html: formatLine(line.slice(2)) }} />);
			} else {
				processListItems();
				if (line.trim() !== '') {
					formattedContent.push(<p key={index} dangerouslySetInnerHTML={{ __html: formatLine(line) }} />);
				}
			}
		});

		processListItems();
		return formattedContent;
	};

	return (
		<ResponseModalContainer ref={modalRef}>
			<CloseButton onClick={handleCloseModal}>×</CloseButton>
			<ResponseContent>
				{modalState === ModalState.Initial
					? 'Click refresh to get AI feedback'
						: isTherapistThinking
							? 'Your therapist is pondering your situation...'
							: errorMessage
								? errorMessage
								: formatMarkdown(result)}
			</ResponseContent>
			<ResponseActions>
				<ActionButton onClick={() => handlePlusClick(result)}>➕</ActionButton>
				<ActionButton onClick={() => handleHeartClick(result)}>❤️</ActionButton>
			</ResponseActions>
			{isEmotionsBarVisible && (
				<EmotionsBar onEmotionClick={handleEmotionClick} />
			)}
		</ResponseModalContainer>
	)
}

export default ResponseModal