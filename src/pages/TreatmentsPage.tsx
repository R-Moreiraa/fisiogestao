import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TreatmentPlan, Patient, Professional } from '../types';
import {
  Layers,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Check,
  ChevronRight,
  AlertCircle,
  X,
  Loader2,
  TrendingDown
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TreatmentsPage: React.FC = () => {
  const [treatments, setTreatments] = useState<TreatmentPlan[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Deduction Action State
  const [deductingId, setDeductingId] = useState<string | null>(null);
  const [deductionFeedback, setDeductionFeedback] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formPatientId, setFormPatientId] = useState('');
  const [formProId, setFormProId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDiagnosis, setFormDiagnosis] = useState('');
  const [formTotalSessions, setFormTotalSessions] = useState(10);
  const [formFrequency, setFormFrequency] = useState('2 vezes por semana');
  const [formPrice, setFormPrice] = useState(1800);
  const [formGoals, setFormGoals] = useState('');

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      const [treatRes, patRes, proRes] = await Promise.all([
        api.get('/api/treatments', { params: { status: statusFilter || undefined } }),
        api.get('/api/patients', { params: { limit: 100 } }),
        api.get('/api/professionals')
      ]);

      if (treatRes.data.success) setTreatments(treatRes.data.data);
      if (patRes.data.success) setPatients(patRes.data.data);
      if (proRes.data.success) setProfessionals(proRes.data.data);
    } catch (err) {
      console.error('Erro ao carregar tratamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreatments();
  }, [statusFilter]);

  const handleDeductSession = async (treatmentId: string) => {
    setDeductingId(treatmentId);
    setDeductionFeedback(null);

    try {
      const res = await api.post(`/api/treatments/${treatmentId}/deduct-session`);
      if (res.data.success) {
        setDeductionFeedback(res.data.message);
        const updated = res.data.data;
        if (updated.remaining_sessions === 0) {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 }
          });
        }
        await fetchTreatments();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Falha ao baixar sessão.');
    } finally {
      setDeductingId(null);
    }
  };

  const handleCreateTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await api.post('/api/treatments', {
        patient_id: formPatientId,
        professional_id: formProId,
        title: formTitle,
        diagnosis: formDiagnosis,
        total_sessions: Number(formTotalSessions),
        frequency: formFrequency,
        price: Number(formPrice),
        therapeutic_goals: formGoals
      });

      if (res.data.success) {
        setModalOpen(false);
        setFormTitle('');
        setFormDiagnosis('');
        setFormGoals('');
        fetchTreatments();
      }
    } catch (err) {
      console.error('Erro ao criar tratamento:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTreatments = treatments.filter((t) =>
    t.patient_name.toLowerCase().includes(search.toLowerCase()) ||
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Planos de Tratamento & Sessões
          </h1>
          <p className="text-xs text-slate-400">
            Controle de pacotes contratados, contagem atômica de sessões e baixa segura.
          </p>
        </div>

        <button
          onClick={() => {
            if (patients.length > 0) setFormPatientId(patients[0].id);
            if (professionals.length > 0) setFormProId(professionals[0].id);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          Novo Plano de Tratamento
        </button>
      </div>

      {deductionFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{deductionFeedback}</span>
          </div>
          <button onClick={() => setDeductionFeedback(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Pesquisar por paciente ou plano de tratamento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white rounded-xl border border-slate-200 outline-none focus:border-brand-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
        >
          <option value="">Todos os Status</option>
          <option value="em_andamento">Em Andamento</option>
          <option value="concluido">Concluídos</option>
          <option value="suspenso">Suspensos</option>
        </select>
      </div>

      {/* Treatments Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Carregando tratamentos...</div>
      ) : filteredTreatments.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80">
          Nenhum plano de tratamento encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTreatments.map((t) => {
            const percentage = Math.round((t.completed_sessions / t.total_sessions) * 100);
            const isCompleted = t.status === 'concluido' || t.remaining_sessions === 0;

            return (
              <div
                key={t.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-brand-50 text-brand-700 border border-brand-200'
                    }`}>
                      {isCompleted ? 'Tratamento Concluído' : 'Em Andamento'}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {t.frequency}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{t.title}</h3>
                    <p className="text-xs text-brand-700 font-bold mt-0.5">{t.patient_name}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{t.diagnosis || 'Reabilitação Funcional'} • {t.professional_name}</p>
                  </div>

                  {t.therapeutic_goals && (
                    <div className="p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-600 leading-relaxed border border-slate-100">
                      <strong>Metas:</strong> {t.therapeutic_goals}
                    </div>
                  )}
                </div>

                {/* Progress bar and counter */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-500 font-medium">Progresso das Sessões</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {t.completed_sessions} <span className="text-xs text-slate-400 font-normal">/ {t.total_sessions} sessões</span>
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-brand-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400 font-medium">
                      {t.remaining_sessions > 0 ? (
                        <>Restam <strong className="text-slate-700">{t.remaining_sessions}</strong> sessões</>
                      ) : (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 100% Finalizado
                        </span>
                      )}
                    </span>
                    <span className="font-bold text-slate-700">{percentage}%</span>
                  </div>

                  {/* Controlled Baixa de Sessão Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleDeductSession(t.id)}
                      disabled={isCompleted || deductingId === t.id}
                      className="w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200"
                    >
                      {deductingId === t.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Registrando baixa...
                        </>
                      ) : isCompleted ? (
                        'Pacote Finalizado'
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Baixar Sessão Realizada (Deduzir 1)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* NEW TREATMENT PLAN MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
            <div className="bg-gradient-to-r from-petroleum to-brand-700 px-6 py-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Criar Plano de Tratamento</h3>
                <p className="text-xs text-brand-200">Defina o pacote de sessões e metas</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTreatment} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Paciente *
                </label>
                <select
                  required
                  value={formPatientId}
                  onChange={(e) => setFormPatientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
                >
                  <option value="">Selecione o paciente...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} - CPF: {p.cpf || 'S/ CPF'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
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

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Título do Plano *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Reabilitação Joelho Pós-LCA (10 Sessões)"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Diagnóstico / Lesão
                </label>
                <input
                  type="text"
                  placeholder="Ex: Lesão parcial de ligamento cruzado anterior (CID M23.6)"
                  value={formDiagnosis}
                  onChange={(e) => setFormDiagnosis(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Quantidade de Sessões Contratadas *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formTotalSessions}
                    onChange={(e) => setFormTotalSessions(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-brand-700 outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Frequência Semanal
                  </label>
                  <select
                    value={formFrequency}
                    onChange={(e) => setFormFrequency(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500"
                  >
                    <option value="1 vez por semana">1 vez por semana</option>
                    <option value="2 vezes por semana">2 vezes por semana</option>
                    <option value="3 vezes por semana">3 vezes por semana</option>
                    <option value="Diário (Seg a Sex)">Diário (Seg a Sex)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Valor Total do Pacote (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Metas Terapêuticas Compartilhadas
                </label>
                <textarea
                  rows={2}
                  placeholder="Objetivos a atingir ao final das sessões contratadas..."
                  value={formGoals}
                  onChange={(e) => setFormGoals(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition flex items-center gap-2 disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar Plano de Tratamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

