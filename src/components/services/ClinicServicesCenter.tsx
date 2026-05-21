import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Sparkles, 
  Trash2, 
  Edit3, 
  Layers, 
  Clock, 
  Activity, 
  CheckCircle2, 
  X, 
  Settings, 
  Calendar, 
  TrendingUp, 
  FileText, 
  Sliders, 
  UserCheck, 
  Eye, 
  EyeOff, 
  Heart,
  Briefcase,
  AlertCircle,
  FolderPlus,
  Compass,
  LayoutGrid
} from 'lucide-react';
import { ClinicService, Dentist } from '../../types';

interface ClinicServicesCenterProps {
  services: ClinicService[];
  dentists: Dentist[];
  onAddService: (newSrv: Omit<ClinicService, 'id' | 'bookingCount' | 'revenueGenerated' | 'createdAt'>) => void;
  onUpdateService: (updatedSrv: ClinicService) => void;
  onDeleteService: (id: string) => void;
}

// Default categories
const INITIAL_CATEGORIES = [
  { name: 'Cosmetic Dentistry', label: 'Estética / Cosmética', icon: '💎', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { name: 'Preventive Dentistry', label: 'Odontologia Preventiva', icon: '🧼', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { name: 'Implants', label: 'Próteses & Implantes', icon: '🦷', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { name: 'Orthodontics', label: 'Aparelhos & Ortodontia', icon: '🦷', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { name: 'Emergency Care', label: 'Pronto Atendimento', icon: '🚨', color: 'bg-red-50 text-red-700 border-red-200' }
];

export default function ClinicServicesCenter({
  services,
  dentists,
  onAddService,
  onUpdateService,
  onDeleteService
}: ClinicServicesCenterProps) {
  
  // Custom categories state
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('serene_service_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedComplexity, setSelectedComplexity] = useState<string>('All');

  // Trigger notification modal
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'warn'} | null>(null);

  // Modal setup
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingService, setEditingService] = useState<ClinicService | null>(null);

  // Create Service Form state
  const [serviceForm, setServiceForm] = useState({
    name: '',
    category: 'Preventive Dentistry',
    description: '',
    duration: 45,
    price: 350,
    assignedDentists: [] as string[],
    status: 'Active' as ClinicService['status'],
    onlineBooking: true,
    complexity: 'Low' as ClinicService['complexity'],
    prepTime: 10,
    color: '#3b82f6',
    icon: '✨'
  });

  // Create Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    label: '',
    icon: '✨',
    colorKey: 'rose'
  });

  const triggerToast = (message: string, type: 'success' | 'warn' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Quick stats computed
  const stats = useMemo(() => {
    const activeOnes = services.filter(s => s.status === 'Active');
    const totalBookingsCount = services.reduce((sum, s) => sum + s.bookingCount, 0);
    const totalVal = services.reduce((sum, s) => sum + s.revenueGenerated, 0);
    const avgDuration = activeOnes.length > 0 
      ? Math.round(activeOnes.reduce((sum, s) => sum + s.duration, 0) / activeOnes.length) 
      : 0;
    
    // Most popular treatment
    let topService = 'Limpeza e Profilaxia';
    let maxBook = -1;
    services.forEach(s => {
      if (s.bookingCount > maxBook) {
        maxBook = s.bookingCount;
        topService = s.name;
      }
    });

    return {
      activeCount: activeOnes.length,
      avgDuration,
      totalIncome: totalVal,
      topService,
      totalBookingsCount
    };
  }, [services]);

  // Main filter
  const filteredServices = useMemo(() => {
    return services.filter(s => {
      // Exclude archived from main list view, keep historical
      if (s.status === 'Archived') return false;

      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.description.toLowerCase().includes(search.toLowerCase());
      
      const matchCat = selectedCategory === 'All' || s.category === selectedCategory;
      const matchStatus = selectedStatus === 'All' || s.status === selectedStatus;
      const matchComp = selectedComplexity === 'All' || s.complexity === selectedComplexity;

      return matchSearch && matchCat && matchStatus && matchComp;
    });
  }, [services, search, selectedCategory, selectedStatus, selectedComplexity]);

  // Handle toggle online visible
  const handleToggleOnlineBooking = (srv: ClinicService) => {
    const updated = {
      ...srv,
      onlineBooking: !srv.onlineBooking
    };
    onUpdateService(updated);
    triggerToast(`Visibilidade do agendamento on-line de "${srv.name}" foi alterado para ${updated.onlineBooking ? 'Visível' : 'Oculto'}.`);
  };

  // Handle toggle operational state
  const handleToggleStatus = (srv: ClinicService) => {
    const nextStates: Record<ClinicService['status'], ClinicService['status']> = {
      Active: 'Hidden',
      Hidden: 'Draft',
      Draft: 'Active',
      Archived: 'Archived'
    };
    const nextState = nextStates[srv.status];
    const updated = { ...srv, status: nextState };
    onUpdateService(updated);
    triggerToast(`Status do tratamento "${srv.name}" alterado para "${nextState}".`);
  };

  // Submit new treatment catalog record
  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.name || !serviceForm.price) {
      triggerToast('Preencha os dados curriculares obrigatórios.', 'warn');
      return;
    }

    if (editingService) {
      // Execute edit
      const updated: ClinicService = {
        ...editingService,
        ...serviceForm
      };
      onUpdateService(updated);
      triggerToast(`Tratamento de "${serviceForm.name}" atualizado de forma síncrona.`);
      setEditingService(null);
    } else {
      // Execute create
      onAddService({
        name: serviceForm.name,
        category: serviceForm.category,
        description: serviceForm.description || 'Nenhuma instrução clínica definida.',
        duration: Number(serviceForm.duration),
        price: Number(serviceForm.price),
        assignedDentists: serviceForm.assignedDentists.length > 0 ? serviceForm.assignedDentists : [dentists[0]?.name || 'Dr. Sarah Jenkins'],
        status: serviceForm.status,
        onlineBooking: serviceForm.onlineBooking,
        complexity: serviceForm.complexity,
        prepTime: Number(serviceForm.prepTime),
        color: serviceForm.color,
        icon: serviceForm.icon
      });
      triggerToast(`Serviço de "${serviceForm.name}" integrado ao cadastro global.`);
    }

    setShowCreateModal(false);
    // Reset inputs
    setServiceForm({
      name: '',
      category: 'Preventive Dentistry',
      description: '',
      duration: 45,
      price: 350,
      assignedDentists: [],
      status: 'Active',
      onlineBooking: true,
      complexity: 'Low',
      prepTime: 10,
      color: '#3b82f6',
      icon: '✨'
    });
  };

  // Open modal for editing
  const handleStartEdit = (srv: ClinicService) => {
    setEditingService(srv);
    setServiceForm({
      name: srv.name,
      category: srv.category,
      description: srv.description,
      duration: srv.duration,
      price: srv.price,
      assignedDentists: srv.assignedDentists,
      status: srv.status,
      onlineBooking: srv.onlineBooking,
      complexity: srv.complexity,
      prepTime: srv.prepTime,
      color: srv.color,
      icon: srv.icon || '✨'
    });
    setShowCreateModal(true);
  };

  // Quick category registration submit
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name || !categoryForm.label) return;

    const colors: Record<string, string> = {
      rose: 'bg-rose-50 text-rose-700 border-rose-200',
      emerald: 'bg-emerald-50 text-emerald-700 border-[#6ee7b7]',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      amber: 'bg-amber-50 text-amber-700 border-amber-200',
      indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    };

    const newCat = {
      name: categoryForm.name,
      label: categoryForm.label,
      icon: categoryForm.icon,
      color: colors[categoryForm.colorKey] || 'bg-gray-50 text-gray-700'
    };

    const updated = [...categories, newCat];
    setCategories(updated);
    localStorage.setItem('serene_service_categories', JSON.stringify(updated));

    triggerToast(`Categoria funcional "${categoryForm.label}" habilitada.`);
    setShowCategoryModal(false);
    setCategoryForm({ name: '', label: '', icon: '✨', colorKey: 'rose' });
  };

  // Toggle dentist selection in form
  const handleToggleDentistInForm = (dentistName: string) => {
    setServiceForm(prev => {
      const matchIdx = prev.assignedDentists.indexOf(dentistName);
      if (matchIdx >= 0) {
        return {
          ...prev,
          assignedDentists: prev.assignedDentists.filter(d => d !== dentistName)
        };
      } else {
        return {
          ...prev,
          assignedDentists: [...prev.assignedDentists, dentistName]
        };
      }
    });
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#0b1c30]">
      
      {/* 1. TOAST ALERTS OVERLAY */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-4 text-xs font-bold shadow-md z-30 relative ${
              notification.type === 'success' 
                ? 'bg-blue-50 text-blue-900 border-blue-200' 
                : 'bg-amber-50 text-amber-950 border-amber-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-blue-500 shrink-0" />
              {notification.message}
            </span>
            <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-gray-600 transition-colors pointer-events-auto cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. PREMIUM HEADER BLOCK */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 pb-6 text-left">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-indigo-600 font-extrabold uppercase tracking-widest mb-1.5">
            <span>DentaFlow Core Service Orchestrator</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-ping"></span>
            <span className="text-gray-400 font-medium font-mono">INTEGRAÇÃO DE CONSULTÓRIO EM TEMPO REAL</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0b1c30]">Gestão de Serviços &amp; Tratamentos</h1>
          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
            Cadastre terapias odontológicas, regule preços de procedimentos, gerencie visibilidade no site e agende consultas com alocação sincronizada.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button 
            onClick={() => setShowCategoryModal(true)}
            className="bg-white hover:bg-slate-50 border border-gray-250 text-gray-700/80 rounded-xl py-2 px-3.5 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-purple-500" /> Nova Categoria
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 px-4 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Criar Tratamento
          </button>
        </div>
      </div>

      {/* 3. BENTO-BOX PREMIUM SERVICES ANALYTICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Clinical catalog strength */}
        <div className="bg-white p-5 border border-gray-150 rounded-2xl shadow-2xs text-left relative overflow-hidden group hover:shadow-sm transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="text-[9px] text-indigo-600 font-extrabold tracking-wider uppercase block">Tratamentos Ativos</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <h3 className="text-3xl font-extrabold text-[#0b1c30] mt-2 leading-none">
            {stats.activeCount} <span className="text-xs text-slate-400 font-normal">especialidades</span>
          </h3>
          <p className="text-[10px] text-gray-400 font-semibold mt-3">
            Sincronizados com a página <span className="text-[#2563eb] font-bold">Public Booking</span> do site.
          </p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12 opacity-30 select-none pointer-events-none"></div>
        </div>

        {/* Metric 2: Popular treatment */}
        <div className="bg-white p-5 border border-gray-150 rounded-2xl shadow-2xs text-left relative overflow-hidden group hover:shadow-sm transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="text-[9px] text-[#2563eb] font-extrabold tracking-wider uppercase block">Procedimento Mais Procurado</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-xl font-extrabold text-[#0b1c30] mt-2 leading-tight truncate">
            {stats.topService}
          </h3>
          <p className="text-[10px] text-gray-400 font-semibold mt-3">
            Responsável por <span className="text-emerald-500 font-bold">{stats.totalBookingsCount}</span> agendamentos este ano.
          </p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 opacity-30 select-none pointer-events-none"></div>
        </div>

        {/* Metric 3: Total aggregated book value */}
        <div className="bg-white p-5 border border-gray-150 rounded-2xl shadow-2xs text-left relative overflow-hidden group hover:shadow-sm transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="text-[9px] text-emerald-600 font-extrabold tracking-wider uppercase block">Receita Acumulada</span>
            <TrendingUp className="w-4 h-4 text-emerald-500 animate-pulse" />
          </div>
          <h3 className="text-3xl font-extrabold text-[#0b1c30] mt-2 leading-none">
            € {stats.totalIncome.toLocaleString('pt-PT')}
          </h3>
          <p className="text-[10px] text-gray-400 font-semibold mt-3">
            Receita total rastreada sob faturamento médico.
          </p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-12 -mt-12 opacity-30 select-none pointer-events-none"></div>
        </div>

        {/* Metric 4: Average consultation window */}
        <div className="bg-white p-5 border border-gray-150 rounded-2xl shadow-2xs text-left relative overflow-hidden group hover:shadow-sm transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="text-[9px] text-amber-600 font-extrabold tracking-wider uppercase block">Duração Média</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-3xl font-extrabold text-[#0b1c30] mt-2 leading-none">
            {stats.avgDuration} <span className="text-xs text-slate-400 font-normal">minutos</span>
          </h3>
          <p className="text-[10px] text-gray-400 font-semibold mt-3">
            Tempo otimizado para preparação higiênica.
          </p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -mr-12 -mt-12 opacity-30 select-none pointer-events-none"></div>
        </div>

      </div>

      {/* 4. RIBBON INTERACTIVE FILTER PANEL */}
      <div className="bg-white border border-gray-150 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Dynamic Search box */}
        <div className="relative flex-1 max-w-sm text-left">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Pesquisar por especialidade ou sintoma..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white text-xs border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all font-semibold text-[#0b1c30]"
          />
        </div>

        {/* Options filters */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold">
          
          <div className="flex items-center gap-1">
            <span className="text-gray-400 text-[10px] uppercase">Categoria:</span>
            <select 
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="border border-gray-200 rounded-lg p-1.5 bg-white font-semibold text-gray-600 focus:outline-none focus:border-blue-500 text-xs"
            >
              <option value="All">Todas</option>
              {categories.map(c => (
                <option key={c.name} value={c.name}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-gray-400 text-[10px] uppercase">Status:</span>
            <select 
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="border border-gray-200 rounded-lg p-1.5 bg-white font-semibold text-gray-600 focus:outline-none focus:border-blue-500 text-xs"
            >
              <option value="All">Todos</option>
              <option value="Active">Ativo</option>
              <option value="Hidden">Oculto</option>
              <option value="Draft">Rascunho</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-gray-400 text-[10px] uppercase">Complexidade:</span>
            <select 
              value={selectedComplexity}
              onChange={e => setSelectedComplexity(e.target.value)}
              className="border border-gray-200 rounded-lg p-1.5 bg-white font-semibold text-gray-600 focus:outline-none focus:border-blue-500 text-xs"
            >
              <option value="All">Toda Complexidade</option>
              <option value="Low">Baixa</option>
              <option value="Medium">Média</option>
              <option value="High">Alta</option>
            </select>
          </div>

        </div>

      </div>

      {/* 5. PRIMARY SERVICE GRID / CATALOG OPERATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        {filteredServices.map((srv) => {
          const matchCatData = categories.find(c => c.name === srv.category) || {
            label: srv.category,
            color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            icon: '🦷'
          };

          return (
            <div 
              key={srv.id}
              className="bg-white border border-gray-150 rounded-2xl p-6 shadow-2xs hover:shadow-sm hover:border-blue-200 transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              <span className={`absolute top-0 right-0 w-2.5 h-2.5 rounded-full mt-5 mr-5 block ${
                srv.status === 'Active' ? 'bg-emerald-500' : srv.status === 'Hidden' ? 'bg-amber-500' : 'bg-slate-400'
              }`} title={`Status: ${srv.status}`} />

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{srv.icon || '✨'}</span>
                  <div>
                    <span className="text-[9px] font-mono text-gray-400">ID: {srv.id}</span>
                    <span className={`px-2 py-0.5 rounded-md border text-[9px] font-extrabold uppercase ml-2 block sm:inline-block ${matchCatData.color}`}>
                      {matchCatData.icon} {matchCatData.label}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-extrabold text-sm text-[#0b1c30] group-hover:text-blue-600 transition-colors">
                    {srv.name}
                  </h3>
                  <p className="text-[11px] text-gray-400 font-medium leading-normal mt-1 min-h-12 line-clamp-3">
                    {srv.description}
                  </p>
                </div>

                {/* Technical stats ledger */}
                <div className="grid grid-cols-3 gap-2 py-3.5 my-3.5 border-t border-b border-gray-50 text-center font-mono">
                  <div>
                    <span className="text-[8px] text-gray-400 uppercase font-sans font-bold block mb-0.5">Duração</span>
                    <strong className="text-xs text-[#0b1c30] font-black">{srv.duration} min</strong>
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-400 uppercase font-sans font-bold block mb-0.5">Complexity</span>
                    <strong className={`text-[10px] px-1 py-0.5 rounded-sm font-extrabold ${
                      srv.complexity === 'High' ? 'text-rose-600' : srv.complexity === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>{srv.complexity}</strong>
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-400 uppercase font-sans font-bold block mb-0.5">Preço Base</span>
                    <strong className="text-xs text-blue-600 font-black">€ {srv.price}</strong>
                  </div>
                </div>

                {/* Dentists assigned list */}
                <div className="text-[10px] space-y-1">
                  <span className="text-gray-400 uppercase font-bold text-[8px] block">CORPO CLÍNICO DESIGNADO</span>
                  <div className="flex flex-wrap gap-1">
                    {srv.assignedDentists.map((dName, idx) => (
                      <span key={idx} className="bg-slate-100/80 hover:bg-slate-100 text-[#434655] px-2 py-1 rounded font-semibold transition-colors">
                        👤 {dName}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Bottom control row */}
              <div className="mt-6 pt-4 border-t border-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-4 text-[11px] font-bold">
                
                {/* Bookings sum */}
                <div className="text-left">
                  <span className="text-[9px] text-[#4d5162] font-medium block">HISTÓRICO</span>
                  <p className="text-xs">
                    <strong className="text-blue-600">{srv.bookingCount}</strong> agendamentos
                  </p>
                </div>

                {/* Operations buttons */}
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => handleToggleOnlineBooking(srv)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      srv.onlineBooking 
                        ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100' 
                        : 'bg-slate-50 border-slate-200 text-gray-400 hover:bg-slate-100'
                    }`}
                    title={srv.onlineBooking ? 'Disponível para agendamento on-line' : 'Indisponível para agendamento on-line'}
                  >
                    {srv.onlineBooking ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  <button 
                    onClick={() => handleToggleStatus(srv)}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-gray-600 rounded-lg transition-colors cursor-pointer text-[10px] font-extrabold uppercase font-mono"
                    title="Mudar Status"
                  >
                    {srv.status === 'Active' ? ' Ativo' : srv.status === 'Hidden' ? 'Oculto' : 'Draft'}
                  </button>

                  <button 
                    onClick={() => handleStartEdit(srv)}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#0b1c30] rounded-lg transition-colors cursor-pointer"
                    title="Editar Tratamento"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button 
                    onClick={() => {
                      if (confirm(`Deseja arquivar e desativar o tratamento "${srv.name}"?`)) {
                        onDeleteService(srv.id);
                        triggerToast(`Serviço de "${srv.name}" arquivado com sucesso no histórico.`);
                      }
                    }}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title="Arquivar Tratamento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>
          );
        })}

        {filteredServices.length === 0 && (
          <div className="col-span-1 md:col-span-3 bg-white border border-dashed border-gray-200 p-16 rounded-3xl text-center text-gray-400 font-semibold shadow-2xs space-y-2">
            <LayoutGrid className="w-8 h-8 mx-auto text-gray-300 animate-pulse" />
            <p>Nenhuma especialidade odontológica ativa condiz com os critérios de filtragem ativos.</p>
          </div>
        )}
      </div>

      {/* 6. CREATE / EDIT TREATMENT MODAL (Apple-Style Form) */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-left">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-gray-150 shadow-2xl w-full max-w-5xl overflow-hidden max-h-[95vh]"
            >
              {/* Modal header */}
              <div className="bg-[#fcfdff] p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-4">
                <div>
                  <h3 className="font-extrabold text-base text-[#0b1c30]">
                    {editingService ? `Editar Configurações: ${serviceForm.name}` : 'Registrar Nova Especialidade Odontológica'}
                  </h3>
                  <span className="text-[11px] text-gray-400">Insira a codificação clínica do tratamento para sincronização automática com o gateway de agendamento online.</span>
                </div>
                <button 
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingService(null);
                  }}
                  className="bg-slate-100 text-gray-450 hover:text-gray-800 p-2 rounded-full cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Layout Grid containing Live fields and Card Preview on Right */}
              <form onSubmit={serviceFormSubmitLogic} className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto max-h-[80vh]">
                
                {/* Form fields: 7 Columns */}
                <div className="lg:col-span-7 p-8 space-y-5 border-r border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-extrabold uppercase tracking-wide text-gray-500 block mb-1">Nome do Tratamento / Serviço</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: Botox Odontológico Funcional"
                        value={serviceForm.name}
                        onChange={e => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-slate-50 focus:bg-white text-xs p-2.5 border border-gray-250 rounded-xl focus:border-blue-500 focus:outline-none transition-all font-semibold text-[#0b1c30]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold uppercase tracking-wide text-gray-500 block mb-1">Categoria Funcional</label>
                      <select 
                        value={serviceForm.category}
                        onChange={e => setServiceForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-slate-50 focus:bg-white text-xs p-2.5 border border-gray-250 rounded-xl focus:border-blue-500 focus:outline-none transition-all font-semibold text-gray-650"
                      >
                        {categories.map(c => (
                          <option key={c.name} value={c.name}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-wide text-gray-500 block mb-1">Descritivo Comercial e Clínico (Site Público)</label>
                    <textarea 
                      rows={3}
                      placeholder="Indicações, recomendações preventivas e escopo operacional detalhado..."
                      value={serviceForm.description}
                      onChange={e => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-slate-50 focus:bg-white text-xs p-2.5 border border-gray-250 rounded-xl focus:border-blue-500 focus:outline-none transition-all font-semibold text-gray-700"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-extrabold uppercase tracking-wide text-gray-500 block mb-1">Preço Base (BRL)</label>
                      <input 
                        type="number" 
                        required
                        placeholder="Ex: 450"
                        value={serviceForm.price}
                        onChange={e => setServiceForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                        className="w-full bg-slate-50 focus:bg-white text-xs p-2.5 border border-gray-250 rounded-xl focus:border-blue-500 focus:outline-none transition-all font-semibold text-[#0b1c30]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold uppercase tracking-wide text-gray-500 block mb-1">Duração (Minutos)</label>
                      <select 
                        value={serviceForm.duration}
                        onChange={e => setServiceForm(prev => ({ ...prev, duration: Number(e.target.value) }))}
                        className="w-full bg-slate-50 focus:bg-white text-xs p-2.5 border border-gray-250 rounded-xl focus:border-blue-500 focus:outline-none transition-all font-semibold text-gray-700"
                      >
                        <option value={15}>15 minutos</option>
                        <option value={30}>30 minutos</option>
                        <option value={45}>45 minutos</option>
                        <option value={60}>60 minutos (1h)</option>
                        <option value={90}>90 minutos (1h30)</option>
                        <option value={120}>120 minutos (2h)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold uppercase tracking-wide text-gray-500 block mb-1">Preparação Clínicos</label>
                      <select 
                        value={serviceForm.prepTime}
                        onChange={e => setServiceForm(prev => ({ ...prev, prepTime: Number(e.target.value) }))}
                        className="w-full bg-slate-50 focus:bg-white text-xs p-2.5 border border-gray-250 rounded-xl focus:border-blue-500 focus:outline-none transition-all font-semibold text-gray-700"
                      >
                        <option value={5}>5 min</option>
                        <option value={10}>10 min</option>
                        <option value={15}>15 min</option>
                        <option value={20}>20 min</option>
                        <option value={30}>30 min</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-extrabold uppercase tracking-wide text-gray-500 block mb-1">Complexidade Operatória</label>
                      <div className="flex gap-2">
                        {['Low', 'Medium', 'High'].map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setServiceForm(prev => ({ ...prev, complexity: c as ClinicService['complexity'] }))}
                            className={`flex-1 py-2 text-center text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                              serviceForm.complexity === c 
                                ? 'bg-indigo-50 border-indigo-500 text-[#2563eb]' 
                                : 'bg-slate-50 border-slate-200 text-gray-500 hover:bg-slate-100'
                            }`}
                          >
                            {c === 'Low' ? 'Baixa' : c === 'Medium' ? 'Média' : 'Alta'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-extrabold uppercase tracking-wide text-gray-500 block mb-1">Emoji / Icone</label>
                        <input 
                          type="text" 
                          placeholder="💄"
                          value={serviceForm.icon}
                          onChange={e => setServiceForm(prev => ({ ...prev, icon: e.target.value }))}
                          className="w-full bg-slate-50 focus:bg-white text-center text-xs p-2.5 border border-gray-250 rounded-xl focus:border-blue-500 focus:outline-none transition-all font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold uppercase tracking-wide text-gray-500 block mb-1">Filtro Cor</label>
                        <input 
                          type="color" 
                          value={serviceForm.color}
                          onChange={e => setServiceForm(prev => ({ ...prev, color: e.target.value }))}
                          className="w-full h-9 bg-slate-50 border border-gray-250 rounded-xl p-0.5 cursor-pointer accent-blue-600 block"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Schedulers dentist multi checkbox selection */}
                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-wide text-gray-500 block mb-1.5">Profissionais Habilitados no Corpo Clínico</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {dentists.map(d => {
                        const isAssigned = serviceForm.assignedDentists.includes(d.name);
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => handleToggleDentistInForm(d.name)}
                            className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                              isAssigned 
                                ? 'bg-emerald-50/50 border-emerald-500 text-emerald-950 font-bold' 
                                : 'bg-slate-50 border-slate-150 text-gray-500 hover:bg-slate-100 font-medium'
                            }`}
                          >
                            <span className="text-[10px]">{isAssigned ? '✅' : '⬜'}</span>
                            <div className="min-w-0">
                              <span className="block truncate text-[#0b1c30]">{d.name}</span>
                              <span className="text-[9px] text-gray-400 font-mono block truncate">{d.specialty}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Operational Settings toggles */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-gray-150 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-4 text-xs">
                      <div>
                        <span className="font-extrabold text-[#0b1c30] block">Agendamento Online</span>
                        <span className="text-[10px] text-gray-400">Disponível no site público</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={serviceForm.onlineBooking}
                        onChange={e => setServiceForm(prev => ({ ...prev, onlineBooking: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 cursor-pointer accent-blue-600 shrink-0"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-4 text-xs">
                      <div>
                        <span className="font-extrabold text-[#0b1c30] block">Ativo Operacional</span>
                        <span className="text-[10px] text-gray-400">Pronto para atendimento</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={serviceForm.status === 'Active'}
                        onChange={e => setServiceForm(prev => ({ ...prev, status: e.target.checked ? 'Active' : 'Hidden' }))}
                        className="w-4 h-4 text-blue-600 cursor-pointer accent-blue-600 shrink-0"
                      />
                    </div>
                  </div>

                </div>

                {/* Live Preview UI Widget: 5 Columns */}
                <div className="lg:col-span-5 bg-[#fafbfe] p-8 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] text-[#2563eb] font-extrabold uppercase tracking-widest block mb-4">LIVE SERVICE PREVIEW CARD</span>
                    
                    {/* Render exact layout match from treatments cards */}
                    <div className="bg-white border-2 border-dashed border-gray-250 p-6 rounded-3xl text-left shadow-md bg-radial from-white to-slate-50 relative overflow-hidden">
                      <span className="absolute top-0 right-0 w-3 h-3 rounded-full mt-6 mr-6 block bg-emerald-500" />

                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{serviceForm.icon || '✨'}</span>
                        <div>
                          <span className="text-[8px] font-mono text-indigo-500 uppercase block tracking-wider">Visualização Prévia</span>
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-indigo-100 text-[#2563eb] block">
                            {serviceForm.category}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-black text-sm text-[#0b1c30]">{serviceForm.name || 'Nome do Tratamento'}</h4>
                        <p className="text-[10.5px] text-gray-400 font-medium leading-normal mt-1 min-h-12">
                          {serviceForm.description || 'Preencha o campo descritivo acima para renderizar os dados clínicos e operantes.'}
                        </p>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-2 gap-2 p-3 my-4 bg-slate-50 rounded-xl text-center text-[10px] font-mono border border-slate-100">
                        <div>
                          <span className="text-[8px] text-gray-400 font-bold block uppercase font-sans">DURAÇÃO</span>
                          <strong className="text-[#0b1c30]">{serviceForm.duration} min</strong>
                        </div>
                        <div>
                          <span className="text-[8px] text-gray-400 font-bold block uppercase font-sans">VALOR BASE</span>
                          <strong className="text-blue-600">€ {serviceForm.price || 0}</strong>
                        </div>
                      </div>

                      {/* In charge */}
                      <div className="space-y-1 text-[10px]">
                        <span className="text-[8px] text-gray-400 font-bold block uppercase">MÉDICOS RESPONSÁVEIS</span>
                        <div className="flex flex-wrap gap-1">
                          {serviceForm.assignedDentists.length > 0 
                            ? serviceForm.assignedDentists.map((d, index) => (
                                <span key={index} className="bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-gray-650">
                                  👤 {d}
                                </span>
                              ))
                            : <span className="text-gray-400 italic font-medium">Nenhum médico selecionado</span>
                          }
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-[10.5px] text-indigo-950 font-bold leading-relaxed">
                      💡 <strong>Sincronização Ativa:</strong> O DentaFlow mapeia este tratamento ao sistema financeiro (comissões dos dentistas, tributações de recibos de faturamento), ao formulário de agendamento online e aos prontuários clínicos instantaneamente.
                    </div>
                  </div>

                  {/* Submission triggers */}
                  <div className="pt-6 border-t border-gray-150 flex items-center justify-end gap-2 text-xs font-bold mt-8">
                    <button 
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setEditingService(null);
                      }}
                      className="bg-white hover:bg-slate-100 border border-gray-250 text-gray-600 rounded-xl py-2 px-4 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 px-5 shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" /> {editingService ? 'Salvar Alterações' : 'Gravar Tratamento'}
                    </button>
                  </div>

                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. CREATE NEW CATEGORY OPTIONAL DIALOG */}
      <AnimatePresence>
        {showCategoryModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-left">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-gray-150 shadow-xl w-full max-w-md p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-3 mb-4 pb-2 border-b border-gray-50">
                <h3 className="font-extrabold text-[#0b1c30] text-sm flex items-center gap-1.5">
                  <FolderPlus className="w-4 h-4 text-purple-600" /> Cadastrar Categoria Funcional
                </h3>
                <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCategorySubmit} className="space-y-4 text-xs font-bold text-gray-500">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Código de Identificação (Sem espaços)</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ex: PediatricDentistry"
                    value={categoryForm.name}
                    onChange={e => setCategoryForm(prev => ({ ...prev, name: e.target.value.replace(/\s+/g, '') }))}
                    className="w-full bg-slate-50 text-xs p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 text-[#0b1c30] font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Título Amigável (Nome de exibição)</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ex: Odontopediatria Especializada"
                    value={categoryForm.label}
                    onChange={e => setCategoryForm(prev => ({ ...prev, label: e.target.value }))}
                    className="w-full bg-slate-50 text-xs p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 text-[#0b1c30] font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Emoji / Icone</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="👶"
                      value={categoryForm.icon}
                      onChange={e => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                      className="w-full bg-slate-50 text-center text-xs p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 text-[#0b1c30] font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Tom de Cor</label>
                    <select 
                      value={categoryForm.colorKey} 
                      onChange={e => setCategoryForm(prev => ({ ...prev, colorKey: e.target.value }))}
                      className="w-full bg-slate-50 text-xs p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 text-gray-700 font-semibold"
                    >
                      <option value="rose">Rosa Suave</option>
                      <option value="emerald">Verde Esmeralda</option>
                      <option value="purple">Roxo Prótese</option>
                      <option value="cyan">Ciano Alinhadores</option>
                      <option value="amber">Âmbar Geral</option>
                      <option value="indigo">Índigo Cirurgia</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex justify-end gap-2 font-bold">
                  <button 
                    type="button" 
                    onClick={() => setShowCategoryModal(false)}
                    className="bg-white border border-gray-250 text-gray-600 rounded-lg px-3 py-1.5 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="bg-[#2563eb] text-white rounded-lg px-4 py-1.5 hover:bg-blue-700 transition-all cursor-pointer"
                  >
                    Registrar Categoria
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );

  // Dynamic helper form submit validation
  function serviceFormSubmitLogic(e: React.FormEvent) {
    handleServiceSubmit(e);
  }
}
