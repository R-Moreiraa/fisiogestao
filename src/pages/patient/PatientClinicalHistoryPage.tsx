import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ClinicalEvolution } from '../../types';
import { FileClock, Activity, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const PatientClinicalHistoryPage: React.FC = () => {
  const [evolutions, setEvolutions] = useState<ClinicalEvolution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/patient/clinical-history');
        if (res.data.success) {
          setEvolutions(res.data.data);
        }
      } catch (err) {
        console.error('Erro ao carregar histórico clínico:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Meu Histórico Clínico & Recomendações
          </h1>
          <p className="text-xs text-slate-400">
            Registro de evoluções e condutas compartilhadas pelos seus fisioterapeutas.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-brand-700 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200 self-start sm:self-auto font-semibold">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          Registros Oficiais Autenticados
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Carregando histórico clínico...</div>
      ) : evolutions.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80">
          Nenhuma evolução clínica liberada até o momento.
        </div>
      ) : (
        <div className="space-y-4">
          {evolutions.map((evo) => (
            <div
              key={evo.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-brand-600 text-white font-extrabold text-xs flex items-center justify-center">
                    #{evo.session_number}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      Sessão realizada em {new Date(evo.session_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </h3>
                    <p className="text-xs text-slate-400">Profissional: {evo.professional_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs bg-slate-50 px-3 py-1.5 rounded-xl">
                  <span className="text-slate-500">Dor inicial: <strong className="text-amber-600">{evo.pain_before}</strong>/10</span>
                  <span className="text-slate-300">→</span>
                  <span className="text-slate-500">Dor pós-sessão: <strong className="text-emerald-600">{evo.pain_after}</strong>/10</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <strong className="text-slate-700 block mb-0.5">Procedimentos Aplicados:</strong>
                  <p className="text-slate-600 leading-relaxed">{evo.procedures}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <strong className="text-slate-700 block mb-0.5">Condutas & Resposta:</strong>
                  <p className="text-slate-600 leading-relaxed">{evo.conduct} {evo.patient_response}</p>
                </div>
              </div>

              {evo.next_recommendations && (
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-xs text-emerald-900 leading-relaxed">
                  <strong className="block mb-0.5 text-emerald-950 font-bold">Orientações Domiciliares para Você:</strong>
                  {evo.next_recommendations}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

