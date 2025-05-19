# Note Ninja

A modern, fast, and secure note-taking application built with React, Firebase, and Tailwind CSS.

## Features

- 🔐 Secure authentication with Firebase
- 📝 Create, edit, and organize notes
- 💾 Real-time saving with Firebase Firestore
- 🎨 Beautiful, responsive UI with Tailwind CSS
- ⚡ Fast and modern development with Vite

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- Firebase account

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/note-ninja.git
   cd note-ninja
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Firebase project and enable:
   - Authentication (Email/Password)
   - Firestore Database
   - Storage (optional)

4. Create a `.env` file in the root directory with your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
note-ninja/
├── public/             # Static files
├── src/
│   ├── components/     # Reusable components
│   ├── pages/         # Page components
│   ├── lib/           # Firebase and other utilities
│   ├── App.tsx        # Main app component
│   ├── main.tsx       # Entry point
│   └── index.css      # Global styles
├── index.html         # HTML entry point
└── package.json       # Dependencies and scripts
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 