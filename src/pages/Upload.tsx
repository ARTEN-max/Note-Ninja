import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import { db, storage } from '../lib/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore'

export default function Upload() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploading, setUploading] = useState(false)
  const [term, setTerm] = useState('')

  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    if (selected && !allowedTypes.includes(selected.type)) {
      setError('Only PDF or DOCX files are allowed.')
      setFile(null)
      return
    }
    setError('')
    setFile(selected)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!user) {
      setError('You must be logged in to upload notes.')
      return
    }
    if (!course || !title || !file) {
      setError('Please fill in all fields and select a PDF or DOCX file.')
      return
    }
    if (!/^[A-Z0-9]+$/.test(course)) {
      setError('Course code must be in ALL CAPS with no spaces, e.g., MATH235')
      return
    }
    if (!allowedTypes.includes(file.type)) {
      setError('Only PDF or DOCX files are allowed.')
      return
    }
    setUploading(true)
    try {
      const courseCode = course.toUpperCase()
      // Upload file to Firebase Storage under notes/{courseCode}/{userId}/{filename}
      const filePath = `notes/${courseCode}/${user.uid}/${file.name}`
      const storageRef = ref(storage, filePath)
      await uploadBytes(storageRef, file)
      // Get download URL
      const fileUrl = await getDownloadURL(storageRef)
      // Fetch user's name from Firestore
      let userName = '';
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          userName = userDoc.data().name || '';
        }
      } catch {}
      // Save metadata to Firestore
      await addDoc(collection(db, 'pendingNotes'), {
        title,
        courseCode,
        fileUrl,
        uploaderId: user.uid,
        name: userName,
        term: term || undefined,
        createdAt: serverTimestamp(),
      })
      setSuccess('Note uploaded successfully!')
      setCourse('')
      setTitle('')
      setTerm('')
      setFile(null)
      ;(document.getElementById('file') as HTMLInputElement).value = ''
    } catch (err) {
      setError('Failed to upload note. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-blue-100 to-blue-200 font-sans text-gray-800">
      {/* Header Gradient */}
      <div className="w-full bg-gradient-to-b from-blue-100 via-blue-200 to-blue-300">
        <Navbar />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-md max-w-xl w-full mx-auto"
        >
          <h1 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">Upload Notes</h1>
          {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
          {success && <div className="mb-4 text-green-600 text-sm">{success}</div>}
          <div className="mb-4">
            <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <input
              id="course"
              type="text"
              required
              className="input w-full"
              placeholder="e.g., CS246"
              value={course}
              onChange={e => setCourse(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">Course code must be in ALL CAPS with no spaces, e.g., MATH235</p>
          </div>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              id="title"
              type="text"
              required
              className="input w-full"
              placeholder="e.g., CS246 Midterm Summary"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="term" className="block text-sm font-medium text-gray-700 mb-1">Term <span className="text-gray-400 font-normal">(optional, e.g., Fall 2019)</span></label>
            <input
              id="term"
              type="text"
              className="input w-full"
              placeholder="e.g., Fall 2019"
              value={term}
              onChange={e => setTerm(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">Note File (PDF or DOCX)</label>
            <input
              id="file"
              type="file"
              required
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={handleFileChange}
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-semibold transition-colors duration-200"
          >
            {uploading ? 'Uploading...' : 'Upload Note'}
          </button>
        </form>
      </div>
      {/* Footer with Gradient */}
      <footer className="w-full bg-gradient-to-t from-blue-100 via-blue-50 to-white mt-auto text-center py-6 text-gray-400 text-sm">
        © 2025 Note Ninja. Built with 💻 for students, by students.
      </footer>
    </div>
  )
} 