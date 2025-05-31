import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { signup } from '../utils/api';
import { Navbar } from '../components/Navbar';

export const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required');
      toast.error('Email and password are required', {
        duration: 3000,
        style: { background: '#fef2f2', color: '#b91c1c' },
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await signup(email, password);
      if (response.data.success) {
        toast.success('Account created! Please sign in.', {
          duration: 2000,
          style: { background: '#f0fdf4', color: '#15803d' },
        });
        navigate('/signin');
      } else {
        setError(response.data.msg);
        toast.error(response.data.msg, {
          duration: 3000,
          style: { background: '#fef2f2', color: '#b91c1c' },
        });
      }
    } catch (err) {
      console.log(err)
      setError('Failed to create user');
      toast.error('Failed to create user', {
        duration: 3000,
        style: { background: '#fef2f2', color: '#b91c1c' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 flex flex-col"
    >
      <Navbar />
      <main className="container flex flex-col items-center justify-center flex-grow">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Sign Up
          </h2>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 mb-4 text-sm"
            >
              {error}
            </motion.p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-600 text-sm mb-1" htmlFor="email">
                Email
              </label>
              <motion.input
                ref={emailRef}
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input bg-gray-50 text-gray-800 placeholder-gray-400 disabled:opacity-50"
                required
                disabled={isLoading}
                aria-label="Email"
                whileFocus={{ scale: 1.02 }}
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1" htmlFor="password">
                Password
              </label>
              <motion.input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input bg-gray-50 text-gray-800 placeholder-gray-400 disabled:opacity-50"
                required
                disabled={isLoading}
                aria-label="Password"
                whileFocus={{ scale: 1.02 }}
              />
            </div>
            <motion.button
              type="submit"
              className="btn btn-primary w-full disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Sign up"
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white mx-auto"
                  viewBox="0 0 24 24"
                >
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
              ) : (
                'Sign Up'
              )}
            </motion.button>
          </form>
          <p className="mt-4 text-center text-gray-600 text-sm">
            Already have an account?{' '}
            <motion.a
              onClick={() => navigate('/signin')}
              className="text-black hover:underline cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              Sign In
            </motion.a>
          </p>
        </motion.div>
      </main>
    </motion.div>
  );
};