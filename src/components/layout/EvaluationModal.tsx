import React, { useState } from 'react';
import { X, Calendar, User, Phone, Mail, Clock, MessageSquare, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSpecialty?: string;
}

export const EvaluationModal: React.FC<EvaluationModalProps> = ({
  isOpen,
  onClose,
  defaultSpecialty = 'Fisioterapia Traumato-Ortopédica',
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialty, setSpecialty] = useState(defaultSpecialty);
  const [preferredShift, setPreferredShift] = useState('Manhã');
  const [preferredDate, setPreferredDate] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await api.post('/api/public/appointment-requests', {
        name,
        phone,
        email,
        specialty,
        preferred_shift: preferredShift,
        preferred_date: preferredDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        message,
      });

      if (res.data.success) {
        setSubmitted(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        setErrorMessage(res.data.message || 'Erro ao enviar solicitação.');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Falha na conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setName('');
    setPhone('');
    setEmail('');
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-petroleum to-brand-700 px-6 py-5 text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-200">
              Atendimento Personalizado 1:1
            </span>
            <h3 className="text-xl font-bold mt-0.5">Agendar Avaliação Fisioterapêutica</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-bold text-slate-800">Solicitação Enviada!</h4>
            <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto">
              Recebemos sua mensagem com sucesso, <strong className="text-slate-900">{name}</strong>. Nossa equipe de recepção entrará em contato via WhatsApp/Telefone para confirmar o melhor horário na agenda da clínica.
            </p>
            <div className="pt-4">
              <button
                onClick={handleReset}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-xl transition shadow-md shadow-brand-500/20"
              >
                Concluir
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nome Completo *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Telefone / WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="(11) 98765-4321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Especialidade ou Área de Atenção
              </label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition bg-white"
              >
                <option value="Fisioterapia Traumato-Ortopédica">Fisioterapia Traumato-Ortopédica (Dores articulares, tendinites)</option>
                <option value="Reabilitação Pós-Operatória">Reabilitação Pós-Operatória (LCA, menisco, próteses)</option>
                <option value="Tratamento de Coluna Vertebral">Tratamento de Coluna Vertebral (Hérnia, ciático, lombalgia)</option>
                <option value="Fisioterapia Esportiva & Performance">Fisioterapia Esportiva & Performance</option>
                <option value="Pilates Clínico & Postura">Pilates Clínico & Reabilitação Postural</option>
                <option value="Fisioterapia Neurológica & Vestibular">Fisioterapia Neurológica & Vestibular (Labirintite)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Data de Preferência
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Turno de Preferência
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <select
                    value={preferredShift}
                    onChange={(e) => setPreferredShift(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition bg-white"
                  >
                    <option value="Manhã">Manhã (07h às 12h)</option>
                    <option value="Tarde">Tarde (12h às 17h)</option>
                    <option value="Noite">Noite (17h às 21h)</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Descreva seus sintomas ou queixa principal
              </label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <textarea
                  rows={3}
                  placeholder="Ex: Sinto dor na lombar ao ficar sentado, piora no final do dia..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition resize-none"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              * O envio desta solicitação não confirma o horário imediatamente. Nossa recepção entrará em contato para alinhar os detalhes e validar com o fisioterapeuta responsável.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-brand-500/25 flex items-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Solicitar Agendamento'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

