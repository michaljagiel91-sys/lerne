'use client'
import { useState } from 'react'
import { Task } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react'
import FillBlankTask from './student/FillBlankTask'
import MatchPairsTask from './student/MatchPairsTask'
import WordOrderTask from './student/WordOrderTask'
import TrueFalseTask from './student/TrueFalseTask'
import MultipleChoiceTask from './student/MultipleChoiceTask'
import MemoryGame from './student/MemoryGame'
import CrosswordGame from './student/CrosswordGame'
import TicTacToeGame from './student/TicTacToeGame'
import LabyrinthGame from './student/LabyrinthGame'

interface Props {
  tasks: Task[]
  assignmentId: string
  isCompleted: boolean
}

export default function TaskPlayer({ tasks, assignmentId, isCompleted: initCompleted }: Props) {
  const [current, setCurrent] = useState(0)
  const [results, setResults] = useState<Record<string, { correct: boolean; score: number }>>({})
  const [completed, setCompleted] = useState(initCompleted)

  const task = tasks[current]
  const totalScore = Object.values(results).reduce((sum, r) => sum + r.score, 0)
  const maxScore = tasks.length * 10

  const handleResult = async (correct: boolean, score: number) => {
    setResults(prev => ({ ...prev, [task.id]: { correct, score } }))

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('task_results').upsert({
      assignment_id: assignmentId,
      task_id: task.id,
      student_id: user!.id,
      is_correct: correct,
      score,
      attempts: 1,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'assignment_id,task_id' })
  }

  const handleFinish = async () => {
    const supabase = createClient()
    await supabase.from('assignments').update({
      is_completed: true,
      score: totalScore,
      completed_at: new Date().toISOString(),
    }).eq('id', assignmentId)
    setCompleted(true)
  }

  if (!tasks.length) {
    return (
      <div className="card p-16 text-center">
        <p className="text-gray-500">Diese Lektion hat noch keine Aufgaben.</p>
      </div>
    )
  }

  if (completed) {
    return (
      <div className="card p-16 text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy size={36} className="text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Glückwunsch!</h2>
        <p className="text-gray-500 mb-4">Sie haben diese Lektion abgeschlossen.</p>
        <div className="text-4xl font-bold text-brand-600 mb-1">{totalScore}</div>
        <div className="text-sm text-gray-400">von {maxScore} möglichen Punkten</div>
      </div>
    )
  }

  const taskComponents: Record<string, React.ReactNode> = {
    fill_blank:      <FillBlankTask task={task} onResult={handleResult} />,
    match_pairs:     <MatchPairsTask task={task} onResult={handleResult} />,
    word_order:      <WordOrderTask task={task} onResult={handleResult} />,
    true_false:      <TrueFalseTask task={task} onResult={handleResult} />,
    multiple_choice: <MultipleChoiceTask task={task} onResult={handleResult} />,
    memory:          <MemoryGame task={task} onResult={handleResult} />,
    crossword:       <CrosswordGame task={task} onResult={handleResult} />,
    tictactoe:       <TicTacToeGame task={task} onResult={handleResult} />,
    labyrinth:       <LabyrinthGame task={task} onResult={handleResult} />,
  }

  const allDone = tasks.every(t => results[t.id])

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Aufgabe {current + 1} von {tasks.length}
          </span>
          <span className="text-sm text-gray-500">{totalScore} Punkte</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-500"
            style={{ width: `${((current) / tasks.length) * 100}%` }}
          />
        </div>
        <div className="flex gap-1.5 mt-3">
          {tasks.map((t, i) => (
            <button key={t.id}
              onClick={() => setCurrent(i)}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                results[t.id]
                  ? results[t.id].correct ? 'bg-green-400' : 'bg-red-300'
                  : i === current ? 'bg-brand-400' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Task */}
      <div>
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-gray-900">{task.title}</h2>
          {task.instructions && <p className="text-sm text-gray-500 mt-0.5">{task.instructions}</p>}
        </div>
        {taskComponents[task.type] ?? <p className="text-gray-500">Aufgabentyp nicht unterstützt.</p>}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrent(c => c - 1)} disabled={current === 0} className="btn-secondary">
          <ChevronLeft size={16} /> Zurück
        </button>

        {current < tasks.length - 1 ? (
          <button onClick={() => setCurrent(c => c + 1)} className="btn-primary">
            Weiter <ChevronRight size={16} />
          </button>
        ) : allDone ? (
          <button onClick={handleFinish} className="btn-primary bg-green-600 hover:bg-green-700">
            <Trophy size={16} /> Lektion abschließen
          </button>
        ) : (
          <button onClick={handleFinish} className="btn-secondary text-gray-500">
            Abschließen (ohne alle Aufgaben)
          </button>
        )}
      </div>
    </div>
  )
}
