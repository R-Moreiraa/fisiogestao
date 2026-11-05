import React, { useState, useEffect } from 'react';
import { LandingNavbar } from '../components/layout/LandingNavbar';
import { LandingFooter } from '../components/layout/LandingFooter';
import { EvaluationModal } from '../components/layout/EvaluationModal';
import { api } from '../services/api';
import { LandingCms, Professional, ClinicSettings } from '../types';
import {
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Award,
  Sparkles,
  MapPin,
  Phone,
  ArrowRight,
  Star,
  Activity,
  Heart,
  Zap,
  Flame,
  Compass,
  Users,
  Clock,
  ExternalLink,
  Stethoscope,
  Smile,
  BadgeCheck,
  Building
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const [evaluationModalOpen, setEvaluationModalOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState('Fisioterapia Traumato-Ortopédica');
  const [cms, setCms] = useState<LandingCms | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [clinic, setClinic] = useState<ClinicSettings | null>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await api.get('/api/public/clinic-info');
        if (res.data.success) {
          setCms(res.data.landing);
          setProfessionals(res.data.professionals || []);
          setClinic(res.data.clinic);
        }
      } catch (err) {
        console.error('Erro ao carregar dados públicos da clínica:', err);
      }
    };
    fetchInfo();
  }, []);

  const openEvaluation = (specialtyTitle?: string) => {
    if (specialtyTitle) {
      setSelectedSpecialty(specialtyTitle);
    }
    setEvaluationModalOpen(true);
  };

  const getSpecialtyIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck': return ShieldCheck;
      case 'Zap': return Zap;
      case 'Flame': return Flame;
      case 'Heart': return Heart;
      case 'Compass': return Compass;
      default: return Activity;
    }
  };

  // Fallback photos for specialties if not present
  const specialtyPhotos: Record<string, string> = {
    'esp_1': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80',
    'esp_2': 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
    'esp_3': 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&auto=format&fit=crop&q=80',
    'esp_4': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    'esp_5': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
    'esp_6': 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=600&auto=format&fit=crop&q=80',
  };

  const defaultTreatmentPrograms = [
    {
      title: 'Terapia Manual & Liberação Miofascial',
      category: 'Alívio Imediato da Dor',
      desc: 'Técnicas manuais de tração articular, Maitland e desativação de pontos-gatilho para alívio de tensões profundas.',
      image: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&auto=format&fit=crop&q=80'
    },
    {
      title: 'Cinesioterapia & Fortalecimento Ativo',
      category: 'Recuperação Funcional',
      desc: 'Exercícios terapêuticos específicos com faixas elásticas, halteres leves e propriocepção individualizada 1:1.',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80'
    },
    {
      title: 'Pilates Clínico Supervisionado',
      category: 'Estabilização Segmentar',
      desc: 'Estúdio completo com Reformer, Cadillac e Barrel para reeducação biomecânica da coluna e articulações.',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80'
    },
    {
      title: 'Eletroterapia & Analgesia',
      category: 'Tecnologia em Saúde',
      desc: 'Recursos eletroterapêuticos de precisão (TENS, FES, Laser e Ultrassom) para aceleração cicatricial e controle inflamatório.',
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80'
    },
    {
      title: 'Recovery Esportivo & Prevenção',
      category: 'Desempenho & Atletas',
      desc: 'Protocolos avançados com botas pneumáticas de compressão e técnicas de regeneração neuromuscular.',
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80'
    },
    {
      title: 'Avaliação Biomecânica 3D',
      category: 'Diagnóstico Preciso',
      desc: 'Análise minuciosa de mobilidade, goniometria articular, testes ortopédicos e identificação da causa raiz dos sintomas.',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80'
    }
  ];

  const treatmentPrograms = cms?.treatment_programs || defaultTreatmentPrograms;

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      <LandingNavbar onOpenEvaluation={() => openEvaluation()} />

      {/* 1. HERO SECTION - Inspired by Reference Image 1 */}
      <section
        id="inicio"
        className="relative bg-gradient-to-br from-petroleum via-brand-900 to-brand-700 text-white overflow-hidden py-16 sm:py-24 lg:py-28"
      >
        {/* Subtle dot pattern and ambient gradient glows */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Heading, Subheading & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-brand-200 text-xs sm:text-sm font-semibold tracking-wide shadow-inner">
                <Sparkles className="w-4 h-4 text-brand-300" />
                <span>{cms?.hero_badge || 'Referência em Fisioterapia & Reabilitação Avançada'}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
                {cms?.hero_title || 'Movimento, saúde e qualidade de vida em cada etapa da sua recuperação.'}
              </h1>

              <p className="text-base sm:text-lg text-brand-100/90 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {cms?.hero_subtitle || 'Tratamento fisioterapêutico individualizado e humanizado com foco em resultados reais e prevenção de recidivas.'}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => openEvaluation()}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition active:scale-95 flex items-center justify-center gap-2.5 text-base cursor-pointer"
                >
                  <CalendarCheck className="w-5 h-5" />
                  Agendar Avaliação
                </button>
                <a
                  href="#tratamentos"
                  className="w-full sm:w-auto px-7 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl backdrop-blur-md border border-white/20 transition flex items-center justify-center gap-2 text-base"
                >
                  Conheça nossos tratamentos
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>

              {/* Key Highlights */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-white/15 text-left">
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-white">100%</p>
                  <p className="text-xs text-brand-200">Atendimento 1:1 Individual</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-white">+5.000</p>
                  <p className="text-xs text-brand-200">Sessões Realizadas</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-white">99%</p>
                  <p className="text-xs text-brand-200">Satisfação dos Pacientes</p>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Photo Composition (Directly Inspired by Image 1) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Back card glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-brand-400 to-sky-300 rounded-3xl blur-2xl opacity-35"></div>

                <div className="relative bg-white/95 rounded-3xl p-3 shadow-2xl border border-white/40 overflow-hidden">
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[1/1] bg-slate-100">
                    {/* Realistic physiotherapy rehabilitation photo */}
                    <img
                      src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1000&auto=format&fit=crop&q=80"
                      alt="Fisioterapeuta auxiliando paciente em exercício de reabilitação e fortalecimento"
                      className="w-full h-full object-cover object-center transform hover:scale-105 transition duration-700"
                    />

                    {/* Gradient overlay on bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-6 text-white">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-600/90 backdrop-blur-md rounded-full text-[11px] font-bold text-white w-max mb-1 shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-200" />
                        Reabilitação Fisioterapêutica Individual
                      </div>
                      <h4 className="text-lg font-bold">
                        Dr. Roberto Sullivan & Dra. Camila Duarte
                      </h4>
                      <p className="text-xs text-brand-100 mt-0.5">
                        Equipe especializada em Coluna, Ortopedia & Pilates Clínico
                      </p>
                    </div>

                    {/* Floating Badge 1 (Top Right): Avaliação Biomecânica */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-slate-900 px-3 py-1.5 rounded-2xl shadow-lg border border-white/60 flex items-center gap-2 animate-bounce-subtle">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                        ✓
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-bold text-slate-800 leading-tight">Avaliação 3D</p>
                        <p className="text-[9px] text-slate-500">Diagnóstico Preciso</p>
                      </div>
                    </div>
                  </div>

                  {/* Floating Footer Pill */}
                  <div className="p-3.5 bg-brand-50/80 rounded-2xl mt-3 flex items-center justify-between border border-brand-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Atendimento 100% Personalizado</p>
                        <p className="text-[11px] text-slate-500">1 paciente por fisioterapeuta em toda a sessão</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-brand-700 bg-brand-200/60 px-2.5 py-1 rounded-full">
                      Padrão Ouro
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK LOCATIONS BAR - Exactly like Reference Image 1 */}
      <section id="unidades" className="bg-brand-900 text-white py-8 border-t border-brand-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="md:border-r md:border-brand-800 pr-4">
              <h4 className="text-lg font-black tracking-tight text-white leading-tight">
                Nossas Unidades de Atendimento
              </h4>
              <p className="text-xs text-brand-200 mt-1">
                Ambientes modernos com acessibilidade plena e estacionamento no local.
              </p>
            </div>

            {cms?.locations?.map((loc, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center gap-1.5 text-brand-300 text-xs font-bold uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{loc.name}</span>
                </div>
                <p className="text-xs text-white/90 leading-snug">{loc.address}</p>
                <div className="flex items-center gap-1 text-xs text-brand-200 font-semibold pt-0.5">
                  <Phone className="w-3 h-3 text-brand-400" />
                  <span>{loc.phone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. ABOUT THE CLINIC SECTION (Dual Real Photography Composition) */}
      <section id="sobre" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual Photography Composition with 2 clinical images */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 group">
                <img
                  src="https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&auto=format&fit=crop&q=80"
                  alt="Fisioterapeuta aplicando terapia manual e alívio de dor na coluna vertebral"
                  className="w-full h-[380px] object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end p-5">
                  <span className="text-xs font-bold text-white bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl">
                    Terapia Manual & Mobilização Articular
                  </span>
                </div>
              </div>

              {/* Inset Second Clinical Photo: Pilates Reformer */}
              <div className="absolute -bottom-8 -right-6 w-48 sm:w-56 rounded-2xl overflow-hidden shadow-2xl border-4 border-white hidden sm:block">
                <img
                  src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&auto=format&fit=crop&q=80"
                  alt="Sessão de Pilates Clínico supervisionada"
                  className="w-full h-36 object-cover"
                />
                <div className="bg-brand-700 text-white p-2 text-center text-[10px] font-bold">
                  Estúdio de Pilates Clínico
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-wider">
                Sobre a Clínica
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {cms?.about_title || 'Cuidando de pessoas, restaurando movimentos e devolvendo bem-estar.'}
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                {cms?.about_description ||
                  'A FisioPrime nasceu do compromisso de transformar a experiência de reabilitação. Combinamos tecnologia de ponta, avaliação biomecânica criteriosa e atendimento estritamente individualizado.'}
              </p>

              {/* Differentials Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {cms?.differentials?.map((diff, index) => (
                  <div key={index} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center gap-2 text-brand-700 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                      <span>{diff.title}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed pl-6">{diff.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SPECIALTIES SECTION - With Clinical Images on each card */}
      <section id="especialidades" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-200">
              Especialidades Clínicas
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tratamentos focados na sua recuperação integral
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Nossa abordagem clínica integra terapias manuais avançadas, eletroterapia, cinesioterapia motora e exercícios terapêuticos baseados em evidência científica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cms?.specialties?.map((esp) => {
              const IconComp = getSpecialtyIcon(esp.icon);
              const cardImage = esp.image || specialtyPhotos[esp.id] || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80';

              return (
                <div
                  key={esp.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-brand-300 transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    {/* Specialty Card Image */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                      <img
                        src={cardImage}
                        alt={esp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent"></div>
                      <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md">
                          <IconComp className="w-5 h-5 stroke-[2]" />
                        </div>
                        <span className="text-xs font-bold text-white drop-shadow-md">
                          Atendimento 1:1
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-2">
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-brand-700 transition">
                        {esp.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-3">
                        {esp.desc}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between">
                    <button
                      onClick={() => openEvaluation(esp.title)}
                      className="text-xs font-bold text-brand-600 group-hover:text-brand-700 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      Agendar esta área
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                    </button>
                    <span className="text-[10px] text-slate-400 font-semibold bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/60">
                      Personalizado
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. TREATMENTS & CLINICAL PROCEDURES SHOWCASE (Dedicated Gallery) */}
      <section id="tratamentos" className="py-20 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-100 px-3.5 py-1.5 rounded-full">
              Nossos Recursos & Programas
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Metodologias e Tratamentos Aplicados
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Conheça os principais procedimentos realizados em nossas salas e boxes terapêuticos individuais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {treatmentPrograms.map((tp, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-lg transition group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={tp.image}
                      alt={tp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-brand-800 shadow-xs">
                      {tp.category}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h4 className="text-base font-extrabold text-slate-900 group-hover:text-brand-700 transition">
                      {tp.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {tp.desc}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => openEvaluation(tp.title)}
                    className="w-full py-2.5 bg-slate-50 hover:bg-brand-50 hover:text-brand-700 border border-slate-200 hover:border-brand-200 rounded-xl text-xs font-bold text-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Solicitar Avaliação Deste Tratamento
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. OUR SPECIALISTS / PROFISSIONAIS */}
      <section id="profissionais" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-200">
              Corpo Clínico
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Fisioterapeutas especialistas certificados
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Profissionais pós-graduados nos maiores centros hospitalares e acadêmicos do país, com registro ativo no CREFITO.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {professionals.map((pro) => (
              <div
                key={pro.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-lg transition space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                    <img
                      src={pro.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'}
                      alt={pro.name}
                      className="w-full h-full object-cover hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-brand-800 shadow-xs">
                      {pro.crefito}
                    </div>
                  </div>

                  <div className="p-6 pt-4 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                      {pro.specialty}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">{pro.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                      {pro.bio}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {pro.available_hours || 'Segunda a Sexta'}
                  </span>
                  <button
                    onClick={() => openEvaluation(pro.specialty)}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer"
                  >
                    Consultar
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CLINIC INFRASTRUCTURE / ESPAÇO FÍSICO */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-300">
              Infraestrutura & Tecnologia
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold">
              Ambientes desenhados para sua recuperação e privacidade
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Salas individuais climatizadas, estúdio completo de pilates clínico e equipamentos de ponta.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-800">
              <img
                src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=80"
                alt="Estúdio de Pilates Reformer"
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-bold text-white">Estúdio de Pilates Reformer</span>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-800">
              <img
                src="https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=500&auto=format&fit=crop&q=80"
                alt="Consultórios de Terapia Manual"
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-bold text-white">Consultórios de Terapia Manual</span>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-800">
              <img
                src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=80"
                alt="Box de Eletroterapia Analgésica"
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-bold text-white">Box de Eletroterapia Avançada</span>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-800">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=80"
                alt="Espaço de Avaliação Biomecânica"
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-bold text-white">Avaliação Biomecânica 3D</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS SECTION (With Patient Avatars) */}
      <section id="depoimentos" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
              Resultados Reais
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              O que nossos pacientes dizem
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Depoimentos autorizados de quem recuperou o movimento, superou a dor e retornou às atividades do dia a dia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cms?.testimonials?.map((t, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition"
              >
                <div className="space-y-3">
                  <div className="flex text-amber-400 gap-1">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                    "{t.text}"
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <img
                    src={t.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                    <p className="text-xs text-brand-600 font-semibold">{t.treatment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA SECTION */}
      <section className="bg-gradient-to-r from-petroleum to-brand-800 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Pronto para dar o primeiro passo em direção ao seu alívio e bem-estar?
          </h2>
          <p className="text-brand-100 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Nossa equipe está pronta para avaliar sua condição com tecnologia, acolhimento e compromisso ético.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => openEvaluation()}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-xl shadow-amber-500/25 transition active:scale-95 text-base flex items-center justify-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-5 h-5" />
              Agendar Avaliação Agora
            </button>
            <Link
              to="/login/paciente"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl border border-white/20 transition flex items-center justify-center gap-2 text-base"
            >
              Já sou paciente
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />

      {/* Interactive Modal for evaluation request */}
      <EvaluationModal
        isOpen={evaluationModalOpen}
        onClose={() => setEvaluationModalOpen(false)}
        defaultSpecialty={selectedSpecialty}
      />
    </div>
  );
};
