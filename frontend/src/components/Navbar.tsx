import { useRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { userAtom } from '../store/store';
import { disconnectWebSocket } from '../utils/websocket';

export const Navbar = () => {
  const [user, setUser] = useRecoilState(userAtom);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('websocketURL');
      setUser(null);
      await disconnectWebSocket();
      navigate('/signin');
      toast.success('Logged out successfully', {
        duration: 2000,
        style: { background: '#f0fdf4', color: '#15803d' },
      });
    } catch (error) {
      console.log(error)
      toast.error('Failed to log out. Please try again.', {
        duration: 3000,
        style: { background: '#fef2f2', color: '#b91c1c' },
      });
    }
  };

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-sm py-4"
    >
      <div className="container flex justify-between items-center">
        <motion.h1
          className="text-2xl font-bold text-gray-800"
          whileHover={{ scale: 1.05 }}
        >
          SChat
        </motion.h1>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm">{user.name}</span>
            <motion.button
              onClick={handleLogout}
              className="btn btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Log out"
            >
              Logout
            </motion.button>
          </div>
        ) : (
          <div className="flex gap-4">
            <motion.button
              onClick={() => navigate('/signin')}
              className="btn btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Sign in"
            >
              Sign In
            </motion.button>
            <motion.button
              onClick={() => navigate('/signup')}
              className="btn btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Sign up"
            >
              Sign Up
            </motion.button>
          </div>
        )}
      </div>
    </motion.nav>
  );
};