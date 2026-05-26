'use client'
import { useState } from 'react'
import { TaskType, Task } from '@/types'
import { createClient } from '@/lib/supabase/client'
import FillBlankEditor from './FillBlankEditor'
import MatchPairsEditor from './MatchPairsEditor'
import WordOrderEditor from './WordOrderEditor'
import TrueFalseEditor from './TrueFalseEditor'
import MultipleChoiceEditor from './MultipleChoiceEditor'
import MemoryEditor from './MemoryEditor'
import CrosswordEditor from './CrosswordEditor'
import TicTacToeEditor from './TicTacToeEditor'
import LabyrinthEditor from './LabyrinthEditor'
import MediaUpload from './MediaUpload'

interface Props {
  lessonId: string
  taskType: TaskType
  task?: Task
  onSaved: () => void
  onCancel: () => void
}

export default function TaskEditor({ lessonId, taskType, task, onSaved, onCancel }: Props) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [instructions, setInstructions] = useState(task?.instructions ?? '')
  const [content, setContent] = useState<unknown>(task?.content ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!title.trim()) { setError('Bitte geben Sie einen Titel ein.'); return }
    if (!content) { setError('Bitte füllen Sie den Aufgabeninhalt aus.'); return }
    setSaving(true)
    setError('')

    const supabase = createClient()

    if (task) {
      const { error } = await supabase.from('tasks').update({
        title, instructions, content, updated_at: new Date().toISOString()
      }).eq('id', task.id)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { data: last } = await supabase.from('tasks')
        .select('order_index').eq('lesson_id', lessonId)
        .order('order_index', { ascending: false }).limit(1).single()

      const { error } = await supabase.from('tasks').insert({
        lesson_id: lessonId,
        type: taskType,
        title,
        instructions: instructions || null,
        content,
        order_index: (last?.order_index ?? 0) + 1,
      })
      if (error) { setError(error.message); setSaving(false); return }
    }

    onSaved()
  }

  const editorProps = { content, onChange: setContent }

  const editors: Record<TaskType, React.ReactNode> = {
    fill_blank:      <FillBlankEditor {...editorProps} />,
    match_pairs:     <MatchPairsEditor {...editorProps} />,
    word_order:      <WordOrderEditor {...editorProps} />,
    true_false:      <TrueFalseEditor {...editorProps} />,
    multiple_choice: <MultipleChoiceEditor {...editorProps} />,
    memory:          <MemoryEditor {...editorProps} />,
    crossword:       <CrosswordEditor {...editorProps} />,
    tictactoe:       <TicTacToeEditor {...editorProps} />,
    labyrinth:       <LabyrinthEditor {...editorProps} />,
  }

  return (
    <div className="max-w-3xl space-y-5">
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>
      )}

      {/* Common fields */}
      <div className="card p-5 space-y-4">
        <div>
          <label className="label">Aufgabentitel *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            className="input" placeholder="Titel der Aufgabe" />
        </div>
        <div>
          <label className="label">Anweisungen (optional)</label>
          <textarea value={instructions} onChange={e => setInstructions(e.target.value)}
            className="input h-20 resize-none"
            placeholder="Anweisungen für die Lernenden..." />
        </div>
      </div>

      {/* Type-specific editor */}
      <div className="card p-5">
        {editors[taskType]}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Speichern...' : task ? 'Änderungen speichern' : 'Aufgabe erstellen'}
        </button>
        <button onClick={onCancel} className="btn-secondary">Abbrechen</button>
      </div>
    </div>
  )
}
