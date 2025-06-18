import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const UserSearch = () => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search) return;
    setLoading(true);
    const q = query(collection(db, 'students'), where('username', '>=', search), where('username', '<=', search + '\uf8ff'));
    const querySnapshot = await getDocs(q);
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    setResults(users);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-sour-lavender flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl font-bold mb-6" style={{ color: '#5E2A84' }}>Search Users</h1>
      <form onSubmit={handleSearch} className="flex gap-2 mb-8 w-full max-w-md">
        <input
          type="text"
          placeholder="Search by username..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#b266ff]"
        />
        <button type="submit" className="px-6 py-2 bg-[#b266ff] text-white font-bold rounded-r-lg hover:bg-[#8a2be2]">Search</button>
      </form>
      {loading && <div className="text-lg text-[#5E2A84]">Loading...</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-3xl">
        {results.map(user => (
          <div
            key={user.id}
            className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4 cursor-pointer hover:bg-[#f3e8ff] transition"
            onClick={() => navigate(`/u/${user.username}`)}
          >
            <img
              src={user.pfp || 'https://i.imgur.com/6VBx3io.png'}
              alt={user.username}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#b266ff]"
            />
            <div>
              <div className="font-bold text-lg text-[#5E2A84]">{user.username}</div>
              <div className="text-gray-500">View Profile</div>
            </div>
          </div>
        ))}
      </div>
      {!loading && results.length === 0 && search && (
        <div className="text-gray-500 mt-8">No users found.</div>
      )}
    </div>
  );
};

export default UserSearch; 