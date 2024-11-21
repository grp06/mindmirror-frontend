import { TFile, MarkdownView } from 'obsidian'
import { Plugin } from 'obsidian'

export const updateUserInput = (plugin: Plugin): string => {
  const view = plugin.app.workspace.getActiveViewOfType(MarkdownView)

  if (view) {
    return view.editor.getValue()
  }
  return ''
}

export const handlePlusClick = async (plugin: Plugin, advice: string) => {
  const view = plugin.app.workspace.getActiveViewOfType(MarkdownView)
  if (!view) return

  const editor = view.editor
  const currentContent = editor.getValue()
  const updatedContent = `${currentContent}\n\n### AI:\n- ${advice}\n### Me:\n- `
  editor.setValue(updatedContent)

  const lastLine = editor.lineCount() - 1
  editor.setCursor({ line: lastLine, ch: 0 })
  editor.scrollIntoView({
    from: { line: lastLine, ch: 0 },
    to: { line: lastLine, ch: 0 },
  })
}

export const handleHeartClick = async (plugin: Plugin, advice: string) => {
  const view = plugin.app.workspace.getActiveViewOfType(MarkdownView)
  if (!view) return

  const currentNoteFile = view.file
  const currentNoteDate = currentNoteFile?.basename

  const feedbackFile = plugin.app.vault.getAbstractFileByPath('ai-feedback.md')

  if (feedbackFile instanceof TFile) {
    const content = await plugin.app.vault.read(feedbackFile)
    const updatedContent = `### ${currentNoteDate}\n${advice}\n\n${content}`
    await plugin.app.vault.modify(feedbackFile, updatedContent)
  } else {
    const newContent = `### ${currentNoteDate}\n${advice}`
    await plugin.app.vault.create('ai-feedback.md', newContent)
  }
}
