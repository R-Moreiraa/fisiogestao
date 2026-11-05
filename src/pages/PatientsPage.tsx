import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Patient } from '../types';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Filter,
  Phone,
  Mail,
  ChevronRight,
  UserCheck,
  UserX,
  FileText,
  Calendar,
  X,
  Loader2,
  Edit,
  Trash2
} from 'lucide-react';

export const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [profession, setProfession] = useState('');
  const [insurance, setInsurance] = useState('Particular');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [address, setAddress] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/patients', {
        params: { search: search || undefined, status: statusFilter || undefined }
      });
      if (res.data.success) {
        setPatients(res.data.data);
      }
    } catch (err) {
      console.error('Erro ao carregar pacientes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      const res = await api.post('/api/patients', {
        name,
        cpf,
        birth_date: birthDate,
        phone,
        whatsapp: whatsapp || phone,
        email,
        profession,
        insurance,
        emergency_contact: emergencyContact,
        address,
        clinical_notes: clinicalNotes,
      });

      if (res.data.success) {
        setModalOpen(false);
        // Reset form
        setName('');
        setCpf('');
        setBirthDate('');
        setPhone('');
        setEmail('');
        setAddress('');
        fetchPatients();
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Falha ao cadastrar paciente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Prontuário & Gestão de Pacientes
          </h1>
          <p className="text-xs text-slate-400">
            Base completa de pacientes, histórico clínico, evoluções e planos terapêuticos.
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMessage('');
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Novo Paciente
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nome completo, CPF, telefone ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-brand-500"
        >
          <option value="">Todos os Status</option>
          <option value="ativo">Somente Ativos</option>
          <option value="inativo">Inativos</option>
        </select>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Carregando pacientes...</div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            Nenhum paciente encontrado para esta pesquisa.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold bg-slate-50/50">
                  <th className="py-3.5 px-6 font-semibold">Paciente</th>
                  <th className="py-3.5 px-4 font-semibold">CPF / Nascimento</th>
                  <th className="py-3.5 px-4 font-semibold">Contato</th>
                  <th className="py-3.5 px-4 font-semibold">Convênio</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition group">
                    <td className="py-4 px-6">
                      <Link to={`/gestao/pacientes/${p.id}`} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 font-bold flex items-center justify-center shrink-0 group-hover:bg-brand-600 group-hover:text-white transition">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-brand-700 transition">
                            {p.name}
                          </p>
                          <span className="text-[11px] text-slate-400">{p.profession || 'Não informada'}</span>
                        </div>
                      </Link>
                    </td>

                    <td className="py-4 px-4 text-slate-600 font-medium">
                      <div>{p.cpf || 'Não informado'}</div>
                      <span className="text-[10px] text-slate-400">
                        {p.birth_date ? new Date(p.birth_date + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{p.phone}</span>
                      </div>
                      {p.email && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[150px]">{p.email}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                        {p.insurance || 'Particular'}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        p.status === 'ativo' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {p.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/gestao/pacientes/${p.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 rounded-xl font-bold transition text-xs"
                      >
                        Ver Prontuário
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* NEW PATIENT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100">
            <div className="bg-gradient-to-r from-petroleum to-brand-700 px-6 py-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Cadastrar Novo Paciente</h3>
                <p className="text-xs text-brand-200">Preencha os dados cadastrais completos</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Eduardo de Oliveira"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    CPF
                  </label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 98765-4321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    E-mail
                  </label>
                  <input
                    type="email"
                    placeholder="paciente@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Profissão
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Arquiteto"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Convênio / Plano de Saúde
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Particular, Bradesco Saúde, etc."
                    value={insurance}
                    onChange={(e) => setInsurance(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contato de Emergência
                  </label>
                  <input
                    type="text"
                    placeholder="Nome e telefone do parente/responsável"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Endereço Completo
                  </label>
                  <input
                    type="text"
                    placeholder="Rua, número, complemento, bairro, cidade - UF"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Observações Iniciais
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Queixas principais ou histórico breve..."
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500 resize-none"
                  />
                </div>
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
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Paciente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

