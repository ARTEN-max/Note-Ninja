import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { db } from '../lib/firebase'
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'

interface CourseSummary {
  courseCode: string
  noteCount: number
}

export default function Home() {
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchError, setSearchError] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuth()
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true)
      // Query all notes and group by courseCode
      const notesSnap = await getDocs(query(collection(db, 'notes')))
      const courseMap: Record<string, number> = {}
      notesSnap.forEach(doc => {
        const data = doc.data()
        if (data.courseCode) {
          courseMap[data.courseCode] = (courseMap[data.courseCode] || 0) + 1
        }
      })
      // Convert to array and sort by noteCount descending
      const courseArr = Object.entries(courseMap)
        .map(([courseCode, noteCount]) => ({ courseCode, noteCount }))
        .sort((a, b) => b.noteCount - a.noteCount)
        .slice(0, 6)
      setCourses(courseArr)
      setLoading(false)
    }
    fetchCourses()
    // Fetch user name if logged in
    async function fetchUserName() {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          setUserName(userDoc.data().name || null)
        }
      } else {
        setUserName(null)
      }
    }
    fetchUserName()
  }, [user])

  const handleSearch = async (query: string) => {
    setSearchError('')
    if (!query.trim()) return
    const searchCode = query.trim().toUpperCase()
    // Check if any notes exist for this courseCode (case-insensitive)
    const notesSnap = await getDocs(queryCollectionByCourse(searchCode))
    if (!notesSnap.empty) {
      navigate(`/courses/${searchCode}`)
    } else {
      setSearchError('Course not found or no notes available.')
    }
  }

  function queryCollectionByCourse(courseCode: string) {
    // Query for courseCode in uppercase (case-insensitive search)
    return query(collection(db, 'notes'), orderBy('courseCode'), orderBy('createdAt', 'desc'))
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fc] font-sans text-gray-800">
      {/* Header Gradient */}
      <div className="w-full bg-gradient-to-b from-blue-100 via-blue-200 to-blue-300">
        <Navbar />
      </div>
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-blue-50 via-blue-100 to-blue-200 py-12 px-4 md:px-8 flex items-center justify-center">
        <div className="max-w-7xl mx-auto w-full text-center flex flex-col items-center">
          {userName && (
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome, {userName}!</h2>
          )}
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 text-gray-900">
            Ace your exams with <span className="text-blue-600">quality lecture notes</span>
          </h1>
          <p className="text-gray-600 md:text-lg mb-10 max-w-2xl mx-auto">
            Access high-quality notes from top students. Share your knowledge and help others succeed.
          </p>
          <form
            onSubmit={e => {
              e.preventDefault()
              handleSearch(searchQuery)
            }}
            className="w-full max-w-xl"
          >
            <div className="flex items-center bg-white rounded-full shadow-lg focus-within:shadow-xl transition-shadow duration-300 px-2 py-2 gap-2">
              <svg className="h-6 w-6 text-gray-400 ml-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" /></svg>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search for notes, courses, topics..."
                className="flex-1 bg-transparent outline-none text-base px-2 py-3 font-medium placeholder-gray-400 rounded-full"
              />
              <button
                type="submit"
                className="ml-2 px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition-colors duration-200"
              >
                Search
              </button>
            </div>
          </form>
          {searchError && <div className="text-red-600 mt-2 text-sm">{searchError}</div>}
        </div>
      </section>

      {/* Popular Courses Section with Gradient */}
      <section className="w-full bg-gradient-to-b from-blue-100 via-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-4 py-16 w-full">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-10">
            Popular Courses
          </h2>
          {loading ? (
            <div className="text-center text-gray-500">Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="text-center text-gray-500">No courses found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {courses.map(course => (
                <Link
                  key={course.courseCode}
                  to={`/courses/${course.courseCode}`}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 flex flex-col gap-2 cursor-pointer"
                >
                  <span className="text-blue-600 font-semibold text-sm">{course.courseCode}</span>
                  <span className="text-lg font-medium text-gray-800">{course.noteCount} note{course.noteCount !== 1 ? 's' : ''}</span>
                  <span className="mt-2 inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-semibold text-sm hover:bg-blue-100 transition">View Notes</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section with Gradient */}
      <section className="w-full bg-gradient-to-b from-blue-200 via-blue-100 to-white">
        <div className="max-w-2xl mx-auto bg-gray-100 rounded-xl p-8 text-center my-16">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Not seeing your course?</h3>
          <button className="mt-2 px-8 py-3 rounded-full bg-blue-600 text-white font-semibold shadow transition-transform duration-150 hover:bg-blue-700 active:scale-95" onClick={() => navigate('/request-course')}>
            Request a Course
          </button>
        </div>
      </section>

      {/* Footer with Gradient */}
      <footer className="w-full bg-gradient-to-t from-blue-100 via-blue-50 to-white mt-auto text-center py-6 text-gray-400 text-sm">
        © 2025 Note Ninja. Built with 💻 for students, by students.
      </footer>
    </div>
  )
} 