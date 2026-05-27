'use client'
import { useEffect, useState } from 'react'
import { TextBlockContent } from '@/types'

interface Props { content: unknown; onChange: (c: unknown) => void }

export default function TextBlockEditor({ content, onChange }: Props) {
  const init = content as TextBlockContent | null
  const [html, setHtml] = useState(init?.html ?? '')

  useEffect(() => { onChange({ html } as TextBlockContent) }, [html])

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 flex-wrap">
        {[
          ['<b>', '</b>', 'Fett'],
          ['<i>', '</i>', 'Kursiv'],
          ['<u>', '</u>', 'Unterstr.'],
          ['<h2>', '</h2>', 'H2'],
          ['<h3>', '</h3>', 'H3'],
          ['<ul><li>', '</li></ul>', 'Liste'],
          ['<br>', '', 'Zeilenbr.'],
        ].map(([open, close, label]) => (
          <button key={label} type="button"
            onClick={() => {
              const ta = document.getElementById('text-editor') as HTMLTextAreaElement
              if (!ta) return
              const start = ta.selectionStart, end = ta.selectionEnd
              const selected = html.slice(start, end)
              const newHtml = html.slice(0, start) + open + selected + close + html.slice(end)
              setHtml(newHtml)
            }}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg font-medium transition-colors">
            {label}
          </button>
        ))}
      </div>
      <textarea
        id="text-editor"
        value={html}
        onChange={e => setHtml(e.target.value)}
        className="input h-48 resize-y font-mono text-sm"
        placeholder="<p>Text hier eingeben...</p>"
      />
      {html && (
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Vorschau:</p>
          <div className="p-3 bg-gray-50 rounded-xl text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      )}
    </div>
  )
}
