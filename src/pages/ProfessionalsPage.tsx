import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Professional } from '../types';
import {
  UserCheck,
  Plus,
  Phone,
  Mail,
  Award,
  Calendar,
  Activity,
  CheckCircle2,
  Clock,
  X,
  Loader2
} from 'lucide-react';

export const ProfessionalsPage: React.FC = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [crefito, setCrefito] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [availableHours, setAvailableHours] = useState('Seg-Sex: 08:00 - 18:00');

  const fetchPros = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/professionals');
      if (res.data.success) {
        setProfessionals(res.data.data);
      }
    } catch (err) {
      console.error('Erro ao carregar profissionais:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPros();
  }, []);

  const handleCreatePro = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await api.post('/api/professionals', {
        name,
        crefito,
        specialty,
        phone,
        email,
        bio,
        available_hours: availableHours
      });

      if (res.data.success) {
        setModalOpen(false);
        setName('');
        setCrefito('');
        setSpecialty('');
        setPhone('');
        setEmail('');
        setBio('');
        fetchPros();
      }
    } catch (err) {
      console.error('Erro ao cadastrar profissional:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Corpo Clínico & Fisioterapeutas
          </h1>
          <p className="text-xs text-slate-400">
            Registro no CREFITO, produtividade clínica, especialidades e escalas de atendimento.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Profissional
        </button>
      </div>

      {/* Grid of Professionals */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Carregando profissionais...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professionals.map((pro) => (
            <div
              key={pro.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80">
                    <img
                      src={pro.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200'}
                      alt={pro.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">{pro.name}</h3>
                    <p className="text-xs text-brand-700 font-bold mt-0.5">{pro.specialty}</p>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-1">
                      {pro.crefito}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{pro.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{pro.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{pro.available_hours || 'Segunda a Sexta'}</span>
                  </div>
                </div>

                {pro.bio && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl leading-relaxed">
                    {pro.bio}
                  </p>
                )}
              </div>

              {/* Productivity KPIs */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-center">
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-xs font-black text-slate-900 block">{pro.completed_appointments || 0}</span>
                  <span className="text-[10px] text-slate-400">Atendimentos</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-xs font-black text-brand-700 block">{pro.active_treatment_plans || 0}</span>
                  <span className="text-[10px] text-slate-400">Planos Ativos</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NEW PROFESSIONAL MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
            <div className="bg-gradient-to-r from-petroleum to-brand-700 px-6 py-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Cadastrar Fisioterapeuta</h3>
                <p className="text-xs text-brand-200">Preencha os dados e credenciamento no CREFITO</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-full hover:bg-white/10 text-white/80">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePro} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dra. Mariana Vasconcelos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Registro CREFITO *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 123456-F/SP"
                    value={crefito}
                    onChange={(e) => setCrefito(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Especialidade Principal *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Coluna & Pilates"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 98765-4321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    E-mail de Acesso *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="fisio@clinica.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Horários de Atendimento
                </label>
                <input
                  type="text"
                  placeholder="Ex: Seg-Sex: 08:00 - 18:00"
                  value={availableHours}
                  onChange={(e) => setAvailableHours(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mini Bio / Apresentação
                </label>
                <textarea
                  rows={2}
                  placeholder="Resumo da formação acadêmica e especializações..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
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
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Profissional'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

