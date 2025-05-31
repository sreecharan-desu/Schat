import { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Landing } from './pages/LandingPage';
import { Signup } from './pages/Signup';
import { Signin } from './pages/Signin';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter basename="/">
      <ErrorBoundary>
        <Suspense
          fallback={
            <motion.div
              className="min-h-screen bg-gray-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="flex items-center gap-2 text-gray-600"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Loading...
              </motion.div>
            </motion.div>
          }
        >
          <Toaster />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;