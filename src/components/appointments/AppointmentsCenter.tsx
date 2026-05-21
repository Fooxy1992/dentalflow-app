import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Check, 
  X, 
  Plus, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  User, 
  Smile, 
  UserCheck, 
  UserX,
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  Activity, 
  FileText, 
  Mail, 
  Phone, 
  HelpCircle,
  Stethoscope,
  Sparkles,
  RefreshCw,
  Share2,
  CalendarRange,
  CalendarDays,
  ListFilter
} from 'lucide-react';
import { Appointment, Dentist, Patient, ClinicService } from '../../types';

interface AppointmentsCenterProps {
  services?: ClinicService[];
  appointments: Appointment[];
  patients: Patient[];
  dentists: Dentist[];
  onUpdateAppointmentStatus: (id: string, status: 'Confirmed' | 'Pending' | 'Cancelled') => void;
  onAddAppointment: (appointment: Omit<Appointment, 'id' | 'status' | 'price'>) => void;
  onSelectPatientById?: (id: string) => void;
  onSwitchTab?: (tab: 'dashboard' | 'appointments' | 'patients' | 'dentists' | 'financial' | 'services') => void;
}

export default function AppointmentsCenter({
  services,
  appointments,
  patients,
  dentists,
  onUpdateAppointmentStatus,
  onAddAppointment,
  onSelectPatientById,
  onSwitchTab
}: AppointmentsCenterProps) {
  
  // Local active date representation (default to clinic state's '2026-05-21')
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 4, 21)); // May 21, 2026
  
  // Layout views: 'calendar_month' | 'calendar_week' | 'calendar_day' | 'timeline'
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'timeline'>('week');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [filterDentist, setFilterDentist] = useState<string>('All');
  const [filterTreatment, setFilterTreatment] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterRoom, setFilterRoom] = useState<string>('All');
  
  // Full-fidelity Local appointments representing more statuses and extra attributes for absolute realism!
  const [localAppointments, setLocalAppointments] = useState<Appointment[]>([]);
  
  // Modal states
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [prefilledTimeSlot, setPrefilledTimeSlot] = useState<{ date: string; time: string } | null>(null);
  
  // Extra fields that aren't persisted in standard Appointment type but enrich the DB for realism
  const [extraDetails, setExtraDetails] = useState<Record<string, {
    duration: number; // in mins
    room: string;     // e.g. "Sala Safira", "Consultório 01"
    specialNotes: string;
    flowStatus: 'Confirmed' | 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | 'No-show';
  }>>({});

  // Form state for creating/editing appointments
  const [appointmentForm, setAppointmentForm] = useState({
    patientName: '',
    email: '',
    phone: '',
    date: '2026-05-21',
    time: '09:00 AM',
    treatment: 'Checkup',
    dentistName: '',
    notes: '',
    duration: 60,
    room: 'Consultório 01',
    flowStatus: 'Pending' as 'Confirmed' | 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | 'No-show'
  });

  // Synchronize appointments while safely keeping rich local decorations
  useEffect(() => {
    const updated = appointments.map(app => {
      // populate defaults if not present
      if (!extraDetails[app.id]) {
        let room = "Consultório 01";
        if (app.dentistName.includes("Reynolds")) room = "Consultório 02 - Implante";
        else if (app.dentistName.includes("Chen")) room = "Orthospace - Sala B";
        else if (app.dentistName.includes("Lee")) room = "Consultório 03 - Pêro";

        let flowStatus: any = app.status;
        // make simple randomize for extra status types if not strictly confirmed
        if (app.id === 'app-1') flowStatus = 'Completed'; // Make app-1 completed for realistic bottom activity!

        setExtraDetails(prev => ({
          ...prev,
          [app.id]: {
            duration: app.treatment.includes('Implantes') || app.treatment.includes('Implants') ? 90 : 45,
            room,
            specialNotes: app.notes || "Procedimento agendado perante conformidade clínica.",
            flowStatus: flowStatus
          }
        }));
      }
      return app;
    });
    setLocalAppointments(appointments);
  }, [appointments]);

  // Form initializer
  const openCreateModalWithSlot = (dateStr: string, timeStr: string) => {
    setAppointmentForm({
      patientName: '',
      email: '',
      phone: '',
      date: dateStr,
      time: timeStr,
      treatment: 'Checkup',
      dentistName: dentists[0]?.name || 'Dr. Sarah Jenkins',
      notes: '',
      duration: 45,
      room: 'Consultório 01',
      flowStatus: 'Confirmed'
    });
    setPrefilledTimeSlot({ date: dateStr, time: timeStr });
    setShowCreateModal(true);
  };

  const handleEditClick = (app: Appointment) => {
    const details = extraDetails[app.id] || { duration: 45, room: 'Consultório 01', specialNotes: '', flowStatus: app.status };
    setAppointmentForm({
      patientName: app.patientName,
      email: app.email,
      phone: app.phone,
      date: app.date,
      time: app.time,
      treatment: app.treatment,
      dentistName: app.dentistName,
      notes: app.notes || '',
      duration: details.duration,
      room: details.room,
      flowStatus: details.flowStatus
    });
    setSelectedAppointment(app);
    setIsEditMode(true);
  };

  // Helper date conversions
  const formatDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const selectedDateStr = useMemo(() => formatDateString(currentDate), [currentDate]);

  // Active Filters list - CENTRALIZED REGISTER SYNC: Look up active treatments dynamically!
  const treatmentsList = useMemo(() => {
    if (services && services.length > 0) {
      return Array.from(new Set(services.filter(s => s.status === 'Active').map(s => s.name)));
    }
    return ["Checkup", "Teeth Whitening", "Dental Implants", "Orthodontics", "Odontologia Geral", "Clareamento", "Implantes", "Ortodontia"];
  }, [services]);
  const roomsList = ["Consultório 01", "Consultório 02 - Implante", "Orthospace - Sala B", "Consultório 03 - Pêro", "VIP Suite"];

  // Helper to change local states
  const updateLocalStatus = (id: string, status: 'Confirmed' | 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | 'No-show') => {
    // Notify master props if appropriate
    if (status === 'Confirmed' || status === 'Pending' || status === 'Cancelled') {
      onUpdateAppointmentStatus(id, status);
    }
    
    setExtraDetails(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || { duration: 45, room: "Consultório 01", specialNotes: "" }),
        flowStatus: status
      }
    }));
    
    // Smooth alert confirmation
    const textStatusMap: Record<string, string> = {
      Confirmed: 'CONFIRMADO',
      Pending: 'PENDENTE',
      'In Progress': 'EM ATENDIMENTO',
      Completed: 'CONCLUÍDO (Faturado)',
      Cancelled: 'CANCELADO',
      'No-show': 'FALTOU (Ausente)'
    };
    
    // Simulate flow visual response
    if (selectedAppointment && selectedAppointment.id === id) {
      setSelectedAppointment(prev => prev ? { ...prev, status: (status === 'In Progress' || status === 'Completed' || status === 'No-show') ? 'Confirmed' : status as any } : null);
    }
  };

  // Create or Update submit handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && selectedAppointment) {
      // Modify locally and notify status
      updateLocalStatus(selectedAppointment.id, appointmentForm.flowStatus);
      
      setExtraDetails(prev => ({
        ...prev,
        [selectedAppointment.id]: {
          duration: appointmentForm.duration,
          room: appointmentForm.room,
          specialNotes: appointmentForm.notes,
          flowStatus: appointmentForm.flowStatus
        }
      }));

      // In a real database, we would edit other properties here too. For our mockup, we will update the local representation immediately.
      setLocalAppointments(prev => prev.map(a => a.id === selectedAppointment.id ? {
        ...a,
        patientName: appointmentForm.patientName,
        email: appointmentForm.email,
        phone: appointmentForm.phone,
        date: appointmentForm.date,
        time: appointmentForm.time,
        treatment: appointmentForm.treatment,
        dentistName: appointmentForm.dentistName,
        notes: appointmentForm.notes
      } : a));

      setIsEditMode(false);
      setSelectedAppointment(null);
    } else {
      // Call parent to append to main clinic database
      onAddAppointment({
        patientName: appointmentForm.patientName,
        email: appointmentForm.email,
        phone: appointmentForm.phone,
        date: appointmentForm.date,
        time: appointmentForm.time,
        treatment: appointmentForm.treatment,
        dentistName: appointmentForm.dentistName,
        notes: appointmentForm.notes
      });
      setShowCreateModal(false);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    // Filter appointments for the selected day 'currentDate'
    const dayApps = localAppointments.filter(app => app.date === selectedDateStr);
    const dayConfirmed = dayApps.filter(app => (extraDetails[app.id]?.flowStatus || app.status) === 'Confirmed');
    const dayCompleted = dayApps.filter(app => (extraDetails[app.id]?.flowStatus || app.status) === 'Completed');
    const dayInProgress = dayApps.filter(app => (extraDetails[app.id]?.flowStatus || app.status) === 'In Progress');
    const allPending = localAppointments.filter(app => (extraDetails[app.id]?.flowStatus || app.status) === 'Pending');
    const activeDentists = dentists.filter(d => d.status === 'Available').length;
    
    // Total cancellation or slots
    const totalCancelled = localAppointments.filter(app => (extraDetails[app.id]?.flowStatus || app.status) === 'Cancelled').length;
    const rate = localAppointments.length > 0 ? ((totalCancelled / localAppointments.length) * 100).toFixed(1) : "0.0";

    return {
      todayCount: dayApps.length,
      todayConfirmed: dayConfirmed.length,
      todayCompleted: dayCompleted.length,
      todayInProgress: dayInProgress.length,
      pendingCount: allPending.length,
      activeDentists,
      availableSlots: 18 - dayApps.length, // total possible 3 chairs * 6 slots = 18 slots
      cancellationRate: `${rate}%`
    };
  }, [localAppointments, extraDetails, selectedDateStr, dentists]);

  // Comprehensive Search & Filters logic
  const filteredAppointments = useMemo(() => {
    return localAppointments.filter(app => {
      // Search text
      const matchesSearch = 
        app.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.treatment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.dentistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.phone && app.phone.includes(searchQuery));

      // Dentist filter
      const matchesDentist = filterDentist === 'All' || app.dentistName === filterDentist;

      // Treatment filter
      const matchesTreatment = filterTreatment === 'All' || app.treatment.toLowerCase() === filterTreatment.toLowerCase();

      // Status filter
      const appStatus = extraDetails[app.id]?.flowStatus || app.status;
      const matchesStatus = filterStatus === 'All' || appStatus === filterStatus;

      // Room filter
      const appRoom = extraDetails[app.id]?.room || "Consultório 01";
      const matchesRoom = filterRoom === 'All' || appRoom === filterRoom;

      return matchesSearch && matchesDentist && matchesTreatment && matchesStatus && matchesRoom;
    });
  }, [localAppointments, extraDetails, searchQuery, filterDentist, filterTreatment, filterStatus, filterRoom]);

  // Appointments on selected day for day/week views
  const dayAppointments = useMemo(() => {
    return localAppointments.filter(app => app.date === selectedDateStr);
  }, [localAppointments, selectedDateStr]);

  // Color Mapping helper for Dentists to ensure incredible branding color consistency
  const getDentistColor = (name: string) => {
    if (name.includes('Sarah') || name.includes('Jenkins')) return { bg: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100/50', dot: 'bg-indigo-600', text: 'text-indigo-800', solid: 'bg-indigo-600' };
    if (name.includes('Marcus') || name.includes('Reynolds')) return { bg: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/50', dot: 'bg-emerald-600', text: 'text-emerald-800', solid: 'bg-emerald-600' };
    if (name.includes('Emily') || name.includes('Chen')) return { bg: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100/50', dot: 'bg-purple-600', text: 'text-purple-800', solid: 'bg-purple-600' };
    return { bg: 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100/50', dot: 'bg-sky-600', text: 'text-sky-800', solid: 'bg-sky-600' };
  };

  // Status Badge visual styles mapper
  const getStatusBadgeStyles = (status: string) => {
    switch(status) {
      case 'Confirmed':
        return { text: 'Confirmado', class: 'bg-emerald-100/80 text-emerald-800 border-emerald-200 px-3 py-1', dot: 'bg-emerald-500' };
      case 'Pending':
        return { text: 'Pendente', class: 'bg-amber-100/80 text-amber-800 border-amber-200 px-3 py-1 animate-pulse', dot: 'bg-amber-500' };
      case 'In Progress':
        return { text: 'Em Consulta', class: 'bg-blue-100/80 text-blue-800 border-blue-200 px-3 py-1', dot: 'bg-blue-600' };
      case 'Completed':
        return { text: 'Concluído', class: 'bg-slate-100 text-slate-800 border-slate-200 px-3 py-1', dot: 'bg-slate-600' };
      case 'Cancelled':
        return { text: 'Cancelado', class: 'bg-red-100/80 text-red-800 border-red-200 px-3 py-1', dot: 'bg-red-500' };
      case 'No-show':
        return { text: 'Falta Justificada', class: 'bg-violet-100 text-violet-800 border-violet-200 px-3 py-1', dot: 'bg-violet-600' };
      default:
        return { text: 'Pendente', class: 'bg-gray-100 text-gray-800 border-gray-200 px-3 py-1', dot: 'bg-gray-400' };
    }
  };

  // Hours block list for calendar views
  const timeSlots = [
    "08:00 AM",
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM", // Almoço block
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM"
  ];

  // Week days mapper
  const getWeekDays = (start: Date) => {
    const days = [];
    const temp = new Date(start);
    // Move back to Sunday
    const dayOfWeek = temp.getDay();
    temp.setDate(temp.getDate() - dayOfWeek);
    
    for (let i = 0; i < 7; i++) {
      days.push(new Date(temp));
      temp.setDate(temp.getDate() + 1);
    }
    return days;
  };

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  // Navigate forward/backward
  const handlePrevDateRange = () => {
    const temp = new Date(currentDate);
    if (viewMode === 'month') {
      temp.setMonth(temp.getMonth() - 1);
    } else if (viewMode === 'week') {
      temp.setDate(temp.getDate() - 7);
    } else {
      temp.setDate(temp.getDate() - 1);
    }
    setCurrentDate(temp);
  };

  const handleNextDateRange = () => {
    const temp = new Date(currentDate);
    if (viewMode === 'month') {
      temp.setMonth(temp.getMonth() + 1);
    } else if (viewMode === 'week') {
      temp.setDate(temp.getDate() + 7);
    } else {
      temp.setDate(temp.getDate() + 1);
    }
    setCurrentDate(temp);
  };

  const setToday = () => {
    setCurrentDate(new Date(2026, 4, 21)); // May 21, 2026
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#0b1c30]">
      
      {/* 1. HEADER SECTION & MAIN CONTROLS */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold mb-1">
            <span>DentaFlow Core</span>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="text-gray-500 font-medium">Agendas &amp; Relacionamento</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0b1c30]">Consultas &amp; Centro de Agenda</h1>
          <p className="text-xs text-gray-500 mt-1">
            Gerencie o fluxo de consultas, blocos operatórios, confirmações de pacientes e cargas de trabalho clínicas em tempo real.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex w-full sm:w-auto overflow-x-auto bg-white border border-gray-150 rounded-xl p-1 shadow-xs shrink-0 hide-scrollbar">
            <button 
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${viewMode === 'day' ? 'bg-[#2563eb] text-white shadow-xs' : 'text-gray-500 hover:text-[#0b1c30]'}`}
            >
              Dia
            </button>
            <button 
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${viewMode === 'week' ? 'bg-[#2563eb] text-white shadow-xs' : 'text-gray-500 hover:text-[#0b1c30]'}`}
            >
              Semana
            </button>
            <button 
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${viewMode === 'month' ? 'bg-[#2563eb] text-white shadow-xs' : 'text-gray-500 hover:text-[#0b1c30]'}`}
            >
              Mês
            </button>
            <button 
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${viewMode === 'timeline' ? 'bg-[#2563eb] text-white shadow-xs' : 'text-gray-500 hover:text-[#0b1c30]'}`}
            >
              Timeline
            </button>
          </div>

          <button 
            onClick={() => {
              setAppointmentForm({
                patientName: '',
                email: '',
                phone: '',
                date: selectedDateStr,
                time: '09:00 AM',
                treatment: 'Checkup',
                dentistName: dentists[0]?.name || 'Dr. Sarah Jenkins',
                notes: '',
                duration: 45,
                room: 'Consultório 01',
                flowStatus: 'Confirmed'
              });
              setIsEditMode(false);
              setShowCreateModal(true);
            }}
            className="w-full sm:w-auto justify-center bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl py-2.5 px-4 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Novo Agendamento
          </button>
        </div>
      </div>

      {/* 2. PREMIUM STRIPE-STYLE STAT CARDS PANEL */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Card 1: Today Appointments */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Consultas Hoje</span>
            <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-semibold text-xs">
              <CalendarRange className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-extrabold text-[#0b1c30] group-hover:scale-105 transition-transform origin-left">{stats.todayCount} Real</h3>
            <div className="mt-1 flex items-center gap-1">
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded flex items-center gap-0.5">
                <TrendingUp className="w-2.5 h-2.5" /> +15%
              </span>
              <span className="text-[9px] text-gray-400">vs ontém</span>
            </div>
          </div>
        </div>

        {/* Card 2: Pending Confirmations */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Pendentes Site</span>
            <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 font-semibold text-xs">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-extrabold text-[#0b1c30] group-hover:scale-105 transition-transform origin-left">{stats.pendingCount} Ativos</h3>
            <div className="mt-1 flex items-center gap-1">
              <span className="text-[9px] font-bold text-[#b45309] bg-amber-50 px-1 rounded">
                Revisar fila
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Active Dentists */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Corpo Clínico</span>
            <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center text-[#10b981] font-semibold text-xs">
              <Stethoscope className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-extrabold text-[#0b1c30] group-hover:scale-105 transition-transform origin-left">{stats.activeDentists} / {dentists.length}</h3>
            <div className="mt-1 flex items-center gap-1">
              <span className="text-[9px] text-emerald-600 bg-emerald-50/50 px-1.5 py-0.5 rounded font-medium">95% Ocupação</span>
            </div>
          </div>
        </div>

        {/* Card 4: Available Slots */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-500"></div>
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Horários Livres</span>
            <div className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center text-violet-600 font-semibold text-xs">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-extrabold text-[#0b1c30] group-hover:scale-105 transition-transform origin-left">{stats.availableSlots} Slots</h3>
            <div className="mt-1 flex items-center gap-1">
              <span className="text-[9px] text-[#8b5cf6] font-semibold">Hoje, 21 de Maio</span>
            </div>
          </div>
        </div>

        {/* Card 5: Completed Consultations */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-sky-500"></div>
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Finalizadas Hoje</span>
            <div className="w-7 h-7 bg-sky-50 rounded-lg flex items-center justify-center text-sky-600 font-semibold text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-extrabold text-[#0b1c30] group-hover:scale-105 transition-transform origin-left">{stats.todayCompleted} Concluídas</h3>
            <div className="mt-1 flex items-center gap-1">
              <span className="text-[9px] text-gray-500 font-normal">Fluxo operacional 24h</span>
            </div>
          </div>
        </div>

        {/* Card 6: Cancellation Rate */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-red-400"></div>
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Índice Cancelados</span>
            <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center text-red-600 font-semibold text-xs">
              <XCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-extrabold text-[#0b1c30] group-hover:scale-105 transition-transform origin-left">{stats.cancellationRate}</h3>
            <div className="mt-1 flex items-center gap-1">
              <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1 rounded">▼ Saudável</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. FLOATING ADVANCED FILTER BAR */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Real-time search */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Filtro rápido por paciente, tratamento ou doutor..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-150 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all text-gray-700 font-medium"
            />
          </div>

          {/* Filtering pickers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            
            {/* Dentist Filter */}
            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Especialista</label>
              <select
                value={filterDentist}
                onChange={e => setFilterDentist(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 text-gray-600 font-medium"
              >
                <option value="All">Todos Dentistas</option>
                {dentists.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Treatment Filter */}
            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Tratamento</label>
              <select
                value={filterTreatment}
                onChange={e => setFilterTreatment(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 text-gray-600 font-medium"
              >
                <option value="All">Todos Procedimentos</option>
                {treatmentsList.map((t, idx) => (
                  <option key={idx} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Status Geral</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 text-gray-600 font-medium"
              >
                <option value="All">Qualquer Etapa</option>
                <option value="Confirmed">Confirmado</option>
                <option value="Pending">Pendente</option>
                <option value="In Progress">Em Consulta</option>
                <option value="Completed">Concluído</option>
                <option value="Cancelled">Cancelado</option>
                <option value="No-show">No-show</option>
              </select>
            </div>

            {/* Room Filter */}
            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Operatório / Cadeira</label>
              <select
                value={filterRoom}
                onChange={e => setFilterRoom(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 text-gray-600 font-medium"
              >
                <option value="All">Qualquer Consultó.</option>
                {roomsList.map((r, idx) => (
                  <option key={idx} value={r}>{r}</option>
                ))}
              </select>
            </div>

          </div>

          <button 
            onClick={() => {
              setFilterDentist('All');
              setFilterTreatment('All');
              setFilterStatus('All');
              setFilterRoom('All');
              setSearchQuery('');
            }}
            className="text-[10px] text-gray-400 hover:text-blue-600 font-bold px-3 py-2 border border-dashed border-gray-200 rounded-xl flex items-center gap-1 shrink-0"
            title="Limpar todos os filtros"
          >
            <RefreshCw className="w-3 h-3" /> Limpar Filtros
          </button>
        </div>
      </div>

      {/* 4. CLINICAL CALENDAR WORKSPACE (Day / Week / Month Views) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: ACTIVE VIEWWORKSPACE (COL-SPAN-9) */}
        <div className="lg:col-span-9 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
          
          {/* Calendar Header Navigators */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-50 pb-4 gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={handlePrevDateRange}
                className="w-8 h-8 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-500 hover:text-[#0b1c30] transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <h2 className="text-md font-bold text-[#0b1c30] tracking-tight min-w-[150px] text-center capitalize">
                {viewMode === 'month' && currentDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
                {viewMode === 'week' && `Semana de ${weekDays[0].toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}`}
                {viewMode === 'day' && currentDate.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                {viewMode === 'timeline' && `${currentDate.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })} ⎯ Timeline de Doutores`}
              </h2>

              <button 
                onClick={handleNextDateRange}
                className="w-8 h-8 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-500 hover:text-[#0b1c30] transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button 
                onClick={setToday}
                className="text-[10px] font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Hoje
              </button>
            </div>

            {/* Quick Helper badge info */}
            <div className="flex items-center gap-4 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-indigo-600 rounded"></span> Dr. Sarah</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-600 rounded"></span> Dr. Marcus</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-purple-600 rounded"></span> Dra. Emily</span>
            </div>
          </div>

          {/* WEEK VIEW (Default, Cliniko Inspired Grid) */}
          {viewMode === 'week' && (
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Week Header */}
                <div className="grid grid-cols-[auto_repeat(7,1fr)] border-b border-gray-100 pb-3 text-center">
                  <div className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-2.5 pl-2">Horário</div>
                  {weekDays.map((day, dIdx) => {
                    const isSelected = formatDateString(day) === selectedDateStr;
                    return (
                      <div 
                        key={dIdx} 
                        onClick={() => setCurrentDate(day)}
                        className={`p-2 rounded-xl transition-all cursor-pointer hover:bg-blue-5/30 ${isSelected ? 'bg-blue-50/70 border border-blue-200' : ''}`}
                      >
                        <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">
                          {day.toLocaleDateString('pt-PT', { weekday: 'short' })}
                        </span>
                        <span className={`text-md font-extrabold w-7 h-7 flex items-center justify-center mx-auto rounded-full ${isSelected ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-700'}`}>
                          {day.getDate()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Day hour rows mapping */}
                <div className="divide-y divide-gray-50 border-b border-gray-50 max-h-[500px] overflow-y-auto pr-1">
                  {timeSlots.map((slot, sIdx) => {
                    const isLunchHour = slot === "12:00 PM";
                    return (
                      <div key={sIdx} className="grid grid-cols-[auto_repeat(7,1fr)] items-stretch min-h-[55px]">
                        
                        {/* Hour marker column */}
                        <div className="py-3 text-[11px] font-bold text-gray-400 flex flex-col justify-start">
                          <span>{slot}</span>
                          {isLunchHour && <span className="text-[8px] text-amber-500 tracking-wider">INTERVALO</span>}
                        </div>

                        {/* 7 Days of week slot blocks */}
                        {weekDays.map((day, dIdx) => {
                          const dateStr = formatDateString(day);
                          
                          // Find appointment during this slot
                          const slotApps = localAppointments.filter(app => {
                            // Quick approximation: matching Hour slot directly
                            const matchDate = app.date === dateStr;
                            const matchTime = app.time.replace(/^0/, '') === slot.replace(/^0/, '');
                            return matchDate && matchTime;
                          });

                          return (
                            <div 
                              key={dIdx} 
                              className={`p-1 border-l border-gray-50/80 transition-all relative group flex flex-col justify-center ${isLunchHour ? 'bg-amber-500/5' : 'hover:bg-slate-50/40'}`}
                            >
                              {/* If lunch break block */}
                              {isLunchHour && dIdx !== 0 && dIdx !== 6 && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  <span className="text-[8px] font-bold text-amber-600 uppercase bg-amber-50 px-1 border border-amber-200 rounded">Almoço Clínico</span>
                                </div>
                              )}

                              {slotApps.map((app) => {
                                const details = extraDetails[app.id] || { duration: 45, room: 'Consultório 01', flowStatus: app.status };
                                const dColor = getDentistColor(app.dentistName);
                                const statusInfo = getStatusBadgeStyles(details.flowStatus);
                                
                                return (
                                  <motion.div
                                    key={app.id}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditClick(app);
                                    }}
                                    className={`p-2 rounded-xl border text-[10px] space-y-1 block cursor-pointer transition-all ${dColor.bg}`}
                                    title={`${app.patientName} - ${app.treatment}\nDentista: ${app.dentistName}\nLocal: ${details.room}`}
                                  >
                                    <div className="flex justify-between items-start">
                                      <span className="font-extrabold truncate text-[#0b1c30] pr-1">{app.patientName}</span>
                                      <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} title={statusInfo.text}></span>
                                    </div>
                                    <div className="text-[8px] opacity-80 font-medium tracking-tight truncate">
                                      {app.treatment}
                                    </div>
                                    <div className="flex justify-between items-center pt-0.5 border-t border-black/5 text-[8px] font-mono opacity-60">
                                      <span>{details.room.split(' ')[1] || details.room}</span>
                                      <span>{details.duration}m</span>
                                    </div>
                                  </motion.div>
                                );
                              })}

                              {/* Click empty space slot callback -> Trigger Walkin Dialog */}
                              {slotApps.length === 0 && !isLunchHour && (
                                <button 
                                  onClick={() => openCreateModalWithSlot(dateStr, slot)}
                                  className="w-full h-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1"
                                >
                                  <span className="text-[8px] text-blue-600 font-bold bg-blue-50 border border-blue-200 px-1.5 py-1 rounded-lg">
                                    + Agendar
                                  </span>
                                </button>
                              )}
                            </div>
                          );
                        })}

                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* DAY VIEW (Column per Dentist layout) */}
          {viewMode === 'day' && (
            <div className="overflow-x-auto">
              <div className="min-w-[600px] space-y-4">
                <div className="grid grid-cols-4 border-b border-gray-100 pb-3 text-center">
                  <div className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">Horários</div>
                  {dentists.map((doc, dIdx) => {
                    return (
                      <div key={dIdx} className="p-1">
                        <div className="flex items-center justify-center gap-2">
                          <img alt={doc.name} src={doc.imageUrl} className="w-6 h-6 rounded-full border border-gray-150" />
                          <div>
                            <span className="font-extrabold text-[12px] text-gray-700 block text-center leading-3">{doc.name.split(' ')[1]}</span>
                            <span className="text-[8px] text-gray-400 block tracking-widest">{doc.specialty.split(' ')[0]}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Day slots layout */}
                <div className="divide-y divide-gray-50 border-b border-gray-50 max-h-[500px] overflow-y-auto pr-1">
                  {timeSlots.map((slot, sIdx) => {
                    const isLunchHour = slot === "12:00 PM";
                    return (
                      <div key={sIdx} className="grid grid-cols-4 items-stretch min-h-[60px]">
                        
                        {/* Hour stamp column */}
                        <div className="py-4 text-[11px] font-bold text-gray-400 flex flex-col justify-start">
                          <span>{slot}</span>
                          {isLunchHour && <span className="text-[8px] text-amber-500">INTERVALO</span>}
                        </div>

                      {/* Dentist Columns mapper */}
                      {dentists.map((doc) => {
                        // Find appointment at this time slot and assigned to this dentist on active currentDate
                        const app = dayAppointments.find(a => {
                          const matchDentist = a.dentistName.toLowerCase() === doc.name.toLowerCase();
                          const matchTime = a.time.replace(/^0/, '') === slot.replace(/^0/, '');
                          return matchDentist && matchTime;
                        });

                        return (
                          <div 
                            key={doc.id} 
                            className={`p-1.5 border-l border-gray-50/80 transition-all relative group flex flex-col justify-center ${isLunchHour ? 'bg-amber-100/10' : 'hover:bg-slate-50/30'}`}
                          >
                            {app ? (
                              (() => {
                                const details = extraDetails[app.id] || { duration: 45, room: 'Consultório 01', flowStatus: app.status };
                                const dColor = getDentistColor(app.dentistName);
                                const statusInfo = getStatusBadgeStyles(details.flowStatus);
                                return (
                                  <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    onClick={() => handleEditClick(app)}
                                    className={`p-2.5 rounded-xl border text-[11px] space-y-1 block cursor-pointer transition-all ${dColor.bg}`}
                                  >
                                    <div className="flex justify-between items-start">
                                      <span className="font-extrabold text-slate-900 truncate pr-0.5">{app.patientName}</span>
                                      <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} title={statusInfo.text}></span>
                                    </div>
                                    <div className="text-[9px] text-gray-500 font-semibold truncate">{app.treatment}</div>
                                    <div className="pt-1.5 border-t border-black/5 flex justify-between items-center text-[8px] text-gray-400 font-mono">
                                      <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /> {details.room}</span>
                                      <span>⏱️ {details.duration}m</span>
                                    </div>
                                  </motion.div>
                                );
                              })()
                            ) : (
                              !isLunchHour && (
                                <button 
                                  onClick={() => openCreateModalWithSlot(selectedDateStr, slot)}
                                  className="w-full h-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1"
                                >
                                  <span className="text-[9px] text-blue-600 font-bold bg-blue-50 border border-blue-150 px-2 py-1 rounded-lg">
                                    + Agendar Doutor
                                  </span>
                                </button>
                              )
                            )}
                          </div>
                        );
                      })}

                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          )}

          {/* MONTH VIEW (Compact Calendar Grid) */}
          {viewMode === 'month' && (
            (() => {
              // build month calendar layout
              const year = currentDate.getFullYear();
              const month = currentDate.getMonth();
              const firstDayOfMonth = new Date(year, month, 1).getDay();
              const numDaysInMonth = new Date(year, month + 1, 0).getDate();
              
              const dayCells = [];
              // pad empty
              for (let i = 0; i < firstDayOfMonth; i++) {
                dayCells.push(null);
              }
              // actual days
              for (let d = 1; d <= numDaysInMonth; d++) {
                dayCells.push(new Date(year, month, d));
              }

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-7 text-center font-bold text-[10px] text-gray-400 uppercase tracking-widest">
                    <div>Dom</div>
                    <div>Seg</div>
                    <div>Ter</div>
                    <div>Qua</div>
                    <div>Qui</div>
                    <div>Sex</div>
                    <div>Sáb</div>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {dayCells.map((cell, idx) => {
                      if (!cell) return <div key={idx} className="bg-slate-50/20 aspect-video rounded-xl border border-gray-50/50"></div>;
                      
                      const cellDateStr = formatDateString(cell);
                      const isToday = cellDateStr === selectedDateStr;
                      
                      // Count appointments on this day
                      const dayApps = localAppointments.filter(app => app.date === cellDateStr);

                      return (
                        <div 
                          key={idx} 
                          onClick={() => setCurrentDate(cell)}
                          className={`min-h-[75px] bg-white p-2 rounded-2xl border transition-all cursor-pointer hover:border-blue-300 flex flex-col justify-between ${isToday ? 'border-2 border-blue-600 bg-blue-50/10 shadow-xs' : 'border-gray-100 hover:bg-slate-50/40'}`}
                        >
                          <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white font-extrabold' : 'text-gray-700'}`}>
                            {cell.getDate()}
                          </span>

                          <div className="space-y-1">
                            {dayApps.slice(0, 2).map((app, aIdx) => {
                              const docColor = getDentistColor(app.dentistName);
                              return (
                                <div 
                                  key={app.id} 
                                  className={`text-[8px] font-bold px-1.5 py-0.5 rounded truncate ${docColor.bg}`}
                                >
                                  {app.patientName.split(' ')[0]}
                                </div>
                              );
                            })}
                            {dayApps.length > 2 && (
                              <div className="text-[7px] text-gray-400 text-right font-extrabold">
                                + {dayApps.length - 2} mais
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()
          )}

          {/* TIMELINE VIEW (Hour by Hour row visualization with overlap alarms) */}
          {viewMode === 'timeline' && (
            <div className="space-y-6">
              <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl text-xs space-y-1 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block text-blue-800">Visualizador de Concorrência &amp; Sobrecarga Mecânica</span>
                  <p className="text-[11px] text-blue-700">
                    O sistema sinaliza automaticamente sobrecargas em operatórios idênticos na mesma faixa horária. Cadeira odontológica v01 possui sensor de congestionamento.
                  </p>
                </div>
              </div>

              {/* Dynamic list of appointments in order */}
              <div className="relative border-l-2 border-slate-100 pl-4 space-y-4">
                {timeSlots.map((slot, sIdx) => {
                  const slotApps = dayAppointments.filter(app => app.time.replace(/^0/, '') === slot.replace(/^0/, ''));
                  const isConflict = slotApps.length > 1;

                  return (
                    <div key={sIdx} className="relative group">
                      
                      {/* Timeline clock circular pip */}
                      <span className={`absolute -left-6 top-2.5 w-3.5 h-3.5 rounded-full border-2 ${isConflict ? 'bg-red-500 border-red-300 animate-pulse' : 'bg-slate-200 border-white'}`}></span>
                      
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        
                        {/* Time label */}
                        <div className="w-20 shrink-0 text-xs font-bold text-gray-500 tracking-wider">
                          {slot}
                        </div>

                        {/* Content box */}
                        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-3">
                          {slotApps.length > 0 ? (
                            slotApps.map((app) => {
                              const details = extraDetails[app.id] || { duration: 45, room: 'Consultório 01', flowStatus: app.status };
                              const docColor = getDentistColor(app.dentistName);
                              return (
                                <div 
                                  key={app.id} 
                                  onClick={() => handleEditClick(app)}
                                  className={`p-3.5 border rounded-2xl cursor-pointer hover:shadow-sm transition-all ${docColor.bg} ${isConflict ? 'border-2 border-red-300' : ''}`}
                                >
                                  <div className="flex justify-between items-center">
                                    <div className="font-extrabold text-[#0b1c30]">{app.patientName}</div>
                                    <span className="text-[8px] font-bold text-white bg-slate-900 px-1.5 py-0.5 rounded-md uppercase">
                                      {details.room}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-gray-500 font-semibold mt-1">{app.treatment} com {app.dentistName}</p>
                                  
                                  {isConflict && (
                                    <div className="mt-2 text-[9px] text-red-600 bg-red-50 py-1 px-2.5 rounded-lg border border-red-100 flex items-center gap-1 font-bold">
                                      🚨 Conflito operacional: Mesma hora com dentes coincidentes no operatório. Remaneje.
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <div className="py-2 px-3 text-[11px] text-gray-300 italic">
                              Operatórios e cadeiras livres de agendamento clínico
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* 5. RIGHT COLUMN: DOCTOR OPERABILITY / AVAILABILITY PANEL (COL-SPAN-3) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Active Dentists Section */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-3 border-b border-gray-50 pb-3">
              <div>
                <h3 className="text-xs font-extrabold text-[#0b1c30] uppercase tracking-wider">Disponibilidade Médica</h3>
                <span className="text-[9px] text-gray-400">Escala de plantão ativa hoje</span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            </div>

            <div className="space-y-3.5">
              {dentists.map((doc) => {
                // calculate consultations count today for this doc
                const docsTodayApps = dayAppointments.filter(app => app.dentistName.toLowerCase() === doc.name.toLowerCase());
                const loadPercentage = Math.min(100, Math.round((docsTodayApps.length / 5) * 100)); // 5 slots total cap

                return (
                  <div key={doc.id} className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-gray-100 rounded-2xl space-y-2.5 transition-colors">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden relative shrink-0">
                        <img alt={doc.name} src={doc.imageUrl} className="w-full h-full object-cover" />
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${doc.status === 'Available' ? 'bg-emerald-500' : 'bg-red-400'}`}></span>
                      </div>
                      
                      <div className="min-w-0 flex-grow">
                        <span className="font-extrabold text-[12px] text-[#0b1c30] truncate block">{doc.name}</span>
                        <span className="text-[9px] text-[#2563eb] font-semibold tracking-wide block">{doc.specialty}</span>
                      </div>
                    </div>

                    {/* Workload metric row */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase">
                        <span>Carga Clínica</span>
                        <span>{docsTodayApps.length} Atendimentos</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${loadPercentage > 80 ? 'bg-red-500' : loadPercentage > 40 ? 'bg-amber-500' : 'bg-[#2563eb]'}`}
                          style={{ width: `${loadPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Requests and Online Bookings Panel */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-3 border-b border-gray-50 pb-3">
              <div>
                <h3 className="text-xs font-extrabold text-[#0b1c30] uppercase tracking-wider">Aprovações do Site</h3>
                <span className="text-[9px] text-[#2563eb] font-bold">Ação instantânea requerida</span>
              </div>
              <span className="bg-amber-100 text-[#b45309] text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {localAppointments.filter(a => a.status === 'Pending').length} Req
              </span>
            </div>

            <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1">
              {localAppointments.filter(a => a.status === 'Pending').map((app) => {
                return (
                  <div key={app.id} className="p-3 rounded-2xl border border-amber-100 bg-amber-500/5 space-y-2.5 relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-extrabold text-[12px] block text-[#0b1c30]">{app.patientName}</span>
                        <span className="text-[9px] text-gray-400 font-mono block">{app.phone}</span>
                      </div>
                      <span className="text-[8px] bg-amber-100 text-[#b45309] font-bold px-1 rounded uppercase">WEB</span>
                    </div>

                    <div className="text-[10px] text-gray-600 bg-white/50 p-2 rounded-xl">
                      <strong>Tratamento:</strong> {app.treatment}<br/>
                      <strong>Previsão de Horário:</strong> {app.date} às {app.time}
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          updateLocalStatus(app.id, 'Confirmed');
                        }}
                        className="flex-grow py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] rounded-lg transition-colors cursor-pointer"
                      >
                        Aprovar
                      </button>
                      <button 
                        onClick={() => {
                          updateLocalStatus(app.id, 'Cancelled');
                        }}
                        className="py-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[9px] rounded-lg transition-colors cursor-pointer"
                      >
                        Recusar
                      </button>
                    </div>
                  </div>
                );
              })}

              {localAppointments.filter(a => a.status === 'Pending').length === 0 && (
                <div className="p-8 text-center text-gray-400 text-xs italic space-y-1">
                  <UserCheck className="w-8 h-8 mx-auto text-emerald-500 opacity-60" />
                  <p className="font-semibold text-gray-500 text-[10px] uppercase">Muito bem!</p>
                  <p className="text-[9px]">Fila de aprovações limpa e em sincronia.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Dental Room Monitor Widget */}
          <div className="bg-[#0b1c30] text-amber-100 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-custom" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#ffe088]">Infraestrutura Clínica</span>
            </div>
            <p className="text-[10px] text-gray-300 leading-relaxed">
              Equipamento de anestesia magnética de alta-potência ativo no Operatório Safira.
            </p>
            <div className="border-t border-gray-800 pt-2 flex items-center justify-between text-[9px] font-mono text-gray-400">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-custom"></span> Sala 01</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-custom"></span> Sala 02</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span> Sala B</span>
            </div>
          </div>

        </div>

      </div>

      {/* 6. ADVANCED COMPREHENSIVE APPOINTMENT LIST TABLE (Bottom Section) */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-gray-500" /> Registro Geral de Atendimentos Reais
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Visão consolidada do fluxo operacional. Total: {filteredAppointments.length} consultas filtradas</p>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => alert("Histórico de fichas de consultas consolidado para Excel na pasta local.")}
              className="px-3.5 py-2 border border-gray-250 hover:bg-gray-50 text-gray-600 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" /> Exportar Planilha
            </button>
          </div>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-[#f8f9ff] text-gray-400 uppercase text-[9px] tracking-widest border-b border-gray-100">
              <tr>
                <th className="p-4 pl-6">Paciente</th>
                <th className="p-4">Tratamento Realizado</th>
                <th className="p-4">Associação Dentista</th>
                <th className="p-4">Agendamento Real</th>
                <th className="p-4">Operatório / Sala</th>
                <th className="p-4">Status Digital</th>
                <th className="p-4 text-center">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {filteredAppointments.map((app) => {
                const details = extraDetails[app.id] || { duration: 45, room: 'Consultório 01', flowStatus: app.status };
                const stStyles = getStatusBadgeStyles(details.flowStatus);
                const isWebBooking = app.status === 'Pending';

                return (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-all font-medium">
                    {/* Patient Name / Avatar */}
                    <td className="p-4 pl-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2563eb] font-extrabold flex items-center justify-center border border-blue-100 relative shrink-0">
                          {app.patientName.charAt(0)}
                          {isWebBooking && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white" title="Novidade via site"></span>}
                        </div>
                        <div>
                          <span className="font-bold text-[#0b1c30] text-[12px] block hover:text-blue-600 transition-colors cursor-pointer" onClick={() => onSelectPatientById && onSelectPatientById(app.patientName)}>
                            {app.patientName}
                          </span>
                          <span className="text-[9px] text-gray-400 font-normal block">{app.email} ⎯ {app.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Treatment info */}
                    <td className="p-4">
                      <span className="text-gray-900 block font-semibold">{app.treatment}</span>
                      <span className="text-[10px] text-gray-400 font-normal block">Valor estimado: € {app.price?.toLocaleString('pt-PT') || '450'}</span>
                    </td>

                    {/* Assigned Dentist */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800">{app.dentistName}</span>
                      </div>
                    </td>

                    {/* DateTime */}
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-[#0b1c30]">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{app.date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 font-normal">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{app.time} ({details.duration} mins)</span>
                        </div>
                      </div>
                    </td>

                    {/* Room Chair */}
                    <td className="p-4">
                      <span className="text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-mono">
                        {details.room}
                      </span>
                    </td>

                    {/* Rich Status badge */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 rounded-full text-[9px] font-bold border ${stStyles.class}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${stStyles.dot}`}></span>
                        {stStyles.text}
                      </span>
                    </td>

                    {/* Quick Flow Actions */}
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        
                        {/* Status In Progress Trigger */}
                        {details.flowStatus === 'Confirmed' && (
                          <button 
                            onClick={() => updateLocalStatus(app.id, 'In Progress')}
                            className="w-7 h-7 hover:bg-blue-100 text-blue-600 rounded-full flex items-center justify-center transition-all cursor-pointer"
                            title="Atender Paciente na Cadeira"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Status Completed Trigger */}
                        {details.flowStatus === 'In Progress' && (
                          <button 
                            onClick={() => updateLocalStatus(app.id, 'Completed')}
                            className="w-7 h-7 hover:bg-emerald-100 text-emerald-custom rounded-full flex items-center justify-center transition-all cursor-pointer"
                            title="Finalizar e Faturar Consulta"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Quick Approve for pending */}
                        {details.flowStatus === 'Pending' && (
                          <button 
                            onClick={() => updateLocalStatus(app.id, 'Confirmed')}
                            className="w-7 h-7 bg-emerald-500/15 hover:bg-emerald-500 hover:text-white text-emerald-600 rounded-full flex items-center justify-center transition-all cursor-pointer"
                            title="Aprovar de Imediato"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Details edit button */}
                        <button 
                          onClick={() => handleEditClick(app)}
                          className="w-7 h-7 hover:bg-slate-100 text-slate-500 rounded-full flex items-center justify-center transition-all cursor-pointer"
                          title="Ficha Detalhada / Remanejar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* No-show fallback */}
                        {details.flowStatus !== 'Cancelled' && details.flowStatus !== 'Completed' && (
                          <button 
                            onClick={() => updateLocalStatus(app.id, 'No-show')}
                            className="w-7 h-7 hover:bg-violet-100 text-violet-600 rounded-full flex items-center justify-center transition-all cursor-pointer"
                            title="Registrar Falta do Paciente"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Cancel/Del Trigger */}
                        <button 
                          onClick={() => {
                            if (confirm(`Deseja realmente cancelar a consulta do paciente ${app.patientName}?`)) {
                              updateLocalStatus(app.id, 'Cancelled');
                            }
                          }}
                          className="w-7 h-7 hover:bg-red-50 text-red-500 rounded-full flex items-center justify-center transition-all cursor-pointer"
                          title="Cancelar Agendamento"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}

              {filteredAppointments.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-gray-400">
                    <AlertCircle className="w-12 h-12 text-[#bfc7d4] mx-auto opacity-50 mb-2" />
                    <span className="text-xs font-bold block">Consonância com busca esvaziada</span>
                    <p className="text-[10px] mt-1 text-gray-400">Tente ajustar seus termos de pesquisa ou resetar os filtros operatórios superiores.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. HIGH FIDELITY CREATION/EDITION MULTI-SLOT SHEET DIALOG (Modal) */}
      <AnimatePresence>
        {(showCreateModal || isEditMode) && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs text-xs"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl relative"
            >
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  setIsEditMode(false);
                  setSelectedAppointment(null);
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-gray-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="border-b border-gray-50 pb-3">
                <span className="text-[9px] font-extrabold text-blue-600 uppercase tracking-widest block font-mono">
                  {isEditMode ? "Ficha Detalhada / Remanejamento" : "Sistema Integrado de Agendamento"}
                </span>
                <h3 className="text-lg font-bold text-[#0b1c30] mt-0.5">
                  {isEditMode ? `Revisar Consulta de ${appointmentForm.patientName}` : "Preencher Ficha de Consulta"}
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  O sistema valida horários coincidentes ao salvar para evitar duplicidade de cadeira odontológica.
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                {/* Patient basics */}
                <div className="space-y-3 p-3.5 bg-slate-50 rounded-2xl border border-gray-100">
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">1. Identificação de Prontuário</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1">Nome Completo</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Nome do Paciente"
                        value={appointmentForm.patientName}
                        onChange={e => setAppointmentForm(prev => ({ ...prev, patientName: e.target.value }))}
                        className="w-full bg-white border border-gray-150 rounded-lg p-2.5 text-xs focus:border-[#2563eb] outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1">WhatsApp / Telefone</label>
                      <input 
                        type="tel" 
                        required
                        placeholder="(11) 9..."
                        value={appointmentForm.phone}
                        onChange={e => setAppointmentForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-white border border-gray-150 rounded-lg p-2.5 text-xs focus:border-[#2563eb] outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">E-mail</label>
                    <input 
                      type="email" 
                      required
                      placeholder="Identificação digital para e-mail"
                      value={appointmentForm.email}
                      onChange={e => setAppointmentForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-white border border-gray-150 rounded-lg p-2.5 text-xs focus:border-[#2563eb] outline-none font-medium"
                    />
                  </div>
                </div>

                {/* Scheduling Parameters */}
                <div className="space-y-3 p-3.5 bg-slate-50/70 rounded-2xl border border-gray-100">
                  <span className="text-[9px] font-extrabold text-[#2563eb] uppercase tracking-wider block">2. Escala Operatória</span>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1">Data</label>
                      <input 
                        type="date" 
                        required
                        value={appointmentForm.date}
                        onChange={e => setAppointmentForm(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full bg-white border border-gray-150 rounded-lg p-2.5 text-xs text-gray-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1">Início Slot</label>
                      <select
                        value={appointmentForm.time}
                        onChange={e => setAppointmentForm(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full bg-white border border-gray-150 rounded-lg p-2.5 text-xs text-gray-600 focus:border-blue-500 outline-none"
                      >
                        {timeSlots.map((ts, idx) => (
                          <option key={idx} value={ts}>{ts}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1">Durabilidade</label>
                      <select
                        value={appointmentForm.duration}
                        onChange={e => setAppointmentForm(prev => ({ ...prev, duration: Number(e.target.value) }))}
                        className="w-full bg-white border border-gray-150 rounded-lg p-2.5 text-xs text-gray-600 focus:border-blue-500 outline-none"
                      >
                        <option value={30}>30 minutos</option>
                        <option value={45}>45 minutos</option>
                        <option value={60}>60 minutos</option>
                        <option value={90}>90 minutos (Implante)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1">Dentista Especialista</label>
                      <select
                        value={appointmentForm.dentistName}
                        onChange={e => setAppointmentForm(prev => ({ ...prev, dentistName: e.target.value }))}
                        className="w-full bg-white border border-gray-150 rounded-lg p-2.5 text-xs text-gray-600 focus:border-blue-500 outline-none"
                      >
                        {dentists.map((doc) => (
                          <option key={doc.id} value={doc.name}>{doc.name} ({doc.specialty.split(' ')[0]})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1">Tratamento</label>
                      <select
                        value={appointmentForm.treatment}
                        onChange={e => setAppointmentForm(prev => ({ ...prev, treatment: e.target.value }))}
                        className="w-full bg-white border border-gray-150 rounded-lg p-2.5 text-xs text-gray-600 focus:border-blue-500 outline-none"
                      >
                        {treatmentsList.map((tr, idx) => (
                          <option key={idx} value={tr}>{tr}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1">Espaço / Consultório</label>
                      <select
                        value={appointmentForm.room}
                        onChange={e => setAppointmentForm(prev => ({ ...prev, room: e.target.value }))}
                        className="w-full bg-white border border-gray-150 rounded-lg p-2.5 text-xs text-gray-600 focus:border-blue-500 outline-none"
                      >
                        {roomsList.map((r, idx) => (
                          <option key={idx} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1">Status Clínico Atual</label>
                      <select
                        value={appointmentForm.flowStatus}
                        onChange={e => setAppointmentForm(prev => ({ ...prev, flowStatus: e.target.value as any }))}
                        className="w-full bg-white border border-gray-150 rounded-lg p-2.5 text-xs text-gray-600 focus:border-blue-500 outline-none"
                      >
                        <option value="Confirmed">Confirmado (Ativo)</option>
                        <option value="Pending">Pendente de Confirmação</option>
                        <option value="In Progress">Em Consulta</option>
                        <option value="Completed">Concluído</option>
                        <option value="Cancelled">Cancelado</option>
                        <option value="No-show">No-show / Faltou</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Observações Prévias Clínicas / Encaminhamento</label>
                  <textarea
                    rows={2}
                    placeholder="Sintomas, histórico odontológico imediato ou restrições..."
                    value={appointmentForm.notes}
                    onChange={e => setAppointmentForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full border border-gray-150 rounded-lg p-2 text-xs focus:border-blue-500 outline-none resize-none"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setIsEditMode(false);
                      setSelectedAppointment(null);
                    }}
                    className="w-1/3 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl font-bold transition-all"
                  >
                    Voltar
                  </button>
                  <button 
                    type="submit"
                    className="w-2/3 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white font-extrabold rounded-xl shadow transition-colors cursor-pointer"
                  >
                    {isEditMode ? "Confirmar Mudanças" : "Agendar Paciente"}
                  </button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
