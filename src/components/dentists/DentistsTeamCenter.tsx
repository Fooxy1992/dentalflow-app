import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Plus, 
  Award, 
  Clock, 
  Smile, 
  Calendar, 
  Activity, 
  MoreVertical, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  Star, 
  TrendingUp, 
  Mail, 
  Phone, 
  ShieldAlert, 
  Briefcase, 
  UserCheck, 
  FileText, 
  Sparkles,
  Heart,
  BookOpen,
  DollarSign,
  Coffee,
  HelpCircle,
  ThumbsUp,
  Sliders,
  BellRing
} from 'lucide-react';
import { Dentist, Appointment, Patient } from '../../types';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  LineChart, 
  Line, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';

interface DentistsTeamCenterProps {
  dentists: Dentist[];
  appointments: Appointment[];
  patients: Patient[];
  onAddDentist: (dentist: Omit<Dentist, 'id'>) => void;
  onUpdateDentistStatus?: (id: string, status: 'Available' | 'On Leave') => void;
}

// Highly descriptive mock metadata for our dentists to make the EHR experience ultra-premium and realistic
const DENTIST_EXTRAS: Record<string, {
  experience: number;
  contactMobile: string;
  contactEmail: string;
  crmLicense: string;
  graduatedFrom: string;
  satisfactionRate: number;
  consultationCount: number;
  revenueEst: number;
  todayLoadPercent: number; // 0 to 100
  availabilityDetail: 'Available' | 'In Consultation' | 'Break' | 'Surgery' | 'On Leave' | 'Fully Booked';
  skills: string[];
  certifications: string[];
  monthlyPerformances: Array<{ month: string; consultas: number; faturamento: number }>;
}> = {
  'dentist-1': {
    experience: 12,
    contactMobile: '(11) 98221-0099',
    contactEmail: 'sarah.jenkins@dentaflow.co',
    crmLicense: 'CRO-SP 129482',
    graduatedFrom: 'USP - Universidade de São Paulo',
    satisfactionRate: 99.4,
    consultationCount: 342,
    revenueEst: 84300,
    todayLoadPercent: 80,
    availabilityDetail: 'In Consultation',
    skills: ['Odontopediatria', 'Ortodontia Invisalign', 'Laserterapia'],
    certifications: ['Invisalign Diamond Provider', 'Laser Dentistry Gold Certificate'],
    monthlyPerformances: [
      { month: 'Jan', consultas: 28, faturamento: 12000 },
      { month: 'Fev', consultas: 35, faturamento: 15400 },
      { month: 'Mar', consultas: 42, faturamento: 18200 },
      { month: 'Abr', consultas: 38, faturamento: 16500 },
      { month: 'Mai', consultas: 44, faturamento: 20200 },
    ]
  },
  'dentist-2': {
    experience: 8,
    contactMobile: '(11) 97711-2321',
    contactEmail: 'marcus.reynolds@dentaflow.co',
    crmLicense: 'CRO-SP 883192',
    graduatedFrom: 'UNICAMP - Odontologia',
    satisfactionRate: 98.1,
    consultationCount: 220,
    revenueEst: 110900,
    todayLoadPercent: 65,
    availabilityDetail: 'Available',
    skills: ['Implantes Dentários', 'Cirurgia Bucomaxilofacial', 'Enxertos Ósseos'],
    certifications: ['Fellow of International Congress of Oral Implantologists', 'Avançado Anatomia de Harvard'],
    monthlyPerformances: [
      { month: 'Jan', consultas: 18, faturamento: 22000 },
      { month: 'Fev', consultas: 20, faturamento: 25000 },
      { month: 'Mar', consultas: 15, faturamento: 19000 },
      { month: 'Abr', consultas: 24, faturamento: 29900 },
      { month: 'Mai', consultas: 22, faturamento: 28000 },
    ]
  },
  'dentist-3': {
    experience: 6,
    contactMobile: '(11) 98112-9988',
    contactEmail: 'emily.chen@dentaflow.co',
    crmLicense: 'CRO-SP 443210',
    graduatedFrom: 'UNESP - Faculdade de Odontologia',
    satisfactionRate: 97.5,
    consultationCount: 198,
    revenueEst: 54100,
    todayLoadPercent: 95,
    availabilityDetail: 'Fully Booked',
    skills: ['Estética Dental', 'Lentes de Contato de Porcelana', 'Harmonização Facial'],
    certifications: ['DSD (Digital Smile Design) Certified Master', 'Toxina Botulínica Reconhecida pelo CFO'],
    monthlyPerformances: [
      { month: 'Jan', consultas: 22, faturamento: 9000 },
      { month: 'Fev', consultas: 25, faturamento: 11000 },
      { month: 'Mar', consultas: 30, faturamento: 13500 },
      { month: 'Abr', consultas: 28, faturamento: 12200 },
      { month: 'Mai', consultas: 35, faturamento: 17000 },
    ]
  }
};

