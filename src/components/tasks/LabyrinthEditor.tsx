'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, Info, RefreshCw } from 'lucide-react'
import { LabyrinthContent } from '@/types'

interface Props { content: unknown; onChange: (c: unknown) => void }

const SIZE = 11

function generateMaze(size: number): number[][] {
  // Simple maze: all walls, then carve paths
  const maze = Array(size).fill(null).map(() => Array(size).fill(1))
  const carve = (r: number, c: number) => {
    const dirs = [[0,2],[0,-2],[2,0],[-2,0]].sort(() => Math.random() - 0.5)
    maze[r][c] = 0
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc
      if (nr > 0 && nr < size-1 && nc > 0 && nc < size-1 && maze[nr][nc] === 1) {
        maze[r + dr/2][c + dc/2] = 0
        carve(nr, nc)
      }
    }
  }
  carve(1, 1)
  maze[size-2][size-2] = 0
  return maze
}

export default function LabyrinthEditor({ content, onChange }: Props) {
  const init = content as LabyrinthContent | null
  const [maze, setMaze] = useState<number[][]>(init?.maze ?? generateMaze(SIZE))
  const [vocabulary, setVocabulary] = useState(init?.vocabulary ?? [
    { position: [1, 3] as [number,number], word: '', translation: '' }
  ])

  useEffect(() => {
    onChange({ maze, vocabulary, start: [1,1], end: [SIZE-2, SIZE-2] } as LabyrinthContent)
  }, [maze, vocabulary])

  const updateVocab = (i: number, field: string, val: unknown) =>
    setVocabulary(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: val } : v))

  const updatePos = (i: number, axis: 0 | 1, val: number) =>
    setVocabulary(prev => prev.map((v, idx) => idx === i ? { ...v, position: [axis === 0 ? val : v.position[0], axis === 1 ? val : v.position[1]] as [number,number] } : v))

  return (
    <div className="space-y-5">
      <div className="p-3 bg-green-50 rounded-xl text-sm text-green-700 flex gap-2">
        <Info size={16} className="flex-shrink-0 mt-0.5" />
        <span>Ein Labyrinth wird automatisch generiert. Platzieren Sie Vokabeln an bestimmten Positionen im Labyrinth (Zeile/Spalte, Werte von 1 bis {SIZE-2}).</span>
      </div>

      <div className="flex items-center gap-3">
        <label className="label mb-0">Labyrinth ({SIZE}×{SIZE})</label>
        <button type="button" onClick={() => setMaze(generateMaze(SIZE))} className="btn-ghost text-xs px-2 py-1">
          <RefreshCw size={12} /> Neu generieren
        </button>
      </div>

      {/* Maze preview */}
      <div className="inline-grid gap-px bg-gray-200 p-px rounded-lg overflow-hidden"
        style={{ gridTemplateColumns: `repeat(${SIZE}, 20px)` }}>
        {maze.map((row, r) => row.map((cell, c) => {
          const isStart = r === 1 && c === 1
          const isEnd = r === SIZE-2 && c === SIZE-2
          const hasVocab = vocabulary.some(v => v.position[0] === r && v.position[1] === c)
          return (
            <div key={`${r}-${c}`}
              className={`w-5 h-5 flex items-center justify-center text-xs
                ${cell === 1 ? 'bg-gray-800' :
                  isStart ? 'bg-green-400' :
                  isEnd ? 'bg-brand-400' :
                  hasVocab ? 'bg-amber-200' : 'bg-white'}`}
            >
              {isStart && <span className="text-white text-xs">S</span>}
              {isEnd && <span className="text-white text-xs">Z</span>}
            </div>
          )
        }))}
      </div>
      <p className="text-xs text-gray-400">Grün = Start, Blau = Ziel, Gelb = Vokabel</p>

      {/* Vocabulary */}
      <div>
        <label className="label">Vokabeln im Labyrinth</label>
        <div className="space-y-2">
          {vocabulary.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-4">{i+1}</span>
              <input type="text" value={v.word} onChange={e => updateVocab(i, 'word', e.target.value)}
                className="input flex-1 text-sm" placeholder="Wort..." />
              <input type="text" value={v.translation} onChange={e => updateVocab(i, 'translation', e.target.value)}
                className="input flex-1 text-sm" placeholder="Übersetzung..." />
              <div className="flex items-center gap-1">
                <input type="number" value={v.position[0]} onChange={e => updatePos(i, 0, +e.target.value)}
                  className="input w-14 text-center text-sm" placeholder="Z" min={1} max={SIZE-2} />
                <input type="number" value={v.position[1]} onChange={e => updatePos(i, 1, +e.target.value)}
                  className="input w-14 text-center text-sm" placeholder="S" min={1} max={SIZE-2} />
              </div>
              {vocabulary.length > 1 && (
                <button type="button" onClick={() => setVocabulary(prev => prev.filter((_, idx) => idx !== i))}
                  className="text-gray-300 hover:text-red-500 p-1">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <button type="button"
        onClick={() => setVocabulary(prev => [...prev, { position: [1,1], word: '', translation: '' }])}
        className="btn-secondary text-sm">
        <Plus size={15} /> Vokabel hinzufügen
      </button>
    </div>
  )
}
