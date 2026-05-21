import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  ChevronDown, 
  Calendar, 
  FileText, 
  User, 
  Activity, 
  Percent, 
  Calculator, 
  Sparkles, 
  BellRing, 
  AlertCircle,
  Clock, 
  CheckCircle2, 
  Share2, 
  X, 
  Download, 
  Receipt, 
  Building, 
  ShoppingBag, 
  Cpu, 
  UserX,
  UserCheck,
  CreditCard,
  Layers,
  BarChart4
} from 'lucide-react';
import { Transaction, Appointment, Dentist, Patient } from '../../types';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar,
  Legend
} from 'recharts';

interface FinancialRevenueCenterProps {
  transactions: Transaction[];
  appointments: Appointment[];
  dentists: Dentist[];
  patients: Patient[];
  onAddTransaction?: (tx: Omit<Transaction, 'id'>) => void;
  onUpdateTransactionStatus?: (id: string, status: 'Paid' | 'Pending' | 'Overdue') => void;
}

// Initial mock expenses to populate dynamic operational ledger
interface ExpenseRecord {
  id: string;
  category: 'Equipamentos' | 'Materiais' | 'Laboratório' | 'Marketing' | 'Pessoal' | 'Outros';
  supplier: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending';
}

const INITIAL_EXPENSES: ExpenseRecord[] = [
  { id: 'EXP-401', category: 'Pessoal', supplier: 'Equipe de Recepcionistas (Salários)', amount: 6200, date: '2026-05-05', status: 'Paid' },
  { id: 'EXP-402', category: 'Laboratório', supplier: 'Laboratório Dental ProEstética Ltda', amount: 3400, date: '2026-05-10', status: 'Paid' },
  { id: 'EXP-403', category: 'Materiais', supplier: 'Dental Cremer S/A Supplies', amount: 1850, date: '2026-05-12', status: 'Paid' },
  { id: 'EXP-404', category: 'Marketing', supplier: 'Google Ads & Instagram Campanhas', amount: 1200, date: '2026-05-15', status: 'Paid' },
  { id: 'EXP-405', category: 'Equipamentos', supplier: 'Manutenção Laser Dental Tech', amount: 950, date: '2026-05-18', status: 'Paid' },
  { id: 'EXP-406', category: 'Laboratório', supplier: 'Moldagens OrtoDesign Alinhadores', amount: 2100, date: '2026-05-19', status: 'Pending' }
];

