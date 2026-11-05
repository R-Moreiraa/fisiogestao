import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  HeartPulse,
  Calendar,
  Layers,
  Clock,
  User,
  Activity,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  TrendingDown,
  Sparkles,
  MapPin,
  CalendarCheck,
  Phone
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Link } from 'react-router-dom';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/api/patient/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Erro ao carregar painel do paciente:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Carregando seus atendimentos...</div>;
  }

  const patient = data?.patient || {};
  const nextAppointment = data?.next_appointment;
  const activeTreatment = data?.active_treatment;
  const evolutions = data?.recent_evolutions || [];
  const pendingAmount = data?.pending_payment_amount || 0;

  // Pain scale evolution chart data
  const painChartData = evolutions
    .slice()
    .reverse()
    .map((e: any, index: number) => ({
      session: `Sessão #${e.session_number || index + 1}`,
      dor_antes: e.pain_before,
      dor_depois: e.pain_after
    }));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Banner - Inspired by Image 2 */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Meu Acompanhamento
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Olá, {user?.name || patient.name || 'Paciente'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Bem-vindo ao seu portal de fisioterapia e reabilitação. Veja abaixo a evolução do seu tratamento.
          </p>
        </div>

        {pendingAmount > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-800 font-semibold">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Há 1 parcela pendente ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pendingAmount)})</span>
            <Link to="/paciente/financeiro" className="underline font-bold text-amber-900">
              Ver
            </Link>
          </div>
        )}
      </div>

      {/* Health Metrics Row - Exactly matching Image 2 ("Weight, Height, Age, Pain") */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Peso Atual</span>
          <p className="text-2xl font-black text-slate-900">{patient.weight || '78 kg'}</p>
          <span className="text-[11px] text-slate-400">Aferido na avaliação</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Altura</span>
          <p className="text-2xl font-black text-slate-900">{patient.height || '1.79 m'}</p>
          <span className="text-[11px] text-slate-400">Estatura</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nível Atual de Dor</span>
          <p className="text-2xl font-black text-amber-600">
            {patient.pain_score !== undefined ? patient.pain_score : 2} <span className="text-xs text-slate-400 font-normal">/ 10</span>
          </p>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> Redução progressiva
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sessões Realizadas</span>
          <p className="text-2xl font-black text-brand-600">
            {activeTreatment ? `${activeTreatment.completed_sessions}/${activeTreatment.total_sessions}` : `${evolutions.length}`}
          </p>
          <span className="text-[11px] text-slate-400">
            {activeTreatment ? `Restam ${activeTreatment.remaining_sessions} sessões` : 'Em dia'}
          </span>
        </div>
      </div>

      {/* Main Grid: Next Appointment + Current Treatment + Pain Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Next Appointment Card - Inspired by Image 2 right column */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Próxima Consulta</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            {nextAppointment ? (
              <div className="space-y-4">
                <div className="p-4 bg-brand-50/70 border border-brand-200/60 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-brand-900">
                      {new Date(nextAppointment.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                    <span className="px-2.5 py-1 bg-white font-black text-brand-700 text-xs rounded-xl shadow-xs">
                      {nextAppointment.time}
                    </span>
                  </div>
                  <p className="text-xs text-brand-800 font-medium">
                    {nextAppointment.service_type}
                  </p>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1594824813583-4318c4c77ea1?w=100"
                      alt={nextAppointment.professional_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Fisioterapeuta Responsável</span>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{nextAppointment.professional_name}</h4>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {nextAppointment.room || 'Sala 02 - Pilates Clínico'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Você não possui consultas futuras agendadas no momento.
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/paciente/agenda"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Ver Todas as Minhas Consultas
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Current Treatment Plan Progress */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tratamento em Andamento</span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                  {activeTreatment?.title || 'Reabilitação Funcional'}
                </h3>
              </div>
              {activeTreatment && (
                <span className="text-xs font-bold px-3 py-1 bg-brand-50 text-brand-700 rounded-full border border-brand-200">
                  {activeTreatment.frequency}
                </span>
              )}
            </div>

            {activeTreatment ? (
              <div className="space-y-3">
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-brand-600 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round((activeTreatment.completed_sessions / activeTreatment.total_sessions) * 100)}%`
                    }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs text-slate-500">
                  <span>Concluídas: <strong className="text-slate-800">{activeTreatment.completed_sessions} sessões</strong></span>
                  <span>Restantes: <strong className="text-brand-700">{activeTreatment.remaining_sessions} sessões</strong></span>
                </div>

                {activeTreatment.therapeutic_goals && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl text-xs text-slate-600 border border-slate-100 leading-relaxed">
                    <strong className="text-slate-800 block mb-0.5">Objetivos Compartilhados pelo seu Fisioterapeuta:</strong>
                    {activeTreatment.therapeutic_goals}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4">Nenhum plano de tratamento ativo registrado.</p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Link
              to="/paciente/tratamentos"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Ver Detalhes do Tratamento & Histórico
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Pain Evolution Chart - Shows reduction in pain across sessions */}
      {painChartData.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Evolução do Alívio da Dor (EVA 0 a 10)</h3>
              <p className="text-xs text-slate-400">Comparação da dor antes e depois de cada sessão realizada</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-amber-600">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span> Dor Antes da Sessão
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Dor Após a Sessão
              </span>
            </div>
          </div>

          <div className="h-56 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={painChartData}>
                <defs>
                  <linearGradient id="painBefore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="painAfter" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="session" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 10]} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }} />
                <Area type="monotone" dataKey="dor_antes" name="Dor Antes" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#painBefore)" />
                <Area type="monotone" dataKey="dor_depois" name="Dor Após" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#painAfter)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

