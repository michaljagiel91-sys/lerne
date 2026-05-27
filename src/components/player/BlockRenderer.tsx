'use client'
import { Block, TextBlockContent, ImageBlockContent, AudioBlockContent } from '@/types'
import FillBlankTask from '../tasks/student/FillBlankTask'
import MatchPairsTask from '../tasks/student/MatchPairsTask'
import WordOrderTask from '../tasks/student/WordOrderTask'
import TrueFalseTask from '../tasks/student/TrueFalseTask'
import MultipleChoiceTask from '../tasks/student/MultipleChoiceTask'
import MemoryGame from '../tasks/student/MemoryGame'
import CrosswordGame from '../tasks/student/CrosswordGame'
import TicTacToeGame from '../tasks/student/TicTacToeGame'
import LabyrinthGame from '../tasks/student/LabyrinthGame'
import { Check } from 'lucide-react'

interface Props {
  block: Block
  onResult: (blockId: string, correct: boolean, score: number) => void
  isDone: boolean
  isCompleted: boolean
}

const TASK_LABELS: Record<string, string> = {
  fill_blank: 'Lückentext', match_pairs: 'Zuordnen', word_order: 'Wörter ordnen',
  true_false: 'Wahr oder falsch', multiple_choice: 'Multiple Choice',
  memory: 'Memory', crossword: 'Kreuzworträtsel', tictactoe: 'Tic-Tac-Toe', labyrinth: 'Labyrinth',
}

export default function BlockRenderer({ block, onResult, isDone, isCompleted }: Props) {
  const handleResult = (correct: boolean, score: number) => onResult(block.id, correct, score)

  // Content blocks – no card wrapper for text
  switch (block.type) {
    case 'text': {
      const { html } = block.content as TextBlockContent
      return <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
    }
    case 'image': {
      const { url, caption } = block.content as ImageBlockContent
      if (!url) return null
      return (
        <figure>
          <img src={url} alt={caption || ''} className="w-full max-h-96 object-cover rounded-2xl border border-gray-100 shadow-sm" />
          {caption && <figcaption className="text-center text-sm text-gray-500 mt-2 italic">{caption}</figcaption>}
        </figure>
      )
    }
    case 'audio': {
      const { url, title } = block.content as AudioBlockContent
      if (!url) return null
      return (
        <div className="card p-4 bg-indigo-950 text-white rounded-2xl">
          {title && <p className="text-sm font-semibold mb-3 text-indigo-200">{title}</p>}
          <audio controls src={url} className="w-full h-10" />
        </div>
      )
    }
    case 'video': {
      const { url } = block.content as { url: string }
      if (!url) return null
      const embedUrl = url.includes('youtube.com/watch') ? url.replace('watch?v=', 'embed/') : url.includes('youtu.be/') ? url.replace('youtu.be/', 'www.youtube.com/embed/') : url
      return <iframe src={embedUrl} className="w-full aspect-video rounded-2xl border border-gray-100 shadow-sm" allowFullScreen />
    }
  }

  // Interactive task blocks
  const taskMap: Record<string, React.ReactNode> = {
    fill_blank:      <FillBlankTask task={block as unknown as import('@/types').Task} onResult={handleResult} />,
    match_pairs:     <MatchPairsTask task={block as unknown as import('@/types').Task} onResult={handleResult} />,
    word_order:      <WordOrderTask task={block as unknown as import('@/types').Task} onResult={handleResult} />,
    true_false:      <TrueFalseTask task={block as unknown as import('@/types').Task} onResult={handleResult} />,
    multiple_choice: <MultipleChoiceTask task={block as unknown as import('@/types').Task} onResult={handleResult} />,
    memory:          <MemoryGame task={block as unknown as import('@/types').Task} onResult={handleResult} />,
    crossword:       <CrosswordGame task={block as unknown as import('@/types').Task} onResult={handleResult} />,
    tictactoe:       <TicTacToeGame task={block as unknown as import('@/types').Task} onResult={handleResult} />,
    labyrinth:       <LabyrinthGame task={block as unknown as import('@/types').Task} onResult={handleResult} />,
  }

  return (
    <div className="relative">
      {isDone && (
        <div className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
          <Check size={12} className="text-white" />
        </div>
      )}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{TASK_LABELS[block.type]}</span>
      </div>
      {taskMap[block.type] ?? <p className="text-gray-400 text-sm">Aufgabe nicht verfügbar</p>}
    </div>
  )
}
