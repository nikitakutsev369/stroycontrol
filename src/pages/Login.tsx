import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { admins, foremen, sessions } from '../schema';
import { Errors, ErrorMessages, handleError, isAppError } from '../errors';

export default function Login() {
  const navigate = useNavigate();
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
          sessions.create({ userId: user.id, role: 'admin' });
          navigate('/');
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
          sessions.create({ foremanId: foreman.id, role: 'foreman' });
          navigate('/');
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg mb-4">
            <span className="text-3xl">🏗️</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">СтройКонтроль</h1>
          <p className="text-muted-foreground mt-2">Управление строительными проектами</p>
        </div>

        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
          <div className="flex bg-muted rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode('admin'); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                mode === 'admin'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground'
              }`}
            >
              Администратор
            </button>
            <button
              type="button"
              onClick={() => { setMode('foreman'); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                mode === 'foreman'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground'
              }`}
            >
              Прораб
            </button>
          </div>

          <form onSubmit={mode === 'admin' ? handleAdminLogin : handleForemanLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {mode === 'admin' ? 'Имя администратора' : 'ФИО прораба'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-input rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent transition bg-background text-foreground"
                placeholder={mode === 'admin' ? 'Админ' : 'Иванов Иван Иванович'}
                required
                disabled={loading}
              />
            </div>

            {mode === 'admin' ? (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Пароль</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-input rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent transition bg-background text-foreground"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">PIN-код</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full px-4 py-3 border border-input rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent transition bg-background text-foreground"
                  placeholder="••••"
                  maxLength={16}
                  required
                  disabled={loading}
                />
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">Демо-доступ:</p>
            <div className="space-y-2 text-xs">
              <div className="bg-muted rounded-lg p-3">
                <p className="font-medium text-foreground">Администратор:</p>
                <p className="text-muted-foreground mt-1">Имя: <code className="bg-background px-2 py-0.5 rounded">Админ</code></p>
                <p className="text-muted-foreground">Пароль: <code className="bg-background px-2 py-0.5 rounded">admin</code></p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="font-medium text-foreground">Прораб:</p>
                <p className="text-muted-foreground mt-1">Имя: <code className="bg-background px-2 py-0.5 rounded">Иван Петров</code></p>
                <p className="text-muted-foreground">PIN: <code className="bg-background px-2 py-0.5 rounded">1234</code></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
