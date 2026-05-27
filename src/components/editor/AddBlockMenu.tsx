'use client'
import { useEffect, useRef } from 'react'
import { BlockType } from '@/types'

interface Props { onSelect: (type: BlockType) => void; onClose: () => void }

const GROUPS = [
  {
    label: 'Inhalt',
    items: [
      { type: 'text' as BlockType,  emoji: '📝', label: 'Text / HTML' },
      { type: 'image' as BlockType, emoji: '🖼️', label: 'Bild' },
      { type: 'audio' as BlockType, emoji: '🔊', label: 'Audio (MP3)' },
      { type: 'video' as BlockType, emoji: '🎬', label: 'Video (URL)' },
    ],
  },
  {
    label: 'Übungen',
    items: [
      { type: 'fill_blank' as BlockType,      emoji: '✏️', label: 'Lückentext' },
      { type: 'match_pairs' as BlockType,     emoji: '🔗', label: 'Paare zuordnen' },
      { type: 'word_order' as BlockType,      emoji: '🔀', label: 'Wörter ordnen' },
      { type: 'true_false' as BlockType,      emoji: '✅', label: 'Wahr oder falsch' },
      { type: 'multiple_choice' as BlockType, emoji: '🔘', label: 'Multiple Choice' },
    ],
  },
  {
    label: 'Spiele',
    items: [
      { type: 'memory' as BlockType,    emoji: '🃏', label: 'Memory' },
      { type: 'crossword' as BlockType, emoji: '🔤', label: 'Kreuzworträtsel' },
      { type: 'tictactoe' as BlockType, emoji: '❌', label: 'Tic-Tac-Toe' },
      { type: 'labyrinth' as BlockType, emoji: '🌀', label: 'Labyrinth' },
    ],
  },
]

export default function AddBlockMenu({ onSelect, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div ref={ref} className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-2xl shadow-modal z-50 p-3">
      {GROUPS.map(group => (
        <div key={group.label} className="mb-3 last:mb-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1.5">{group.label}</p>
          <div className="grid grid-cols-4 gap-1.5">
            {group.items.map(item => (
              <button key={item.type} onClick={() => onSelect(item.type)}
                className="flex flex-col items-center gap-1 p-2.5 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-center">
                <span className="text-xl">{item.emoji}</span>
                <span className="text-xs font-medium text-gray-700 leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
