'use client'
import { useState, useEffect, useCallback } from 'react'
import { Task, LabyrinthContent } from '@/types'
import { Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react'

interface Props { task: Task; onResult: (correct: boolean, score: number) => void }

export default function LabyrinthGame({ task, onResult }: Props) {
  const content = task.content as LabyrinthContent
  const CELL = 32

  const [pos, setPos] = useState<[number, number]>(content.start)
  const [collected, setCollected] = useState<number[]>([])
  const [currentVocab, setCurrentVocab] = useState<{ word: string; translation: string } | null>(null)
  const [answer, setAnswer] = useState('')
  const [answerResult, setAnswerResult] = useState<'correct' | 'wrong' | null>(null)
  const [done, setDone] = useState(false)
  const [pendingVocabIdx, setPendingVocabIdx] = useState<number | null>(null)

  const move = useCallback((dr: number, dc: number) => {
    if (done || currentVocab) return
    const [r, c] = pos
    const nr = r + dr, nc = c + dc
    const rows = content.maze.length, cols = content.maze[0].length
    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return
    if (content.maze[nr][nc] === 1) return

    setPos([nr, nc])

    // Check vocab
    const vi = content.vocabulary.findIndex(v => v.position[0] === nr && v.position[1] === nc && !collected.includes(content.vocabulary.indexOf(v)))
    const realVi = content.vocabulary.findIndex(v => v.position[0] === nr && v.position[1] === nc)
    if (realVi >= 0 && !collected.includes(realVi)) {
      setPendingVocabIdx(realVi)
      setCurrentVocab(content.vocabulary[realVi])
      setAnswer('')
      setAnswerResult(null)
    }

    // Check end
    const [er, ec] = content.end
    if (nr === er && nc === ec) {
      const score = Math.round((collected.length / Math.max(content.vocabulary.length, 1)) * 10)
      setDone(true)
      onResult(true, Math.max(score, 5))
    }
  }, [pos, done, currentVocab, collected, content])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        e.preventDefault()
        if (e.key === 'ArrowUp') move(-1, 0)
        if (e.key === 'ArrowDown') move(1, 0)
        if (e.key === 'ArrowLeft') move(0, -1)
        if (e.key === 'ArrowRight') move(0, 1)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [move])

  const submitVocab = () => {
    if (!currentVocab || pendingVocabIdx === null) return
    const correct = answer.trim().toLowerCase() === currentVocab.translation.trim().toLowerCase()
    setAnswerResult(correct ? 'correct' : 'wrong')

    setTimeout(() => {
      if (correct) setCollected(prev => [...prev, pendingVocabIdx])
      setCurrentVocab(null)
      setPendingVocabIdx(null)
      setAnswer('')
      setAnswerResult(null)
    }, 800)
  }

  const maze = content.maze
  const [er, ec] = content.end

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>🗝️ Vokabeln gesammelt: {collected.length} / {content.vocabulary.length}</span>
        <span className="text-xs">Pfeiltasten oder Buttons zum Navigieren</span>
      </div>

      {/* Maze */}
      <div className="overflow-auto">
        <div className="inline-grid gap-px bg-gray-300 border border-gray-300 rounded-lg overflow-hidden"
          style={{ gridTemplateColumns: `repeat(${maze[0].length}, ${CELL}px)` }}>
          {maze.map((row, r) =>
            row.map((cell, c) => {
              const isPlayer = pos[0] === r && pos[1] === c
              const isEnd = er === r && ec === c
              const isStart = content.start[0] === r && content.start[1] === c
              const vocabIdx = content.vocabulary.findIndex(v => v.position[0] === r && v.position[1] === c)
              const hasVocab = vocabIdx >= 0 && !collected.includes(vocabIdx)
              const isCollected = vocabIdx >= 0 && collected.includes(vocabIdx)

              return (
                <div key={`${r}-${c}`}
                  className={`w-8 h-8 flex items-center justify-center text-base
                    ${cell === 1 ? 'bg-gray-800' :
                      isPlayer ? 'bg-brand-400' :
                      isEnd ? 'bg-green-400' :
                      isStart ? 'bg-blue-200' :
                      isCollected ? 'bg-green-100' :
                      hasVocab ? 'bg-amber-100' : 'bg-white'}`}>
                  {isPlayer && <span>😊</span>}
                  {!isPlayer && isEnd && <span>🏁</span>}
                  {!isPlayer && hasVocab && <span>📖</span>}
                  {!isPlayer && isCollected && <span>✓</span>}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* D-pad controls */}
      <div className="grid grid-cols-3 gap-1 w-28">
        <div />
        <button onClick={() => move(-1, 0)} className="btn-secondary p-2 justify-center"><ArrowUp size={16} /></button>
        <div />
        <button onClick={() => move(0, -1)} className="btn-secondary p-2 justify-center"><ArrowLeft size={16} /></button>
        <button onClick={() => move(1, 0)} className="btn-secondary p-2 justify-center"><ArrowDown size={16} /></button>
        <button onClick={() => move(0, 1)} className="btn-secondary p-2 justify-center"><ArrowRight size={16} /></button>
      </div>

      {/* Vocab question */}
      {currentVocab && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
          <p className="font-semibold text-gray-900">📖 Wie lautet die Übersetzung?</p>
          <p className="text-lg text-brand-700 font-bold">{currentVocab.word}</p>
          <div className="flex gap-2">
            <input type="text" value={answer} onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitVocab()}
              className={`input flex-1 ${answerResult === 'correct' ? 'border-green-400 bg-green-50' : answerResult === 'wrong' ? 'border-red-400 bg-red-50' : ''}`}
              placeholder="Übersetzung eingeben..." autoFocus />
            <button onClick={submitVocab} className="btn-primary">OK</button>
          </div>
          {answerResult === 'wrong' && <p className="text-xs text-red-600">Richtig: {currentVocab.translation}</p>}
          {answerResult === 'correct' && <p className="text-xs text-green-600">✓ Super!</p>}
        </div>
      )}

      {done && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 text-green-700 text-sm font-semibold">
          <Trophy size={16} /> Ziel erreicht! {collected.length}/{content.vocabulary.length} Vokabeln gesammelt.
        </div>
      )}
    </div>
  )
}
