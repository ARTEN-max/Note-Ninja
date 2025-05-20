import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db } from '../lib/firebase'
import { collection, query, where, orderBy, getDocs, doc, serverTimestamp, increment, updateDoc, addDoc, getDoc } from 'firebase/firestore'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import { useAuth } from '../contexts/AuthContext'
import { FileText } from 'lucide-react'

interface Note {
  id: string
  title: string
  uploaderId: string
  fileUrl: string
  createdAt: { seconds: number, nanoseconds: number } | null
  courseCode: string
  term?: string
}

GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.js`

function NoteCard({ note }: { note: Note }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isPdf = note.fileUrl.toLowerCase().split('?')[0].endsWith('.pdf')
  const isDocx = note.fileUrl.toLowerCase().split('?')[0].endsWith('.docx')
  const fileType = isPdf ? 'PDF' : isDocx ? 'DOCX' : 'File'
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (isPdf && canvasRef.current) {
      const renderPdf = async () => {
        try {
          const loadingTask = getDocument(note.fileUrl)
          const pdf = await loadingTask.promise
          const page = await pdf.getPage(1)
          const viewport = page.getViewport({ scale: 2 })
          const canvas = canvasRef.current
          if (!canvas) return
          const context = canvas.getContext('2d')
          if (!context) return
          canvas.width = viewport.width
          canvas.height = viewport.height

          const rotation = page.rotate || 0
          if (rotation !== 0) {
            context.save()
            context.translate(canvas.width / 2, canvas.height / 2)
            context.rotate((rotation * Math.PI) / 180)
            context.translate(-canvas.width / 2, -canvas.height / 2)
          }

          await page.render({ canvasContext: context, viewport }).promise

          if (rotation !== 0) {
            context.restore()
          }
        } catch (e) {
          // Optionally set a state to show a fallback image
        }
      }
      renderPdf()
    }
  }, [isPdf, note.fileUrl])

  // Download logging handler
  const handleDownload = async (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      navigate('/login');
      return;
    }
    let userName = '';
    if (user) {
      // Try to get the user's name from Firestore if available
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          userName = userDoc.data().name || '';
        }
      } catch {}
    }
    try {
      await addDoc(collection(db, 'notes', note.id, 'downloads'), {
        courseCode: note.courseCode,
        userId: user ? user.uid : 'anonymous',
        userName,
        timestamp: serverTimestamp(),
      });
      // Increment downloadCount in notes collection
      const noteRef = doc(db, 'notes', note.id);
      await updateDoc(noteRef, {
        downloadCount: increment(1)
      });
      // Download will proceed
    } catch (err) {
      // Optionally handle logging error, but don't block download
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition flex flex-col">
      <div className="mb-4 flex justify-center">
        {isPdf ? (
          <canvas
            ref={canvasRef}
            width={384}
            height={512}
            className="w-48 h-64 object-contain rounded shadow border bg-gray-50 dark:bg-gray-900"
            style={{ background: '#f8fafc' }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-48 h-64 rounded shadow border bg-gray-50 dark:bg-gray-900">
            <FileText className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-300 text-center">DOCX file</p>
          </div>
        )}
      </div>
      {/* Extra info: file type and term */}
      <p className="text-sm text-gray-500 dark:text-gray-300 text-center mt-2">
        🗂️ {fileType}{note.term ? ` • ${note.term}` : ''}
      </p>
      <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{note.title}</div>
      <a
        href={note.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-5 py-2 rounded-full w-fit"
        onClick={handleDownload}
      >
        Download
      </a>
    </div>
  )
}

export default function CourseNotes() {
  const { courseCode } = useParams<{ courseCode: string }>()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNotes() {
      setLoading(true)
      const q = query(
        collection(db, 'notes'),
        where('courseCode', '==', courseCode),
        orderBy('createdAt', 'desc')
      )
      const snap = await getDocs(q)
      setNotes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note)))
      setLoading(false)
    }
    fetchNotes()
  }, [courseCode])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-blue-100 to-blue-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 font-sans text-gray-800 dark:text-gray-100">
      <div className="flex-1 max-w-4xl mx-auto px-4 md:px-8 py-12 w-full">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">
          Notes for {courseCode}
        </h1>
        {loading ? (
          <div className="text-center text-gray-500">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="text-center text-gray-500">No notes found for this course.</div>
        ) : (
          notes.length === 1 ? (
            <div className="flex justify-center">
              <NoteCard note={notes[0]} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-wrap">
              {notes.map(note => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          )
        )}
      </div>
      {/* Footer with Gradient */}
      <footer className="w-full bg-gradient-to-t from-blue-100 via-blue-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 mt-auto text-center py-6 text-gray-400 dark:text-gray-500 text-sm">
        © 2025 Note Ninja. Built with 💻 for students, by students.
      </footer>
    </div>
  )
} 