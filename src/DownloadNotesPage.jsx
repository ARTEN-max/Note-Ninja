import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { db } from './firebase';
import { useAuth } from './contexts/AuthContext';
import { doc, setDoc, collection, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

// Mock data for different types of study materials
const studyMaterials = {
  studyGuides: [
    {
      id: "1",
      course: "CS246",
      title: "Object-Oriented Programming Guide",
      type: "Study Guide",
      uploader: "Jane Doe",
      date: "2024-03-15",
      fileType: "PDF",
      pageCount: 18,
      size: "2.3 MB",
      previewImg: "https://cdn.builder.io/api/v1/image/assets/TEMP/36526b27cd6c189d1bfdb806f5ceb1322060cbad?placeholderIfAbsent=true",
      pdfUrl: "/pdfs/cs246/oop-guide.pdf",
      description: "Comprehensive guide covering OOP principles, inheritance, polymorphism, and design patterns."
    },
    {
      id: "2",
      course: "MATH137",
      title: "Calculus I Study Guide",
      type: "Study Guide",
      uploader: "John Smith",
      date: "2024-03-10",
      fileType: "PDF",
      pageCount: 15,
      size: "1.8 MB",
      previewImg: "https://cdn.builder.io/api/v1/image/assets/TEMP/6fae324141d1039bf2b81b3ec7dc2f228cce8544?placeholderIfAbsent=true",
      pdfUrl: "/pdfs/math137/calculus-guide.pdf",
      description: "Complete calculus study guide covering limits, derivatives, and integrals."
    },
    {
      id: "3",
      course: "STAT230",
      title: "Statistics Study Guide",
      type: "Study Guide",
      uploader: "Emma Wilson",
      date: "2024-03-12",
      fileType: "PDF",
      pageCount: 22,
      size: "2.5 MB",
      previewImg: "https://cdn.builder.io/api/v1/image/assets/TEMP/b74b14b6b3c5377baeb384c799fd79ddca8803d8?placeholderIfAbsent=true",
      pdfUrl: "/pdfs/stat230/stats-guide.pdf",
      description: "Complete statistics guide covering probability, distributions, and hypothesis testing."
    }
  ],
  midtermFinal: [
    {
      id: "4",
      course: "MATH135",
      title: "Linear Algebra Midterm Review",
      type: "Midterm",
      uploader: "Alice Brown",
      date: "2024-03-01",
      fileType: "PDF",
      pageCount: 25,
      size: "3.1 MB",
      previewImg: "https://cdn.builder.io/api/v1/image/assets/TEMP/b5a7a6e7eb860dca445df9a3c409eb7da483cae0?placeholderIfAbsent=true",
      pdfUrl: "/pdfs/math135/linear-algebra-midterm.pdf",
      description: "Comprehensive midterm review covering all topics from weeks 1-6."
    },
    {
      id: "5",
      course: "PHYS121",
      title: "Physics Final Preparation",
      type: "Final",
      uploader: "Bob Wilson",
      date: "2024-02-28",
      fileType: "PDF",
      pageCount: 30,
      size: "3.5 MB",
      previewImg: "https://cdn.builder.io/api/v1/image/assets/TEMP/2a20d44e6ae70f49483a0c767b1644249e9ca8a3?placeholderIfAbsent=true",
      pdfUrl: "/pdfs/phys121/physics-final.pdf",
      description: "Complete final exam preparation guide with practice problems and solutions."
    }
  ],
  quizzes: [
    {
      id: "6",
      course: "CHEM120",
      title: "Chemistry Quiz Solutions",
      type: "Quiz",
      uploader: "Carol Davis",
      date: "2024-03-05",
      fileType: "PDF",
      pageCount: 12,
      size: "1.5 MB",
      previewImg: "https://cdn.builder.io/api/v1/image/assets/TEMP/409c53ce05e6a99f769c7cd21d30ed60ddfb1230?placeholderIfAbsent=true",
      pdfUrl: "/pdfs/chem120/quiz-solutions.pdf",
      description: "Solutions to all weekly quizzes with detailed explanations."
    }
  ],
  deepDive: [
    {
      id: "7",
      course: "CS246",
      title: "Advanced Design Patterns",
      type: "Deep Dive",
      uploader: "David Miller",
      date: "2024-03-12",
      fileType: "PDF",
      pageCount: 40,
      size: "4.2 MB",
      previewImg: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
      pdfUrl: "/pdfs/cs246/design-patterns.pdf",
      description: "In-depth exploration of advanced design patterns and their applications."
    }
  ]
};

const ADMIN_EMAIL = 'abdul.rahman78113@gmail.com'; // <-- Set your email here

const DownloadNotesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeSection, setActiveSection] = useState("studyGuides");
  const [currentMaterial, setCurrentMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addSuccess, setAddSuccess] = useState("");
  const [addError, setAddError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadSection, setUploadSection] = useState('studyGuides');
  const [courseCode, setCourseCode] = useState('');
  const [notes, setNotes] = useState([]);

  // Array of high-quality CS-related images
  const csImages = [
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1461344577544-4e5dc9487184?auto=format&fit=crop&w=600&q=80',
  ];

  useEffect(() => {
    // Fetch the material for the current id (for course code)
    // We'll use Firestore for notes, but still need course code from mock or route param
    // For now, use mock to get course code
    const material = Object.values(studyMaterials)
      .flat()
      .find(material => material.id === id);
    if (material) {
      setCurrentMaterial(material);
      setCourseCode(material.course);
      setActiveSection(material.type || 'studyGuides');
    } else {
      navigate('/browse');
    }
  }, [id, navigate]);

  // Fetch notes for this course from Firestore
  useEffect(() => {
    if (!courseCode) return;
    setLoading(true);
    const q = query(collection(db, 'notes'), where('course', '==', courseCode), orderBy('uploadDate', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notesArr = [];
      querySnapshot.forEach((doc) => {
        notesArr.push({ id: doc.id, ...doc.data() });
      });
      setNotes(notesArr);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [courseCode]);

  // Upload handler (admin only)
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !uploadTitle) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `study-materials/${courseCode}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      await setDoc(doc(db, 'notes', `${courseCode}_${Date.now()}`), {
        course: courseCode,
        title: uploadTitle,
        description: uploadDesc,
        section: uploadSection,
        fileUrl: downloadURL,
        fileName: file.name,
        fileSize: file.size,
        uploaderId: currentUser.uid,
        uploaderName: currentUser.email,
        uploadDate: new Date().toISOString(),
        type: uploadSection,
      });
      setAddSuccess('Note uploaded successfully!');
      setFile(null);
      setUploadTitle('');
      setUploadDesc('');
    } catch (err) {
      setAddError('Failed to upload note.');
    } finally {
      setUploading(false);
    }
  };

  // Add to My Notes handler (localStorage version)
  const handleAddToMyNotes = (material) => {
    setAddSuccess("");
    setAddError("");
    try {
      const notes = JSON.parse(localStorage.getItem('myNotes') || '[]');
      if (notes.some(note => note.id === material.id)) {
        setAddError("This note is already in My Notes.");
        return;
      }
      notes.push({ ...material, addedAt: new Date().toISOString() });
      localStorage.setItem('myNotes', JSON.stringify(notes));
      setAddSuccess("Added to My Notes!");
    } catch (err) {
      setAddError("Failed to add to My Notes.");
    }
  };

  const sections = [
    { id: "studyGuides", label: "Study Guides", icon: "📚" },
    { id: "midtermFinal", label: "Midterm/Final", icon: "📝" },
    { id: "quizzes", label: "Quizzes", icon: "✏️" },
    { id: "deepDive", label: "Deep Dive", icon: "🔍" }
  ];

  const MaterialCard = ({ material, onClick }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-md p-4 cursor-pointer border border-pink-100"
      onClick={onClick}
    >
      <div className="relative w-full h-40 mb-3">
        <img
          src={material.previewImg}
          alt={material.title}
          className="rounded-lg object-cover w-full h-full"
        />
        <div className="absolute top-2 left-2 bg-pink-100 text-pink-700 font-bold px-3 py-1 rounded-lg text-sm">
          {material.type}
        </div>
      </div>
      <h3 className="font-bold text-lg text-gray-800 mb-1">{material.title}</h3>
      <div className="text-sm text-gray-500 mb-2">
        {material.uploader} • {material.date}
      </div>
      <p className="text-sm text-gray-600 line-clamp-2">{material.description}</p>
    </motion.div>
  );

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
        className="min-h-screen bg-gradient-to-b from-pink-200 to-pink-300 flex items-center justify-center"
      >
        <div className="text-2xl font-bold text-[#880E4F]">Loading...</div>
      </motion.div>
    );
  }

  if (!courseCode) {
    return null;
  }

  return (
    <div className="min-h-screen bg-sour-lavender py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold font-inknut mb-4" style={{ color: '#5E2A84', textShadow: '0 2px 16px #F5F3FF, 0 1px 0 #fff', fontFamily: 'Inknut Antiqua, serif' }}>
          Notes for {courseCode}
        </h2>
        {/* Admin Upload Form */}
        {currentUser && currentUser.email === ADMIN_EMAIL && (
          <form onSubmit={handleUpload} className="mb-8 bg-white/90 rounded-2xl shadow p-6 flex flex-col gap-4">
            <h3 className="font-bold text-lg text-pink-800 mb-2">Upload PDF Note</h3>
            <input
              type="file"
              accept=".pdf"
              onChange={e => setFile(e.target.files[0])}
              className="border rounded p-2"
              required
            />
            <input
              type="text"
              placeholder="Title"
              value={uploadTitle}
              onChange={e => setUploadTitle(e.target.value)}
              className="border rounded p-2"
              required
            />
            <textarea
              placeholder="Description (optional)"
              value={uploadDesc}
              onChange={e => setUploadDesc(e.target.value)}
              className="border rounded p-2"
            />
            <select
              value={uploadSection}
              onChange={e => setUploadSection(e.target.value)}
              className="border rounded p-2"
            >
              <option value="studyGuides">Study Guide</option>
              <option value="midtermFinal">Midterm/Final</option>
              <option value="quizzes">Quiz</option>
              <option value="deepDive">Deep Dive</option>
            </select>
            <button
              type="submit"
              className="bg-pink-700 text-white font-bold py-2 px-4 rounded hover:bg-pink-800"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Note'}
            </button>
            {addSuccess && <div className="text-green-600">{addSuccess}</div>}
            {addError && <div className="text-red-600">{addError}</div>}
          </form>
        )}
        {/* Notes List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((material, idx) => {
            // Use previewImg if available, otherwise random CS image
            const imgSrc = material.previewImg || csImages[idx % csImages.length];
            return (
              <div key={material.id} className="bg-white rounded-xl shadow-md p-4 border border-pink-100 flex flex-col">
                <div className="relative w-full h-40 mb-3">
                  <img
                    src={imgSrc}
                    alt={material.title}
                    className="rounded-lg object-cover w-full h-full"
                  />
                  <div className="absolute top-2 left-2 bg-[#e3b8f9] text-[#5E2A84] font-bold px-3 py-1 rounded-lg text-sm">
                    {material.type}
                  </div>
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-1">{material.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{material.description}</p>
                <button
                  className="w-full py-2 rounded-2xl font-bold text-base bg-gradient-to-r from-[#b266ff] to-[#8a2be2] text-white shadow-lg transition-transform hover:scale-105 focus:outline-none mb-2"
                  onClick={() => window.open(material.fileUrl, '_blank')}
                >
                  <span className="mr-2">📥</span>Download PDF
                </button>
                <button
                  className="w-full py-2 rounded-2xl font-bold text-base bg-[#e3b8f9] text-[#5E2A84] shadow transition-transform hover:bg-[#c895f2] focus:outline-none mb-2"
                  onClick={() => handleAddToMyNotes(material)}
                >
                  <span className="mr-2">➕</span>Add to My Notes
                </button>
              </div>
            );
          })}
        </div>
        {(addSuccess || addError) && (
          <div className="mt-4 text-center">
            {addSuccess && <div className="text-green-600 font-medium mb-2">{addSuccess}</div>}
            {addError && <div className="text-red-600 font-medium mb-2">{addError}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadNotesPage; 