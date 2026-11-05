import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Transaction } from '../../types';
import { Receipt, CheckCircle2, Clock, Printer, X } from 'lucide-react';

export const PatientFinancialPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);

  useEffect(() => {
    const fetchFin = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/patient/financial');
        if (res.data.success) {
          setTransactions(res.data.data);
        }
      } catch (err) {
        console.error('Erro ao carregar financeiro:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFin();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Financeiro & Recibos
        </h1>
        <p className="text-xs text-slate-400">
          Acompanhe suas parcelas, recibos para declaração e histórico de pagamentos.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Carregando financeiro...</div>
      ) : transactions.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80">
          Nenhum lançamento financeiro registrado.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold bg-slate-50/50">
                  <th className="py-3.5 px-6 font-semibold">Descrição</th>
                  <th className="py-3.5 px-4 font-semibold">Data</th>
                  <th className="py-3.5 px-4 font-semibold">Forma de Pagamento</th>
                  <th className="py-3.5 px-4 font-semibold">Valor</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Recibo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">{tx.description}</td>
                    <td className="py-4 px-4 text-slate-500">
                      {tx.payment_date ? new Date(tx.payment_date + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium">{tx.payment_method}</td>
                    <td className="py-4 px-4 font-extrabold text-slate-900 text-sm">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                        tx.status === 'pago' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {tx.status === 'pago' ? (
                        <button
                          onClick={() => setSelectedReceipt(tx)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition"
                        >
                          <Receipt className="w-3.5 h-3.5 text-slate-500" />
                          Ver Recibo
                        </button>
                      ) : (
                        <span className="text-[11px] text-amber-600 font-semibold">Pendente</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECEIPT VIEW MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">Recibo de Pagamento</span>
                <h3 className="text-lg font-black text-slate-900">FisioPrime Reabilitação</h3>
                <p className="text-[11px] text-slate-400">CNPJ: 12.345.678/0001-90</p>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between p-3 bg-slate-50 rounded-2xl">
                <span>Número do Recibo:</span>
                <strong className="font-mono text-slate-900">{selectedReceipt.receipt_number || 'REC-2025'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Serviço:</span>
                <strong className="text-slate-900">{selectedReceipt.description}</strong>
              </div>
              <div className="flex justify-between">
                <span>Data:</span>
                <strong className="text-slate-900">{selectedReceipt.payment_date || '-'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Forma:</span>
                <strong className="text-slate-900">{selectedReceipt.payment_method}</strong>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-700">Valor Pago:</span>
                <span className="text-xl font-black text-slate-900">{formatCurrency(selectedReceipt.amount)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

