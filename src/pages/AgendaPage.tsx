import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Appointment, Professional, Patient } from '../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Filter,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  MapPin,
  CalendarDays
} from 'lucide-react';

export const AgendaPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Views
  const [viewMode, setViewMode] = useState<'dia' | 'semana' | 'mes'>('dia');
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedProfessional, setSelectedProfessional] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState('');

  // Form State
  const [formPatientId, setFormPatientId] = useState('');
  const [formProId, setFormProId] = useState('');
  const [formDate, setFormDate] = useState(currentDate);
  const [formTime, setFormTime] = useState('09:00');
  const [formDuration, setFormDuration] = useState(50);
  const [formServiceType, setFormServiceType] = useState('Fisioterapia Ortopédica');
  const [formProcedure, setFormProcedure] = useState('Cinesioterapia & Eletroterapia');
  const [formRoom, setFormRoom] = useState('Sala 01');
  const [formNotes, setFormNotes] = useState('');

  const fetchAgenda = async () => {
    try {
      setLoading(true);
      const [aptsRes, prosRes, patsRes] = await Promise.all([
        api.get('/api/appointments', {
          params: {
            date: viewMode === 'dia' ? currentDate : undefined,
            professional_id: selectedProfessional || undefined
          }
        }),
        api.get('/api/professionals'),
        api.get('/api/patients', { params: { limit: 100 } })
      ]);

      if (aptsRes.data.success) setAppointments(aptsRes.data.data);
      if (prosRes.data.success) setProfessionals(prosRes.data.data);
      if (patsRes.data.success) setPatients(patsRes.data.data);
    } catch (err) {
      console.error('Erro ao carregar agenda:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgenda();
  }, [currentDate, viewMode, selectedProfessional]);

  const handlePrevDay = () => {
    const d = new Date(currentDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setCurrentDate(new Date().toISOString().split('T')[0]);
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError('');
    setSubmitting(true);

    try {
      const res = await api.post('/api/appointments', {
        patient_id: formPatientId,
        professional_id: formProId,
        date: formDate,
        time: formTime,
        duration_minutes: formDuration,
        service_type: formServiceType,
        procedure: formProcedure,
        room: formRoom,
        notes: formNotes
      });

      if (res.data.success) {
        setModalOpen(false);
        fetchAgenda();
      }
    } catch (err: any) {
      setConflictError(err.response?.data?.message || 'Falha ao agendar. Verifique conflitos de horários.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/api/appointments/${id}/status`, { status: newStatus });
      fetchAgenda();
    } catch (err) {
      console.error('Erro ao mudar status:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'em_atendimento': return 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse';
      case 'realizado': return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'falta': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'cancelado': return 'bg-slate-50 text-slate-400 border-slate-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  // Time slots for Day View (from 07:00 to 20:00)
  const timeSlots = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Agenda Clínica
          </h1>
          <p className="text-xs text-slate-400">
            Controle de horários, atendimento individual e prevenção automática de conflitos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-2xl flex text-xs font-bold text-slate-600">
            {(['dia', 'semana', 'mes'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-xl capitalize transition ${
                  viewMode === mode ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Professional filter */}
          <select
            value={selectedProfessional}
            onChange={(e) => setSelectedProfessional(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-brand-500"
          >
            <option value="">Todos os Profissionais</option>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* New Appointment CTA */}
          <button
            onClick={() => {
              setFormDate(currentDate);
              setConflictError('');
              if (patients.length > 0) setFormPatientId(patients[0].id);
              if (professionals.length > 0) setFormProId(professionals[0].id);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* Date Navigation Bar */}
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
          >
            Hoje
          </button>
          <button
            onClick={handleNextDay}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <span className="text-base font-extrabold text-slate-900 ml-2">
            {new Date(currentDate + 'T00:00:00').toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </span>
        </div>

        <div className="text-xs font-semibold text-slate-500 hidden sm:block">
          {appointments.length} atendimentos registrados para esta visualização
        </div>
      </div>

      {/* DAY VIEW GRID */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Carregando agendamentos...</div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100">
          {timeSlots.map((slot) => {
            const slotApts = appointments.filter((a) => a.time.startsWith(slot.substring(0, 2)));

            return (
              <div key={slot} className="flex flex-col sm:flex-row p-4 hover:bg-slate-50/60 transition gap-4">
                {/* Time Label */}
                <div className="w-20 shrink-0 flex items-center gap-1.5 text-xs font-extrabold text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{slot}</span>
                </div>

                {/* Appointments in slot */}
                <div className="flex-1 space-y-2">
                  {slotApts.length === 0 ? (
                    <div className="text-xs text-slate-300 italic py-1">Horário livre</div>
                  ) : (
                    slotApts.map((apt) => (
                      <div
                        key={apt.id}
                        className="p-3.5 rounded-2xl border border-slate-200/80 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-sm">{apt.patient_name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${getStatusColor(apt.status)}`}>
                              {apt.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {apt.service_type} • <strong className="text-slate-700">{apt.professional_name}</strong>
                          </p>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {apt.room || 'Sala 01'} ({apt.duration_minutes} min)
                          </span>
                        </div>

                        {/* Status Switchers */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {apt.status === 'agendado' && (
                            <button
                              onClick={() => handleStatusChange(apt.id, 'confirmado')}
                              className="px-2.5 py-1 text-[11px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition"
                            >
                              Confirmar
                            </button>
                          )}
                          {apt.status === 'confirmado' && (
                            <button
                              onClick={() => handleStatusChange(apt.id, 'em_atendimento')}
                              className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                            >
                              Iniciar
                            </button>
                          )}
                          {apt.status === 'em_atendimento' && (
                            <button
                              onClick={() => handleStatusChange(apt.id, 'realizado')}
                              className="px-2.5 py-1 text-[11px] font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                            >
                              Finalizar
                            </button>
                          )}
                          {apt.status !== 'cancelado' && (
                            <button
                              onClick={() => handleStatusChange(apt.id, 'cancelado')}
                              className="px-2 py-1 text-[11px] font-bold text-slate-400 hover:text-rose-600 transition"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* NEW APPOINTMENT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
            <div className="bg-gradient-to-r from-petroleum to-brand-700 px-6 py-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Novo Agendamento de Consulta</h3>
                <p className="text-xs text-brand-200">Sistema com validação automática de choque de horário</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              {conflictError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{conflictError}</span>
                </div>
              )}

              {/* Paciente */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Paciente *
                </label>
                <select
                  required
                  value={formPatientId}
                  onChange={(e) => setFormPatientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
                >
                  <option value="">Selecione o paciente cadastrado...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} - CPF: {p.cpf || 'S/ CPF'}</option>
                  ))}
                </select>
              </div>

              {/* Fisioterapeuta */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Fisioterapeuta Responsável *
                </label>
                <select
                  required
                  value={formProId}
                  onChange={(e) => setFormProId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
                >
                  <option value="">Selecione o profissional...</option>
                  {professionals.map((pro) => (
                    <option key={pro.id} value={pro.id}>{pro.name} ({pro.specialty})</option>
                  ))}
                </select>
              </div>

              {/* Data e Hora */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Horário de Início *
                  </label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Tipo e Procedimento */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tipo de Atendimento
                  </label>
                  <select
                    value={formServiceType}
                    onChange={(e) => setFormServiceType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
                  >
                    <option value="Fisioterapia Ortopédica">Fisioterapia Ortopédica</option>
                    <option value="Reabilitação Pós-Cirúrgica">Reabilitação Pós-Cirúrgica</option>
                    <option value="Tratamento de Coluna">Tratamento de Coluna</option>
                    <option value="Pilates Clínico Individual">Pilates Clínico Individual</option>
                    <option value="Fisioterapia Esportiva">Fisioterapia Esportiva</option>
                    <option value="Avaliação Inicial">Avaliação Inicial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Sala / Box
                  </label>
                  <select
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
                  >
                    <option value="Sala 01 - Traumato-Ortopedia">Sala 01 - Traumato</option>
                    <option value="Sala 02 - Pilates Clínico">Sala 02 - Pilates</option>
                    <option value="Sala 03 - Terapia Manual">Sala 03 - Terapia Manual</option>
                    <option value="Box 01 - Eletroterapia">Box 01 - Eletro</option>
                  </select>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Observações
                </label>
                <textarea
                  rows={2}
                  placeholder="Informações relevantes para a sessão..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Agendamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

