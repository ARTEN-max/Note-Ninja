import { useState } from 'react'
import Navbar from '../components/Navbar'
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-blue-100 to-blue-200 font-sans text-gray-800">
      <div className="w-full bg-gradient-to-b from-blue-100 via-blue-200 to-blue-300">
        <Navbar />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-md max-w-xl w-full mx-auto"
        >
          <h1 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">Request a Course</h1>
          {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
          {success && <div className="mb-4 text-green-600 text-sm">{success}</div>}
          <div className="mb-4">
            <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">Course Code or Name</label>
            <input
              id="course"
              type="text"
              required
              className="input w-full"
              placeholder="e.g., CS246, Linear Algebra, etc."
              value={course}
              onChange={e => setCourse(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">Details (optional)</label>
            <textarea
              id="details"
              className="input w-full"
              placeholder="Why do you need this course? Any specific topics?"
              value={details}
              onChange={e => setDetails(e.target.value)}
              rows={3}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-semibold transition-colors duration-200"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
      <footer className="w-full bg-gradient-to-t from-blue-100 via-blue-50 to-white mt-auto text-center py-6 text-gray-400 text-sm">
        © 2025 Note Ninja. Built with 💻 for students, by students.
      </footer>
    </div>
  )
} 