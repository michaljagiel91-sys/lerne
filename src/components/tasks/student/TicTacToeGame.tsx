'use client'
import { useState } from 'react'
import { Task, TicTacToeContent } from '@/types'
import { cn } from '@/lib/utils'

interface Props { task: Task; onResult: (correct: boolean, score: number) => void }

type Player = 'X' | 'O'
type Cell = Player | null

const WINNING = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]

function checkWinner(board: Cell[]): Player | 'draw' | null {
  for (const [a,b,c] of WINNING) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a] as Player
  }
  if (board.every(Boolean)) return 'draw'
  return null
}

export default function TicTacToeGame({ task, onResult }: Props) {
  const content = task.content as TicTacToeContent
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null))
  const [current, setCurrent] = useState<Player>('X')
  const [activeCell, setActiveCell] = useState<number | null>(null)
  const [answer, setAnswer] = useState('')
  const [answerResult, setAnswerResult] = useState<'correct' | 'wrong' | null>(null)
  const [winner, setWinner] = useState<Player | 'draw' | null>(null)
  const [done, setDone] = useState(false)

  const handleCellClick = (i: number) => {
    if (board[i] || winner || done) return
    setActiveCell(i)
    setAnswer('')
    setAnswerResult(null)
  }

  const submitAnswer = () => {
    if (activeCell === null) return
    const q = content.questions[activeCell]
    const correct = answer.trim().toLowerCase() === q.answer.trim().toLowerCase()

    setAnswerResult(correct ? 'correct' : 'wrong')

    if (correct) {
      setTimeout(() => {
        const newBoard = [...board]
        newBoard[activeCell] = current
        setBoard(newBoard)
        const w = checkWinner(newBoard)
        if (w) {
          setWinner(w)
          setDone(true)
          onResult(w === 'X', w === 'X' ? 10 : 3)
        } else {
          setCurrent(c => c === 'X' ? 'O' : 'X')
        }
        setActiveCell(null)
        setAnswer('')
        setAnswerResult(null)
      }, 600)
    } else {
      setTimeout(() => {
        setActiveCell(null)
        setAnswer('')
        setAnswerResult(null)
        setCurrent(c => c === 'X' ? 'O' : 'X')
      }, 1200)
    }
  }

  return (
    <div className="card p-6 space-y-5">
      {content.instructions && (
        <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">{content.instructions}</p>
      )}

      <div className="flex items-center gap-4 text-sm">
        <div className={cn('px-3 py-1.5 rounded-lg font-semibold', current === 'X' && !winner ? 'bg-brand-100 text-brand-700' : 'text-gray-400')}>
          Spieler ✗
        </div>
        <span className="text-gray-300">vs</span>
        <div className={cn('px-3 py-1.5 rounded-lg font-semibold', current === 'O' && !winner ? 'bg-red-100 text-red-700' : 'text-gray-400')}>
          Spieler ○
        </div>
        {!done && <span className="text-xs text-gray-500 ml-2">Spieler {current} ist dran</span>}
      </div>

      <div className="grid grid-cols-3 gap-2 max-w-xs">
        {board.map((cell, i) => {
          const winning = winner && winner !== 'draw' && WINNING.some(([a,b,c] )=> [a,b,c].includes(i) && board[a] === winner && board[b] === winner && board[c] === winner)
          return (
            <button key={i}
              onClick={() => handleCellClick(i)}
              disabled={!!cell || !!winner}
              className={cn(
                'aspect-square rounded-xl border-2 text-3xl font-bold transition-all',
                winning ? (winner === 'X' ? 'bg-brand-100 border-brand-400' : 'bg-red-100 border-red-400') :
                cell ? 'bg-gray-50 border-gray-200 cursor-default' :
                activeCell === i ? 'bg-amber-50 border-amber-400' :
                'bg-white border-gray-200 hover:border-brand-300 hover:bg-brand-50'
              )}>
              <span className={cell === 'X' ? 'text-brand-600' : 'text-red-500'}>
                {cell ?? (content.questions[i]?.question ? '' : '')}
              </span>
            </button>
          )
        })}
      </div>

      {/* Question dialog */}
      {activeCell !== null && !winner && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
          <p className="font-medium text-gray-900">
            Frage für Spieler {current}: {content.questions[activeCell]?.question}
          </p>
          <div className="flex gap-2">
            <input type="text" value={answer} onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitAnswer()}
              className={cn('input flex-1', answerResult === 'correct' ? 'border-green-400 bg-green-50' : answerResult === 'wrong' ? 'border-red-400 bg-red-50' : '')}
              placeholder="Antwort eingeben..." autoFocus />
            <button onClick={submitAnswer} className="btn-primary">OK</button>
          </div>
          {answerResult === 'wrong' && (
            <p className="text-xs text-red-600">Falsch! Richtig: {content.questions[activeCell]?.answer}</p>
          )}
          {answerResult === 'correct' && (
            <p className="text-xs text-green-600">✓ Richtig!</p>
          )}
        </div>
      )}

      {winner && (
        <div className={cn('px-4 py-3 rounded-xl text-sm font-semibold', winner === 'draw' ? 'bg-gray-100 text-gray-700' : winner === 'X' ? 'bg-brand-50 text-brand-700' : 'bg-red-50 text-red-700')}>
          {winner === 'draw' ? '🤝 Unentschieden!' : `🏆 Spieler ${winner} gewinnt!`}
        </div>
      )}
    </div>
  )
}
