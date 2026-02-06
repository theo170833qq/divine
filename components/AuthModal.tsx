import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { CrossIcon, ShieldIcon } from './Icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onSuccess();
        onClose();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        // Se o cadastro foi feito mas não há sessão, exige confirmação de e-mail
        if (data.user && !data.session) {
            setInfoMessage('Conta criada! Verifique seu e-mail para confirmar o cadastro antes de entrar.');
            setIsLogin(true); // Muda para a tela de login
        } else {
            onSuccess();
            onClose();
        }
      }
    } catch (err: any) {
      let msg = err.message || 'Ocorreu um erro. Tente novamente.';
      
      // Traduções de erros comuns do Supabase
      if (msg.includes('Invalid login credentials')) {
        msg = 'E-mail ou senha incorretos.';
      } else if (msg.includes('User already registered')) {
        msg = 'Este e-mail já possui conta. Clique em "Fazer login" abaixo.';
      } else if (msg.includes('Password should be at least')) {
        msg = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (msg.includes('valid email')) {
        msg = 'Por favor, digite um e-mail válido.';
      } else if (msg.includes('rate limit')) {
        msg = 'Muitas tentativas. Aguarde um momento antes de tentar novamente.';
      } else if (msg.includes('Email not confirmed')) {
        msg = 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada (e spam) e clique no link enviado.';
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-royal-900/90 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-church-50 rounded-lg shadow-2xl border border-gold-600/50 overflow-hidden transform transition-all animate-fade-in-up">
        {/* Paper Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-80 pointer-events-none"></div>

        <div className="relative p-8">
            <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-royal-900 border-2 border-gold-500 flex items-center justify-center shadow-lg">
                    <ShieldIcon className="w-8 h-8 text-gold-400" />
                </div>
            </div>

            <h2 className="text-2xl font-display font-bold text-royal-900 text-center uppercase tracking-widest mb-2">
                {isLogin ? 'Bem-vindo de volta' : 'Iniciar Jornada'}
            </h2>
            <p className="text-center text-church-600 font-serif text-sm italic mb-8">
                {isLogin ? 'Entre para acessar seu diário espiritual.' : 'Crie sua conta para salvar suas orações e reflexões.'}
            </p>

            <form onSubmit={handleAuth} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-royal-800 uppercase tracking-wider mb-1">Email</label>
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-church-200 rounded-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-church-900 placeholder:text-church-300 font-serif"
                        placeholder="seu@email.com"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-royal-800 uppercase tracking-wider mb-1">Senha</label>
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-church-200 rounded-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-church-900 font-serif"
                        placeholder="••••••••"
                        minLength={6}
                    />
                </div>

                {infoMessage && (
                    <div className="p-3 bg-green-50 text-green-800 text-xs text-center border border-green-200 rounded-sm font-serif">
                        {infoMessage}
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-red-50 text-red-800 text-xs text-center border border-red-200 rounded-sm font-serif animate-pulse">
                        {error}
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full btn-3d-gold py-3 rounded-sm font-display font-bold uppercase tracking-wider text-royal-900 mt-4 disabled:opacity-50"
                >
                    {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button 
                    onClick={() => {
                        setIsLogin(!isLogin);
                        setError(null);
                        setInfoMessage(null);
                    }}
                    className="text-gold-600 hover:text-gold-800 text-xs font-bold uppercase tracking-widest border-b border-transparent hover:border-gold-600 transition-all"
                >
                    {isLogin ? 'Não tem uma conta? Crie agora' : 'Já tem conta? Fazer login'}
                </button>
            </div>

            <button onClick={onClose} className="absolute top-4 right-4 text-church-400 hover:text-royal-900">
                <CrossIcon className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;