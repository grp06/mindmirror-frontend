import React, { useState } from 'react'
import {
	InputItem,
	Label,
	Select,
	CustomInputWrapper,
	CustomInput,
} from './StyledComponents'

interface CustomizableDropdownProps {
	label: string
	options: string[]
	value: string
	onChange: (value: string) => void
	onCustomSubmit: (value: string) => void
	placeholder: string
}

const CustomizableDropdown: React.FC<CustomizableDropdownProps> = ({
	label,
	options,
	value,
	onChange,
	onCustomSubmit,
	placeholder,
}) => {
	const [isCustom, setIsCustom] = useState(false)
	const [customValue, setCustomValue] = useState('')

	const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		if (e.target.value === 'Add my own') {
			setIsCustom(true)
		} else {
			onChange(e.target.value)
		}
	}

	const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCustomValue(e.target.value)
	}

	const handleCustomSubmit = () => {
		onCustomSubmit(customValue)
		setIsCustom(false)
		setCustomValue('')
	}

	return (
		<InputItem>
			<Label htmlFor={`${label.toLowerCase().replace(/\s+/g, '-')}-dropdown`}>
				{label}
			</Label>
			{isCustom ? (
				<CustomInputWrapper>
					<CustomInput
						value={customValue}
						onChange={handleCustomInputChange}
						onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
							e.key === 'Enter' && handleCustomSubmit()
						}
						placeholder={placeholder}
					/>
					<button onClick={handleCustomSubmit}>✓</button>
				</CustomInputWrapper>
			) : (
				<Select
					id={`${label.toLowerCase().replace(/\s+/g, '-')}-dropdown`}
					value={value}
					onChange={handleSelectChange}
				>
					{options.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
					{!options.includes(value) && (
						<option key={value} value={value}>
							{value}
						</option>
					)}
				</Select>
			)}
		</InputItem>
	)
}

export default CustomizableDropdown
