import { useState } from 'react';
import type { FormEvent } from 'react';
import { AxiosError } from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import apiClient from '../lib/axios';
import { useAuth } from '../hooks/useAuth';
import type { RegisterRequest, AuthResponse } from '../types/api.types';

/**
 * Register Page
 * 
 * Modern registration page with gradient background and glassmorphism design.
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    username: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 8) return { strength: 1, label: 'Weak', color: 'text-red-400' };
    if (password.length < 12) return { strength: 2, label: 'Medium', color: 'text-yellow-400' };
    return { strength: 3, label: 'Strong', color: 'text-green-400' };
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordsMatch = formData.password && confirmPassword && formData.password === confirmPassword;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password confirmation
    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', formData);
      setAuth(response.data);
      navigate('/', { replace: true });
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string } | undefined)?.message
          : undefined;
      setError(message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 md:p-10">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block mb-4"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <span className="text-2xl font-bold text-white">BP</span>
            </div>
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Create Account
          </h2>
          <p className="text-white/80 text-sm md:text-base">
            Start uploading photos at Blitz Speed
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
            <p className="text-red-100 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Registration Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white/90 mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-white/50" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Username Field */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-white/90 mb-2"
            >
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-white/50" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                placeholder="Choose a username"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white/90 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-white/50" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="block w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                placeholder="Create a password (min 8 characters)"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white/80 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                      className={`h-full ${
                        passwordStrength.strength === 1
                          ? 'bg-red-400'
                          : passwordStrength.strength === 2
                          ? 'bg-yellow-400'
                          : 'bg-green-400'
                      }`}
                    />
                  </div>
                  {passwordStrength.label && (
                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                      {passwordStrength.label}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-white/90 mb-2"
            >
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-white/50" />
              </div>
              <input
                id="confirm-password"
                name="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`block w-full pl-10 pr-10 py-3 bg-white/10 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all ${
                  confirmPassword && passwordsMatch
                    ? 'border-green-400/50'
                    : confirmPassword && !passwordsMatch
                    ? 'border-red-400/50'
                    : 'border-white/20'
                }`}
                placeholder="Confirm your password"
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                {confirmPassword && passwordsMatch && (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                )}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-white/50 hover:text-white/80 transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="mt-1 text-xs text-red-300">Passwords do not match</p>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading || !passwordsMatch || formData.password.length < 8}
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </motion.button>

          {/* Sign In Link */}
          <div className="text-center pt-4">
            <p className="text-white/70 text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-white hover:text-white/80 underline underline-offset-2 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
