import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  Calendar,
  Activity,
  DollarSign,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  UserPlus,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
  Inbox,
  Stethoscope,
  Building2,
  CalendarCheck
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { Link } from 'react-router-dom';

export const GestaoDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/api/dashboard/summary');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Erro ao carregar resumo do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleUpdateAppointmentStatus = async (id: string, newStatus: string) => {
    setStatusUpdatingId(id);
    try {
      await api.patch(`/api/appointments/${id}/status`, { status: newStatus });
      await fetchSummary();
    } catch (err) {
      console.error('Erro ao atualizar status do agendamento:', err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200/60 rounded-3xl w-full"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200/60 rounded-3xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-200/60 rounded-3xl"></div>
          <div className="h-80 bg-slate-200/60 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const todaySchedule = data?.today_schedule || [];
  const monthlyChart = data?.monthly_chart || [];
  const treatmentDistribution = data?.treatment_distribution || [];
  const recentPatients = data?.recent_patients || [];
  const pendingWebRequests = data?.pending_web_requests || [];
  const professionals = data?.professionals || [];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmado':
        return <span className="text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">Confirmado</span>;
      case 'em_atendimento':
        return <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full animate-pulse">Em Atendimento</span>;
      case 'realizado':
        return <span className="text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">Realizado</span>;
      case 'falta':
        return <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">Falta</span>;
      case 'cancelado':
        return <span className="text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full">Cancelado</span>;
      default:
        return <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">Agendado</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* WELCOME BANNER - Inspired by Image 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Painel de Controle
            </span>
            <span className="text-xs text-slate-400">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Olá, {user?.name || 'Dr. Roberto Sullivan'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Aqui está o panorama operacional e clínico do seu consultório hoje.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/gestao/agenda"
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition"
          >
            <CalendarCheck className="w-4 h-4" />
            Novo Agendamento
          </Link>
          <Link
            to="/gestao/pacientes"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            <UserPlus className="w-4 h-4" />
            Novo Paciente
          </Link>
        </div>
      </div>

      {/* WEB REQUEST ALERT BANNER (If there are pending requests from Landing page) */}
      {pendingWebRequests.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 sm:p-5 rounded-3xl shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Inbox className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base">
                {pendingWebRequests.length} Nova solicitação de agendamento vinda da Landing Page!
              </h4>
              <p className="text-xs text-white/90">
                Lead: <strong>{pendingWebRequests[0].name}</strong> ({pendingWebRequests[0].specialty}) - Preferência: {pendingWebRequests[0].preferred_shift}
              </p>
            </div>
          </div>
          <Link
            to="/gestao/solicitacoes"
            className="px-4 py-2 bg-white text-amber-700 hover:bg-amber-50 rounded-xl text-xs font-bold shrink-0 transition shadow-xs"
          >
            Revisar e Agendar
          </Link>
        </div>
      )}

      {/* KPI STAT CARDS - Exactly like Image 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Pacientes */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total de Pacientes</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {kpis.total_patients}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {kpis.patients_in_treatment} pacientes em tratamento contínuo
          </p>
        </div>

        {/* Consultas de Hoje */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Consultas de Hoje</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {kpis.today_appointments}
            </span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {todaySchedule.filter((a: any) => a.status === 'realizado').length} finalizadas
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Taxa de comparecimento: <strong className="text-slate-700">{kpis.attendance_rate}%</strong>
          </p>
        </div>

        {/* Faturamento Mensal */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Faturamento (Mês)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight truncate">
              {formatCurrency(kpis.monthly_revenue || 18000)}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Recebido
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Lucro operacional estimado: <strong className="text-emerald-700">{formatCurrency(kpis.estimated_profit || 12500)}</strong>
          </p>
        </div>

        {/* Valores Pendentes */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Valores a Receber</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight truncate text-amber-700">
              {formatCurrency(kpis.pending_receivables)}
            </span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              Pendente
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Parcelas e sessões a faturar
          </p>
        </div>
      </div>

      {/* CHARTS ROW - Inspired by Image 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Chart: Financial Evolution (AreaChart) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Evolução Financeira</h3>
              <p className="text-xs text-slate-400">Faturamento vs Despesas Operacionais (últimos 6 meses)</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-full bg-brand-600"></span> Faturamento
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-full bg-rose-400"></span> Despesas
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyChart}>
                <defs>
                  <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(val) => `R$${val/1000}k`} />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value)), '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Area type="monotone" dataKey="faturamento" name="Faturamento" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#colorFaturamento)" />
                <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorDespesas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Treatment Distribution Donut Chart */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">Distribuição por Área</h3>
            <p className="text-xs text-slate-400">Tipos de tratamentos mais demandados</p>
          </div>

          <div className="h-56 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={treatmentDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {treatmentDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val}%`, 'Participação']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900">100%</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Especialidades</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {treatmentDistribution.map((t: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600 font-medium truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }}></span>
                  <span className="truncate">{t.name}</span>
                </span>
                <span className="font-bold text-slate-900">{t.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TODAY'S APPOINTMENTS & SPECIALISTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Today's schedule table */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Agenda do Dia</h3>
              <p className="text-xs text-slate-400">Próximos atendimentos fisioterapêuticos programados para hoje</p>
            </div>
            <Link
              to="/gestao/agenda"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Abrir Calendário Completo
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {todaySchedule.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Nenhum atendimento agendado para o dia de hoje.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                    <th className="pb-3 font-semibold">Horário</th>
                    <th className="pb-3 font-semibold">Paciente</th>
                    <th className="pb-3 font-semibold">Fisioterapeuta</th>
                    <th className="pb-3 font-semibold">Procedimento / Sala</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Ação Rápida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todaySchedule.map((apt: any) => (
                    <tr key={apt.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 font-bold text-slate-900">
                        {apt.time}
                        <span className="block text-[10px] text-slate-400 font-normal">50 min</span>
                      </td>
                      <td className="py-3.5 font-semibold text-slate-800">
                        <Link to={`/gestao/pacientes/${apt.patient_id}`} className="hover:text-brand-600 hover:underline">
                          {apt.patient_name}
                        </Link>
                      </td>
                      <td className="py-3.5 text-slate-600">{apt.professional_name}</td>
                      <td className="py-3.5 text-slate-500">
                        <span className="font-medium text-slate-700 block">{apt.service_type}</span>
                        <span className="text-[10px] text-slate-400">{apt.room || 'Sala 01'}</span>
                      </td>
                      <td className="py-3.5">{getStatusBadge(apt.status)}</td>
                      <td className="py-3.5 text-right space-x-1">
                        {apt.status === 'agendado' && (
                          <button
                            onClick={() => handleUpdateAppointmentStatus(apt.id, 'confirmado')}
                            className="px-2.5 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold rounded-lg text-[10px] transition"
                            title="Confirmar Presença"
                          >
                            Confirmar
                          </button>
                        )}
                        {apt.status === 'confirmado' && (
                          <button
                            onClick={() => handleUpdateAppointmentStatus(apt.id, 'em_atendimento')}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg text-[10px] transition"
                            title="Iniciar Atendimento"
                          >
                            Iniciar
                          </button>
                        )}
                        {apt.status === 'em_atendimento' && (
                          <button
                            onClick={() => handleUpdateAppointmentStatus(apt.id, 'realizado')}
                            className="px-2.5 py-1 bg-slate-800 text-white hover:bg-slate-900 font-bold rounded-lg text-[10px] transition"
                            title="Finalizar Atendimento"
                          >
                            Finalizar
                          </button>
                        )}
                        {apt.status !== 'realizado' && apt.status !== 'cancelado' && (
                          <button
                            onClick={() => handleUpdateAppointmentStatus(apt.id, 'falta')}
                            className="px-2 py-1 text-rose-600 hover:bg-rose-50 font-bold rounded-lg text-[10px] transition"
                            title="Registrar Falta"
                          >
                            Falta
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Our Specialists / Equipe - Matching Image 3 right card */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-lg">Corpo Clínico</h3>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
              {professionals.length} Ativos
            </span>
          </div>

          <div className="space-y-3">
            {professionals.map((pro: any) => (
              <div key={pro.id} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                    <img
                      src={pro.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120'}
                      alt={pro.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{pro.name}</h4>
                    <p className="text-[11px] text-brand-600 font-medium">{pro.specialty}</p>
                    <span className="text-[10px] text-slate-400 font-semibold">{pro.crefito}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Disponível
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              to="/gestao/profissionais"
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              Gerenciar Profissionais & Escalas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