export default function DentistsTeamCenter({
  dentists,
  appointments,
  patients,
  onAddDentist,
  onUpdateDentistStatus
}: DentistsTeamCenterProps) {

  // Dynamic state hooks for operational control & UI selection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedDentistId, setSelectedDentistId] = useState<string | null>(null);
  
  // New entry registration state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDentistForm, setNewDentistForm] = useState({
    name: '',
    specialty: 'Clínica Geral',
    status: 'Available' as 'Available' | 'On Leave',
    description: '',
    rating: 4.8,
    experience: 5,
    graduatedFrom: '',
    crmLicense: '',
    contactMobile: '',
    contactEmail: '',
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150',
    skills: '',
    certifications: ''
  });

  // Local state augmentation for newly added dentists so they aren't plain lists
  const [localExtras, setLocalExtras] = useState<Record<string, typeof DENTIST_EXTRAS['dentist-1']>>({});

  // Fetch full parameters securely combining props and local metadata
  const getDentistMeta = (id: string, dName: string) => {
    // Fallback if newly registered or not mapped in static mock array
    if (DENTIST_EXTRAS[id]) return DENTIST_EXTRAS[id];
    if (localExtras[id]) return localExtras[id];

    // Build standard high-quality details for pristine rendering
    return {
      experience: 7,
      contactMobile: '(11) 99000-1122',
      contactEmail: `${dName.toLowerCase().replace(/\s+/g, '')}@dentaflow.co`,
      crmLicense: 'CRO-SP ' + Math.floor(100000 + Math.random() * 900000),
      graduatedFrom: 'Universidade Federal de Odontologia',
      satisfactionRate: 98.4,
      consultationCount: 88,
      revenueEst: 24700,
      todayLoadPercent: 40,
      availabilityDetail: 'Available' as const,
      skills: ['Procedimentos Clínicos', 'Prevenção Oclusiva'],
      certifications: ['Iniciante em Odontologia Digital'],
      monthlyPerformances: [
        { month: 'Jan', consultas: 10, faturamento: 4000 },
        { month: 'Fev', consultas: 14, faturamento: 5200 },
        { month: 'Mar', consultas: 12, faturamento: 4500 },
        { month: 'Abr', consultas: 16, faturamento: 6200 },
        { month: 'Mai', consultas: 18, faturamento: 7500 },
      ]
    };
  };

  // Status visual map
  const getStatusDetailLabel = (detail: string) => {
    switch(detail) {
      case 'Available':
        return { label: 'Em Espera / Livre', style: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs' };
      case 'In Consultation':
        return { label: 'Em Consulta Ativa', style: 'bg-indigo-50 text-[#2563eb] border-indigo-200' };
      case 'Break':
        return { label: 'Intervalo Técnico', style: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'Surgery':
        return { label: 'Em Bloco Cirúrgico', style: 'bg-red-50 text-red-700 border-red-200' };
      case 'Fully Booked':
        return { label: 'Agenda Esgotada', style: 'bg-rose-50 text-rose-700 border-rose-200 md:animate-pulse' };
      case 'On Leave':
        return { label: 'Licença Médica', style: 'bg-gray-100 text-gray-600 border-gray-200' };
      default:
        return { label: 'Disponível', style: 'bg-emerald-50 text-emerald-705 border-emerald-200' };
    }
  };

  // Available Dental Specialties Array for Filtering
  const uniqueSpecialties = useMemo(() => {
    const specs = dentists.map(d => d.specialty);
    return ['All', ...Array.from(new Set(specs))];
  }, [dentists]);

  // Operational metrics for the top visual widgets
  const analyticsMetrics = useMemo(() => {
    const total = dentists.length;
    const onlineCount = dentists.filter(d => d.status === 'Available').length;
    
    // Sum stats
    let totalConsultasAll = 0;
    let satisfiedSums = 100;

    dentists.forEach(d => {
      const extra = getDentistMeta(d.id, d.name);
      totalConsultasAll += extra.consultationCount;
      satisfiedSums += extra.satisfactionRate;
    });

    const avgSatisfaction = (satisfiedSums / (dentists.length + 1)).toFixed(1);
    
    // Today appointments count
    const appointmentsToday = appointments.filter(a => a.status === 'Confirmed').length;

    return {
      total,
      onlineCount,
      totalConsultasAll,
      avgSatisfaction,
      appointmentsToday
    };
  }, [dentists, appointments]);

  // Filters calculation
  const filteredDentists = useMemo(() => {
    return dentists.filter(dentist => {
      const matchSearch = dentist.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          dentist.specialty.toLowerCase().includes(searchQuery.toLowerCase());
      
      const specialtyMatch = selectedSpecialty === 'All' || dentist.specialty === selectedSpecialty;
      
      const extra = getDentistMeta(dentist.id, dentist.name);
      const statusValue = dentist.status;
      
      let statusMatch = true;
      if (selectedStatus === 'Active') {
        statusMatch = statusValue === 'Available';
      } else if (selectedStatus === 'On Leave') {
        statusMatch = statusValue === 'On Leave';
      }

      return matchSearch && specialtyMatch && statusMatch;
    });
  }, [dentists, searchQuery, selectedSpecialty, selectedStatus]);

  // Active dentist object derived from drawer select
  const activeDentist = useMemo(() => {
    if (!selectedDentistId) return null;
    return dentists.find(d => d.id === selectedDentistId) || null;
  }, [selectedDentistId, dentists]);

  const activeMeta = useMemo(() => {
    if (!selectedDentistId) return getDentistMeta('', '');
    const found = dentists.find(d => d.id === selectedDentistId);
    return getDentistMeta(selectedDentistId, found ? found.name : '');
  }, [selectedDentistId, dentists, localExtras]);

  // Calculate upcoming appointments specific to the selected dentist
  const activeAppointments = useMemo(() => {
    if (!activeDentist) return [];
    return appointments.filter(app => 
      app.dentistName.toLowerCase().includes(activeDentist.name.toLowerCase())
    );
  }, [activeDentist, appointments]);

  // Submit handler for registering a new dentist
  const handleCreateDentistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDentistForm.name.trim()) return;

    // Call upstream prop
    onAddDentist({
      name: newDentistForm.name,
      specialty: newDentistForm.specialty,
      imageUrl: newDentistForm.imageUrl,
      rating: newDentistForm.rating,
      description: newDentistForm.description || `Especialista renomado focado em entregar qualidade técnica e bem-estar.`,
      status: newDentistForm.status,
      schedules: ['Seg-Sex: 08h às 18h']
    });

    const generatedId = `dentist-${dentists.length + 1}`;
    
    // Save details in local augmented state
    const skillsList = newDentistForm.skills
      ? newDentistForm.skills.split(',').map(s => s.trim())
      : ['Clínica Geral', 'Diagnóstico Estético'];

    const certList = newDentistForm.certifications
      ? newDentistForm.certifications.split(',').map(s => s.trim())
      : ['Curso de Especialização Odonto Premium'];

    const newAugmentedMeta = {
      experience: Number(newDentistForm.experience),
      contactMobile: newDentistForm.contactMobile || '(11) 98111-2233',
      contactEmail: newDentistForm.contactEmail || `${newDentistForm.name.toLowerCase().replace(/\s+/g, '')}@dentaflow.co`,
      crmLicense: newDentistForm.crmLicense || 'CRO-SP ' + Math.floor(100000 + Math.random() * 900000),
      graduatedFrom: newDentistForm.graduatedFrom || 'Universidade Estadual de Odontologia',
      satisfactionRate: 98.7,
      consultationCount: 22,
      revenueEst: 8000,
      todayLoadPercent: 15,
      availabilityDetail: 'Available' as const,
      skills: skillsList,
      certifications: certList,
      monthlyPerformances: [
        { month: 'Mar', consultas: 5, faturamento: 1800 },
        { month: 'Abr', consultas: 8, faturamento: 2900 },
        { month: 'Mai', consultas: 12, faturamento: 4500 },
      ]
    };

    setLocalExtras(prev => ({
      ...prev,
      [generatedId]: newAugmentedMeta
    }));

    setShowAddModal(false);
    
    // Reset form
    setNewDentistForm({
      name: '',
      specialty: 'Clínica Geral',
      status: 'Available',
      description: '',
      rating: 4.8,
      experience: 5,
      graduatedFrom: '',
      crmLicense: '',
      contactMobile: '',
      contactEmail: '',
      imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150',
      skills: '',
      certifications: ''
    });
  };

  // Toggle Dentist status
  const handleToggleStatus = (id: string, currentStatus: string) => {
    if (onUpdateDentistStatus) {
      const target = currentStatus === 'Available' ? 'On Leave' : 'Available';
      onUpdateDentistStatus(id, target);
      
      // Update local simulation details if appropriate
      setLocalExtras(prev => {
        const dMeta = getDentistMeta(id, '');
        return {
          ...prev,
          [id]: {
            ...dMeta,
            availabilityDetail: target === 'Available' ? 'Available' : 'On Leave'
          }
        };
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#0b1c30]">
      
      {/* 1. HEADER & ACTIONS SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6 text-left">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 font-bold mb-1">
            <span>Gestão Operacional</span>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="text-gray-500 font-medium">Corpo de Dentistas &amp; Disponibilidade</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0b1c30]">Corpo Clínico &amp; Alocação</h1>
          <p className="text-xs text-gray-500 mt-1">
            Gestão operacional em tempo real de dentistas, especialidades técnicas, agenda de atendimento semanal e performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl py-2.5 px-4.5 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Credenciar Profissional
          </button>
        </div>
      </div>

      {/* 2. DENTAL CLINIC OPERATIONS ANALYTICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white p-5 border border-gray-100 rounded-2xl shadow-xs text-left relative overflow-hidden group hover:shadow-sm transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Equipe de Especialistas</span>
              <h3 className="text-xl font-extrabold text-[#0b1c30]">{analyticsMetrics.total} Dentistas</h3>
            </div>
          </div>
          <div className="mt-3.5 flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold">
            <span className="inline-block w-2-0 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-emerald-700 font-bold">{analyticsMetrics.onlineCount} Ativos Hoje</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 border border-gray-100 rounded-2xl shadow-xs text-left relative overflow-hidden group hover:shadow-sm transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#2563eb] flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Carga de Agendamentos</span>
              <h3 className="text-xl font-extrabold text-[#0b1c30]">{analyticsMetrics.appointmentsToday} Consultas</h3>
            </div>
          </div>
          <div className="mt-4 text-[10px] text-gray-400 font-medium">
            Média de <span className="text-[#2563eb] font-bold">~4.5 atendimentos</span> por cadeira estética.
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 border border-gray-100 rounded-2xl shadow-xs text-left relative overflow-hidden group hover:shadow-sm transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Smile className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Nível de Satisfação</span>
              <h3 className="text-xl font-extrabold text-[#0b1c30]">{analyticsMetrics.avgSatisfaction}% Net</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
            <span>Excelente feedback (9.8 NPS médio)</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 border border-gray-100 rounded-2xl shadow-xs text-left relative overflow-hidden group hover:shadow-sm transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Casos Totais Concluídos</span>
              <h3 className="text-xl font-extrabold text-[#0b1c30]">{analyticsMetrics.totalConsultasAll} Pacientes</h3>
            </div>
          </div>
          <div className="mt-4 text-[10px] text-gray-400 font-medium">
            Inscrito no registro clínico DentaEHR nacional.
          </div>
        </div>

      </div>

      {/* 3. ADVANCED DIRECTORY FILTERS BOARD */}
      <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pl-0.5" />
          <input 
            type="text" 
            placeholder="Buscar por especialista, nome de batismo ou dente/foco..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-medium"
          />
        </div>

        {/* Filters group dropdown elements */}
        <div className="flex flex-wrap gap-2.5 items-center">
          
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Especialidade:</span>
            <select
              value={selectedSpecialty}
              onChange={e => setSelectedSpecialty(e.target.value)}
              className="border border-gray-200 bg-white rounded-lg p-1.5 text-xs text-gray-600 font-semibold focus:outline-none"
            >
              {uniqueSpecialties.map(spec => (
                <option key={spec} value={spec}>
                  {spec === 'All' ? 'Todas Especialidades' : spec}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="border border-gray-200 bg-white rounded-lg p-1.5 text-xs text-gray-600 font-semibold focus:outline-none"
            >
              <option value="All">Todos Operacionais</option>
              <option value="Active">Disponível / Ativo</option>
              <option value="On Leave">Ausente / Licença</option>
            </select>
          </div>

        </div>

      </div>

      {/* 4. CLINICAL DOCTORS LIST GRID (Main block of Redesign) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        {filteredDentists.map((dentist) => {
          const meta = getDentistMeta(dentist.id, dentist.name);
          const availability = getStatusDetailLabel(dentist.status === 'On Leave' ? 'On Leave' : meta.availabilityDetail);
          
          return (
            <motion.div 
              key={dentist.id}
              layoutId={`dentist-card-${dentist.id}`}
              className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-xs hover:border-gray-300 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Card top banner with active indicator */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between">
                  
                  {/* Doctor Thumbnail */}
                  <div className="flex gap-4">
                    <div className="relative shrink-0">
                      <img 
                        src={dentist.imageUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150'} 
                        alt={dentist.name} 
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-100 bg-slate-50" 
                      />
                      {/* Operational light bulb */}
                      <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                        dentist.status === 'Available' ? 'bg-emerald-500' : 'bg-red-500'
                      }`} title="Status do Calendário Principal">
                        <span className="w-1 h-1 bg-white rounded-full"></span>
                      </span>
                    </div>

                    <div className="min-w-0">
                      <span className="text-[10px] font-extrabold uppercase text-[#2563eb] tracking-wide block">
                        {dentist.specialty}
                      </span>
                      <h3 className="font-extrabold text-sm text-[#0b1c30] truncate mt-0.5">
                        {dentist.name}
                      </h3>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {meta.crmLicense}
                      </span>
                    </div>
                  </div>

                  {/* Rating Badge */}
                  <div className="bg-amber-50/70 border border-amber-200/50 px-2 py-1 rounded-xl flex items-center gap-1 font-extrabold text-[10px] text-amber-700 shrink-0">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                    <span>{dentist.rating.toFixed(1)}</span>
                  </div>

                </div>

                {/* Availability Bar indicator detail */}
                <div className={`mt-5 p-2.5 rounded-xl border flex items-center justify-between text-[11px] font-bold ${availability.style}`}>
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 animate-pulse" />
                    {availability.label}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono font-medium">CRO-Ativo</span>
                </div>

                {/* Key operational data points */}
                <div className="grid grid-cols-3 gap-3 my-5 border-y border-gray-50 py-3.5 text-xs">
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Experiência</span>
                    <span className="font-extrabold text-slate-700">{meta.experience} anos</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Casos Totais</span>
                    <span className="font-extrabold text-slate-700">{meta.consultationCount}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Satisfação</span>
                    <span className="font-extrabold text-emerald-600">{meta.satisfactionRate}%</span>
                  </div>
                </div>

                {/* Schedule workload progress bar */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                    <span>OCUPAÇÃO DA AGENDA HOJE</span>
                    <span className="text-gray-650">{meta.todayLoadPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        meta.todayLoadPercent > 80 ? 'bg-rose-500' : meta.todayLoadPercent > 50 ? 'bg-amber-500' : 'bg-blue-600'
                      }`} 
                      style={{ width: `${meta.todayLoadPercent}%` }}
                    ></div>
                  </div>
                </div>

              </div>

              {/* Bottom Quick Actions bar */}
              <div className="bg-[#fcfdff] border-t border-gray-100 p-4 px-6 flex items-center justify-between gap-2">
                <button 
                  onClick={() => handleToggleStatus(dentist.id, dentist.status)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                    dentist.status === 'Available' 
                      ? 'bg-red-50 text-red-650 hover:bg-red-100/50 border-red-100' 
                      : 'bg-emerald-50 text-emerald-750 hover:bg-emerald-100/50 border-emerald-100'
                  }`}
                >
                  {dentist.status === 'Available' ? 'Marcar Ausente' : 'Marcar Ativo'}
                </button>

                <button 
                  onClick={() => setSelectedDentistId(dentist.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  Ver Ficha Drawer <ChevronRight className="w-3 h-3" />
                </button>
              </div>

            </motion.div>
          );
        })}

        {filteredDentists.length === 0 && (
          <div className="col-span-full bg-white border border-dashed border-gray-200 p-12 text-center rounded-2xl text-gray-400">
            <span className="text-sm font-bold block">Nenhum profissional corresponde aos filtros atuais</span>
            <p className="text-xs text-gray-450 mt-1">Experimente limpar a sua busca ou ajustar as caixas de seleção de especialidades.</p>
          </div>
        )}
      </div>

      {/* 5. LIVE CLINICAL ACTIVITY FEED & CLINIC ACTIVITY TIMELINE (BENTO GRID EXPANSION) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
        
        {/* Left Bento Segment: Ongoing activity logs feed */}
        <div className="lg:col-span-7 bg-white border border-gray-150 rounded-2xl p-6 space-y-5">
          <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#0b1c30] flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-600" /> Registro de Atividade Clínica ao Vivo
            </h3>
            <span className="text-[10px] bg-indigo-50 text-[#2563eb] border border-blue-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Câmeras Ativas
            </span>
          </div>

          <div className="space-y-4">
            
            <div className="flex gap-3 items-start text-xs border-b border-gray-50 pb-3">
              <span className="h-2 w-2 rounded-full bg-indigo-500 mt-1 shrink-0"></span>
              <div className="flex-1">
                <span className="text-[9px] text-gray-400 font-mono font-semibold block">14:15 - HOJE</span>
                <p className="font-semibold text-gray-800">Dra. Sarah Jenkins iniciou procedimento estético de Invisalign.</p>
                <span className="text-[10px] text-gray-400">Paciente beneficiário: Carlos Eduardo (Prontuário #PAT-2)</span>
              </div>
            </div>

            <div className="flex gap-3 items-start text-xs border-b border-gray-50 pb-3">
              <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
              <div className="flex-1">
                <span className="text-[9px] text-gray-400 font-mono font-semibold block">13:30 - HOJE</span>
                <p className="font-semibold text-gray-800">Dr. Marcus Reynolds concluiu a cirurgia de instalação de implante.</p>
                <span className="text-[10px] text-gray-400">Excelente estabilidade primária atingida (45 Ncm de torque).</span>
              </div>
            </div>

            <div className="flex gap-3 items-start text-xs pb-1">
              <span className="h-2 w-2 rounded-full bg-amber-500 mt-1 shrink-0"></span>
              <div className="flex-1">
                <span className="text-[9px] text-gray-400 font-mono font-semibold block">11:00 - HOJE</span>
                <p className="font-semibold text-gray-800">Dra. Emily Chen completou clareamento a laser em consultório.</p>
                <span className="text-[10px] text-gray-400">Dentes escalados em 3 tons na escala de cor Vita Classical.</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Bento Segment: Clinic Capacity Radar Metrics */}
        <div className="lg:col-span-5 bg-white border border-gray-150 rounded-2xl p-6 text-xs text-left">
          <h3 className="text-sm font-bold text-[#0b1c30] mb-3 flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Distribuição de Especialidades
          </h3>
          <p className="text-gray-500 mb-4 leading-relaxed text-[11px]">
            Equilíbrio de atendimentos clínico-estéticos em vigor por área profissional em toda a nossa rede.
          </p>

          <div className="space-y-3 font-semibold">
            <div>
              <div className="flex justify-between mb-1 text-gray-650">
                <span>Implantodontia / Cirurgia</span>
                <span>42%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-gray-650">
                <span>Ortodontia Estética</span>
                <span>35%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-gray-650">
                <span>Dentística de Harmonização</span>
                <span>23%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '23%' }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 6. DRAWER SIDE PANEL: DETAILED PROFESSIONAL BIO & PERFORMANCE METRICS */}
      <AnimatePresence>
        {selectedDentistId && activeDentist && (
          <>
            {/* Overlay backdrop black */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDentistId(null)}
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-xs cursor-pointer"
            />

            {/* Slide drawer container */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="fixed right-0 top-0 bottom-0 max-w-lg w-full bg-white z-50 shadow-2xl p-7 overflow-y-auto text-left flex flex-col justify-between"
            >
              
              <div className="space-y-6">
                
                {/* Close handle bar */}
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <div>
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase">
                      FICHA DO CREDENCIADO
                    </span>
                    <h3 className="text-lg font-extrabold text-[#0b1c30] mt-1">Prontuário Médico</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedDentistId(null)}
                    className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-gray-400 cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Profile header within drawer */}
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-gray-100">
                  <img 
                    src={activeDentist.imageUrl} 
                    alt={activeDentist.name} 
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-xs" 
                  />
                  <div>
                    <h4 className="font-extrabold text-md text-[#0b1c30]">{activeDentist.name}</h4>
                    <span className="text-xs text-blue-600 font-bold block">{activeDentist.specialty}</span>
                    <span className="text-[10px] text-gray-400 block font-mono">{activeMeta.crmLicense}</span>
                  </div>
                </div>

                {/* Main operational sections */}
                <div className="space-y-4 text-xs">
                  
                  {/* Graduated history profile */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest block flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" /> FORMAÇÃO &amp; HISTÓRICO ACADÊMICO
                    </span>
                    <p className="text-gray-700 font-medium"> Graduado pela prestigiada <strong className="text-slate-800">{activeMeta.graduatedFrom}</strong> com residências técnicas em estética bucofacial.</p>
                  </div>

                  {/* Skills tags bullet points */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest block flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-indigo-600" /> ESPECIALIDADES &amp; COMPETÊNCIAS ATIVAS
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeMeta.skills.map((tag, idx) => (
                        <span key={idx} className="bg-slate-150 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                          ★ {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Certified titles */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest block flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-emerald-600" /> CERTIFICAÇÕES DE RECONHECIMENTO
                    </span>
                    <ul className="space-y-1.5 text-gray-650 bg-slate-50/50 p-3 rounded-xl border border-gray-100">
                      {activeMeta.certifications.map((cert, flagIdx) => (
                        <li key={flagIdx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{cert}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Operational stats values */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-slate-50 rounded-2xl text-center space-y-1 border border-gray-100">
                      <span className="text-[9px] text-gray-400 font-bold block uppercase">ATENDIMENTOS NO MÊS</span>
                      <strong className="text-xl font-extrabold text-[#0b1c30]">68 pacientes</strong>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl text-center space-y-1 border border-gray-100">
                      <span className="text-[9px] text-gray-400 font-bold block uppercase">VOLUME DE FATURAMENTO EST.</span>
                      <strong className="text-xl font-extrabold text-emerald-600">
                        € {(activeMeta.revenueEst || 45000).toLocaleString('pt-PT')}
                      </strong>
                    </div>
                  </div>

                  {/* Performance Chart of consultations volumes */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                      EVOLUÇÃO DO FLUXO DE CAIXA DE PROCEDIMENTOS (ÚLTIMOS MESES)
                    </span>
                    <div className="h-32 w-full bg-slate-50 rounded-2xl p-2 border border-gray-100">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={activeMeta.monthlyPerformances}>
                          <XAxis dataKey="month" stroke="#aaa" fontSize={9} tickLine={false} />
                          <Tooltip />
                          <Bar dataKey="faturamento" fill="#2563eb" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

              </div>

              {/* Action buttons drawer bottom */}
              <div className="pt-6 border-t border-gray-100 flex items-center gap-3">
                <button 
                  onClick={() => {
                    alert(`Notificação operacional disparada para a agenda do profissional ${activeDentist.name}`);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-205 py-2.5 rounded-xl text-center text-xs font-bold text-gray-700 transition-colors cursor-pointer"
                >
                  Disparar Alerta SMS
                </button>
                <button 
                  onClick={() => setSelectedDentistId(null)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-2.5 rounded-xl text-center text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Fechar Prontuário
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 7. CREDENTIAL REGISTRATION MODAL FORM */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-6 text-left"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-[#0b1c30] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" /> Credenciamento de Novo Doutor / Dentista
                </h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-150 flex items-center justify-center text-gray-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateDentistSubmit} className="space-y-4 text-xs">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Nome Completo do Profissional</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Dr. Adriano Moreira"
                      value={newDentistForm.name}
                      onChange={e => setNewDentistForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-gray-250 rounded-xl p-2.5 outline-none focus:border-blue-500 font-medium bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Especialidade Principal</label>
                    <select
                      value={newDentistForm.specialty}
                      onChange={e => setNewDentistForm(prev => ({ ...prev, specialty: e.target.value }))}
                      className="w-full border border-gray-250 rounded-xl p-2.5 outline-none focus:border-blue-500 text-gray-500 bg-slate-50 font-semibold"
                    >
                      <option value="Clínica Geral">Clínica Geral</option>
                      <option value="Implantodontia">Implantodontia</option>
                      <option value="Ortodontia">Ortodontia</option>
                      <option value="Harmonização Orofacial">Harmonização Orofacial</option>
                      <option value="Odontopediatria">Odontopediatria</option>
                      <option value="Endodontia">Endodontia</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Registro CRO (Ex: CRO-SP 99990)</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: CRO-SP 774820"
                      value={newDentistForm.crmLicense}
                      onChange={e => setNewDentistForm(prev => ({ ...prev, crmLicense: e.target.value }))}
                      className="w-full border border-gray-250 rounded-xl p-2.5 outline-none focus:border-blue-500 font-medium bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Anos de Prática / Experiência</label>
                    <input 
                      type="number" 
                      required
                      placeholder="Quantidade de anos"
                      value={newDentistForm.experience}
                      onChange={e => setNewDentistForm(prev => ({ ...prev, experience: Number(e.target.value) }))}
                      className="w-full border border-gray-250 rounded-xl p-2.5 outline-none focus:border-blue-500 font-medium bg-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Instituição de Formação</label>
                    <input 
                      type="text" 
                      placeholder="Ex: USP / UNICAMP"
                      value={newDentistForm.graduatedFrom}
                      onChange={e => setNewDentistForm(prev => ({ ...prev, graduatedFrom: e.target.value }))}
                      className="w-full border border-gray-250 rounded-xl p-2.5 outline-none focus:border-blue-500 font-medium bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Foto do Credenciado (Link Unsplash)</label>
                    <input 
                      type="text" 
                      placeholder="HTTPS link..."
                      value={newDentistForm.imageUrl}
                      onChange={e => setNewDentistForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                      className="w-full border border-gray-250 rounded-xl p-2.5 outline-none focus:border-blue-500 font-medium bg-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">WhatsApp de Contato</label>
                    <input 
                      type="tel" 
                      placeholder="(11) 9..."
                      value={newDentistForm.contactMobile}
                      onChange={e => setNewDentistForm(prev => ({ ...prev, contactMobile: e.target.value }))}
                      className="w-full border border-gray-250 rounded-xl p-2.5 outline-none focus:border-blue-500 font-medium bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">E-mail Comercial @dentaflow</label>
                    <input 
                      type="email" 
                      placeholder="username@dentaflow.co"
                      value={newDentistForm.contactEmail}
                      onChange={e => setNewDentistForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                      className="w-full border border-gray-250 rounded-xl p-2.5 outline-none focus:border-blue-500 font-medium bg-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Habilidades Extras (Separadas por vírgula)</label>
                    <input 
                      type="text" 
                      placeholder="Dentes a laser, Botox bucal"
                      value={newDentistForm.skills}
                      onChange={e => setNewDentistForm(prev => ({ ...prev, skills: e.target.value }))}
                      className="w-full border border-gray-250 rounded-xl p-2.5 outline-none focus:border-blue-500 font-medium bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Certificações Reconhecidas (Vírgula)</label>
                    <input 
                      type="text" 
                      placeholder="DSD Master, Diamond Provider"
                      value={newDentistForm.certifications}
                      onChange={e => setNewDentistForm(prev => ({ ...prev, certifications: e.target.value }))}
                      className="w-full border border-gray-250 rounded-xl p-2.5 outline-none focus:border-blue-500 font-medium bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Breve Resumo Profissional / Bio</label>
                  <textarea 
                    rows={2}
                    placeholder="Especialista com foco em tratamentos de reabilitação oclusal..."
                    value={newDentistForm.description}
                    onChange={e => setNewDentistForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-250 rounded-xl p-2.5 outline-none focus:border-blue-500 font-medium bg-slate-50 resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Confirmar Credenciamento Técnico
                </button>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
