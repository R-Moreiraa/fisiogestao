import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Patient, MedicalRecord } from '../types';
import {
  FileText,
  Search,
  Plus,
  User,
  Activity,
  CheckCircle2,
  Calendar,
  AlertCircle,
  X,
  Loader2,
  Stethoscope,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MedicalRecordsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal New Record
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [anamnesis, setAnamnesis] = useState('');
  const [painScale, setPainScale] = useState(5);
  const [posturalAssessment, setPosturalAssessment] = useState('');
  const [functionalAssessment, setFunctionalAssessment] = useState('');
  const [physioDiagnosis, setPhysioDiagnosis] = useState('');
  const [therapeuticGoals, setTherapeuticGoals] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/patients', { params: { limit: 100 } });
      if (res.data.success && res.data.data.length > 0) {
        setPatients(res.data.data);
        if (!selectedPatientId) {
          setSelectedPatientId(res.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar pacientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async (patientId: string) => {
    try {
      const res = await api.get(`/api/patients/${patientId}/medical-records`);
      if (res.data.success) {
        setRecords(res.data.data);
      }
    } catch (err) {
      console.error('Erro ao carregar prontuários do paciente:', err);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      fetchRecords(selectedPatientId);
    }
  }, [selectedPatientId]);

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    setSubmitting(true);

    try {
      const res = await api.post(`/api/patients/${selectedPatientId}/medical-records`, {
        chief_complaint: chiefComplaint,
        anamnesis,
        pain_scale: painScale,
        postural_assessment: posturalAssessment,
        functional_assessment: functionalAssessment,
        physioDiagnosis,
        physio_diagnosis: physioDiagnosis,
        therapeutic_goals: therapeuticGoals,
        treatment_plan: treatmentPlan
      });

      if (res.data.success) {
        setModalOpen(false);
        // Reset form
        setChiefComplaint('');
        setAnamnesis('');
        setPosturalAssessment('');
        setFunctionalAssessment('');
        setPhysioDiagnosis('');
        setTherapeuticGoals('');
        setTreatmentPlan('');
        fetchRecords(selectedPatientId);
      }
    } catch (err) {
      console.error('Erro ao registrar prontuário:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.cpf && p.cpf.includes(search))
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Prontuário Eletrônico do Fisioterapeuta
          </h1>
          <p className="text-xs text-slate-400">
            Anamnese completa, avaliação postural, biomecânica e metas de reabilitação.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          disabled={!selectedPatientId}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Nova Avaliação Fisioterapêutica
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Patient Selector List */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 outline-none focus:border-brand-500"
            />
          </div>

          <div className="max-h-[600px] overflow-y-auto space-y-1">
            {filteredPatients.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPatientId(p.id)}
                className={`w-full p-3 rounded-2xl text-left transition flex items-center justify-between ${
                  selectedPatientId === p.id
                    ? 'bg-brand-50 border border-brand-200 shadow-xs'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    selectedPatientId === p.id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-slate-900 text-xs truncate">{p.name}</p>
                    <span className="text-[10px] text-slate-400">CPF: {p.cpf || 'S/ CPF'}</span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${selectedPatientId === p.id ? 'text-brand-600' : 'text-slate-300'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Selected Patient Medical Records History */}
        <div className="lg:col-span-8 space-y-6">
          {selectedPatient && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">Prontuário Ativo</span>
                <h2 className="text-lg font-black text-slate-900">{selectedPatient.name}</h2>
                <p className="text-xs text-slate-400">{selectedPatient.insurance || 'Particular'} • Contato: {selectedPatient.phone}</p>
              </div>

              <Link
                to={`/gestao/pacientes/${selectedPatient.id}`}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Ver Ficha Completa
              </Link>
            </div>
          )}

          {records.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-3">
              <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">Nenhuma avaliação inicial registrada</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Clique no botão "Nova Avaliação Fisioterapêutica" acima para iniciar o prontuário deste paciente.
              </p>
            </div>
          ) : (
            records.map((r) => (
              <div key={r.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-400">Diagnóstico Funcional</span>
                    <h3 className="text-base font-extrabold text-slate-900">{r.physio_diagnosis}</h3>
                  </div>
                  <div className="text-right">
                    <span className="inline-block text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      Dor EVA: {r.pain_scale}/10
                    </span>
                    <span className="block text-[11px] text-slate-400 mt-1">
                      {new Date(r.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-2xl">
                    <strong className="text-slate-700 block mb-1">Queixa Principal:</strong>
                    <p className="text-slate-600 leading-relaxed">{r.chief_complaint}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-2xl">
                    <strong className="text-slate-700 block mb-1">Anamnese Clínica:</strong>
                    <p className="text-slate-600 leading-relaxed">{r.anamnesis}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-2xl">
                    <strong className="text-slate-700 block mb-1">Avaliação Postural & Biomecânica:</strong>
                    <p className="text-slate-600 leading-relaxed">{r.postural_assessment}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-2xl">
                    <strong className="text-slate-700 block mb-1">Testes Funcionais & Mobilidade:</strong>
                    <p className="text-slate-600 leading-relaxed">{r.functional_assessment}</p>
                  </div>
                  <div className="p-3.5 bg-brand-50 rounded-2xl md:col-span-2 border border-brand-100">
                    <strong className="text-brand-900 block mb-1">Metas & Plano Terapêutico:</strong>
                    <p className="text-brand-950 leading-relaxed">{r.therapeutic_goals} — {r.treatment_plan}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL: NOVA AVALIAÇÃO FISIOTERAPÊUTICA */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100">
            <div className="bg-gradient-to-r from-petroleum to-brand-700 px-6 py-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Novo Prontuário de Avaliação</h3>
                <p className="text-xs text-brand-200">Paciente: {selectedPatient?.name}</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Diagnóstico Fisioterapêutico / Funcional *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Lombalgia Mecânica Crônica Postural (CID M54.5)"
                  value={physioDiagnosis}
                  onChange={(e) => setPhysioDiagnosis(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="col-span-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Escala de Dor (0 a 10)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={painScale}
                    onChange={(e) => setPainScale(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-base font-black text-amber-600 outline-none focus:border-brand-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Queixa Principal *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dor na região lombar ao permanecer sentado..."
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Anamnese & Histórico Clínico
                </label>
                <textarea
                  rows={2}
                  placeholder="Início dos sintomas, tratamentos prévios, exames de imagem..."
                  value={anamnesis}
                  onChange={(e) => setAnamnesis(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Avaliação Postural
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Hiperlordose, escoliose, assimetria de ombros..."
                    value={posturalAssessment}
                    onChange={(e) => setPosturalAssessment(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Testes Funcionais & Mobilidade
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Lasègue, Schober, amplitude de movimento..."
                    value={functionalAssessment}
                    onChange={(e) => setFunctionalAssessment(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500 resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Objetivos Terapêuticos
                </label>
                <input
                  type="text"
                  placeholder="Ex: Reduzir EVA <= 2, ganho de ADM completa, fortalecimento de core..."
                  value={therapeuticGoals}
                  onChange={(e) => setTherapeuticGoals(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Conduta & Plano de Tratamento
                </label>
                <input
                  type="text"
                  placeholder="Ex: Cinesioterapia motora, eletroterapia analgésica, pilates clínico..."
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500"
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
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar no Prontuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

