'use client'
import { useState } from 'react'
import { Block } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Trophy, Check } from 'lucide-react'
import BlockRenderer from './BlockRenderer'

interface Props { blocks: Block[]; assignmentId: string; isCompleted: boolean }

export default function LessonPlayer({ blocks, assignmentId, isCompleted: initCompleted }: Props) {
  const [results, setResults] = useState<Record<string, { correct: boolean; score: number }>>({})
  const [completed, setCompleted] = useState(initCompleted)

  const interactiveBlocks = blocks.filter(b =>
    ['fill_blank','match_pairs','word_order','true_false','multiple_choice','memory','crossword','tictactoe','labyrinth'].includes(b.type)
  )

  const handleResult = async (blockId: string, correct: boolean, score: number) => {
    setResults(prev => ({ ...prev, [blockId]: { correct, score } }))
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('block_results').upsert({
      assignment_id: assignmentId,
      block_id: blockId,
      student_id: user!.id,
      is_correct: correct,
      score,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'assignment_id,block_id' })
  }

  const handleFinish = async () => {
    const totalScore = Object.values(results).reduce((s, r) => s + r.score, 0)
    const supabase = createClient()
    await supabase.from('assignments').update({
      is_completed: true,
      score: totalScore,
      completed_at: new Date().toISOString(),
    }).eq('id', assignmentId)
    setCompleted(true)
  }

  const doneCount = Object.keys(results).length
  const totalInteractive = interactiveBlocks.length
  const totalScore = Object.values(results).reduce((s, r) => s + r.score, 0)

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      {totalInteractive > 0 && !completed && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-gray-600 font-medium">Fortschritt</span>
            <span className="text-gray-500">{doneCount}/{totalInteractive} Aufgaben · {totalScore} Punkte</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${totalInteractive > 0 ? (doneCount / totalInteractive) * 100 : 0}%` }} />
          </div>
        </div>
      )}

      {/* Render all blocks top to bottom */}
      {blocks.map(block => (
        <BlockRenderer
          key={block.id}
          block={block}
          onResult={handleResult}
          isDone={!!results[block.id]}
          isCompleted={completed}
        />
      ))}

      {/* Finish button */}
      {!completed && totalInteractive > 0 && (
        <div className="card p-5 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Lektion abschließen</p>
            <p className="text-sm text-gray-500">{doneCount} von {totalInteractive} Aufgaben bearbeitet</p>
          </div>
          <button onClick={handleFinish} className="btn-primary bg-green-600 hover:bg-green-700">
            <Trophy size={16} /> Abschließen
          </button>
        </div>
      )}

      {completed && (
        <div className="card p-10 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy size={28} className="text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Glückwunsch!</h2>
          <p className="text-gray-500 text-sm mb-3">Diese Lektion wurde abgeschlossen.</p>
          <div className="text-3xl font-bold text-indigo-600">{totalScore} Punkte</div>
        </div>
      )}
    </div>
  )
}
