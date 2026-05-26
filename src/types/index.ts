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
  tasks?: Task[]
  _count?: { tasks: number; assignments: number }
}

export interface Task {
  id: string
  lesson_id: string
  type: TaskType
  title: string
  instructions?: string
  content: TaskContent
  order_index: number
  points?: number
  created_at: string
}

export type TaskType =
  | 'fill_blank'
  | 'match_pairs'
  | 'word_order'
  | 'true_false'
  | 'multiple_choice'
  | 'memory'
  | 'crossword'
  | 'tictactoe'
  | 'labyrinth'

// ---------- TASK CONTENT TYPES ----------

export interface FillBlankContent {
  text: string // use {{answer}} for blanks
  blanks: { answer: string; alternatives?: string[] }[]
  audio_url?: string
  image_url?: string
}

export interface MatchPairsContent {
  pairs: { left: string; right: string; left_image?: string; right_image?: string }[]
  audio_url?: string
}

export interface WordOrderContent {
  sentence: string
  words: string[]  // shuffled
  audio_url?: string
}

export interface TrueFalseContent {
  statements: { text: string; is_true: boolean; explanation?: string }[]
  audio_url?: string
  image_url?: string
}

export interface MultipleChoiceContent {
  question: string
  options: { text: string; is_correct: boolean }[]
  audio_url?: string
  image_url?: string
}

export interface MemoryContent {
  pairs: { word: string; translation: string; image_url?: string }[]
}

export interface CrosswordContent {
  words: { word: string; clue: string; direction: 'across' | 'down'; row: number; col: number }[]
  grid_size: { rows: number; cols: number }
}

export interface TicTacToeContent {
  questions: { question: string; answer: string }[]
  instructions?: string
}

export interface LabyrinthContent {
  maze: number[][] // 0=path, 1=wall
  vocabulary: { position: [number, number]; word: string; translation: string }[]
  start: [number, number]
  end: [number, number]
}

export type TaskContent =
  | FillBlankContent
  | MatchPairsContent
  | WordOrderContent
  | TrueFalseContent
  | MultipleChoiceContent
  | MemoryContent
  | CrosswordContent
  | TicTacToeContent
  | LabyrinthContent

// ---------- ASSIGNMENTS ----------

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

export interface TaskResult {
  id: string
  assignment_id: string
  task_id: string
  student_id: string
  is_correct: boolean
  answer: unknown
  score: number
  attempts: number
  completed_at: string
}
