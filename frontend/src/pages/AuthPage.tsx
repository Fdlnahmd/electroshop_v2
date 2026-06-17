import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { ArrowLeft } from 'lucide-react';

export function AuthPage({ isRegister = false }: { isRegister?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, apiUrl } = useAppContext();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
  }, [isRegister]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isRegister) {
      if (!name || !email || !password) {
        setError('Please fill in all fields');
        return;
      }
      
      try {
        const res = await fetch(`${apiUrl}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ name, email, password })
        });
        
        const data = await res.json();
        
        if (res.ok) {
          await login(data.user, data.access_token);
          navigate('/');
        } else {
          setError(data.message || 'Registration failed');
        }
      } catch (err) {
        setError('Failed to connect to the server');
      }
    } else {
      try {
        const res = await fetch(`${apiUrl}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        
        if (res.ok) {
          await login(data.user, data.access_token);
          const from = (location.state as any)?.from?.pathname || '/';
          navigate(from);
        } else {
          setError(data.message || 'Invalid email or password');
        }
      } catch (err) {
        setError('Failed to connect to the server');
      }
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft size={16} />
          <span>Kembali ke Toko</span>
        </Link>
      </div>
      <div className="max-w-md w-full">
        <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-white font-bold text-2xl mb-4">
              E
            </Link>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {isRegister ? 'Create an account' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {isRegister 
                ? 'Sign up to start shopping premium tech.' 
                : 'Enter your credentials to access your account.'}
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}
            
            {isRegister && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-colors"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-colors"
                />
              </div>
            </div>

            {!isRegister && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
              >
                {isRegister ? 'Register' : 'Sign in'}
              </button>
            </div>
            

          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}
              <Link to={isRegister ? '/login' : '/register'} className="ml-1 font-medium text-primary hover:underline">
                {isRegister ? 'Sign in' : 'Register now'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
