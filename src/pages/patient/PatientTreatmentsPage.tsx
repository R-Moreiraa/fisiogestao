import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { TreatmentPlan } from '../../types';
import { Layers, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export const PatientTreatmentsPage: React.FC = () => {
  const [treatments, setTreatments] = useState<TreatmentPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/patient/treatments');
        if (res.data.success) {
          setTreatments(res.data.data);
        }
      } catch (err) {
        console.error('Erro ao carregar tratamentos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTreatments();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Meus Tratamentos & Metas Clínicas
        </h1>
        <p className="text-xs text-slate-400">
          Acompanhe os planos terapêuticos ativos, metas traçadas pelo fisioterapeuta e progresso de sessões.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Carregando tratamentos...</div>
      ) : treatments.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80">
          Você ainda não possui planos de tratamento cadastrados.
        </div>
      ) : (
        <div className="space-y-4">
          {treatments.map((t) => {
            const percentage = Math.round((t.completed_sessions / t.total_sessions) * 100);
            const isFinished = t.status === 'concluido' || t.remaining_sessions === 0;

            return (
              <div
                key={t.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      isFinished ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-brand-50 text-brand-700 border border-brand-200'
                    }`}>
                      {isFinished ? 'Tratamento Concluído com Sucesso' : 'Em Andamento'}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-1">{t.title}</h3>
                    <p className="text-xs text-slate-400">
                      Fisioterapeuta: <strong>{t.professional_name}</strong> • Frequência: {t.frequency}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-900">
                      {t.completed_sessions} <span className="text-xs text-slate-400 font-normal">/ {t.total_sessions} sessões</span>
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        isFinished ? 'bg-emerald-500' : 'bg-brand-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Restam <strong>{t.remaining_sessions}</strong> sessões contratadas</span>
                    <span className="font-bold text-slate-800">{percentage}% concluído</span>
                  </div>
                </div>

                {t.therapeutic_goals && (
                  <div className="p-4 bg-brand-50/70 rounded-2xl border border-brand-100 text-xs text-brand-900 leading-relaxed">
                    <strong className="block mb-1 text-brand-950 font-bold">Objetivos Terapêuticos Compartilhados:</strong>
                    {t.therapeutic_goals}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

