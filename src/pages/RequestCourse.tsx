import { useState } from 'react'
import { db } from '../lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'

export default function RequestCourse() {
  const { user } = useAuth();
  const [course, setCourse] = useState('')
  const [details, setDetails] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!user) {
      setError('You must be logged in to request a course.')
      return
    }
    if (!course.trim()) {
      setError('Please enter the course code or name you want to request.')
      return
    }
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'courseRequests'), {
        course,
        details,
        createdAt: serverTimestamp(),
        userId: user.uid,
        userEmail: user.email || '',
      })
      setSuccess('Your course request has been submitted!')
      setCourse('')
      setDetails('')
    } catch (err) {
      setError('Failed to submit request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-blue-100 to-blue-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 font-sans text-gray-800 dark:text-gray-100">
      <div className="w-full bg-gradient-to-b from-blue-100 via-blue-200 to-blue-300 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"></div>
      <div className="flex-1 flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md max-w-xl w-full mx-auto"
        >
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">Request a Course</h1>
          {error && <div className="mb-4 text-red-600 dark:text-red-400 text-sm">{error}</div>}
          {success && <div className="mb-4 text-green-600 dark:text-green-400 text-sm">{success}</div>}
          <div className="mb-4">
            <label htmlFor="course" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Course Code or Name</label>
            <input
              id="course"
              type="text"
              required
              className="input w-full dark:bg-gray-900 dark:text-gray-100"
              placeholder="e.g., CS246, Linear Algebra, etc."
              value={course}
              onChange={e => setCourse(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="details" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Details (optional)</label>
            <textarea
              id="details"
              className="input w-full dark:bg-gray-900 dark:text-gray-100"
              placeholder="Why do you need this course? Any specific topics?"
              value={details}
              onChange={e => setDetails(e.target.value)}
              rows={3}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-2 rounded-full font-semibold transition-colors duration-200"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
      <footer className="w-full bg-gradient-to-t from-blue-100 via-blue-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 mt-auto text-center py-6 text-gray-400 dark:text-gray-500 text-sm">
        © 2025 Note Ninja. Built with 💻 for students, by students.
      </footer>
    </div>
  )
} 