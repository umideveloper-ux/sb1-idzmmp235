import React, { useState, useEffect } from 'react';
import { School } from '../types';
import { Car, Lock, User } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

interface LoginProps {
  schools: School[];
  onLogin: (school: School) => void;
}

const Login: React.FC<LoginProps> = ({ schools, onLogin }) => {
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('Schools in Login:', schools);
  }, [schools]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (selectedSchool === '') {
      setError('Lütfen bir sürücü kursu seçin');
      return;
    }
    const school = schools.find(s => s.id === selectedSchool);
    if (!school) {
      setError('Geçersiz sürücü kursu seçimi');
      return;
    }
    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, school.email, password);
      onLogin(school);
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/invalid-login-credentials') {
        setError('Giriş başarısız. Lütfen e-posta ve şifrenizi kontrol edin.');
      } else {
        setError('Giriş sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animasyonlu arka plan öğeleri */}
      <div className="absolute inset-0 z-0">
        <div id="stars"></div>
        <div id="stars2"></div>
        <div id="stars3"></div>
      </div>

      <div className="max-w-md w-full space-y-8 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-10 rounded-xl shadow-2xl transform transition-all hover:scale-105 relative z-10">
        <div>
          <Car className="mx-auto h-16 w-auto text-white" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            2024 Sürücü Kursu Yönetim Sistemi
          </h2>
          <p className="mt-2 text-center text-sm text-gray-200">
            Lütfen giriş yapın
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="school" className="sr-only">
                Sürücü Kursu
              </label>
              <div className="relative">
                {schools.length === 0 ? (
                  <p className="text-white text-sm mb-2">Sürücü kursları yükleniyor...</p>
                ) : (
                  <>
                    <select
                      id="school"
                      name="school"
                      required
                      className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      value={selectedSchool}
                      onChange={(e) => setSelectedSchool(e.target.value)}
                    >
                      <option value="">Sürücü Kursu Seçin</option>
                      {schools.map((school) => (
                        <option key={school.id} value={school.id}>
                          {school.name}
                        </option>
                      ))}
                    </select>
                    <User className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Şifre
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Şifre"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-300 text-sm bg-red-500 bg-opacity-25 border border-red-400 rounded-md p-2 mt-2">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:scale-105"
              disabled={isLoading || schools.length === 0}
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" aria-hidden="true" />
              </span>
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center text-xs text-gray-300">
          <p>© 2024 Sürücü Kursu Yönetim Sistemi</p>
          <p>Haşim Doğan Işık tarafından tasarlanmış ve kodlanmıştır.</p>
          <p>Tüm hakları saklıdır. İzinsiz paylaşılması ve kullanılması yasaktır.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;