import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface Note {
  id: string
  title: string
  content: string
  updatedAt: Date
}

export default function NoteEditor() {
  const { noteId } = useParams<{ noteId: string }>()
  const navigate = useNavigate()
  const [note, setNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // TODO: Implement Firebase Firestore fetch
    // For now, using mock data
    const mockNote: Note = {
      id: noteId || 'new',
      title: 'New Note',
      content: '',
      updatedAt: new Date(),
    }
    setNote(mockNote)
    setTitle(mockNote.title)
    setContent(mockNote.content)
    setLoading(false)
  }, [noteId])

  const handleSave = async () => {
    setSaving(true)
    try {
      // TODO: Implement Firebase Firestore save
      console.log('Saving note:', { title, content })
      navigate('/dashboard')
    } catch (err) {
      console.error('Failed to save note:', err)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {noteId === 'new' ? 'New Note' : 'Edit Note'}
          </h1>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              className="input mt-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <textarea
              id="content"
              rows={15}
              className="input mt-1 font-mono"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your note here..."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 