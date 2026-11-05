import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Appointment } from '../../types';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  CalendarDays
} from 'lucide-react';

export const PatientAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Reschedule Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [requestType, setRequestType] = useState<'reagendamento' | 'cancelamento'>('reagendamento');
  const [reason, setReason] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/patient/appointments');
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error('Erro ao carregar consultas do paciente:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleOpenModal = (apt: Appointment, type: 'reagendamento' | 'cancelamento') => {
    setSelectedApt(apt);
    setRequestType(type);
    setReason('');
    setPreferredDate('');
    setFeedback('');
    setModalOpen(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApt) return;
    setSubmitting(true);

    try {
      const res = await api.post('/api/patient/request-reschedule', {
        appointment_id: selectedApt.id,
        request_type: requestType,
        reason,
        preferred_date: preferredDate
      });

      if (res.data.success) {
        setFeedback(res.data.message);
        setTimeout(() => {
          setModalOpen(false);
          fetchAppointments();
        }, 2000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Falha ao enviar solicitação.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmado':
        return <span className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">Confirmado</span>;
      case 'em_atendimento':
        return <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full animate-pulse">Em Atendimento</span>;
      case 'realizado':
        return <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">Realizado</span>;
      case 'falta':
        return <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">Falta Registrada</span>;
      case 'cancelado':
        return <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full">Cancelado</span>;
      default:
        return <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">Agendado</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Minha Agenda & Consultas
        </h1>
        <p className="text-xs text-slate-400">
          Consulte suas próximas sessões, histórico de atendimentos e solicite alterações de horário.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Carregando seus agendamentos...</div>
      ) : appointments.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80">
          Você não possui nenhum agendamento registrado.
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      {new Date(apt.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </h3>
                    <p className="text-xs text-slate-400">Horário: <strong className="text-slate-800">{apt.time}</strong> ({apt.duration_minutes} min)</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(apt.status)}
                  {apt.reschedule_pending && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      Alteração em análise
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Procedimento:</span>
                  <p className="font-bold text-slate-800">{apt.service_type}</p>
                </div>
                <div>
                  <span className="text-slate-400">Fisioterapeuta:</span>
                  <p className="font-bold text-slate-800">{apt.professional_name}</p>
                </div>
              </div>

              {/* Action buttons (only for upcoming appointments) */}
              {['agendado', 'confirmado'].includes(apt.status) && !apt.reschedule_pending && (
                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenModal(apt, 'reagendamento')}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                  >
                    Solicitar Reagendamento
                  </button>
                  <button
                    onClick={() => handleOpenModal(apt, 'cancelamento')}
                    className="px-3.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition"
                  >
                    Cancelar Consulta
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* RESCHEDULE / CANCEL MODAL */}
      {modalOpen && selectedApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
            <div className="bg-gradient-to-r from-petroleum to-brand-700 px-6 py-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {requestType === 'reagendamento' ? 'Solicitar Reagendamento' : 'Solicitar Cancelamento'}
                </h3>
                <p className="text-xs text-brand-200">
                  Consulta: {new Date(selectedApt.date + 'T00:00:00').toLocaleDateString('pt-BR')} às {selectedApt.time}
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-full text-white/80 hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedback ? (
              <div className="p-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-slate-800">{feedback}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest} className="p-6 space-y-4 text-xs">
                {requestType === 'reagendamento' && (
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Data de preferência para o novo horário:
                    </label>
                    <input
                      type="date"
                      required
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Motivo da solicitação *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Informe o motivo da alteração de data/horário..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500 resize-none"
                  />
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  * Sua solicitação será encaminhada para a recepção da clínica, que validará a disponibilidade com o fisioterapeuta.
                </p>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition flex items-center gap-2 disabled:opacity-60"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar Solicitação'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

