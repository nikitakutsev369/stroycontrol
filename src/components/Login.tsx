import React, { useState } from 'react';
import { admins, foremen, sessions } from '../schema';
import { User, Foreman } from '../types';
import { Errors, ErrorMessages, handleError, isAppError } from '../errors';
import { config } from '../config';
import { oauth } from '../oauth';

interface LoginProps {
  onLogin: (user: User | Foreman, role: 'admin' | 'foreman') => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [mode, setMode] = useState<'admin' | 'foreman'>('admin');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      try {
        const user = admins.authenticate(name, password);
        if (user) {
          const session = sessions.create({ userId: user.id, role: 'admin' });
          onLogin(user, 'admin');
        } else {
          throw Errors.unauthorized(ErrorMessages.invalidCredentials);
        }
      } catch (err) {
        handleError(err);
        setError(isAppError(err) ? err.message : ErrorMessages.invalidCredentials);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const handleForemanLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      try {
        const foreman = foremen.authenticate(name, pin);
        if (foreman) {
          const session = sessions.create({ foremanId: foreman.id, role: 'foreman' });
          onLogin(foreman, 'foreman');
        } else {
          throw Errors.unauthorized(ErrorMessages.invalidCredentials);
        }
      } catch (err) {
        handleError(err);
        setError(isAppError(err) ? err.message : ErrorMessages.invalidCredentials);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (mode === 'admin') {
      handleAdminLogin(e);
    } else {
      handleForemanLogin(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <span className="text-3xl">🏗️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">СтройКонтроль</h1>
          <p className="text-gray-500 mt-2">Управление строительными проектами</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Mode Switcher */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode('admin'); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                mode === 'admin'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Администратор
            </button>
            <button
              type="button"
              onClick={() => { setMode('foreman'); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                mode === 'foreman'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Прораб
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {mode === 'admin' ? 'Имя администратора' : 'ФИО прораба'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder={mode === 'admin' ? 'Админ' : 'Иванов Иван Иванович'}
                required
                disabled={loading}
              />
            </div>

            {mode === 'admin' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Пароль</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PIN-код</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="••••"
                  maxLength={16}
                  required
                  disabled={loading}
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-medium text-white transition shadow-sm ${
                mode === 'admin'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          {/* OAuth Login */}
          {config.oauthEnabled && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-500">или</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => oauth.startLogin()}
                className="w-full py-3 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition shadow-sm flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Войти через Kimi
              </button>
            </div>
          )}

          {/* Demo credentials */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-3">Демо-доступ:</p>
            <div className="space-y-2 text-xs">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="font-medium text-blue-900">Администратор:</p>
                <p className="text-blue-700 mt-1">Имя: <code className="bg-blue-100 px-2 py-0.5 rounded">Админ</code></p>
                <p className="text-blue-700">Пароль: <code className="bg-blue-100 px-2 py-0.5 rounded">admin</code></p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="font-medium text-purple-900">Прораб:</p>
                <p className="text-purple-700 mt-1">Имя: <code className="bg-purple-100 px-2 py-0.5 rounded">Иван Петров</code></p>
                <p className="text-purple-700">PIN: <code className="bg-purple-100 px-2 py-0.5 rounded">1234</code></p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2024 СтройКонтроль. Все права защищены.
        </p>
      </div>
    </div>
  );
}
