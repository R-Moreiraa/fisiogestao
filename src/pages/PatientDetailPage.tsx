import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Patient,
  MedicalRecord,
  ClinicalEvolution,
  TreatmentPlan,
  Appointment,
  Transaction
} from '../types';
import {
  User,
  FileText,
  Activity,
  Layers,
  Calendar,
  DollarSign,
  ChevronLeft,
  Plus,
  Clock,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Receipt,
  Loader2,
  X
} from 'lucide-react';

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dados' | 'prontuario' | 'evolucoes' | 'tratamentos' | 'financeiro'>('prontuario');

  // Modal State for New Evolution
  const [evolutionModalOpen, setEvolutionModalOpen] = useState(false);
  const [submittingEvo, setSubmittingEvo] = useState(false);
  const [painBefore, setPainBefore] = useState(4);
  const [painAfter, setPainAfter] = useState(1);
  const [procedures, setProcedures] = useState('');
  const [conduct, setConduct] = useState('');
  const [patientResponse, setPatientResponse] = useState('');
  const [nextRec, setNextRec] = useState('');

  const fetchPatientDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/patients/${id}`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Erro ao buscar dados do paciente:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientDetail();
  }, [id]);

  const handleAddEvolution = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingEvo(true);
    try {
      const activePlan = data?.treatment_plans?.find((t: any) => t.status === 'em_andamento');
      await api.post(`/api/patients/${id}/evolutions`, {
        treatment_plan_id: activePlan?.id || null,
        session_date: new Date().toISOString().split('T')[0],
        pain_before: painBefore,
        pain_after: painAfter,
        procedures,
        conduct,
        patient_response: patientResponse,
        next_recommendations: nextRec,
        shared_with_patient: true
      });
      setEvolutionModalOpen(false);
      // Reset
      setProcedures('');
      setConduct('');
      setPatientResponse('');
      setNextRec('');
      fetchPatientDetail();
    } catch (err) {
      console.error('Erro ao adicionar evolução:', err);
    } finally {
      setSubmittingEvo(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Carregando ficha do paciente...</div>;
  }

  const patient: Patient = data?.patient;
  const medicalRecords: MedicalRecord[] = data?.medical_records || [];
  const evolutions: ClinicalEvolution[] = data?.clinical_evolutions || [];
  const treatments: TreatmentPlan[] = data?.treatment_plans || [];
  const appointments: Appointment[] = data?.appointments || [];
  const transactions: Transaction[] = data?.transactions || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/gestao/pacientes"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Lista de Pacientes
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setEvolutionModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            Nova Evolução de Sessão
          </button>
        </div>
      </div>

      {/* Patient Profile Summary Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-brand-500/20">
            {patient.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {patient.name}
              </h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                {patient.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span>CPF: <strong className="text-slate-700">{patient.cpf || 'Não informado'}</strong></span>
              <span>•</span>
              <span>Telefone: <strong className="text-slate-700">{patient.phone}</strong></span>
              <span>•</span>
              <span>Convênio: <strong className="text-slate-700">{patient.insurance || 'Particular'}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Health Stats */}
        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Escala de Dor</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-amber-600">{patient.pain_score || 0}</span>
              <span className="text-xs text-slate-400">/ 10</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sessões Concluídas</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-brand-600">{evolutions.length}</span>
              <span className="text-xs text-slate-400">sessões</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tratamentos</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-slate-800">{treatments.length}</span>
              <span className="text-xs text-slate-400">planos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 overflow-x-auto pb-1">
        {[
          { key: 'prontuario', label: 'Prontuário de Avaliação', icon: FileText },
          { key: 'evolucoes', label: `Evoluções (${evolutions.length})`, icon: Activity },
          { key: 'tratamentos', label: `Tratamentos & Sessões (${treatments.length})`, icon: Layers },
          { key: 'financeiro', label: `Financeiro (${transactions.length})`, icon: DollarSign },
          { key: 'dados', label: 'Dados Pessoais & Contato', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-brand-600 text-brand-700 bg-white/50 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: PRONTUÁRIO */}
      {activeTab === 'prontuario' && (
        <div className="space-y-6">
          {medicalRecords.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 text-center space-y-3">
              <p className="text-slate-500 text-sm">Nenhuma avaliação inicial cadastrada ainda para este paciente.</p>
              <p className="text-xs text-slate-400">Acesse o módulo de Prontuários para cadastrar a anamnese física completa.</p>
            </div>
          ) : (
            medicalRecords.map((mr) => (
              <div key={mr.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full uppercase">
                      Avaliação Fisioterapêutica Inicial
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-1">
                      {mr.physio_diagnosis}
                    </h3>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <p>Avaliado por: <strong>{mr.professional_name}</strong></p>
                    <span>{new Date(mr.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <span className="font-bold text-slate-700 uppercase block mb-1">Queixa Principal</span>
                      <p className="text-slate-600 leading-relaxed">{mr.chief_complaint}</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <span className="font-bold text-slate-700 uppercase block mb-1">Anamnese Detalhada</span>
                      <p className="text-slate-600 leading-relaxed">{mr.anamnesis}</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <span className="font-bold text-slate-700 uppercase block mb-1">Avaliação Postural</span>
                      <p className="text-slate-600 leading-relaxed">{mr.postural_assessment}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <span className="font-bold text-slate-700 uppercase block mb-1">Testes Funcionais & Mobilidade</span>
                      <p className="text-slate-600 leading-relaxed">{mr.functional_assessment}</p>
                    </div>

                    <div className="p-4 bg-brand-50/70 border border-brand-200/60 rounded-2xl">
                      <span className="font-bold text-brand-800 uppercase block mb-1">Objetivos Terapêuticos</span>
                      <p className="text-brand-900 leading-relaxed">{mr.therapeutic_goals}</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <span className="font-bold text-slate-700 uppercase block mb-1">Plano de Tratamento Proposto</span>
                      <p className="text-slate-600 leading-relaxed">{mr.treatment_plan}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: EVOLUÇÕES CLÍNICAS */}
      {activeTab === 'evolucoes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Histórico Cronológico de Sessões Realizadas</h3>
            <button
              onClick={() => setEvolutionModalOpen(true)}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Registrar Sessão
            </button>
          </div>

          {evolutions.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 text-center text-slate-400">
              Nenhuma evolução clínica registrada até o momento.
            </div>
          ) : (
            <div className="space-y-3">
              {evolutions.map((evo) => (
                <div key={evo.id} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-brand-600 text-white font-extrabold text-xs flex items-center justify-center">
                        #{evo.session_number}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        Sessão de Fisioterapia ({new Date(evo.session_date + 'T00:00:00').toLocaleDateString('pt-BR')})
                      </span>
                    </div>

                    {/* Pain comparison pill */}
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-500">
                        Dor antes: <strong className="text-amber-600">{evo.pain_before}</strong> → Dor após: <strong className="text-emerald-600">{evo.pain_after}</strong>
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600 font-medium">{evo.professional_name}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <strong className="text-slate-700 block mb-0.5">Procedimentos Realizados:</strong>
                      <p className="text-slate-600 leading-relaxed">{evo.procedures}</p>
                    </div>
                    <div>
                      <strong className="text-slate-700 block mb-0.5">Condutas & Resposta do Paciente:</strong>
                      <p className="text-slate-600 leading-relaxed">{evo.conduct} {evo.patient_response}</p>
                    </div>
                  </div>

                  {evo.next_recommendations && (
                    <div className="p-3 bg-brand-50 rounded-2xl text-xs text-brand-900 border border-brand-100">
                      <strong>Recomendações para casa:</strong> {evo.next_recommendations}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: TRATAMENTOS */}
      {activeTab === 'tratamentos' && (
        <div className="space-y-4">
          {treatments.map((t) => (
            <div key={t.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    t.status === 'concluido' ? 'bg-emerald-50 text-emerald-700' : 'bg-brand-50 text-brand-700'
                  }`}>
                    {t.status === 'concluido' ? 'Tratamento Concluído' : 'Em Andamento'}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">{t.title}</h3>
                  <p className="text-xs text-slate-400">{t.diagnosis} • Responsável: {t.professional_name}</p>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900">
                    {t.completed_sessions} / {t.total_sessions}
                  </span>
                  <span className="block text-[11px] text-slate-400 font-medium">Sessões Realizadas</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-brand-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((t.completed_sessions / t.total_sessions) * 100)}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500">Restam <strong>{t.remaining_sessions}</strong> sessões contratadas</span>
                <span className="text-brand-600 font-bold">{Math.round((t.completed_sessions / t.total_sessions) * 100)}% concluído</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: FINANCEIRO */}
      {activeTab === 'financeiro' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Histórico de Pagamentos & Recibos</h3>
          {transactions.length === 0 ? (
            <p className="text-xs text-slate-400">Nenhum lançamento financeiro para este paciente.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                    <th className="pb-3 font-semibold">Descrição</th>
                    <th className="pb-3 font-semibold">Valor</th>
                    <th className="pb-3 font-semibold">Forma</th>
                    <th className="pb-3 font-semibold">Recibo</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 font-semibold text-slate-800">{tx.description}</td>
                      <td className="py-3 font-bold text-slate-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)}
                      </td>
                      <td className="py-3 text-slate-600">{tx.payment_method}</td>
                      <td className="py-3 text-brand-600 font-mono text-[11px]">{tx.receipt_number || '-'}</td>
                      <td className="py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          tx.status === 'pago' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: DADOS PESSOAIS */}
      {activeTab === 'dados' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Informações Cadastrais Completas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl">
              <span className="text-slate-400 block mb-0.5 font-medium">Nome Completo:</span>
              <strong className="text-slate-800">{patient.name}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl">
              <span className="text-slate-400 block mb-0.5 font-medium">CPF:</span>
              <strong className="text-slate-800">{patient.cpf || 'Não informado'}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl">
              <span className="text-slate-400 block mb-0.5 font-medium">Telefone / WhatsApp:</span>
              <strong className="text-slate-800">{patient.phone}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl">
              <span className="text-slate-400 block mb-0.5 font-medium">E-mail:</span>
              <strong className="text-slate-800">{patient.email || 'Não informado'}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl sm:col-span-2">
              <span className="text-slate-400 block mb-0.5 font-medium">Endereço:</span>
              <strong className="text-slate-800">{patient.address || 'Não cadastrado'}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl sm:col-span-2">
              <span className="text-slate-400 block mb-0.5 font-medium">Contato de Emergência:</span>
              <strong className="text-slate-800">{patient.emergency_contact || 'Não cadastrado'}</strong>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVA EVOLUÇÃO DE SESSÃO */}
      {evolutionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100">
            <div className="bg-gradient-to-r from-petroleum to-brand-700 px-6 py-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Registrar Evolução Clínica</h3>
                <p className="text-xs text-brand-200">Paciente: {patient.name}</p>
              </div>
              <button
                onClick={() => setEvolutionModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvolution} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto text-xs">
              {/* Pain Before / After */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Dor Antes da Sessão (0 a 10)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={painBefore}
                    onChange={(e) => setPainBefore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-amber-600 outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Dor ao Final da Sessão (0 a 10)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={painAfter}
                    onChange={(e) => setPainAfter(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-emerald-600 outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Procedimentos Realizados *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ex: Terapia manual lombo-pélvica, tração oscilatória, liberação de quadrado lombar..."
                  value={procedures}
                  onChange={(e) => setProcedures(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Condutas Fisioterapêuticas & Exercícios *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ex: Fortalecimento de core no Reformer, exercícios de ponte unipodal..."
                  value={conduct}
                  onChange={(e) => setConduct(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Resposta do Paciente
                </label>
                <input
                  type="text"
                  placeholder="Ex: Boa tolerância à carga, relatou alívio imediato da tensão muscular..."
                  value={patientResponse}
                  onChange={(e) => setPatientResponse(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Recomendações e Orientações Domiciliares
                </label>
                <input
                  type="text"
                  placeholder="Ex: Manter pausas ativas a cada 50min, realizar série de alongamento..."
                  value={nextRec}
                  onChange={(e) => setNextRec(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEvolutionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingEvo}
                  className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition flex items-center gap-2 disabled:opacity-60"
                >
                  {submittingEvo ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Evolução'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