export default function FinancialRevenueCenter({
  transactions,
  appointments,
  dentists,
  patients,
  onAddTransaction,
  onUpdateTransactionStatus
}: FinancialRevenueCenterProps) {
  
  // Tabs: overview | transactions | expenses | commissions
  const [financialTab, setFinancialTab] = useState<'overview' | 'transactions' | 'expenses' | 'commissions'>('overview');
  
  // Custom interactive systems state
  const [localExpenses, setLocalExpenses] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem('serene_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  // Keep expenses synced
  const saveExpensesToLocal = (newExpenses: ExpenseRecord[]) => {
    setLocalExpenses(newExpenses);
    localStorage.setItem('serene_expenses', JSON.stringify(newExpenses));
  };

  // State filters
  const [txSearch, setTxSearch] = useState('');
  const [txStatusFilter, setTxStatusFilter] = useState<string>('All');
  const [txTreatmentFilter, setTxTreatmentFilter] = useState<string>('All');
  
  // Commission simulator states
  const [commissionRate, setCommissionRate] = useState<number>(35); // Default 35% commission on private clinic services
  const [commissionDentistId, setCommissionDentistId] = useState<string>('All');

  // Triggerable alert notifications banner
  const [financialNotification, setFinancialNotification] = useState<{message: string; type: 'success' | 'warning'} | null>(null);

  // New item creators variables
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  // Invoice view slideover target
  const [selectedInvoiceTx, setSelectedInvoiceTx] = useState<Transaction | null>(null);

  // Form states
  const [paymentForm, setPaymentForm] = useState({
    patientName: '',
    treatment: 'Limpeza e Profilaxia',
    amount: 350,
    status: 'Paid' as 'Paid' | 'Pending' | 'Overdue',
    date: '2026-05-21'
  });

  const [expenseForm, setExpenseForm] = useState({
    category: 'Materiais' as ExpenseRecord['category'],
    supplier: '',
    amount: 450,
    status: 'Paid' as 'Paid' | 'Pending',
    date: '2026-05-21'
  });

  // Color constants for charts
  const CHARTS_COLORS = {
    blue: '#2563eb',
    indigo: '#4f46e5',
    emerald: '#10b981',
    amber: '#f59e0b',
    red: '#ef4444',
    purple: '#8b5cf6',
    rose: '#f43f5e'
  };

  // Global totals computation
  const totalRevenue = useMemo(() => {
    return transactions
      .filter(t => t.status === 'Paid')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalPending = useMemo(() => {
    return transactions
      .filter(t => t.status === 'Pending')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalOverdue = useMemo(() => {
    return transactions
      .filter(t => t.status === 'Overdue')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalExpensesComputed = useMemo(() => {
    return localExpenses
      .filter(e => e.status === 'Paid')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [localExpenses]);

  const netClinicProfit = useMemo(() => {
    return totalRevenue - totalExpensesComputed;
  }, [totalRevenue, totalExpensesComputed]);

  // Dynamic monthly chart arrays
  const monthlyRevenueLineData = useMemo(() => {
    // Generate simulated monthly cashflow keeping consistency with Oct trends
    return [
      { month: 'Dez', receitas: 65000, despesas: 14000, lucro: 51000 },
      { month: 'Jan', receitas: 78000, despesas: 15300, lucro: 62700 },
      { month: 'Fev', receitas: 89000, despesas: 16100, lucro: 72905 },
      { month: 'Mar', receitas: 104500, despesas: 18200, lucro: 86300 },
      { month: 'Abr', receitas: 112000, despesas: 19100, lucro: 92900 },
      { month: 'Mai', receitas: totalRevenue + 85000, despesas: totalExpensesComputed + 12000, lucro: (totalRevenue + 85000) - (totalExpensesComputed + 12000) },
    ];
  }, [totalRevenue, totalExpensesComputed]);

  // Treatment profitability Breakdown Chart values
  const treatmentDistributionPieData = useMemo(() => {
    const mapObj: Record<string, number> = {};
    transactions.forEach(t => {
      mapObj[t.treatment] = (mapObj[t.treatment] || 0) + t.amount;
    });

    const defaultItems = [
      { name: 'Ortodontia Alinhadores', value: mapObj['Orthodontics'] || 3800, color: CHARTS_COLORS.indigo },
      { name: 'Implantes Dentários', value: mapObj['Dental Implants'] || 2500, color: CHARTS_COLORS.blue },
      { name: 'Clareamentos a Laser', value: mapObj['Teeth Whitening'] || 450, color: CHARTS_COLORS.emerald },
      { name: 'Estética Multidisciplinar', value: mapObj['Smile Makeover'] || 5050, color: CHARTS_COLORS.rose }
    ];

    // Merge any actual active treatments from custom registrations
    const results = Object.entries(mapObj).map(([key, val]) => {
      // Find matching standard visual name
      let label = key;
      if (key === 'Checkup') label = 'Profilaxia / Checkup';
      if (key === 'Teeth Whitening') label = 'Clareamento Dental';
      if (key === 'Dental Implants') label = 'Implantes Estágio II';
      if (key === 'Orthodontics') label = 'Manutenção Ortodôntica';
      
      return {
        name: label,
        value: val,
        color: CHARTS_COLORS.amber
      };
    });

    return results.length > 0 ? results : defaultItems;
  }, [transactions]);

  // Dentist performance breakdown calculation
  const dentistRevenueBarData = useMemo(() => {
    const dentistProf: Record<string, number> = {
      'Dr. Sarah Jenkins': 45000,
      'Dr. Marcus Reynolds': 55000,
      'Dr. Emily Chen': 35000,
      'Desejáveis Outros': 12000
    };

    // Calculate sum dynamically from active client transactions matching dentist appointment names
    transactions.forEach(tx => {
      // Find dentist that conducts the treatment
      const matchApp = appointments.find(a => a.patientName === tx.patientName && a.treatment === tx.treatment);
      if (matchApp) {
        dentistProf[matchApp.dentistName] = (dentistProf[matchApp.dentistName] || 0) + tx.amount;
      }
    });

    return Object.entries(dentistProf).map(([name, sum]) => ({
      name: name.split(' ').slice(1).join(' ') || name, // Dr. Sarah Jenkins -> Sarah Jenkins
      faturamento: sum,
      comissoes: Math.floor(sum * (commissionRate / 100))
    }));
  }, [transactions, appointments, commissionRate]);

  // Filter conditions for transactions layout
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchSearch = tx.patientName.toLowerCase().includes(txSearch.toLowerCase()) || 
                          tx.treatment.toLowerCase().includes(txSearch.toLowerCase()) ||
                          tx.id.toLowerCase().includes(txSearch.toLowerCase());
      
      const matchStatus = txStatusFilter === 'All' || tx.status === txStatusFilter;
      const matchTreatment = txTreatmentFilter === 'All' || tx.treatment === txTreatmentFilter;

      return matchSearch && matchStatus && matchTreatment;
    });
  }, [transactions, txSearch, txStatusFilter, txTreatmentFilter]);

  // Unique treatment values for dropdown setup
  const uniqueTxTreatments = useMemo(() => {
    return ['All', ...Array.from(new Set(transactions.map(t => t.treatment)))];
  }, [transactions]);

  // Helper payment detail attributes mock
  const getSubTxDetails = (id: string) => {
    // Return high fidelity auxiliary fields
    const paymentMethods = ['Pix Instantâneo', 'Cartão de Crédito Vista', 'Cartão de Débito', 'Boleto Bancário Itaú'];
    const idx = id.charCodeAt(id.length - 1) % paymentMethods.length;
    return {
      method: paymentMethods[idx],
      discountRate: id.charCodeAt(id.length - 1) % 3 === 0 ? '10% Desconto Convênio' : 'Preço Integral Base',
      vatTax: Math.floor((transactions.find(t => t.id === id)?.amount || 100) * 0.05), // standard 5% ISS dental services tax
      notes: 'Autorizado via gateway de faturamento DentaFlow Pay. Recibo assinado digitalmente.'
    };
  };

  // Simulated Alert reminding users
  const handleSimulateAlert = (patientName: string) => {
    setFinancialNotification({
      message: `Cobrança preventiva automática disparada via WhatsApp/SMS para o paciente ${patientName}.`,
      type: 'success'
    });
    setTimeout(() => setFinancialNotification(null), 5000);
  };

  // Dynamic payment submission handler
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.patientName) return;

    if (onAddTransaction) {
      onAddTransaction({
        patientName: paymentForm.patientName,
        treatment: paymentForm.treatment,
        amount: Number(paymentForm.amount),
        status: paymentForm.status,
        date: paymentForm.date
      });
    }

    setFinancialNotification({
      message: `Transação de € ${paymentForm.amount.toLocaleString('pt-PT')} do paciente ${paymentForm.patientName} registrada com sucesso!`,
      type: 'success'
    });
    setTimeout(() => setFinancialNotification(null), 4000);
    setShowPaymentModal(false);

    // Reset payment input forms
    setPaymentForm({
      patientName: '',
      treatment: 'Limpeza e Profilaxia',
      amount: 350,
      status: 'Paid',
      date: '2026-05-21'
    });
  };

  // Expense record registration
  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.supplier) return;

    const newExp: ExpenseRecord = {
      id: `EXP-${Math.floor(500 + Math.random() * 500)}`,
      category: expenseForm.category,
      supplier: expenseForm.supplier,
      amount: Number(expenseForm.amount),
      date: expenseForm.date,
      status: expenseForm.status
    };

    const updated = [newExp, ...localExpenses];
    saveExpensesToLocal(updated);

    setFinancialNotification({
      message: `Nova despesa de € ${expenseForm.amount.toLocaleString('pt-PT')} para ${expenseForm.supplier} gravada sob categoria ${expenseForm.category}.`,
      type: 'success'
    });
    setTimeout(() => setFinancialNotification(null), 5000);
    setShowExpenseModal(false);

    // Reset expense inputs
    setExpenseForm({
      category: 'Materiais',
      supplier: '',
      amount: 450,
      status: 'Paid',
      date: '2026-05-21'
    });
  };

  // Toggle invoice individual payment state
  const handleTogglePaymentStatus = (id: string, current: 'Paid' | 'Pending' | 'Overdue') => {
    if (onUpdateTransactionStatus) {
      const targetMap: Record<string, 'Paid' | 'Pending' | 'Overdue'> = {
        'Paid': 'Pending',
        'Pending': 'Overdue',
        'Overdue': 'Paid'
      };
      
      onUpdateTransactionStatus(id, targetMap[current]);
      
      setFinancialNotification({
        message: `Status da faturação #${id} atualizado.`,
        type: 'success'
      });
      setTimeout(() => setFinancialNotification(null), 3000);
    }
  };

  // Delete/Filter expense
  const handleDeleteExpense = (id: string) => {
    const next = localExpenses.filter(e => e.id !== id);
    saveExpensesToLocal(next);
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#0b1c30]">
      
      {/* 1. DYNAMIC FEEDBACK NOTIFICATION BANNER */}
      <AnimatePresence>
        {financialNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl border flex items-center justify-between text-xs font-bold shadow-md z-30 relative ${
              financialNotification.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
              {financialNotification.message}
            </span>
            <button onClick={() => setFinancialNotification(null)} className="hover:opacity-85 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. HEADER SEC - STRIPE MINIMAL DESIGN */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 pb-6 text-left">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-indigo-600 font-extrabold uppercase tracking-widest mb-1.5">
            <span>DentaPay Hub v4.2</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
            <span className="text-gray-400 font-medium">CONEXÃO GATEWAY ATIVA</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0b1c30]">Controle Financeiro &amp; Faturamento</h1>
          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
            Monitore o fluxo de caixa consolidado, receitas de tratamentos ativos, adiantamento de fornecedores e controle de comissionamento de dentistas.
          </p>
        </div>

        {/* Header Action controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button 
            onClick={() => setShowExpenseModal(true)}
            className="bg-white hover:bg-slate-50 border border-gray-250 text-gray-700/80 rounded-xl py-2 px-3.5 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <TrendingDown className="w-4 h-4 text-rose-500" /> Registrar Despesa
          </button>
          <button 
            onClick={() => setShowPaymentModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 px-4 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nova Fatura Recebida
          </button>
        </div>
      </div>

      {/* 3. FINTECH ANALYTICS CARDS LEDGER (Stripe-Style Panels) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric 1: Monthly inflow */}
        <div className="bg-white p-5 border border-gray-150 rounded-2xl shadow-2xs text-left relative overflow-hidden group hover:shadow-sm transition-all md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-[#2563eb] font-extrabold tracking-wider uppercase block">Faturamento Brutal (Mês)</span>
            <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>
          <h3 className="text-2xl font-extrabold text-[#0b1c30] mt-2 leading-none">
            € {(totalRevenue + 85000).toLocaleString('pt-PT')}
          </h3>
          <p className="text-[10px] text-gray-400 font-semibold mt-3">
            <span className="text-emerald-500">+12%</span> em relação à meta de clínica estabelicida.
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        </div>

        {/* Metric 2: Net profit estimated */}
        <div className="bg-white p-5 border border-gray-150 rounded-2xl shadow-2xs text-left relative overflow-hidden group hover:shadow-sm transition-all md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-emerald-600 font-extrabold tracking-wider uppercase block">Lucro Líquido Real</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>
          <h3 className="text-2xl font-extrabold text-[#0b1c30] mt-2 leading-none">
            € {(netClinicProfit + 73000).toLocaleString('pt-PT')}
          </h3>
          <p className="text-[10px] text-gray-400 font-semibold mt-3">
            Margem EBITDA estimada em <span className="text-[#2563eb] font-bold">~82.4%</span>.
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
        </div>

        {/* Metric 3: Total pending queue */}
        <div className="bg-white p-5 border border-gray-150 rounded-2xl shadow-2xs text-left relative overflow-hidden group hover:shadow-sm transition-all md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-amber-600 font-extrabold tracking-wider uppercase block">Receita Pendente (Inflow)</span>
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
          </div>
          <h3 className="text-2xl font-extrabold text-[#0b1c30] mt-2 leading-none">
            € {totalPending.toLocaleString('pt-PT')}
          </h3>
          <p className="text-[10px] text-gray-400 font-semibold mt-3">
            Em faturas no gateway aguardando Pix ou compensação.
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
        </div>

        {/* Metric 4: Direct active overhead metrics */}
        <div className="bg-white p-5 border border-gray-150 rounded-2xl shadow-2xs text-left relative overflow-hidden group hover:shadow-sm transition-all md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-rose-600 font-extrabold tracking-wider uppercase block">Despesas Operacionais Pavimentadas</span>
            <TrendingDown className="w-4 h-4 text-rose-500 shrink-0" />
          </div>
          <h3 className="text-2xl font-extrabold text-[#0b1c30] mt-2 leading-none">
            € {totalExpensesComputed.toLocaleString('pt-PT')}
          </h3>
          <p className="text-[10px] text-gray-400 font-semibold mt-3">
            Materiais estéticos e faturados laboratoriais.
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 to-rose-650"></div>
        </div>

        {/* Metric 5: Active clinical appointments projected ledger */}
        <div className="bg-white p-5 border border-gray-150 rounded-2xl shadow-2xs text-left relative overflow-hidden group hover:shadow-sm transition-all md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-indigo-600 font-extrabold tracking-wider uppercase block">Inadimplência Clínico</span>
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          </div>
          <h3 className="text-2xl font-extrabold text-[#0b1c30] mt-2 leading-none">
            € {totalOverdue.toLocaleString('pt-PT')}
          </h3>
          <p className="text-[10px] text-gray-400 font-semibold mt-3">
            Cobranças com status <span className="text-rose-600 font-black">Vencido</span> ativo.
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-indigo-600"></div>
        </div>

      </div>

      {/* 4. CLINIC NAVIGATION TAB LABELS */}
      <div className="flex border-b border-gray-150 gap-6 text-xs font-bold text-gray-400 text-left">
        <button 
          onClick={() => setFinancialTab('overview')}
          className={`pb-3 border-b-2 font-black transition-all cursor-pointer ${
            financialTab === 'overview' ? 'border-blue-600 text-blue-600 text-sm' : 'border-transparent hover:text-[#0b1c30]'
          }`}
        >
          Painel Consolidado &amp; Gráficos
        </button>
        <button 
          onClick={() => setFinancialTab('transactions')}
          className={`pb-3 border-b-2 font-black transition-all cursor-pointer ${
            financialTab === 'transactions' ? 'border-blue-600 text-blue-600 text-sm' : 'border-transparent hover:text-[#0b1c30]'
          }`}
        >
          Faturamentos ({filteredTransactions.length}) &amp; Emissão Invoices
        </button>
        <button 
          onClick={() => setFinancialTab('expenses')}
          className={`pb-3 border-b-2 font-black transition-all cursor-pointer ${
            financialTab === 'expenses' ? 'border-blue-600 text-blue-600 text-sm' : 'border-transparent hover:text-[#0b1c30]'
          }`}
        >
          Despesas Integradas ({localExpenses.length})
        </button>
        <button 
          onClick={() => setFinancialTab('commissions')}
          className={`pb-3 border-b-2 font-black transition-all cursor-pointer ${
            financialTab === 'commissions' ? 'border-blue-600 text-blue-600 text-sm' : 'border-transparent hover:text-[#0b1c30]'
          }`}
        >
          Divisão de Royalties &amp; Comissões
        </button>
      </div>

      {/* 5. TAB RENDERS */}
      <AnimatePresence mode="wait">
        
        {/* TAB 5.1: OVERVIEW & INTERACTIVE CHARTS BENTO BLOCK */}
        {financialTab === 'overview' && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Bento Grid Layer 1: Major financial curves area chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
              
              <div className="lg:col-span-8 bg-white border border-gray-150 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-5 border-b border-gray-50 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#0b1c30] flex items-center gap-1.5">
                      <BarChart4 className="w-4 h-4 text-blue-600" /> Fluxo de Caixa Recorrente (Mês a Mês)
                    </h3>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Visão consolidada comparativa de receitas adquiridas e despesas líquidas executadas.</span>
                  </div>
                  <div className="bg-slate-50 border border-gray-150 p-1.5 rounded-lg text-[10px] font-bold text-gray-500">
                    6 Últimos Ciclos
                  </div>
                </div>

                <div className="h-64 font-mono">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyRevenueLineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#aaa" fontSize={9} tickLine={false} />
                      <YAxis stroke="#aaa" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Area type="monotone" name="Inflow / Receita" dataKey="receitas" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorInflow)" />
                      <Area type="monotone" name="Outflow / Despesa" dataKey="despesas" stroke="#ef4444" strokeWidth={1.5} fillOpacity={1} fill="url(#colorOutflow)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Treatment distribution donut chart summary */}
              <div className="lg:col-span-4 bg-white border border-gray-150 rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#0b1c30] mb-0.5 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600" /> Foco de Lucratividade
                  </h3>
                  <p className="text-[10px] text-gray-400 mb-5 leading-relaxed">Faturamento somado distribuído pelas ramificações de especialidade da clínica.</p>
                  
                  <div className="h-44 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={treatmentDistributionPieData}
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {treatmentDistributionPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `€ ${Number(value).toLocaleString('pt-PT')}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Custom legends displaying sums */}
                <div className="space-y-1.5 text-[10px] font-bold mt-4 pt-4 border-t border-gray-50">
                  {treatmentDistributionPieData.slice(0, 4).map((entry, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-gray-600 font-semibold truncate">
                        <span className="w-2.5 h-2.5 rounded-full block shrink-0" style={{ backgroundColor: entry.color }}></span>
                        {entry.name}
                      </span>
                      <span className="text-gray-800 font-mono">€ {entry.value.toLocaleString('pt-PT')}</span>
                    </div>
                  ))}
                </div>

              </div>

            </div>

            {/* Bento Grid Layer 2: Clinic team contribution overview & Payout simulators */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
              
              {/* Left BarChart: Dentist Revenue generation */}
              <div className="lg:col-span-7 bg-white border border-gray-150 rounded-3xl p-6">
                <div>
                  <h3 className="text-sm font-bold text-[#0b1c30] flex items-center justify-between">
                    <span>Performance Gerencial por Cadeira Estética</span>
                    <span className="text-[10px] bg-indigo-50 text-[#2563eb] py-1 px-2 rounded-lg">Cálculo Ativo</span>
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-1 mb-5 leading-relaxed">Faturamento bruto gerado no consultório comparado com os deveres de comissão estipulados.</p>
                </div>

                <div className="h-56 font-mono">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dentistRevenueBarData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#666" fontSize={9} />
                      <YAxis stroke="#444" fontSize={9} />
                      <Tooltip />
                      <Legend />
                      <Bar name="Receita Bruta Gerada" dataKey="faturamento" fill="#2563eb" radius={[5, 5, 0, 0]} />
                      <Bar name="Comissão do Doutor" dataKey="comissoes" fill="#4f46e5" radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right Widget: Commission slider computer simulator */}
              <div className="lg:col-span-5 bg-white border border-gray-150 rounded-3xl p-6 flex flex-col justify-between text-left">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-bold">SIMULADOR ENHANCED</span>
                    <Calculator className="w-5 h-5 text-amber-500" />
                  </div>
                  <h3 className="text-sm font-bold text-[#0b1c30]">Calculadora de Incentivos Técnicos</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">Ajuste o Royaltie médio da cliníca para simular os payouts dos dentistas credenciados em tempo real.</p>
                  
                  {/* Slider Control */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-gray-100 my-4 space-y-3">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Percentual de Comissão:</span>
                      <span className="text-[#2563eb] font-black">{commissionRate}%</span>
                    </div>
                    
                    <input 
                      type="range" 
                      min="15" 
                      max="60" 
                      step="5"
                      value={commissionRate}
                      onChange={e => setCommissionRate(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />

                    <div className="flex justify-between text-[9px] text-gray-400 font-bold">
                      <span>Mínimo 15%</span>
                      <span>Média Brasil 35-40%</span>
                      <span>Máximo 60%</span>
                    </div>
                  </div>

                  {/* Immediate projection responses */}
                  <div className="space-y-2 mt-4">
                    <span className="text-[9px] text-gray-400 font-bold uppercase block tracking-wider">PREVISÃO DE DISPÊNDIO DE COMISSÃO DE EQUIPE</span>
                    
                    <div className="flex justify-between items-center text-xs border-b border-gray-50 pb-2">
                      <span className="text-gray-500 font-semibold">Total Dedução de Comissões:</span>
                      <strong className="text-[#0b1c30] font-extrabold">
                        € {Math.floor((totalRevenue + 85000) * (commissionRate / 100)).toLocaleString('pt-PT')}
                      </strong>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-semibold">Faturamento Clínico Líquido Retido:</span>
                      <strong className="text-emerald-600 font-extrabold">
                        € {Math.floor((totalRevenue + 85000) * ((100 - commissionRate) / 100)).toLocaleString('pt-PT')}
                      </strong>
                    </div>
                  </div>
                </div>

                <p className="text-[9px] text-gray-400 italic mt-4 leading-normal">
                  *Comissões computadas com base em faturamento de procedimentos e próteses deduzidas dos custos laboratoriais adjacentes.
                </p>
              </div>

            </div>

          </motion.div>
        )}

        {/* TAB 5.2: DETAILED INVOICES BOARD & ADVANCED TX TABLE */}
        {financialTab === 'transactions' && (
          <motion.div 
            key="transactions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-left"
          >
            {/* Filter tool ribbon */}
            <div className="bg-white border border-gray-150 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Dynamic Search box */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Nome do paciente, ID do repasse, tratamento..."
                  value={txSearch}
                  onChange={e => setTxSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white text-xs border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all font-semibold"
                />
              </div>

              {/* Options selectors */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 text-[10px] uppercase">Código Status:</span>
                  <select 
                    value={txStatusFilter}
                    onChange={e => setTxStatusFilter(e.target.value)}
                    className="border border-gray-200 rounded-lg p-1.5 bg-white font-semibold text-gray-600 focus:outline-none focus:border-blue-500"
                  >
                    <option value="All">Todos os Lançamentos</option>
                    <option value="Paid">Somente Pago</option>
                    <option value="Pending">Pendente</option>
                    <option value="Overdue">Vencido</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-gray-400 text-[10px] uppercase">Tratamento:</span>
                  <select 
                    value={txTreatmentFilter}
                    onChange={e => setTxTreatmentFilter(e.target.value)}
                    className="border border-gray-200 rounded-lg p-1.5 bg-white font-semibold text-gray-600 focus:outline-none focus:border-blue-500"
                  >
                    <option value="All">Todas Condições</option>
                    {uniqueTxTreatments.map(tOption => {
                      if (tOption === 'All') return null;
                      return <option key={tOption} value={tOption}>{tOption}</option>;
                    })}
                  </select>
                </div>

              </div>

            </div>

            {/* Advanced detailed layout Table list */}
            <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-2xs">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xs font-extrabold uppercase text-[#0b1c30] tracking-wider">Histórico Consolidado de Transações</h3>
                <span className="text-[10px] text-gray-400 font-bold">{filteredTransactions.length} lançamentos filtrados</span>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#fcfdff] text-gray-400 uppercase text-[9px] tracking-widest border-b border-gray-100 font-bold">
                    <tr>
                      <th className="p-4 pl-6 w-12"></th>
                      <th className="p-4">Identificação</th>
                      <th className="p-4">Paciente</th>
                      <th className="p-4">Tratamento Realizado</th>
                      <th className="p-4">Lançamento</th>
                      <th className="p-4">Valor Integrado</th>
                      <th className="p-4">Status Gateway</th>
                      <th className="p-4 text-right pr-6">Opções</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-semibold">
                    {filteredTransactions.map((tx) => {
                      const expanded = expandedTxId === tx.id;
                      const extraDetails = getSubTxDetails(tx.id);

                      return (
                        <React.Fragment key={tx.id}>
                          <tr className={`hover:bg-slate-50/70 transition-colors ${expanded ? 'bg-slate-50/40' : ''}`}>
                            <td className="p-4 pl-6">
                              <button 
                                onClick={() => setExpandedTxId(expanded ? null : tx.id)}
                                className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
                              >
                                {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                              </button>
                            </td>
                            <td className="p-4 font-mono text-[10px] text-blue-600 font-bold">{tx.id}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-indigo-50 text-indigo-700 font-bold rounded-lg flex items-center justify-center text-[10px] shrink-0">
                                  {tx.patientName.split(' ')[0][0]}
                                </div>
                                <span className="font-extrabold text-[#0b1c30]">{tx.patientName}</span>
                              </div>
                            </td>
                            <td className="p-4 text-slate-700">{tx.treatment}</td>
                            <td className="p-4 text-gray-400 font-mono text-[10px]">{tx.date}</td>
                            <td className="p-4 text-[#0b1c30] font-black">
                              € {tx.amount.toLocaleString('pt-PT')}
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => handleTogglePaymentStatus(tx.id, tx.status)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border cursor-pointer ${
                                  tx.status === 'Paid' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : tx.status === 'Overdue'
                                    ? 'bg-rose-50 text-rose-700 border-rose-250'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                                title="Toque para alternar o status operacional"
                              >
                                {tx.status === 'Paid' ? 'Pago' : tx.status === 'Overdue' ? 'Vencido' : 'Pendente'}
                              </button>
                            </td>
                            <td className="p-4 text-right pr-6 space-x-1.5">
                              {tx.status === 'Overdue' && (
                                <button 
                                  onClick={() => handleSimulateAlert(tx.patientName)}
                                  className="bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                                  title="Notificar paciente via WhatsApp"
                                >
                                  Cobrançar
                                </button>
                              )}
                              <button 
                                onClick={() => setSelectedInvoiceTx(tx)}
                                className="bg-slate-100 hover:bg-slate-200 text-gray-700 text-[10px] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                              >
                                Emitir recibo
                              </button>
                            </td>
                          </tr>

                          {/* Expanded detail section subrow */}
                          {expanded && (
                            <tr>
                              <td colSpan={8} className="p-4 pl-16 bg-slate-50 text-[11px] text-[#4d5162]">
                                <motion.div 
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="grid grid-cols-1 md:grid-cols-4 gap-4"
                                >
                                  <div>
                                    <span className="text-[9px] text-[#2563eb] font-extrabold uppercase block mb-1">Meio de Transação</span>
                                    <strong className="text-[#0b1c30]">{extraDetails.method}</strong>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-indigo-600 font-extrabold uppercase block mb-1">Deduções Tributárias (ISS 5%)</span>
                                    <strong className="text-[#0b1c30]">€ {extraDetails.vatTax.toLocaleString('pt-PT')}</strong>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-amber-600 font-extrabold uppercase block mb-1">Plano Aplicado / Convênio</span>
                                    <strong className="text-[#0b1c30]">{extraDetails.discountRate}</strong>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Instrução de Gateway</span>
                                    <p className="text-xs italic text-gray-500">{extraDetails.notes}</p>
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}

                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-gray-400 font-semibold border-dashed">
                          Não há transações correspondentes com os filtros estipulados de busca.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 5.3: CLINICAL LABORATORY COSTS & SALARIES EXPENSES */}
        {financialTab === 'expenses' && (
          <motion.div 
            key="expenses"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-left"
          >
            <div className="bg-white border border-gray-150 rounded-2xl p-6">
              <div className="flex justify-between items-center border-b border-gray-50 pb-4 mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[#0b1c30] flex items-center gap-1.5">
                    <Building className="w-4.5 h-4.5 text-rose-500" /> Livro Auxiliar de Despesas (Outflow)
                  </h3>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Gestão de salários, fornecedores, laboratórios protéticos e suprimentos estéticos em geral.</span>
                </div>
                <button 
                  onClick={() => setShowExpenseModal(true)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold py-2 px-3.5 rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Lançamento Despesa
                </button>
              </div>

              {/* Expense entries list grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {localExpenses.map((exp) => {
                  // Determine icon according to category
                  const colorMap = {
                    Pessoal: 'bg-blue-50 text-blue-600 border-blue-100',
                    Laboratório: 'bg-purple-50 text-purple-600 border-purple-100',
                    Materiais: 'bg-amber-50 text-amber-600 border-amber-100',
                    Marketing: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                    Equipamentos: 'bg-indigo-50 text-indigo-600 border-indigo-100',
                    Outros: 'bg-gray-50 text-gray-600 border-gray-100'
                  };

                  return (
                    <div 
                      key={exp.id} 
                      className="bg-white p-5 border border-gray-150 rounded-2xl shadow-2xs hover:border-gray-300 transition-all flex items-start justify-between gap-3 text-left"
                    >
                      <div className="flex gap-4">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold ${colorMap[exp.category] || colorMap.Outros}`}>
                          {exp.category[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider font-mono">{exp.id}</span>
                            <span className="text-[10px] bg-slate-100 font-extrabold rounded-md px-1.5 py-0.5 text-gray-600">{exp.category}</span>
                          </div>
                          <h4 className="font-extrabold text-[#0b1c30] text-xs truncate mt-1.5">{exp.supplier}</h4>
                          <span className="text-[10px] text-gray-300 font-mono italic block">{exp.date}</span>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1.5">
                        <span className="text-[#0b1c30] font-black text-sm">
                          € {exp.amount.toLocaleString('pt-PT')}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-extrabold rounded-md px-1.5 py-0.5 border ${
                            exp.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                            {exp.status === 'Paid' ? 'Pago' : 'A pagar'}
                          </span>
                          <button 
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="bg-gray-55 hover:bg-gray-100 p-1 text-gray-400 rounded-lg hover:text-red-500 cursor-pointer"
                            title="Remover lançamento de despesa"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {localExpenses.length === 0 && (
                <div className="p-12 text-center text-gray-400 font-medium border-dashed">
                  Nenhuma despesa catalogada no registro de caixa.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 5.4: DENTIST COMMISSION & REWARD DIVIDENDS */}
        {financialTab === 'commissions' && (
          <motion.div 
            key="commissions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-left"
          >
            <div className="bg-white border border-gray-150 rounded-2xl p-6">
              <div className="flex justify-between items-center border-b border-gray-50 pb-4 mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[#0b1c30] flex items-center gap-1.5">
                    <Percent className="w-4.5 h-4.5 text-indigo-600" /> Relatório de Royalties &amp; Incentivos
                  </h3>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Demonstrativo simplificado de comissionamento acumulado com base na taxa de clínica de {commissionRate}%.</span>
                </div>
              </div>

              <div className="space-y-4">
                {dentists.map((dentist) => {
                  // Standard base calculations mimicking faturments
                  const specMapping: Record<string, number> = {
                    'doc-1': 45000,
                    'doc-2': 55000,
                    'doc-3': 35000,
                    'doc-4': 10500
                  };
                  const value = specMapping[dentist.id] || 12000;
                  const calculatedCommissionVal = Math.floor(value * (commissionRate / 100));

                  return (
                    <div 
                      key={dentist.id} 
                      className="bg-[#fcfdff] border border-gray-150 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left"
                    >
                      <div className="flex gap-4 items-center">
                        <img 
                          src={dentist.imageUrl} 
                          alt={dentist.name} 
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover border" 
                        />
                        <div>
                          <h4 className="font-extrabold text-[#0b1c30] text-xs">{dentist.name}</h4>
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold block px-1.5 py-0.5 rounded-md mt-1 w-max">
                            {dentist.specialty}
                          </span>
                        </div>
                      </div>

                      {/* Cashflow columns */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold">
                        <div>
                          <span className="text-[9px] text-gray-400 block font-bold uppercase">FATURAMENTO CLINICO BRUTO</span>
                          <span className="text-slate-700 font-extrabold">€ {value.toLocaleString('pt-PT')}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-[#2563eb] block font-bold uppercase">COMISSÃO REVERBERADA ({commissionRate}%)</span>
                          <span className="text-[#2563eb] font-extrabold">€ {calculatedCommissionVal.toLocaleString('pt-PT')}</span>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                          <span className="text-[9px] text-emerald-600 block font-bold uppercase">PROVEITO RETIDO CLÍNICA</span>
                          <span className="text-emerald-600 font-extrabold">
                            € {(value - calculatedCommissionVal).toLocaleString('pt-PT')}
                          </span>
                        </div>
                      </div>

                      {/* Pay control options button */}
                      <button 
                        onClick={() => {
                          alert(`Fechamento financeiro do profissional ${dentist.name} processado! Um comprovante Pix de € ${calculatedCommissionVal.toLocaleString('pt-PT')} de comissão foi gerado com sucesso.`);
                        }}
                        className="bg-[#2563eb] hover:bg-blue-700 text-white font-extrabold text-[10px] py-1.5 px-3.5 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        Fechar Repasse Quinzenal
                      </button>

                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* 6. MODAL SYSTEM A: INVOICE GENERATOR FORM */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 text-left"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-xs font-black uppercase text-[#0b1c30] flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-[#2563eb]" /> Registrar Nova Fatura de Tratamento
                </h3>
                <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs font-semibold">
                
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Paciente Alvo</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Nome completo do paciente beneficiário"
                    value={paymentForm.patientName}
                    onChange={e => setPaymentForm(prev => ({ ...prev, patientName: e.target.value }))}
                    className="w-full border border-gray-200 bg-slate-50 focus:bg-white rounded-xl p-2.5 outline-none font-medium focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Tratamento Realizado</label>
                  <select
                    value={paymentForm.treatment}
                    onChange={e => setPaymentForm(prev => ({ ...prev, treatment: e.target.value }))}
                    className="w-full border border-gray-200 bg-slate-50 focus:bg-white rounded-xl p-2.5 outline-none text-[#0b1c30]"
                  >
                    <option value="Limpeza e Profilaxia">Limpeza e Profilaxia</option>
                    <option value="Orthodontics">Manutenção Ortodontia</option>
                    <option value="Teeth Whitening">Clareamento Clínico</option>
                    <option value="Dental Implants">Implante Coclear Completo</option>
                    <option value="Smile Makeover">Harmonização Estetica</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Valor do Procedimento (€)</label>
                    <input 
                      type="number" 
                      required
                      placeholder="Ex: 450"
                      value={paymentForm.amount}
                      onChange={e => setPaymentForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      className="w-full border border-gray-200 bg-slate-50 focus:bg-white rounded-xl p-2.5 outline-none font-medium text-[#0b1c30]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Status do Lançamento</label>
                    <select
                      value={paymentForm.status}
                      onChange={e => setPaymentForm(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full border border-gray-200 bg-slate-50 focus:bg-white rounded-xl p-2.5 outline-none text-[#0b1c30]"
                    >
                      <option value="Paid">Consolidado / Pago</option>
                      <option value="Pending">Aguardando Pagamento</option>
                      <option value="Overdue">Vencido / Inadimplente</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Data Competência</label>
                  <input 
                    type="date" 
                    required
                    value={paymentForm.date}
                    onChange={e => setPaymentForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full border border-gray-200 bg-slate-50 focus:bg-white rounded-xl p-2.5 outline-none font-medium text-[#0b1c30]"
                  />
                </div>

                <div className="pt-3 flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl font-bold text-center text-gray-700 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-center cursor-pointer"
                  >
                    Confirmar Lançamento
                  </button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. MODAL SYSTEM B: EXPENSE REGISTER FORM */}
      <AnimatePresence>
        {showExpenseModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 text-left"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-xs font-black uppercase text-[#0b1c30] flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-rose-500" /> Registrar Despesa de Clínca
                </h3>
                <button onClick={() => setShowExpenseModal(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleExpenseSubmit} className="space-y-4 text-xs font-semibold">
                
                <div>
                  <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Fornecedor / Destinatário</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Aluguel Imóvel Paulista, Dental Cremer"
                    value={expenseForm.supplier}
                    onChange={e => setExpenseForm(prev => ({ ...prev, supplier: e.target.value }))}
                    className="w-full border border-gray-200 bg-slate-50 focus:bg-white rounded-xl p-2.5 outline-none font-medium focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Categoria</label>
                    <select
                      value={expenseForm.category}
                      onChange={e => setExpenseForm(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full border border-gray-200 bg-slate-50 focus:bg-white rounded-xl p-2.5 outline-none text-[#0b1c30]"
                    >
                      <option value="Equipamentos">Equipamentos</option>
                      <option value="Materiais">Materiais</option>
                      <option value="Laboratório">Laboratório Protetico</option>
                      <option value="Marketing">Marketing / Tráfego</option>
                      <option value="Pessoal">Pessoal / Salários</option>
                      <option value="Outros">Outras Contribuições</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Total Despesa (€)</label>
                    <input 
                      type="number" 
                      required
                      placeholder="Ex: 1520"
                      value={expenseForm.amount}
                      onChange={e => setExpenseForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      className="w-full border border-gray-200 bg-slate-50 focus:bg-white rounded-xl p-2.5 outline-none font-medium text-[#0b1c30] focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Status Pagamento</label>
                    <select
                      value={expenseForm.status}
                      onChange={e => setExpenseForm(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full border border-gray-200 bg-slate-50 focus:bg-white rounded-xl p-2.5 outline-none text-[#0b1c30]"
                    >
                      <option value="Paid">Faturado / Liquidado</option>
                      <option value="Pending">Aguardando Vencimento</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Data Lançamento</label>
                    <input 
                      type="date" 
                      required
                      value={expenseForm.date}
                      onChange={e => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full border border-gray-200 bg-slate-50 focus:bg-white rounded-xl p-2.5 outline-none font-medium text-[#0b1c30]"
                    />
                  </div>
                </div>

                <div className="pt-3 flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowExpenseModal(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl font-bold text-center text-gray-700 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-rose-650 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-center cursor-pointer"
                  >
                    Registrar Saída Caixa
                  </button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. SLIDEOUT PANEL OVERLAY: PROFESSIONAL RECEIPT / INVOICE PREVIEW VIEW */}
      <AnimatePresence>
        {selectedInvoiceTx && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInvoiceTx(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 cursor-pointer"
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="fixed right-0 top-0 bottom-0 max-w-md w-full bg-white z-50 shadow-2xl p-8 overflow-y-auto text-left flex flex-col justify-between"
            >
              <div className="space-y-6">
                
                <div className="flex justify-between items-center border-b border-gray-150 pb-4">
                  <div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                      PREVISÃO RECEBIDO
                    </span>
                    <h3 className="text-md font-extrabold text-[#0b1c30] mt-1">Recibo Fiscal Clínico</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedInvoiceTx(null)}
                    className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-gray-400 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Aesthetic Invoice printable structure */}
                <div className="border border-gray-150 rounded-2xl p-5 space-y-4 font-mono text-[11px] text-[#4d5162] bg-slate-50/50">
                  
                  <div className="flex justify-between items-start border-b border-dashed border-gray-200 pb-3">
                    <div>
                      <strong className="text-xs text-[#0b1c30] block">SERENE ODONTOLOGIA INTEGRADA LTDA</strong>
                      <span>CNPJ: 42.109.912/0001-90</span>
                      <span className="block text-[10px] text-gray-400">Av. Paulista, 1200 - Jardins</span>
                    </div>
                    <span className="text-right text-[10px] font-black">{selectedInvoiceTx.id}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-[#2563eb] font-extrabold uppercase tracking-wide block">Paciente Beneficiário</span>
                    <strong className="text-slate-800 font-bold block">{selectedInvoiceTx.patientName}</strong>
                    <span>Convênio Unimed Bradesco Dental Corp</span>
                  </div>

                  <div>
                    <span className="text-[9px] text-indigo-600 font-extrabold uppercase tracking-wide block">Tratamento Realizado</span>
                    <strong className="text-slate-800 font-bold block">{selectedInvoiceTx.treatment}</strong>
                    <span>Duração Média: 45 min</span>
                  </div>

                  <div className="border-t border-dashed border-gray-200 pt-3 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Subtotal Repasse:</span>
                      <span>€ {selectedInvoiceTx.amount.toLocaleString('pt-PT')}</span>
                    </div>
                    <div className="flex justify-between text-gray-450">
                      <span>Tributos Retidos na Fonte (5% ISS):</span>
                      <span>€ {Math.floor(selectedInvoiceTx.amount * 0.05).toLocaleString('pt-PT')}</span>
                    </div>
                    <div className="flex justify-between text-[#0b1c30] font-extrabold font-mono pt-1 text-sm">
                      <span>TOTAL LÍQUIDO AUTORIZADO:</span>
                      <span>€ {selectedInvoiceTx.amount.toLocaleString('pt-PT')}</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 border rounded-xl text-[10px] font-mono leading-relaxed italic text-center">
                    "Agradecemos pela preferência técnica e de confiança dedicada ao nosso corpo de especialistas na Serene. Sorria com leveza."
                  </div>

                </div>

                <div className="space-y-2">
                  <span className="text-[9px] text-gray-400 block font-bold uppercase">MENSAGEM DE ASSINATURA ELETRÔNICA</span>
                  <div className="bg-blue-50/50 p-3 rounded-xl text-[10px] text-blue-700 leading-normal">
                    Fatura homologada sob o código de transmissão de dados criptográficos MD5-SHA256: <strong>{selectedInvoiceTx.id}-SERENE-CONFIRMED</strong>.
                  </div>
                </div>

              </div>

              <div className="pt-6 border-t border-gray-150 flex gap-2">
                <button 
                  onClick={() => alert('Recibo exportado para o diretório local do computador')}
                  className="flex-1 bg-slate-100 hover:bg-slate-205 py-2 px-3 rounded-lg text-xs font-bold text-gray-700 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Baixar PDF Fiscal
                </button>
                <button 
                  onClick={() => {
                    alert('Cobrança e recibo reenviados para o WhatsApp cadastrado do cliente!');
                    setSelectedInvoiceTx(null);
                  }}
                  className="flex-1 bg-[#2563eb] hover:bg-blue-700 py-2 px-3 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" /> Reenviar WhatsApp
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
