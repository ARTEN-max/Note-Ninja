import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { db } from '../lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

export default function Courses() {
  const [courses, setCourses] = useState<{ code: string, noteCount: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true)
      const notesSnap = await getDocs(collection(db, 'notes'))
      const courseMap: Record<string, number> = {}
      notesSnap.forEach(doc => {
        const data = doc.data()
        if (data.courseCode) {
          courseMap[data.courseCode] = (courseMap[data.courseCode] || 0) + 1
        }
      })
      setCourses(Object.entries(courseMap).map(([code, noteCount]) => ({ code, noteCount })))
      setLoading(false)
    }
    fetchCourses()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-blue-100 to-blue-200 font-sans text-gray-800">
      <div className="w-full bg-gradient-to-b from-blue-100 via-blue-200 to-blue-300">
        <Navbar />
      </div>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 w-full">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">All Courses</h1>
        {loading ? (
          <div className="text-center text-gray-500">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="text-center text-gray-500">No courses found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {courses.map(course => (
              <Link
                key={course.code}
                to={`/courses/${course.code}`}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 flex flex-col gap-2 cursor-pointer"
              >
                <span className="text-blue-600 font-semibold text-sm">{course.code}</span>
                <span className="text-lg font-medium text-gray-800">{course.noteCount} note{course.noteCount !== 1 ? 's' : ''}</span>
                <span className="mt-2 inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-semibold text-sm hover:bg-blue-100 transition">View Notes</span>
              </Link>
            ))}
          </div>
        )}
      </div>
      <footer className="w-full bg-gradient-to-t from-blue-100 via-blue-50 to-white mt-auto text-center py-6 text-gray-400 text-sm">
        © 2025 Note Ninja. Built with 💻 for students, by students.
      </footer>
    </div>
  )
} 