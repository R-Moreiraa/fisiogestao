import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HeartPulse,
  Calendar,
  Layers,
  FileClock,
  Receipt,
  User,
  LogOut,
  Menu,
  X,
  Phone,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export const PatientLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login/paciente');
  };

  const navItems = [
    { to: '/paciente/dashboard', icon: HeartPulse, label: 'Meu Painel' },
    { to: '/paciente/agenda', icon: Calendar, label: 'Minha Agenda' },
    { to: '/paciente/tratamentos', icon: Layers, label: 'Meus Tratamentos' },
    { to: '/paciente/historico', icon: FileClock, label: 'Histórico & Evoluções' },
    { to: '/paciente/financeiro', icon: Receipt, label: 'Financeiro & Recibos' },
    { to: '/paciente/perfil', icon: User, label: 'Meu Perfil' },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col antialiased">
      {/* Top micro bar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-500 text-white flex items-center justify-center font-bold shadow-xs">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-base block leading-none">
                Portal do Paciente
              </span>
              <span className="text-[10px] text-brand-600 font-semibold">
                FisioPrime Reabilitação
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/5511987654321"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200 transition"
            >
              <Phone className="w-3.5 h-3.5" />
              Falar com a Clínica (WhatsApp)
            </a>

            <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
              </div>
              <span className="text-xs font-semibold text-slate-800 hidden sm:inline">
                {user?.name || 'Paciente'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex gap-8">
        {/* DESKTOP LEFT SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 space-y-6">
          {/* Patient Card Preview */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md shadow-brand-500/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{user?.name || 'Paciente'}</h3>
              <p className="text-xs text-slate-400">{user?.email || 'Acesso exclusivo'}</p>
            </div>
            <div className="pt-1">
              <span className="inline-block text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full">
                Paciente Ativo
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="bg-white rounded-3xl p-3 border border-slate-200/80 shadow-xs space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-brand-500 text-white font-semibold shadow-md shadow-brand-500/25'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Help box */}
          <div className="bg-gradient-to-br from-petroleum to-brand-800 text-white rounded-3xl p-5 shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-brand-200" />
            </div>
            <h4 className="font-bold text-sm">Dúvidas sobre seu tratamento?</h4>
            <p className="text-xs text-white/80 leading-relaxed">
              Você pode solicitar reagendamentos ou enviar mensagens diretamente à nossa equipe de atendimento.
            </p>
            <a
              href="tel:1132894000"
              className="inline-block text-xs font-bold text-brand-200 hover:text-white underline pt-1"
            >
              Ligue (11) 3289-4000
            </a>
          </div>
        </aside>

        {/* Content View */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="relative w-72 max-w-full bg-white h-full flex flex-col z-10 shadow-2xl p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="font-bold text-slate-900">Menu do Paciente</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition ${
                        isActive
                          ? 'bg-brand-500 text-white font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl text-sm font-semibold transition"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

