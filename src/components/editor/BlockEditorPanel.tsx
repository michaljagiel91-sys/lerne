'use client'
import { useState } from 'react'
import { Block, BlockType } from '@/types'
import dynamic from 'next/dynamic'
import FillBlankEditor from '../tasks/FillBlankEditor'
import MatchPairsEditor from '../tasks/MatchPairsEditor'
import WordOrderEditor from '../tasks/WordOrderEditor'
import TrueFalseEditor from '../tasks/TrueFalseEditor'
import MultipleChoiceEditor from '../tasks/MultipleChoiceEditor'
import MemoryEditor from '../tasks/MemoryEditor'
import CrosswordEditor from '../tasks/CrosswordEditor'
import TicTacToeEditor from '../tasks/TicTacToeEditor'
import LabyrinthEditor from '../tasks/LabyrinthEditor'
import TextBlockEditor from './TextBlockEditor'
import MediaBlockEditor from './MediaBlockEditor'

interface Props { block: Block; onSave: (content: unknown) => void; onCancel: () => void }

export default function BlockEditorPanel({ block, onSave, onCancel }: Props) {
  const [content, setContent] = useState<unknown>(block.content)

  const editors: Record<BlockType, React.ReactNode> = {
    text:            <TextBlockEditor content={content} onChange={setContent} />,
    image:           <MediaBlockEditor type="image" content={content} onChange={setContent} />,
    audio:           <MediaBlockEditor type="audio" content={content} onChange={setContent} />,
    video:           <MediaBlockEditor type="video" content={content} onChange={setContent} />,
    fill_blank:      <FillBlankEditor content={content} onChange={setContent} />,
    match_pairs:     <MatchPairsEditor content={content} onChange={setContent} />,
    word_order:      <WordOrderEditor content={content} onChange={setContent} />,
    true_false:      <TrueFalseEditor content={content} onChange={setContent} />,
    multiple_choice: <MultipleChoiceEditor content={content} onChange={setContent} />,
    memory:          <MemoryEditor content={content} onChange={setContent} />,
    crossword:       <CrosswordEditor content={content} onChange={setContent} />,
    tictactoe:       <TicTacToeEditor content={content} onChange={setContent} />,
    labyrinth:       <LabyrinthEditor content={content} onChange={setContent} />,
  }

  return (
    <div className="space-y-4">
      {editors[block.type] ?? <p className="text-gray-400">Editor nicht verfügbar</p>}
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <button onClick={() => onSave(content)} className="btn-primary text-sm">Speichern</button>
        <button onClick={onCancel} className="btn-secondary text-sm">Abbrechen</button>
      </div>
    </div>
  )
}
