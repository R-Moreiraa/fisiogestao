import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Menu, X, CalendarCheck, User, Building2 } from 'lucide-react';

interface LandingNavbarProps {
  onOpenEvaluation: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ onOpenEvaluation }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      {/* Top micro announcement bar */}
      <div className="bg-petroleum text-brand-100 text-xs py-1.5 px-4 sm:px-8 flex justify-between items-center text-center">
        <span className="hidden sm:inline">
          Atendimento personalizado 1 paciente por fisioterapeuta • Avaliação biomecânica 3D
        </span>
        <div className="flex items-center gap-4 ml-auto text-xs font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Horários disponíveis para esta semana
          </span>
          <span className="text-white/40">|</span>
          <a href="tel:1132894000" className="hover:text-white transition">
            (11) 3289-4000
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-brand-700 transition">
                FISIOPRIME
              </span>
              <span className="text-[10px] bg-brand-50 text-brand-700 font-bold px-1.5 py-0.5 rounded border border-brand-200">
                REABILITAÇÃO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">
              Centro Integrado de Fisioterapia
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
          <a href="#inicio" className="hover:text-brand-600 transition">Início</a>
          <a href="#sobre" className="hover:text-brand-600 transition">Sobre</a>
          <a href="#especialidades" className="hover:text-brand-600 transition">Especialidades</a>
          <a href="#tratamentos" className="hover:text-brand-600 transition">Tratamentos</a>
          <a href="#profissionais" className="hover:text-brand-600 transition">Equipe</a>
          <a href="#depoimentos" className="hover:text-brand-600 transition">Depoimentos</a>
          <a href="#unidades" className="hover:text-brand-600 transition">Unidades</a>
        </nav>

        {/* Actions & Portal Access */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            to="/login/paciente"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-slate-700 hover:text-brand-700 hover:bg-slate-50 transition border border-slate-200"
          >
            <User className="w-3.5 h-3.5 text-brand-600" />
            Área do Paciente
          </Link>

          <Link
            to="/login/gestao"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-slate-700 hover:text-brand-700 hover:bg-slate-50 transition border border-slate-200"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            Acesso à Gestão
          </Link>

          <button
            onClick={onOpenEvaluation}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white shadow-md shadow-brand-500/20 hover:shadow-brand-500/35 transition active:scale-95"
          >
            <CalendarCheck className="w-4 h-4" />
            Agendar Avaliação
          </button>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-6 py-5 space-y-4 shadow-xl animate-fadeIn">
          <div className="flex flex-col space-y-3 font-medium text-slate-700 text-sm">
            <a href="#inicio" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-600">Início</a>
            <a href="#sobre" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-600">Sobre</a>
            <a href="#especialidades" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-600">Especialidades</a>
            <a href="#tratamentos" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-600">Tratamentos</a>
            <a href="#profissionais" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-600">Equipe</a>
            <a href="#unidades" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-600">Unidades</a>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenEvaluation();
              }}
              className="w-full text-center py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold shadow-md"
            >
              Agendar Avaliação
            </button>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to="/login/paciente"
                className="text-center py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Área do Paciente
              </Link>
              <Link
                to="/login/gestao"
                className="text-center py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Portal Gestão
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

