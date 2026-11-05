import React from 'react';
import { Activity, Phone, Mail, MapPin, Clock, ShieldCheck, Instagram, Facebook, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Presentation */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight">FISIOPRIME</span>
                <p className="text-[10px] text-brand-300 font-medium">REABILITAÇÃO AVANÇADA</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Centro de excelência em fisioterapia ortopédica, desportiva, coluna e reabilitação pós-operatória. Cuidando da sua saúde com rigor científico e dedicação exclusiva.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <a href="#" className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-brand-600 hover:text-white flex items-center justify-center transition">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-brand-600 hover:text-white flex items-center justify-center transition">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-brand-600 hover:text-white flex items-center justify-center transition">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Especialidades */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Especialidades</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#especialidades" className="hover:text-brand-400 transition">Traumato-Ortopedia</a></li>
              <li><a href="#especialidades" className="hover:text-brand-400 transition">Pós-Operatório de LCA e Próteses</a></li>
              <li><a href="#especialidades" className="hover:text-brand-400 transition">Tratamento de Coluna Vertebral</a></li>
              <li><a href="#especialidades" className="hover:text-brand-400 transition">Fisioterapia Esportiva</a></li>
              <li><a href="#especialidades" className="hover:text-brand-400 transition">Pilates Clínico & Postural</a></li>
              <li><a href="#especialidades" className="hover:text-brand-400 transition">Fisioterapia Vestibular (Labirintite)</a></li>
            </ul>
          </div>

          {/* Col 3: Links Úteis e Acessos */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Acessos Rápidos</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/login/paciente" className="hover:text-brand-400 transition">Área do Paciente (Login)</Link></li>
              <li><Link to="/login/gestao" className="hover:text-brand-400 transition">Portal de Gestão da Clínica</Link></li>
              <li><a href="#sobre" className="hover:text-brand-400 transition">Sobre a Clínica</a></li>
              <li><a href="#profissionais" className="hover:text-brand-400 transition">Nossos Fisioterapeutas</a></li>
              <li><a href="#unidades" className="hover:text-brand-400 transition">Localizações & Unidades</a></li>
              <li><span className="text-xs text-brand-400 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Conformidade LGPD & CREFITO</span></li>
            </ul>
          </div>

          {/* Col 4: Contato & Horários */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Fale Conosco</h4>
            <div className="space-y-2.5 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>Av. Paulista, 1578 - 14º andar, Bela Vista, São Paulo - SP</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>(11) 3289-4000 / (11) 98765-4321</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>contato@fisioprime.com.br</span>
              </div>
              <div className="flex items-start gap-2.5 pt-1">
                <Clock className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>Segunda a Sexta: 07h às 21h<br />Sábados: 08h às 14h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} FisioPrime Sistema SaaS de Gestão de Fisioterapia. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400 transition">Termos de Uso</a>
            <a href="#" className="hover:text-slate-400 transition">Política de Privacidade</a>
            <a href="#" className="hover:text-slate-400 transition">Registro CREFITO/SP</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

