import { Plugin, MarkdownView, TFile } from 'obsidian'
import React from 'react'
import { createRoot, Root } from 'react-dom/client'
import DropdownContainer from './components/DropdownContainer'
import Onboarding from './components/Onboarding'
import SettingsTab from './components/SettingsTab'
import { AppProvider } from './context/AppContext'
import { ExtendedApp } from './types'
import { DEFAULT_SETTINGS, MindMirrorSettings } from './settings'
import { MindMirrorPlugin } from './types'

// Create a new App component to serve as our root component
const App: React.FC<{ plugin: MindMirrorPlugin }> = ({ plugin }) => {
  return (
    <AppProvider plugin={plugin}>
      <Onboarding />
      <DropdownContainer />
    </AppProvider>
  );
};

export default class MindMirrorPluginImpl extends Plugin implements MindMirrorPlugin {
  root: Root | null = null
  settings: MindMirrorSettings = DEFAULT_SETTINGS
  authMessage = ''

  async getRecentNotes(range: string): Promise<string[]> {
    const files = this.app.vault.getMarkdownFiles()
    const currentFile = this.app.workspace.getActiveFile()

    if (!currentFile) return []

    const dateRegex = /^\d{4}-\d{2}-\d{2}/
    const filteredFiles = files.filter(
      (file) => file.name.startsWith('2024') && dateRegex.test(file.name)
    )

    filteredFiles.sort((a, b) => b.stat.mtime - a.stat.mtime)

    let notesToInclude: TFile[] = []

    if (range === 'just-todays-note') {
      notesToInclude = [currentFile]
    } else {
      const [, count] = range.match(/last(\d+)/) || []
      const numNotes = parseInt(count, 10) || 1

      notesToInclude = [currentFile]
      let foundNotes = 0

      for (const file of filteredFiles) {
        if (file.path !== currentFile.path) {
          notesToInclude.push(file)
          foundNotes++
          if (foundNotes >= numNotes - 1) break
        }
      }
    }

    const noteContents = await Promise.all(
      notesToInclude.map(async (file) => {
        const content = await this.app.vault.read(file)
        return `# ${file.basename}\n\n${content}`
      })
    )

    return noteContents
  }

  async handleEmotionClick(emotion: string) {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView)
    if (!view) return

    const editor = view.editor
    const currentContent = editor.getValue()
    const formattedEmotion = `- ${emotion}`

    let updatedContent
    if (currentContent.startsWith('# Daily Emotions')) {
      const lines = currentContent.split('\n')
      const index = lines.findIndex((line) =>
        line.startsWith('# Daily Emotions')
      )
      lines.splice(index + 1, 0, formattedEmotion)
      updatedContent = lines.join('\n')
    } else {
      updatedContent = `# Daily Emotions\n${formattedEmotion}\n\n${currentContent}`
    }

    editor.setValue(updatedContent)
    editor.setCursor({ line: 0, ch: 0 })
    editor.scrollIntoView({ from: { line: 0, ch: 0 }, to: { line: 0, ch: 0 } })
  }

  async onload() {
    await this.loadSettings()
    this.addSettingTab(new SettingsTab(this.app as ExtendedApp, this))
    
    // Create a container div using React's createRoot
    const reactContainer = document.createElement('div')
    reactContainer.id = 'mind-mirror-root'
    document.body.appendChild(reactContainer)
    
    this.root = createRoot(reactContainer)
    
    // Check for existing auth token
    const existingToken = localStorage.getItem('accessToken')
    console.log('Existing auth token found:', !!existingToken)

    // Render our App component
    this.root.render(<App plugin={this} />)

    if (existingToken) {
      console.log('Dispatching auth-status-changed event')
      setTimeout(() => {
        const event = new CustomEvent('auth-status-changed', {
          detail: { isAuthenticated: true },
        })
        document.dispatchEvent(event)
      }, 0)
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }

  setAuthMessage(message: string) {
    this.authMessage = message
  }
}
