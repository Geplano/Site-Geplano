import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../../services/firebase';
import { Lock, Hammer, AlertCircle, Loader2, Chrome } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!auth) {
        setError("Erro de configuração: Firebase Auth não inicializado.");
        setLoading(false);
        return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // O AdminApp detectará a mudança de estado automaticamente via onAuthStateChanged
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('E-mail ou senha incorretos.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Muitas tentativas falhas. Tente novamente mais tarde.');
      } else {
        setError('Erro ao fazer login. Verifique o console.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    if (!auth || !googleProvider) {
        setError("Autenticação Google não configurada.");
        setLoading(false);
        return;
    }

    try {
        await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
        console.error(err);
        if (err.code === 'auth/popup-closed-by-user') {
            setError('Login cancelado pelo usuário.');
        } else {
            setError('Erro ao autenticar com Google. Tente novamente.');
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center animate-fade-in-up">
        <div className="flex items-center justify-center gap-3 text-geplano-green mb-4">
            <Hammer className="w-10 h-10" />
            <h1 className="text-3xl font-display font-black tracking-tighter">GEPLANO</h1>
        </div>
        <p className="text-gray-500 font-medium">Sistema de Gestão de Conteúdo</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="bg-geplano-green p-6 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <Lock className="text-white w-8 h-8" />
            </div>
            <h2 className="text-white font-bold text-xl">Acesso Restrito</h2>
            <p className="text-green-100 text-sm mt-1">Identifique-se para continuar</p>
        </div>

        <div className="p-8">
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-start gap-3">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            <div className="space-y-4">
                <button 
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-3 shadow-sm"
                >
                    {/* Simple Google G Icon Simulation or Lucide Chrome as placeholder */}
                    <Chrome size={20} className="text-blue-500" />
                    Entrar com Google
                </button>

                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-bold">Ou via E-mail</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase text-xs tracking-wider">E-mail</label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-geplano-green/20 focus:border-geplano-green transition-all outline-none"
                            placeholder="admin@geplano.com.br"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase text-xs tracking-wider">Senha</label>
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-geplano-green/20 focus:border-geplano-green transition-all outline-none"
                            placeholder="••••••••"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-geplano-gold hover:bg-geplano-goldHover text-white font-bold py-4 rounded-lg uppercase tracking-widest transition-all transform active:scale-95 shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Entrar com E-mail'}
                    </button>
                </form>
            </div>
        </div>
      </div>
      
      <p className="mt-8 text-xs text-gray-400">
        &copy; {new Date().getFullYear()} Painel Administrativo Geplano v1.1
      </p>
    </div>
  );
};