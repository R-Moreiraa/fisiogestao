import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Activity,
  Layers,
  DollarSign,
  UserCheck,
  BarChart3,
  Settings,
  Inbox,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  Building2,
  ExternalLink,
  Shield,
  Stethoscope
} from 'lucide-react';

export const GestaoLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login/gestao');
  };

  const menuItems = [
    { to: '/gestao/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/gestao/agenda', icon: Calendar, label: 'Agenda' },
    { to: '/gestao/pacientes', icon: Users, label: 'Pacientes' },
    { to: '/gestao/prontuarios', icon: FileText, label: 'Prontuários' },
    { to: '/gestao/tratamentos', icon: Activity, label: 'Tratamentos & Sessões' },
    { to: '/gestao/financeiro', icon: DollarSign, label: 'Financeiro' },
    { to: '/gestao/profissionais', icon: UserCheck, label: 'Profissionais' },
    { to: '/gestao/solicitacoes', icon: Inbox, label: 'Solicitações Web', badge: '1 Nova' },
    { to: '/gestao/relatorios', icon: BarChart3, label: 'Relatórios' },
    { to: '/gestao/configuracoes', icon: Settings, label: 'Configurações' },
  ];

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'fisioterapeuta': return 'Fisioterapeuta';
      case 'recepcionista': return 'Recepção';
      default: return 'Profissional';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      <div className="flex flex-1">
        {/* DESKTOP SIDEBAR */}
        <aside
          className={`hidden lg:flex flex-col bg-white border-r border-slate-200/80 transition-all duration-300 z-30 sticky top-0 h-screen ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Brand header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
            <div className={`flex items-center gap-3 overflow-hidden ${sidebarCollapsed ? 'justify-center w-full' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-brand-500/20">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              {!sidebarCollapsed && (
                <div className="truncate">
                  <span className="font-extrabold text-slate-900 tracking-tight text-base block leading-none">
                    FisioGestão
                  </span>
                  <span className="text-[10px] text-brand-600 font-semibold uppercase tracking-wider">
                    SaaS Clínica
                  </span>
                </div>
              )}
            </div>
            {!sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                title="Recolher menu"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            <div className={`text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3 ${sidebarCollapsed ? 'text-center' : ''}`}>
              {sidebarCollapsed ? '•••' : 'Módulos Clínicos'}
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    } ${sidebarCollapsed ? 'justify-center' : ''}`
                  }
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0 stroke-[1.8] group-hover:scale-105 transition" />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  {!sidebarCollapsed && item.badge && (
                    <span className="ml-auto text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded-full shadow-xs">
                      {item.badge}
                    </span>
                  )}
                  {sidebarCollapsed && item.badge && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Quick link to Landing page & collapse button */}
          <div className="p-3 border-t border-slate-100 space-y-1">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-brand-600 transition ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
              title="Visualizar Landing Page pública"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span>Ver Landing Page</span>}
            </a>

            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="w-full py-2 flex justify-center text-slate-400 hover:text-slate-600 transition"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* TOPBAR HEADER */}
          <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
            {/* Left: Mobile trigger & Search bar */}
            <div className="flex items-center gap-4 flex-1 max-w-xl">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="relative w-full max-w-md hidden sm:block">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Pesquisar pacientes, atendimentos ou prontuários... (Ctrl+K)"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition outline-none"
                />
              </div>
            </div>

            {/* Right: Actions, Notifications & Profile */}
            <div className="flex items-center gap-3">
              {/* Unit Badge */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 border border-brand-200 text-brand-800 text-xs font-medium rounded-xl">
                <Building2 className="w-3.5 h-3.5 text-brand-600" />
                <span>Unidade Matriz - Paulista</span>
              </div>

              {/* Notification icon */}
              <NavLink
                to="/gestao/solicitacoes"
                className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition"
                title="Solicitações recebidas"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              </NavLink>

              <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-700 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[140px]">
                      {user?.name || 'Dr. Roberto Sullivan'}
                    </p>
                    <span className="text-[10px] text-brand-600 font-medium">
                      {getRoleLabel(user?.role)}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    </div>

                    <NavLink
                      to="/gestao/configuracoes"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      Configurações da Clínica
                    </NavLink>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Encerrar Sessão
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* PAGE CONTENT OUTLET */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="relative w-72 max-w-full bg-white h-full flex flex-col z-10 shadow-2xl animate-slideRight">
            <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-900">FisioGestão SaaS</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                        isActive
                          ? 'bg-brand-50 text-brand-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl text-sm font-semibold transition"
              >
                <LogOut className="w-4 h-4" />
                Sair da Conta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

