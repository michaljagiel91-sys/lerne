'use client'
import { useState } from 'react'
import { Block, BlockType } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Plus, GripVertical, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import BlockEditorPanel from './BlockEditorPanel'
import BlockPreview from './BlockPreview'
import AddBlockMenu from './AddBlockMenu'

interface Props { lessonId: string; initialBlocks: Block[] }

export default function LessonBlockEditor({ lessonId, initialBlocks }: Props) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [saving, setSaving] = useState(false)

  const addBlock = async (type: BlockType) => {
    setSaving(true)
    const supabase = createClient()
    const maxOrder = blocks.length > 0 ? Math.max(...blocks.map(b => b.order_index)) : 0
    const defaultContent = getDefaultContent(type)

    const { data, error } = await supabase.from('blocks').insert({
      lesson_id: lessonId,
      type,
      content: defaultContent,
      order_index: maxOrder + 1,
    }).select().single()

    if (!error && data) {
      setBlocks(prev => [...prev, data])
      setEditingId(data.id)
    }
    setSaving(false)
    setShowAddMenu(false)
  }

  const updateBlock = async (id: string, content: unknown) => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('blocks').update({ content }).eq('id', id)
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content: content as Block['content'] } : b))
    setSaving(false)
    setEditingId(null)
  }

  const deleteBlock = async (id: string) => {
    const supabase = createClient()
    await supabase.from('blocks').delete().eq('id', id)
    setBlocks(prev => prev.filter(b => b.id !== id))
    if (editingId === id) setEditingId(null)
  }

  const moveBlock = async (id: string, dir: 'up' | 'down') => {
    const idx = blocks.findIndex(b => b.id === id)
    if (dir === 'up' && idx === 0) return
    if (dir === 'down' && idx === blocks.length - 1) return

    const newBlocks = [...blocks]
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    ;[newBlocks[idx], newBlocks[swapIdx]] = [newBlocks[swapIdx], newBlocks[idx]]

    const updated = newBlocks.map((b, i) => ({ ...b, order_index: i }))
    setBlocks(updated)

    const supabase = createClient()
    await Promise.all(updated.map(b => supabase.from('blocks').update({ order_index: b.order_index }).eq('id', b.id)))
  }

  return (
    <div className="space-y-3">
      {saving && (
        <div className="fixed top-4 right-4 z-50 px-3 py-2 bg-brand-600 text-white text-xs rounded-lg shadow-lg">
          Speichern...
        </div>
      )}

      {blocks.length === 0 && (
        <div className="card p-12 text-center border-2 border-dashed border-gray-200 bg-transparent shadow-none">
          <p className="text-gray-400 text-sm mb-4">Noch keine Inhalte. Fügen Sie den ersten Block hinzu.</p>
        </div>
      )}

      {blocks.map((block, idx) => (
        <div key={block.id} className={cn('group relative card overflow-hidden', editingId === block.id && 'ring-2 ring-indigo-400')}>
          {/* Block toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <GripVertical size={15} className="text-gray-300" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {BLOCK_LABELS[block.type]}
              </span>
              <span className="text-xs text-gray-400">#{idx + 1}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => moveBlock(block.id, 'up')} disabled={idx === 0} className="btn-ghost p-1.5 disabled:opacity-30">
                <ChevronUp size={14} />
              </button>
              <button onClick={() => moveBlock(block.id, 'down')} disabled={idx === blocks.length - 1} className="btn-ghost p-1.5 disabled:opacity-30">
                <ChevronDown size={14} />
              </button>
              <button onClick={() => setEditingId(editingId === block.id ? null : block.id)} className={cn('btn text-xs px-3 py-1.5', editingId === block.id ? 'bg-indigo-600 text-white' : 'btn-secondary')}>
                {editingId === block.id ? 'Schließen' : 'Bearbeiten'}
              </button>
              <button onClick={() => deleteBlock(block.id)} className="btn-ghost p-1.5 text-gray-400 hover:text-red-500">
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Block content */}
          <div className="p-4">
            {editingId === block.id ? (
              <BlockEditorPanel block={block} onSave={(content) => updateBlock(block.id, content)} onCancel={() => setEditingId(null)} />
            ) : (
              <BlockPreview block={block} />
            )}
          </div>
        </div>
      ))}

      {/* Add block button */}
      <div className="relative">
        <button onClick={() => setShowAddMenu(!showAddMenu)} className="btn-secondary w-full border-dashed">
          <Plus size={16} /> Block hinzufügen
        </button>
        {showAddMenu && (
          <AddBlockMenu onSelect={addBlock} onClose={() => setShowAddMenu(false)} />
        )}
      </div>
    </div>
  )
}

const BLOCK_LABELS: Record<string, string> = {
  text: 'Text', image: 'Bild', audio: 'Audio', video: 'Video',
  fill_blank: 'Lückentext', match_pairs: 'Zuordnen', word_order: 'Reihenfolge',
  true_false: 'Wahr/Falsch', multiple_choice: 'Multiple Choice',
  memory: 'Memory', crossword: 'Kreuzworträtsel', tictactoe: 'Tic-Tac-Toe', labyrinth: 'Labyrinth',
}

function getDefaultContent(type: BlockType): unknown {
  switch (type) {
    case 'text':            return { html: '<p>Text hier eingeben...</p>' }
    case 'image':           return { url: '', caption: '' }
    case 'audio':           return { url: '', title: '' }
    case 'video':           return { url: '' }
    case 'fill_blank':      return { text: 'Schreiben Sie hier den Text. Verwenden Sie {{Antwort}} für Lücken.', blanks: [] }
    case 'match_pairs':     return { pairs: [{ left: '', right: '' }, { left: '', right: '' }] }
    case 'word_order':      return { sentence: '', words: [] }
    case 'true_false':      return { statements: [{ text: '', is_true: true }] }
    case 'multiple_choice': return { question: '', options: [{ text: '', is_correct: true }, { text: '', is_correct: false }] }
    case 'memory':          return { pairs: [{ word: '', translation: '' }, { word: '', translation: '' }] }
    case 'crossword':       return { words: [], grid_size: { rows: 10, cols: 10 } }
    case 'tictactoe':       return { questions: Array(9).fill(null).map(() => ({ question: '', answer: '' })) }
    case 'labyrinth':       return { maze: [], vocabulary: [], start: [1,1], end: [9,9] }
    default:                return {}
  }
}
