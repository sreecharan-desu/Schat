import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';

export const Landing = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 flex flex-col"
    >
      <Navbar />
      <main className="container flex flex-col items-center justify-center flex-grow text-center">
        <motion.h1
          className="text-5xl font-bold text-gray-800 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Welcome to SChat
        </motion.h1>
        <motion.p
          className="text-lg text-gray-600 mb-8 max-w-md"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          SecretChat is your secure and private messaging platform. Connect with friends in real-time with a clean and minimal interface.
        </motion.p>
        <div className="flex gap-4">
          <motion.button
            onClick={() => navigate('/signup')}
            className="btn btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Get started"
          >
            Get Started
          </motion.button>
          <motion.button
            onClick={() => navigate('/signin')}
            className="btn btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Sign in"
          >
            Sign In
          </motion.button>
        </div>
      </main>
      <footer className="py-4 text-center text-gray-500 text-sm">
        © 2025 SChat. All rights reserved.
      </footer>
    </motion.div>
  );
};