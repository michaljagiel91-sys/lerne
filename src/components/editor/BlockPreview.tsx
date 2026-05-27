'use client'
import { Block, TextBlockContent, ImageBlockContent, AudioBlockContent, FillBlankContent, MatchPairsContent, WordOrderContent, TrueFalseContent, MultipleChoiceContent, MemoryContent } from '@/types'

export default function BlockPreview({ block }: { block: Block }) {
  const c = block.content as Record<string, unknown>

  switch (block.type) {
    case 'text': {
      const html = (c as TextBlockContent).html
      return <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: html || '<p class="text-gray-400 italic">Kein Text</p>' }} />
    }
    case 'image': {
      const { url, caption } = c as ImageBlockContent
      if (!url) return <div className="h-20 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">Kein Bild</div>
      return (
        <div>
          <img src={url} alt={caption || ''} className="max-h-48 rounded-xl object-cover border border-gray-200" />
          {caption && <p className="text-xs text-gray-500 mt-1.5 italic">{caption}</p>}
        </div>
      )
    }
    case 'audio': {
      const { url, title } = c as AudioBlockContent
      if (!url) return <div className="h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">Kein Audio</div>
      return (
        <div className="space-y-1.5">
          {title && <p className="text-sm font-medium text-gray-700">{title}</p>}
          <audio controls src={url} className="w-full h-10" />
        </div>
      )
    }
    case 'video': {
      const { url } = c as { url: string }
      if (!url) return <div className="h-20 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">Kein Video</div>
      const embedUrl = url.includes('youtube.com/watch') ? url.replace('watch?v=', 'embed/') : url.includes('youtu.be/') ? url.replace('youtu.be/', 'www.youtube.com/embed/') : url
      return <iframe src={embedUrl} className="w-full aspect-video rounded-xl border border-gray-200" allowFullScreen />
    }
    case 'fill_blank': {
      const { text } = c as FillBlankContent
      const parts = (text || '').split(/(\{\{[^}]+\}\})/g)
      return (
        <p className="text-sm text-gray-700 leading-relaxed">
          {parts.map((p, i) => {
            const m = p.match(/\{\{([^}]+)\}\}/)
            return m ? <span key={i} className="inline-block mx-0.5 px-2 py-0.5 bg-indigo-50 border border-dashed border-indigo-300 rounded text-indigo-600 text-xs">[{m[1]}]</span> : <span key={i}>{p}</span>
          })}
        </p>
      )
    }
    case 'match_pairs': {
      const { pairs } = c as MatchPairsContent
      return (
        <div className="flex flex-wrap gap-2">
          {(pairs || []).slice(0, 4).map((p, i) => (
            <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-600">{p.left} ↔ {p.right}</span>
          ))}
          {(pairs || []).length > 4 && <span className="text-xs text-gray-400">+{pairs.length - 4} mehr</span>}
        </div>
      )
    }
    case 'word_order': {
      const { sentence } = c as WordOrderContent
      return <p className="text-sm text-gray-600 italic">{sentence || 'Kein Satz'}</p>
    }
    case 'true_false': {
      const { statements } = c as TrueFalseContent
      return (
        <div className="space-y-1">
          {(statements || []).slice(0, 3).map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className={`text-xs font-bold ${s.is_true ? 'text-green-600' : 'text-red-500'}`}>{s.is_true ? 'W' : 'F'}</span>
              <span className="text-gray-600 truncate">{s.text}</span>
            </div>
          ))}
        </div>
      )
    }
    case 'multiple_choice': {
      const { question, options } = c as MultipleChoiceContent
      return (
        <div>
          <p className="text-sm font-medium text-gray-800 mb-1.5">{question || 'Keine Frage'}</p>
          <div className="flex flex-wrap gap-1.5">
            {(options || []).map((o, i) => (
              <span key={i} className={`text-xs px-2 py-1 rounded-lg ${o.is_correct ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{o.text}</span>
            ))}
          </div>
        </div>
      )
    }
    case 'memory': {
      const { pairs } = c as MemoryContent
      return <p className="text-sm text-gray-500">{(pairs || []).length} Wortpaare</p>
    }
    default:
      return <p className="text-sm text-gray-400 italic">Vorschau nicht verfügbar</p>
  }
}
