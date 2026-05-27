export type Role = 'teacher' | 'student'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: Role
  avatar_url?: string
  created_at: string
}

export interface Lesson {
  id: string
  teacher_id: string
  title: string
  description?: string
  level?: string
  topic?: string
  is_published: boolean
  created_at: string
  updated_at: string
  blocks?: Block[]
}

// ─── BLOCK SYSTEM ────────────────────────────────────────────
export type BlockType =
  | 'text'
  | 'image'
  | 'audio'
  | 'video'
  | 'fill_blank'
  | 'match_pairs'
  | 'word_order'
  | 'true_false'
  | 'multiple_choice'
  | 'memory'
  | 'crossword'
  | 'tictactoe'
  | 'labyrinth'

export interface Block {
  id: string
  lesson_id: string
  type: BlockType
  order_index: number
  content: BlockContent
  created_at?: string
}

// Content per block type
export interface TextBlockContent       { html: string }
export interface ImageBlockContent      { url: string; caption?: string; alt?: string }
export interface AudioBlockContent      { url: string; title?: string; description?: string }
export interface VideoBlockContent      { url: string; title?: string }
export interface FillBlankContent       { text: string; blanks: { answer: string; alternatives?: string[] }[]; audio_url?: string; image_url?: string }
export interface MatchPairsContent      { pairs: { left: string; right: string }[]; audio_url?: string }
export interface WordOrderContent       { sentence: string; words: string[]; audio_url?: string }
export interface TrueFalseContent       { statements: { text: string; is_true: boolean; explanation?: string }[]; audio_url?: string; image_url?: string }
export interface MultipleChoiceContent  { question: string; options: { text: string; is_correct: boolean }[]; audio_url?: string; image_url?: string }
export interface MemoryContent          { pairs: { word: string; translation: string }[] }
export interface CrosswordContent       { words: { word: string; clue: string; direction: 'across' | 'down'; row: number; col: number }[]; grid_size: { rows: number; cols: number } }
export interface TicTacToeContent       { questions: { question: string; answer: string }[]; instructions?: string }
export interface LabyrinthContent       { maze: number[][]; vocabulary: { position: [number, number]; word: string; translation: string }[]; start: [number, number]; end: [number, number] }

export type BlockContent =
  | TextBlockContent | ImageBlockContent | AudioBlockContent | VideoBlockContent
  | FillBlankContent | MatchPairsContent | WordOrderContent | TrueFalseContent
  | MultipleChoiceContent | MemoryContent | CrosswordContent | TicTacToeContent | LabyrinthContent

// ─── ASSIGNMENTS ─────────────────────────────────────────────
export interface Assignment {
  id: string
  lesson_id: string
  student_id: string
  teacher_id: string
  due_date?: string
  is_completed: boolean
  score?: number
  assigned_at: string
  completed_at?: string
  lesson?: Lesson
  student?: Profile
}

export interface BlockResult {
  id: string
  assignment_id: string
  block_id: string
  student_id: string
  is_correct: boolean
  answer: unknown
  score: number
  completed_at: string
}

// Alias for backward compatibility with student task components
export type Task = Block
export type TaskType = BlockType