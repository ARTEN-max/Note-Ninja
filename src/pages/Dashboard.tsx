import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/firebase'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'

interface Note {
  id: string
  title: string
  courseCode: string
  fileUrl: string
  createdAt: { seconds: number, nanoseconds: number } | null
  term?: string
  name?: string
}

export default function Dashboard() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    async function fetchNotes() {
      if (!user) return;
      const q = query(
        collection(db, 'pendingNotes'),
        where('uploaderId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setNotes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note)));
      setLoading(false);
    }
    fetchNotes();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-blue-100 to-blue-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 font-sans text-gray-800 dark:text-gray-100">
        {/* Header Gradient */}
        <div className="w-full bg-gradient-to-b from-blue-100 via-blue-200 to-blue-300 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"></div>
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="space-y-3">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        {/* Footer with Gradient */}
        <footer className="w-full bg-gradient-to-t from-blue-100 via-blue-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 mt-auto text-center py-6 text-gray-400 dark:text-gray-500 text-sm">
          © 2025 Note Ninja. Built with 💻 for students, by students.
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-blue-100 to-blue-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 font-sans text-gray-800 dark:text-gray-100">
      {/* Header Gradient */}
      <div className="w-full bg-gradient-to-b from-blue-100 via-blue-200 to-blue-300 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"></div>
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Welcome back, {user?.email}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your Uploaded Notes</h2>
              {notes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-300">You haven't uploaded any notes yet.</p>
                  <a
                    href="/upload"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200"
                  >
                    Upload your first note
                  </a>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 dark:bg-gray-900 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 bg-gray-50 dark:bg-gray-900 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Course
                        </th>
                        <th className="px-6 py-3 bg-gray-50 dark:bg-gray-900 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Uploaded
                        </th>
                        <th className="px-6 py-3 bg-gray-50 dark:bg-gray-900 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Term
                        </th>
                        <th className="px-6 py-3 bg-gray-50 dark:bg-gray-900 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Name
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {notes.map((note: any) => (
                        <tr key={note.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                            {note.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {note.courseCode}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {note.createdAt && note.createdAt.seconds ? new Date(note.createdAt.seconds * 1000).toLocaleDateString() : ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {note.term || ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {note.name || ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Footer with Gradient */}
      <footer className="w-full bg-gradient-to-t from-blue-100 via-blue-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 mt-auto text-center py-6 text-gray-400 dark:text-gray-500 text-sm">
        © 2025 Note Ninja. Built with 💻 for students, by students.
      </footer>
    </div>
  )
} 