import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { motion } from 'framer-motion'

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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-blue-100 to-blue-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 font-sans text-gray-800 dark:text-gray-100">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 w-full">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">All Courses</h1>
        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-300">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-300">No courses found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 flex-wrap">
            {courses.map((course, idx) => (
              <motion.div
                key={course.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                whileHover={{ scale: 1.03 }}
                className="transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 hover:border-blue-400 border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800 cursor-pointer"
              >
                <Link
                  to={`/courses/${course.code}`}
                  className="flex flex-col gap-2 h-full w-full"
                >
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">{course.code}</span>
                  <span className="text-lg font-medium text-gray-800 dark:text-gray-100">{course.noteCount} note{course.noteCount !== 1 ? 's' : ''}</span>
                  <span className="mt-2 inline-block bg-blue-50 dark:bg-gray-900 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full font-semibold text-sm hover:bg-blue-100 dark:hover:bg-gray-800 transition">View Notes</span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <footer className="w-full bg-gradient-to-t from-blue-100 via-blue-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 mt-auto text-center py-6 text-gray-400 dark:text-gray-500 text-sm">
        © 2025 Note Ninja. Built with 💻 for students, by students.
      </footer>
    </div>
  )
} 