import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Transaction, Patient } from '../types';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Receipt,
  Printer,
  X,
  Loader2,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const FinancialPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // New Transaction Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formType, setFormType] = useState<'receita' | 'despesa'>('receita');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Pacote de Fisioterapia');
  const [formAmount, setFormAmount] = useState(1800);
  const [formPatientId, setFormPatientId] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState('Pix');
  const [formStatus, setFormStatus] = useState('pago');

  // Receipt Preview Modal
  const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);

  const fetchFinancial = async () => {
    try {
      setLoading(true);
      const [sumRes, txRes, patRes] = await Promise.all([
        api.get('/api/financial/summary'),
        api.get('/api/financial/transactions', {
          params: { type: typeFilter || undefined, status: statusFilter || undefined }
        }),
        api.get('/api/patients', { params: { limit: 100 } })
      ]);

      if (sumRes.data.success) setSummary(sumRes.data.summary);
      if (txRes.data.success) setTransactions(txRes.data.data);
      if (patRes.data.success) setPatients(patRes.data.data);
    } catch (err) {
      console.error('Erro ao buscar dados financeiros:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancial();
  }, [typeFilter, statusFilter]);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const selectedPatient = patients.find((p) => p.id === formPatientId);
      const res = await api.post('/api/financial/transactions', {
        type: formType,
        category: formCategory,
        description: formDescription,
        amount: Number(formAmount),
        patient_id: formPatientId || null,
        patient_name: selectedPatient?.name || null,
        payment_method: formPaymentMethod,
        status: formStatus
      });

      if (res.data.success) {
        setModalOpen(false);
        setFormDescription('');
        fetchFinancial();
      }
    } catch (err) {
      console.error('Erro ao registrar transação:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/api/financial/transactions/${id}/status`, { status: newStatus });
      fetchFinancial();
    } catch (err) {
      console.error('Erro ao atualizar status financeiro:', err);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const filteredTransactions = transactions.filter((tx) =>
    tx.description.toLowerCase().includes(search.toLowerCase()) ||
    (tx.patient_name && tx.patient_name.toLowerCase().includes(search.toLowerCase())) ||
    (tx.receipt_number && tx.receipt_number.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Gestão Financeira & Recibos
          </h1>
          <p className="text-xs text-slate-400">
            Contas a receber, despesas clínicas, emissão de recibos e controle de inadimplência.
          </p>
        </div>

        <button
          onClick={() => {
            if (patients.length > 0) setFormPatientId(patients[0].id);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          Novo Lançamento
        </button>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Faturamento no Mês</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-slate-900 block">
            {formatCurrency(summary?.month_revenue || 0)}
          </span>
          <span className="text-[11px] text-slate-400">Total acumulado: {formatCurrency(summary?.total_revenue || 0)}</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Despesas no Mês</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-rose-700 block">
            {formatCurrency(summary?.month_expenses || 0)}
          </span>
          <span className="text-[11px] text-slate-400">Aluguel, insumos e infraestrutura</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Lucro Operacional</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-brand-800 block">
            {formatCurrency(summary?.estimated_profit || 0)}
          </span>
          <span className="text-[11px] text-emerald-600 font-bold">Margem positiva</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Valores Pendentes</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-amber-700 block">
            {formatCurrency(summary?.pending_receivables || 0)}
          </span>
          <span className="text-[11px] text-slate-400">Parcelas e pacotes a receber</span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por descrição, paciente ou número do recibo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 focus:bg-white rounded-xl border border-slate-200 outline-none focus:border-brand-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
        >
          <option value="">Todas as Transações</option>
          <option value="receita">Apenas Receitas (+)</option>
          <option value="despesa">Apenas Despesas (-)</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
        >
          <option value="">Todos os Status</option>
          <option value="pago">Quitado / Pago</option>
          <option value="pendente">Pendente</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Carregando movimentações financeiras...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">Nenhum lançamento encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold bg-slate-50/50">
                  <th className="py-3.5 px-6 font-semibold">Tipo</th>
                  <th className="py-3.5 px-4 font-semibold">Descrição / Paciente</th>
                  <th className="py-3.5 px-4 font-semibold">Categoria</th>
                  <th className="py-3.5 px-4 font-semibold">Forma de Pagamento</th>
                  <th className="py-3.5 px-4 font-semibold">Valor</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Ação / Recibo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase ${
                        tx.type === 'receita' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {tx.type === 'receita' ? '+ Receita' : '- Despesa'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{tx.description}</p>
                      {tx.patient_name && (
                        <span className="text-[11px] text-brand-600 font-medium">
                          Paciente: {tx.patient_name}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">{tx.category}</td>

                    <td className="py-3.5 px-4 text-slate-600">{tx.payment_method}</td>

                    <td className="py-3.5 px-4 font-extrabold text-sm text-slate-900">
                      {formatCurrency(tx.amount)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        tx.status === 'pago' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {tx.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-6 text-right space-x-2">
                      {tx.status === 'pendente' ? (
                        <button
                          onClick={() => handleUpdateStatus(tx.id, 'pago')}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-[10px] transition"
                        >
                          Dar Baixa (Receber)
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedReceipt(tx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[10px] transition"
                        >
                          <Receipt className="w-3 h-3 text-slate-500" />
                          Ver Recibo
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* NEW TRANSACTION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
            <div className="bg-gradient-to-r from-petroleum to-brand-700 px-6 py-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Lançamento Financeiro</h3>
                <p className="text-xs text-brand-200">Cadastre uma nova receita ou despesa</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setFormType('receita')}
                  className={`py-2 rounded-xl font-bold transition ${
                    formType === 'receita' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Receita (+)
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('despesa')}
                  className={`py-2 rounded-xl font-bold transition ${
                    formType === 'despesa' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Despesa (-)
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Descrição do Lançamento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pacote de Fisioterapia Lombar 10 Sessões"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-extrabold text-slate-900 outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500"
                  >
                    <option value="Pix">Pix (Instantâneo)</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Transferência Bancária">Transferência Bancária</option>
                  </select>
                </div>
              </div>

              {formType === 'receita' && (
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Paciente Associado
                  </label>
                  <select
                    value={formPatientId}
                    onChange={(e) => setFormPatientId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500"
                  >
                    <option value="">Selecione o paciente (opcional)...</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} - CPF: {p.cpf || 'S/ CPF'}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status Inicial
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-500"
                >
                  <option value="pago">Quitado / Pago</option>
                  <option value="pendente">Pendente de Pagamento</option>
                </select>
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
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Lançamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT PRINT / PREVIEW MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">Recibo Oficial</span>
                <h3 className="text-lg font-black text-slate-900">FisioPrime Reabilitação</h3>
                <p className="text-[11px] text-slate-400">CNPJ: 12.345.678/0001-90</p>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex justify-between p-3 bg-slate-50 rounded-2xl">
                <span>Número do Recibo:</span>
                <strong className="font-mono text-slate-900">{selectedReceipt.receipt_number || 'REC-2025-001'}</strong>
              </div>

              <div className="flex justify-between">
                <span>Data de Emissão:</span>
                <strong className="text-slate-900">{selectedReceipt.payment_date || new Date().toISOString().split('T')[0]}</strong>
              </div>

              <div className="flex justify-between">
                <span>Paciente / Tomador:</span>
                <strong className="text-slate-900">{selectedReceipt.patient_name || 'Consumidor'}</strong>
              </div>

              <div className="flex justify-between">
                <span>Serviço Prestado:</span>
                <strong className="text-slate-900">{selectedReceipt.description}</strong>
              </div>

              <div className="flex justify-between">
                <span>Forma de Pagamento:</span>
                <strong className="text-slate-900">{selectedReceipt.payment_method}</strong>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-700">Valor Total Pago:</span>
                <span className="text-2xl font-black text-slate-900">
                  {formatCurrency(selectedReceipt.amount)}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Imprimir Recibo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

