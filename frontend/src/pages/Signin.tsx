import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getUser, signin } from '../utils/api';
import { userAtom } from '../store/store';
import { connectWebSocket } from '../utils/websocket';
import { Navbar } from '../components/Navbar';

export const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setUser] = useRecoilState(userAtom);
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
      const response = await signin(email, password);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('websocketURL', response.data.websocketURL);
        const userResponse = await getUser();
        setUser(userResponse.data.user);
        connectWebSocket(response.data.token, (data) => {
          console.log('WebSocket message:', data);
        });
        toast.success('Signed in successfully', {
          duration: 2000,
          style: { background: '#f0fdf4', color: '#15803d' },
        });
        navigate('/dashboard');
      } else {
        setError(response.data.msg);
        toast.error(response.data.msg, {
          duration: 3000,
          style: { background: '#fef2f2', color: '#b91c1c' },
        });
      }
    } catch (err) {
      console.log(err)
      setError('Failed to sign in');
      toast.error('Failed to sign in', {
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
            Sign In
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
              aria-label="Sign in"
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
                'Sign In'
              )}
            </motion.button>
          </form>
          <p className="mt-4 text-center text-gray-600 text-sm">
            Don't have an account?{' '}
            <motion.a
              onClick={() => navigate('/signup')}
              className="text-black hover:underline cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              Sign Up
            </motion.a>
          </p>
        </motion.div>
      </main>
    </motion.div>
  );
};