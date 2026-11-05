import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { WebRequest, Professional } from '../types';
import {
  Inbox,
  Clock,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  CalendarCheck,
  X,
  Loader2,
  ArrowRight,
  Filter,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const WebRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<WebRequest[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Convert to Appointment Modal
  const [convertingRequest, setConvertingRequest] = useState<WebRequest | null>(null);
  const [submittingConvert, setSubmittingConvert] = useState(false);
  const [convertProId, setConvertProId] = useState('');
  const [convertDate, setConvertDate] = useState('');
  const [convertTime, setConvertTime] = useState('14:00');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [reqRes, proRes] = await Promise.all([
        api.get('/api/web-requests', { params: { status: statusFilter || undefined } }),
        api.get('/api/professionals')
      ]);

      if (reqRes.data.success) setRequests(reqRes.data.data);
      if (proRes.data.success) {
        setProfessionals(proRes.data.data);
        if (proRes.data.data.length > 0) setConvertProId(proRes.data.data[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar solicitações web:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/api/web-requests/${id}/status`, { status: newStatus });
      fetchRequests();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingRequest) return;
    setSubmittingConvert(true);

    try {
      const res = await api.post(`/api/web-requests/${convertingRequest.id}/convert-to-appointment`, {
        professional_id: convertProId,
        date: convertDate || convertingRequest.preferred_date,
        time: convertTime
      });

      if (res.data.success) {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
        setConvertingRequest(null);
        fetchRequests();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Falha ao converter agendamento.');
    } finally {
      setSubmittingConvert(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmada':
        return <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">Confirmada & Agendada</span>;
      case 'em_contato':
        return <span className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">Em Contato / Negociação</span>;
      case 'em_analise':
        return <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">Em Análise</span>;
      case 'cancelada':
        return <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full">Cancelada</span>;
      default:
        return <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full animate-pulse">Nova Solicitação</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Solicitações Web & Leads (Landing Page)
          </h1>
          <p className="text-xs text-slate-400">
            Visitantes do site que solicitaram avaliação. Converta em agendamentos oficiais na agenda da clínica.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
        >
          <option value="">Todos os Status</option>
          <option value="nova">Somente Novas</option>
          <option value="em_contato">Em Contato</option>
          <option value="confirmada">Agendadas / Confirmadas</option>
        </select>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Carregando solicitações...</div>
      ) : requests.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80">
          Nenhuma solicitação encontrada com este filtro.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-extrabold text-slate-900">{req.name}</h3>
                    {getStatusBadge(req.status)}
                  </div>
                  <p className="text-xs text-brand-700 font-bold">
                    Interesse em: {req.specialty}
                  </p>
                </div>

                <div className="text-xs text-slate-400">
                  Recebido em: <strong>{new Date(req.created_at).toLocaleDateString('pt-BR')} às {new Date(req.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1 p-3 bg-slate-50 rounded-2xl">
                  <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Dados de Contato</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Phone className="w-3.5 h-3.5 text-brand-600" />
                    <span>{req.phone}</span>
                    <a
                      href={`https://wa.me/55${req.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full hover:underline"
                    >
                      Abrir WhatsApp
                    </a>
                  </div>
                  {req.email && (
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{req.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1 p-3 bg-slate-50 rounded-2xl">
                  <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Preferência Informada</span>
                  <p className="text-slate-700 font-medium">Turno: <strong>{req.preferred_shift}</strong></p>
                  <p className="text-slate-500">Data sugerida: {new Date(req.preferred_date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                </div>

                <div className="space-y-1 p-3 bg-slate-50 rounded-2xl">
                  <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Mensagem / Queixa</span>
                  <p className="text-slate-600 italic line-clamp-2">{req.message || 'Sem mensagem adicional.'}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-semibold">Alterar status:</span>
                  <select
                    value={req.status}
                    onChange={(e) => handleUpdateStatus(req.id, e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="nova">Nova</option>
                    <option value="em_analise">Em Análise</option>
                    <option value="em_contato">Em Contato</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>

                {req.status !== 'confirmada' ? (
                  <button
                    onClick={() => {
                      setConvertingRequest(req);
                      setConvertDate(req.preferred_date);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition active:scale-95"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    Transformar em Agendamento Efetivo
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                    Agendamento Criado no Calendário
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONVERT TO APPOINTMENT MODAL */}
      {convertingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 px-6 py-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Confirmar e Agendar Consulta</h3>
                <p className="text-xs text-emerald-200">Criará o paciente e inserirá na agenda oficial</p>
              </div>
              <button onClick={() => setConvertingRequest(null)} className="p-1 rounded-full text-white/80 hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConvert} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <p><strong>Paciente:</strong> {convertingRequest.name}</p>
                <p><strong>Telefone:</strong> {convertingRequest.phone}</p>
                <p><strong>Especialidade:</strong> {convertingRequest.specialty}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Fisioterapeuta Responsável *
                </label>
                <select
                  required
                  value={convertProId}
                  onChange={(e) => setConvertProId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 font-semibold"
                >
                  {professionals.map((pro) => (
                    <option key={pro.id} value={pro.id}>{pro.name} ({pro.specialty})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Data da Consulta *
                  </label>
                  <input
                    type="date"
                    required
                    value={convertDate}
                    onChange={(e) => setConvertDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Horário *
                  </label>
                  <input
                    type="time"
                    required
                    value={convertTime}
                    onChange={(e) => setConvertTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConvertingRequest(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingConvert}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center gap-2 disabled:opacity-60"
                >
                  {submittingConvert ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar e Inserir na Agenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

