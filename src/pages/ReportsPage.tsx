import React, { useState, useEffect } from 'react';
import { api, API_BASE_URL } from '../services/api';
import { Professional } from '../types';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  XCircle,
  TrendingUp,
  DollarSign,
  Users,
  FileSpreadsheet
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedPro, setSelectedPro] = useState('');

  const fetchReport = async () => {
    try {
      setLoading(true);
      const [repRes, proRes] = await Promise.all([
        api.get('/api/reports/data', {
          params: {
            start_date: startDate,
            end_date: endDate,
            professional_id: selectedPro || undefined
          }
        }),
        api.get('/api/professionals')
      ]);

      if (repRes.data.success) setData(repRes.data);
      if (proRes.data.success) setProfessionals(proRes.data.data);
    } catch (err) {
      console.error('Erro ao buscar relatórios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate, selectedPro]);

  const metrics = data?.metrics || {};
  const appointments = data?.appointments || [];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const handleExportCsv = () => {
    window.open(`${API_BASE_URL}/api/reports/export-csv?start_date=${startDate}&end_date=${endDate}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Relatórios Clínicos & Gerenciais
          </h1>
          <p className="text-xs text-slate-400">
            Exportação de dados consolidados em CSV e relatórios de produtividade.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar CSV
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
          >
            <Printer className="w-4 h-4" />
            Imprimir Relatório
          </button>
        </div>
      </div>

      {/* Filter Box */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-500 uppercase">Período de:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 font-semibold text-slate-700 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-500 uppercase">Até:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 font-semibold text-slate-700 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-500 uppercase">Profissional:</span>
          <select
            value={selectedPro}
            onChange={(e) => setSelectedPro(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 font-semibold text-slate-700 outline-none"
          >
            <option value="">Todos</option>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Atendimentos no Período</span>
          <p className="text-2xl font-black text-slate-900">{metrics.total_appointments || 0}</p>
          <span className="text-[11px] text-emerald-600 font-bold">{metrics.completed || 0} realizados</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Faltas & Cancelamentos</span>
          <p className="text-2xl font-black text-rose-600">{(metrics.absences || 0) + (metrics.cancellations || 0)}</p>
          <span className="text-[11px] text-slate-400">{metrics.absences || 0} faltas • {metrics.cancellations || 0} cancelados</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Receitas no Período</span>
          <p className="text-2xl font-black text-emerald-600">{formatCurrency(metrics.revenue)}</p>
          <span className="text-[11px] text-slate-400">Pendente: {formatCurrency(metrics.pending)}</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resultado Operacional</span>
          <p className="text-2xl font-black text-brand-700">{formatCurrency(metrics.profit)}</p>
          <span className="text-[11px] text-slate-400">Despesas: {formatCurrency(metrics.expenses)}</span>
        </div>
      </div>

      {/* Appointments List for the Period */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm">Detalhamento dos Atendimentos</h3>
          <span className="text-xs text-slate-400">{appointments.length} registros</span>
        </div>

        {appointments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Nenhum atendimento registrado no período selecionado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold bg-slate-50/50">
                  <th className="py-3 px-6 font-semibold">Data</th>
                  <th className="py-3 px-4 font-semibold">Horário</th>
                  <th className="py-3 px-4 font-semibold">Paciente</th>
                  <th className="py-3 px-4 font-semibold">Fisioterapeuta</th>
                  <th className="py-3 px-4 font-semibold">Procedimento</th>
                  <th className="py-3 px-6 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((a: any) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-6 font-bold text-slate-900">
                      {new Date(a.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-semibold">{a.time}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{a.patient_name}</td>
                    <td className="py-3 px-4 text-slate-600">{a.professional_name}</td>
                    <td className="py-3 px-4 text-slate-500">{a.service_type || a.procedure}</td>
                    <td className="py-3 px-6 text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize bg-slate-100 text-slate-700">
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

