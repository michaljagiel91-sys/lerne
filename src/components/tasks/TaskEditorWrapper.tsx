'use client'
import { useRouter } from 'next/navigation'
import { Task } from '@/types'
import TaskEditor from './TaskEditor'

interface Props { lessonId: string; task: Task }

export default function TaskEditorWrapper({ lessonId, task }: Props) {
  const router = useRouter()
  return (
    <TaskEditor
      lessonId={lessonId}
      taskType={task.type}
      task={task}
      onSaved={() => router.push(`/teacher/lessons/${lessonId}/edit`)}
      onCancel={() => router.push(`/teacher/lessons/${lessonId}/edit`)}
    />
  )
}
