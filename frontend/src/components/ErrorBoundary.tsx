import React, { Component, type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, errorMessage: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="container py-12 text-center flex flex-col items-center justify-center min-h-screen bg-gray-50"
        >
          <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6 max-w-md">
            {this.state.errorMessage || 'An unexpected error occurred. Please try again or contact support.'}
          </p>
          <motion.button
            onClick={this.handleRetry}
            className="btn btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Retry"
          >
            Try Again
          </motion.button>
        </motion.div>
      );
    }
    return this.props.children;
  }
}