import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ClinicSettings, LandingCms } from '../types';
import {
  Settings as SettingsIcon,
  Save,
  CheckCircle2,
  Building2,
  Globe,
  Database,
  ShieldCheck,
  Loader2,
  Clock,
  Phone,
  Mail,
  MapPin,
  Sparkles
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'clinica' | 'landing' | 'sistema'>('clinica');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Clinic Settings
  const [clinicName, setClinicName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [sessionDuration, setSessionDuration] = useState(50);

  // Landing Page CMS
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroBadge, setHeroBadge] = useState('');
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutDescription, setAboutDescription] = useState('');

  // Upstash Cloud Status
  const [upstashStatus, setUpstashStatus] = useState<any>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/settings');
      if (res.data.success) {
        const c: ClinicSettings = res.data.clinic;
        setClinicName(c.clinic_name || '');
        setCnpj(c.cnpj || '');
        setPhone(c.phone || '');
        setWhatsapp(c.whatsapp || '');
        setEmail(c.email || '');
        setAddress(c.address || '');
        setOperatingHours(c.operating_hours || '');
        setSessionDuration(c.default_session_duration || 50);

        const l: LandingCms = res.data.landing;
        setHeroTitle(l.hero_title || '');
        setHeroSubtitle(l.hero_subtitle || '');
        setHeroBadge(l.hero_badge || '');
        setAboutTitle(l.about_title || '');
        setAboutDescription(l.about_description || '');

        setUpstashStatus(res.data.upstash_status);
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    try {
      const res = await api.put('/api/settings/clinic', {
        clinic_name: clinicName,
        cnpj,
        phone,
        whatsapp,
        email,
        address,
        operating_hours: operatingHours,
        default_session_duration: Number(sessionDuration),
      });

      if (res.data.success) {
        setSuccessMessage('Configurações da clínica salvas com sucesso!');
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLanding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    try {
      const res = await api.put('/api/settings/landing', {
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
        hero_badge: heroBadge,
        about_title: aboutTitle,
        about_description: aboutDescription,
      });

      if (res.data.success) {
        setSuccessMessage('Conteúdo da Landing Page atualizado com sucesso no site público!');
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      console.error('Erro ao salvar CMS:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Configurações & CMS da Clínica
          </h1>
          <p className="text-xs text-slate-400">
            Personalize a identidade da clínica, horários de atendimento e conteúdo da Landing Page pública.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('clinica')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'clinica' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Dados da Clínica
          </button>
          <button
            onClick={() => setActiveTab('landing')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'landing' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            CMS da Landing Page
          </button>
          <button
            onClick={() => setActiveTab('sistema')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'sistema' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Banco Upstash & LGPD
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* TAB 1: DADOS DA CLÍNICA */}
      {activeTab === 'clinica' && (
        <form onSubmit={handleSaveClinic} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            Identidade do Estabelecimento & Parâmetros
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nome Comercial da Clínica *
              </label>
              <input
                type="text"
                required
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                CNPJ
              </label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Telefone Fixo
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                WhatsApp Comercial
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                E-mail Institucional
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Duração Padrão das Sessões (Minutos)
              </label>
              <input
                type="number"
                value={sessionDuration}
                onChange={(e) => setSessionDuration(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Endereço Completo (Matriz)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Horário de Atendimento
              </label>
              <input
                type="text"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-brand-500/20 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar Alterações
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: CMS DA LANDING PAGE */}
      {activeTab === 'landing' && (
        <form onSubmit={handleSaveLanding} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Gerenciador de Conteúdo da Landing Page (CMS)
              </h3>
              <p className="text-xs text-slate-400">
                Altere textos e chamadas públicas do seu site sem precisar mexer em uma linha de código.
              </p>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-brand-600 hover:underline"
            >
              Visualizar Site Público ↗
            </a>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tagline / Selo do Hero
              </label>
              <input
                type="text"
                value={heroBadge}
                onChange={(e) => setHeroBadge(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Título Principal do Hero (H1)
              </label>
              <textarea
                rows={2}
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-brand-500 resize-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subtítulo do Hero
              </label>
              <textarea
                rows={2}
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500 resize-none"
              />
            </div>

            <div className="pt-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Título da Seção Sobre a Clínica
              </label>
              <input
                type="text"
                value={aboutTitle}
                onChange={(e) => setAboutTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Descrição da Seção Sobre a Clínica
              </label>
              <textarea
                rows={3}
                value={aboutDescription}
                onChange={(e) => setAboutDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500 resize-none leading-relaxed"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-brand-500/20 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Publicar Alterações no Site
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: BANCO UPSTASH & AUDITORIA */}
      {activeTab === 'sistema' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900">
              Arquitetura de Dados: Upstash Redis REST API
            </h3>
            <p className="text-xs text-slate-400">
              Gerenciamento de conexões, persistência atômica e auditoria LGPD de acesso aos prontuários.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Modo de Persistência Atual:</span>
              <span className="font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {upstashStatus?.cloud_configured ? 'Upstash Redis Cloud (REST API Conectada)' : 'Upstash Engine Local Integrado (storage/redis_data.json)'}
              </span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              O backend suporta de ponta a ponta as credenciais <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">UPSTASH_REDIS_REST_URL</code> e <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">UPSTASH_REDIS_REST_TOKEN</code>. Caso não configurado em ambiente local, nosso motor emulado com isolamento de transações e bloqueio atômico assegura consistência absoluta.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Conformidade com a LGPD & Auditoria de Acesso a Prontuários
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-brand-50 text-brand-900 rounded-xl border border-brand-100">
                <strong>Rastreabilidade de Sessões</strong>
                <p className="text-[11px] text-brand-700 mt-1">Evoluções clínicas imutáveis e auditadas com carimbo de tempo.</p>
              </div>
              <div className="p-3 bg-brand-50 text-brand-900 rounded-xl border border-brand-100">
                <strong>Isolamento de Perfis</strong>
                <p className="text-[11px] text-brand-700 mt-1">Pacientes têm visão estrita dos próprios registros liberados.</p>
              </div>
              <div className="p-3 bg-brand-50 text-brand-900 rounded-xl border border-brand-100">
                <strong>Criptografia em Trânsito</strong>
                <p className="text-[11px] text-brand-700 mt-1">Comunicação REST autenticada com tokens assinados HMAC-SHA256.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

