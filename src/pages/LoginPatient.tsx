import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HeartPulse, Lock, User, ArrowRight, Loader2, Sparkles, Phone, CheckCircle } from 'lucide-react';

export const LoginPatient: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginPatient } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginPatient(identifier, password);
      navigate('/paciente/dashboard');
    } catch (err: any) {
      setError(err.message || 'Falha no login. Verifique seu CPF/E-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoId: string, demoPass: string) => {
    setIdentifier(demoId);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-100/80 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-brand-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3 group mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition">
            <HeartPulse className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-black text-slate-900 tracking-tight block leading-tight">
              Portal do Paciente
            </span>
            <span className="text-[11px] text-brand-600 font-semibold tracking-wide uppercase">
              FisioPrime Reabilitação
            </span>
          </div>
        </Link>
        <h2 className="text-xl font-bold text-slate-900">Bem-vindo à sua Área Exclusiva</h2>
        <p className="text-xs text-slate-500 mt-1">
          Acompanhe suas consultas, evoluções clínicas e planos de tratamento.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-200/80 sm:px-10 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold animate-fadeIn">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                CPF ou E-mail
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="123.456.789-00 ou seu e-mail"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Senha
                </label>
                <a href="#" className="text-[11px] text-brand-600 hover:underline font-medium">
                  Esqueceu a senha?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-brand-600 to-sky-600 hover:from-brand-700 hover:to-sky-700 text-white font-bold rounded-xl text-sm transition shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Acessando...
                </>
              ) : (
                <>
                  Acessar Meus Atendimentos
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Buttons for Patient */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Contas de Paciente de Teste:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('123.456.789-00', 'paciente123')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-brand-50 border border-slate-200 text-left transition group"
              >
                <p className="text-[11px] font-bold text-slate-800 group-hover:text-brand-700">João Carlos</p>
                <p className="text-[10px] text-slate-400">Tratamento Lombar</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('234.567.890-11', 'paciente123')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-brand-50 border border-slate-200 text-left transition group"
              >
                <p className="text-[11px] font-bold text-slate-800 group-hover:text-brand-700">Mariana Costa</p>
                <p className="text-[10px] text-slate-400">Pós-Op Joelho LCA</p>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-4">
          <Link to="/login/gestao" className="text-slate-600 hover:text-brand-600 font-semibold">
            Acesso para Médicos e Recepção
          </Link>
          <span>•</span>
          <Link to="/" className="text-slate-500 hover:text-slate-800">
            Voltar à Página Inicial
          </Link>
        </div>
      </div>
    </div>
  );
};

