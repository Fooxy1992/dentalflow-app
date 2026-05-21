import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Stethoscope, 
  DollarSign, 
  Sparkles, 
  Settings, 
  Search, 
  Eye, 
  Plus, 
  Check, 
  X, 
  Activity, 
  ChevronRight, 
  Clipboard, 
  HelpCircle, 
  Bell, 
  CornerDownRight, 
  ArrowLeft, 
  ShieldCheck, 
  AlertTriangle,
  Send,
  UserCheck,
  UserPlus,
  Menu
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Appointment, Dentist, Patient, Transaction, ClinicService } from '../types';
import AppointmentsCenter from './appointments/AppointmentsCenter';
import PatientRecordsCenter from './patients/PatientRecordsCenter';
import DentistsTeamCenter from './dentists/DentistsTeamCenter';
import FinancialRevenueCenter from './financial/FinancialRevenueCenter';
import ClinicServicesCenter from './services/ClinicServicesCenter';

interface ClinicDashboardProps {
  services: ClinicService[];
  appointments: Appointment[];
  patients: Patient[];
  dentists: Dentist[];
  transactions: Transaction[];
  onUpdateAppointmentStatus: (id: string, status: 'Confirmed' | 'Pending' | 'Cancelled') => void;
  onAddAppointment: (appointment: Omit<Appointment, 'id' | 'status' | 'price'>) => void;
  onAddPatient: (patient: Omit<Patient, 'id'>) => void;
  onSwitchToPublic: () => void;
  onAddDentist: (dentist: Omit<Dentist, 'id'>) => void;
  onUpdateDentistStatus: (id: string, status: 'Available' | 'On Leave') => void;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onUpdateTransactionStatus: (id: string, status: 'Paid' | 'Pending' | 'Overdue') => void;
  onAddService: (newSrv: Omit<ClinicService, 'id' | 'bookingCount' | 'revenueGenerated' | 'createdAt'>) => void;
  onUpdateService: (updatedSrv: ClinicService) => void;
  onDeleteService: (id: string) => void;
}

export default function ClinicDashboard({
  services,
  appointments,
  patients,
  dentists,
  transactions,
  onUpdateAppointmentStatus,
  onAddAppointment,
  onAddPatient,
  onSwitchToPublic,
  onAddDentist,
  onUpdateDentistStatus,
  onAddTransaction,
  onUpdateTransactionStatus,
  onAddService,
  onUpdateService,
  onDeleteService
}: ClinicDashboardProps) {
  // Sidebar states
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments' | 'patients' | 'dentists' | 'financial' | 'services'>('dashboard');
  
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Notifications dropdown state
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Selected patient for clinical modal view (tooth chart!)
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  
  // Tooth state for individual patient tooth chart
  // Tooth identifier 11 to 48 (ISO dental system: 11-18 upper right, 21-28 upper left, 31-38 lower left, 41-48 lower right)
  const [patientTeeth, setPatientTeeth] = useState<Record<string, Record<number, 'Healthy' | 'Decay' | 'Missing' | 'Treated'>>>({
    'pat-1': { 18: 'Healthy', 17: 'Treated', 16: 'Decay', 15: 'Healthy', 11: 'Healthy', 21: 'Healthy', 26: 'Missing', 36: 'Treated', 46: 'Healthy' }
  });

  // Today's Date representation in PT
  const todayStr = '2026-05-21';

  // Toggle single tooth status
  const handleToothClick = (patientId: string, toothNum: number) => {
    setPatientTeeth(prev => {
      const currentPatientRecord = prev[patientId] || {};
      const states: ('Healthy' | 'Decay' | 'Missing' | 'Treated')[] = ['Healthy', 'Decay', 'Missing', 'Treated'];
      const currentIndex = states.indexOf(currentPatientRecord[toothNum] || 'Healthy');
      const nextIndex = (currentIndex + 1) % states.length;
      
      return {
        ...prev,
        [patientId]: {
          ...currentPatientRecord,
          [toothNum]: states[nextIndex]
        }
      };
    });
  };

  // Static reports for chart representations
  const revenueData = useMemo(() => {
    // Dynamically calculate cumulative monthly revenues
    let baseMap = {
      'May': 85000,
      'Jun': 92000,
      'Jul': 89000,
      'Aug': 105000,
      'Sep': 112000,
      'Oct': 124500
    };
    
    // Add amount of confirmed/completed appointments to Oct
    const confirmedTotal = appointments
      .filter(a => a.status === 'Confirmed')
      .reduce((sum, a) => sum + (a.price || 450), 0);
      
    baseMap['Oct'] = 124500 + confirmedTotal;
    
    return [
      { month: 'May', Revenue: baseMap['May'] },
      { month: 'Jun', Revenue: baseMap['Jun'] },
      { month: 'Jul', Revenue: baseMap['Jul'] },
      { month: 'Aug', Revenue: baseMap['Aug'] },
      { month: 'Sep', Revenue: baseMap['Sep'] },
      { month: 'Oct', Revenue: baseMap['Oct'] },
    ];
  }, [appointments]);

  const currentRevenue = useMemo(() => {
    const defaultBase = 124500;
    const addedBase = appointments
      .filter(a => a.status === 'Confirmed')
      .reduce((sum, a) => sum + (a.price || 450), 0);
    return defaultBase + addedBase;
  }, [appointments]);

  // Donut chart treatment stats
  const checkupCount = appointments.filter(a => a.treatment === 'Checkup' || a.treatment === 'Odontologia Geral').length + 8;
  const whiteningCount = appointments.filter(a => a.treatment === 'Teeth Whitening' || a.treatment === 'Clareamento').length + 15;
  const implantCount = appointments.filter(a => a.treatment === 'Dental Implants' || a.treatment === 'Implantes').length + 4;
  const orthoCount = appointments.filter(a => a.treatment === 'Orthodontics' || a.treatment === 'Ortodontia').length + 6;

  const treatmentPieData = [
    { name: 'Checkup', value: checkupCount, color: '#3b82f6' },
    { name: 'Whitening', value: whiteningCount, color: '#fed65b' },
    { name: 'Implants', value: implantCount, color: '#10b981' },
    { name: 'Orthodontics', value: orthoCount, color: '#8b5cf6' },
  ];

  // Appointment creation walkin modal
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [showPatientCreationModal, setShowPatientCreationModal] = useState(false);
  const [walkinForm, setWalkinForm] = useState({
    patientName: '',
    email: '',
    phone: '',
    date: '2026-05-21',
    time: '11:00 AM',
    treatment: 'Teeth Whitening',
    dentistName: dentists[0]?.name || 'Dr. Sarah Jenkins',
    notes: ''
  });

  const [patientForm, setPatientForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: 32,
    gender: 'Masculino',
    medicalHistory: 'Nenhuma alergia relevante',
    notes: ''
  });

  const handleCreateWalkin = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAppointment(walkinForm);
    setShowWalkinModal(false);
    setWalkinForm({
      patientName: '',
      email: '',
      phone: '',
      date: '2026-05-21',
      time: '11:00 AM',
      treatment: 'Teeth Whitening',
      dentistName: dentists[0]?.name || 'Dr. Sarah Jenkins',
      notes: ''
    });
  };

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPatient({
      name: patientForm.name,
      email: patientForm.email,
      phone: patientForm.phone,
      age: Number(patientForm.age),
      gender: patientForm.gender,
      lastVisit: '2026-05-21',
      medicalHistory: patientForm.medicalHistory ? patientForm.medicalHistory.split(',').map(m => m.trim()) : [],
      status: 'Active',
      notes: patientForm.notes
    });
    setShowPatientCreationModal(false);
    setPatientForm({
      name: '',
      email: '',
      phone: '',
      age: 32,
      gender: 'Masculino',
      medicalHistory: '',
      notes: ''
    });
  };


  // Filtered queries
  const filteredAppointmentsBySearch = useMemo(() => {
    return appointments.filter(app => 
      app.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.treatment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.dentistName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [appointments, searchQuery]);

  const filteredPatientsBySearch = useMemo(() => {
    return patients.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery)
    );
  }, [patients, searchQuery]);

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex font-sans overflow-x-hidden">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* LEFT SIDEBAR - Matching the DentaFlow Mockup */}
      <aside className={`fixed lg:sticky top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col shrink-0 justify-between z-50 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center text-white font-bold">D</span>
              <div>
                <span className="font-bold text-sm tracking-tight text-[#0b1c30]">DentaFlow</span>
                <span className="text-[9px] text-gray-400 block tracking-wider font-semibold uppercase">Elite Dental Care</span>
              </div>
            </div>
          </div>

          {/* Quick Action */}
          <div className="p-4">
            <button 
              onClick={() => setShowWalkinModal(true)}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl py-3 px-4 text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Novo Agendamento
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-[#2563eb]'
                  : 'text-[#434655] hover:bg-gray-50 hover:text-[#0b1c30]'
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Painel Geral
            </button>

            <button 
              onClick={() => setActiveTab('appointments')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'appointments'
                  ? 'bg-blue-50 text-[#2563eb]'
                  : 'text-[#434655] hover:bg-gray-50 hover:text-[#0b1c30]'
              }`}
            >
              <Calendar className="w-4 h-4" /> Consultas &amp; Horários
              {appointments.filter(a => a.status === 'Pending').length > 0 && (
                <span className="ml-auto bg-amber-500 text-white min-w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold px-1 animate-pulse">
                  {appointments.filter(a => a.status === 'Pending').length}
                </span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab('patients')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'patients'
                  ? 'bg-blue-50 text-[#2563eb]'
                  : 'text-[#434655] hover:bg-gray-50 hover:text-[#0b1c30]'
              }`}
            >
              <Users className="w-4 h-4" /> Prontuário de Pacientes
            </button>

            <button 
              onClick={() => setActiveTab('dentists')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'dentists'
                  ? 'bg-blue-50 text-[#2563eb]'
                  : 'text-[#434655] hover:bg-gray-50 hover:text-[#0b1c30]'
              }`}
            >
              <Stethoscope className="w-4 h-4" /> Corpo de Dentistas
            </button>

            <button 
              onClick={() => setActiveTab('financial')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'financial'
                  ? 'bg-blue-50 text-[#2563eb]'
                  : 'text-[#434655] hover:bg-gray-50 hover:text-[#0b1c30]'
              }`}
            >
              <DollarSign className="w-4 h-4" /> Fluxo Financeiro
            </button>

            <button 
              onClick={() => setActiveTab('services')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-blue-50 text-[#2563eb]'
                  : 'text-[#434655] hover:bg-gray-50 hover:text-[#0b1c30]'
              }`}
            >
              <Activity className="w-4 h-4" /> Tratamentos &amp; Serviços
            </button>
          </nav>
        </div>

        {/* Access Public Website button */}
        <div className="p-4 border-t border-gray-50">
          <button 
            onClick={onSwitchToPublic}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0b1c30] hover:bg-gray-800 text-[#ffe088] transition-colors font-medium text-xs cursor-pointer shadow-sm"
          >
            <span>Retornar ao Site</span>
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
        </div>
      </aside>

      {/* CENTER WORK AREA */}
      <main className="flex-grow flex flex-col min-w-0">
        
        {/* HEADER BAR */}
        <header className="h-16 bg-white border-b border-gray-50 px-4 md:px-8 flex justify-between items-center shrink-0 z-30 sticky top-0">
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-[#0b1c30] hover:bg-gray-50 rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-48 md:w-96 relative hidden sm:block">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Pesquisar consultas ou pacientes..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-100 focus:border-blue-400 focus:outline-none rounded-2xl text-xs transition-colors bg-gray-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <a 
              href="#help" 
              onClick={(e) => { e.preventDefault(); alert("Fale com o suporte técnico DentaFlow pelo ramal: 110-DENTAL."); }}
              className="hidden sm:flex text-xs font-medium text-gray-400 hover:text-[#0b1c30] items-center gap-1.5 transition-colors"
            >
              <HelpCircle className="w-4 h-4" /> Central de Ajuda
            </a>

            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors relative ${isNotificationsOpen ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-[#0b1c30] hover:bg-blue-50 hover:text-blue-600'}`}
              >
                <Bell className="w-4 h-4" />
                {appointments.filter(a => a.status === 'Pending').length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse border-2 border-white"></span>
                )}
              </button>
              
              {/* Avisos de Próximas Consultas Dropdown */}
              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col overflow-hidden z-50 text-left"
                    >
                      <div className="p-4 border-b border-gray-50 bg-[#f8fafc] flex justify-between items-center">
                        <h4 className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-1.5">
                          <Bell className="w-3.5 h-3.5 text-blue-500" />
                          Aviso de Consultas
                        </h4>
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {appointments.filter(a => a.status === 'Pending').length} Novas
                        </span>
                      </div>
                      
                      <div className="max-h-[320px] overflow-y-auto divide-y divide-gray-50 p-2">
                        {appointments.filter(a => a.status === 'Pending').length > 0 ? (
                          appointments.filter(a => a.status === 'Pending').slice(0, 5).map((app, idx) => (
                            <div key={idx} className="p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors space-y-1">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-extrabold text-[#0b1c30] truncate pr-2">{app.patientName}</span>
                                <span className="text-[10px] font-bold text-red-500 shrink-0 bg-red-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                                  Pendente
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-[10px] text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{app.date} • {app.time}</span>
                                </div>
                              </div>
                              <div className="text-[10px] text-gray-400 truncate mt-1">
                                <span className="font-medium text-[#2563eb]">{app.treatment}</span> com Dr(a). {app.dentistName.split(' ')[1]}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center text-gray-400">
                            <Check className="w-6 h-6 mx-auto mb-2 text-gray-200" />
                            <p className="text-xs">Nenhum aviso pendente.<br/>Tudo sob controle!</p>
                          </div>
                        )}
                      </div>
                      
                      {appointments.filter(a => a.status === 'Pending').length > 0 && (
                        <div className="p-3 border-t border-gray-50 bg-gray-50/50">
                          <button 
                            onClick={() => {
                              setIsNotificationsOpen(false);
                              setActiveTab('appointments');
                            }}
                            className="w-full py-2 bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-[#0b1c30] rounded-xl transition-colors cursor-pointer"
                          >
                            Ir para Centro de Agendamentos
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 border-l border-gray-100 pl-6">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                <img 
                  alt="Dr. Smith" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuMfMISirZQjS_fmCtdWUQ4dO_I5fbyKLY5gaSHo22GMZMqvjkj3bZtHe3B5gmMVVp3xqQxbejQJaqyBUGdhQ4qzPji_aYazZ6NsCrbmFtdZ0y8eaC1dZ0JjVUeo4jTh1tlQY8Fc4AJ3CJzjYLvd-8rAIPJPRQjsSFW0jIFfKASAFIVuA2haObd8v8OloKR3AEj-aUGl3294Ujr6ydXQZ4cbVGjZ74TR8jYpDX29GpcpGUnBVxZERKssPP8ERxIl6_5El4WDgG2Lca8" 
                />
              </div>
              <div>
                <span className="text-xs font-semibold block text-[#0b1c30]">Dr. Jenkins</span>
                <span className="text-[10px] text-emerald-custom font-medium block">Clínico Chefe</span>
              </div>
            </div>
          </div>
        </header>

        {/* INNER SCROLLABLE CONTENT */}
        <div className="p-4 md:p-8 flex-grow overflow-y-auto space-y-8 max-w-7xl w-full mx-auto">
          
          {/* TAB 1: DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 md:space-y-8 animate-fade-in">
              
              {/* HEADING WELCOME */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#0b1c30]">Overview Clínico</h1>
                  <p className="text-xs text-[#434655] mt-1">Bem-vindo de volta, Dr. Jenkins. Eis o status de faturamento e agendamentos de hoje, 21 de Maio.</p>
                </div>
                
                <div className="flex flex-wrap sm:flex-nowrap gap-3 text-xs w-full sm:w-auto">
                  <button 
                    onClick={() => alert("Relatório clínico consolidado exportado para PDF na pasta local.")}
                    className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    Exportar Planilha
                  </button>
                  <span className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-100 text-[#2563eb] font-semibold rounded-lg flex items-center justify-center gap-1.5">
                    Maio, 2026
                  </span>
                </div>
              </div>

              {/* STAT CARDS ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-100 transition-all flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Faturamento do Mês</span>
                    <h3 className="text-2xl font-bold text-[#0b1c30] mt-2">€ {currentRevenue.toLocaleString('pt-PT')}</h3>
                    <div className="mt-4 inline-flex items-center gap-1 py-0.5 px-2 rounded-full bg-[#10b981]/15 text-[#10b981] text-[10px] font-semibold">
                      <span>+12.5%</span> <span className="text-gray-400 font-normal">vs último mês</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">€</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-100 transition-all flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Consultas Hoje</span>
                    <h3 className="text-2xl font-bold text-[#0b1c30] mt-2">{42 + appointments.filter(a => a.status === 'Confirmed').length}</h3>
                    <div className="mt-4 inline-flex items-center gap-1 py-0.5 px-2 rounded-full bg-amber-500/15 text-amber-600 text-[10px] font-semibold">
                      <span>{appointments.filter(a => a.status === 'Pending').length} Pendentes</span> <span className="text-gray-400 font-normal">revisar</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-100 transition-all flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Novos Pacientes</span>
                    <h3 className="text-2xl font-bold text-[#0b1c30] mt-2">{128 + patients.length - 2}</h3>
                    <div className="mt-4 inline-flex items-center gap-1 py-0.5 px-2 rounded-full bg-blue-600/15 text-blue-600 text-[10px] font-semibold">
                      <span>+5.2%</span> <span className="text-gray-400 font-normal">crescimento</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-100 transition-all flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Dentistas Ativos</span>
                    <h3 className="text-2xl font-bold text-[#0b1c30] mt-2">
                      {dentists.filter(d => d.status === 'Available').length} <span className="text-xs text-gray-400">/ {dentists.length}</span>
                    </h3>
                    <div className="mt-4 inline-flex items-center gap-1 py-0.5 px-2 rounded-full bg-gray-150 text-gray-500 text-[10px] font-semibold">
                      <span>{dentists.filter(d => d.status === 'On Leave').length} Licença</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#bfc7d4]/30 text-gray-700 flex items-center justify-center">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                </div>

              </div>

              {/* CHARTS CONTAINER - Exactly as image 4 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Revenue Analytics Line Chart */}
                <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-3 mb-6">
                    <div>
                      <h3 className="text-sm font-semibold tracking-tight text-[#0b1c30]">Evolutivo de Faturamento (€)</h3>
                      <span className="text-[10px] text-gray-400">Receita consolidada de faturamento mensal</span>
                    </div>
                    <div className="w-1.5 h-6 text-gray-300 font-bold block cursor-pointer">···</div>
                  </div>

                  <div className="h-64 w-full text-xs font-semibold">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart 
                        data={revenueData}
                        margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="month" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" tickFormatter={(v) => `€ ${v/1000}k`} />
                        <Tooltip formatter={(value: any) => [`€ ${Number(value).toLocaleString('pt-PT')}`, 'Faturamento']} />
                        <Line 
                          type="monotone" 
                          dataKey="Revenue" 
                          stroke="#2563eb" 
                          strokeWidth={3}
                          dot={{ r: 4, stroke: "#3b82f6", strokeWidth: 2, fill: "#fff" }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Donut Treatment Chart */}
                <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-100 flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-3 mb-4">
                    <div>
                      <h3 className="text-sm font-semibold tracking-tight text-[#0b1c30]">Frequência de Serviços</h3>
                      <span className="text-[10px] text-gray-400">Tratamentos odontológicos requisitados</span>
                    </div>
                    <div className="w-1.5 h-6 text-gray-300 font-bold block cursor-pointer">···</div>
                  </div>

                  <div className="h-44 w-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={treatmentPieData}
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {treatmentPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute text-center">
                      <span className="text-lg font-bold text-[#0b1c30]">
                        {checkupCount + whiteningCount + implantCount + orthoCount}
                      </span>
                      <span className="text-[9px] text-gray-400 block uppercase font-semibold">Total</span>
                    </div>
                  </div>

                  {/* Pie Legend custom */}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-medium text-gray-500">
                    {treatmentPieData.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                        <span className="truncate">{item.name} ({item.value})</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* RECENT REQUESTS QUEUE */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-semibold text-[#0b1c30]">Fila de Consultas Recentes</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Veja solicitações feitas através do Site para aceitar ou reagendar</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('appointments')} 
                    className="text-[#2563eb] text-xs font-semibold hover:underline"
                  >
                    Ver Todas
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 text-gray-400 uppercase text-[9px] tracking-wider border-b border-gray-100">
                      <tr>
                        <th className="p-4 pl-6">Paciente</th>
                        <th className="p-4">Tratamento</th>
                        <th className="p-4">Horário Desejado</th>
                        <th className="p-4">Dentista</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-center">Ações Rápidas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {appointments.slice(-5).reverse().map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 pl-6 font-semibold text-[#0b1c30]">
                            {app.patientName}
                            <span className="text-[10px] text-gray-400 block font-normal">{app.email}</span>
                          </td>
                          <td className="p-4 font-medium text-gray-700">{app.treatment}</td>
                          <td className="p-4 font-normal text-[#434655]">
                            {app.date}
                            <span className="text-[10px] text-gray-400 block">{app.time}</span>
                          </td>
                          <td className="p-4 text-gray-600 font-medium">{app.dentistName}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              app.status === 'Confirmed' 
                                ? 'bg-emerald-500/10 text-emerald-custom' 
                                : app.status === 'Cancelled'
                                ? 'bg-red-500/10 text-red-600'
                                : 'bg-amber-500/10 text-amber-600'
                            }`}>
                              {app.status === 'Confirmed' ? 'Confirmado' : app.status === 'Cancelled' ? 'Cancelado' : 'Pendente'}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {app.status === 'Pending' ? (
                              <div className="flex justify-center gap-2">
                                <button 
                                  onClick={() => {
                                    onUpdateAppointmentStatus(app.id, 'Confirmed');
                                    alert(`Consulta de ${app.patientName} CONFIRMADA com sucesso!`);
                                  }}
                                  className="w-7 h-7 bg-[#10b981]/15 text-[#10b981] hover:bg-[#10b981] hover:text-white rounded-full flex items-center justify-center transition-all cursor-pointer"
                                  title="Aprovar Agenda"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => {
                                    onUpdateAppointmentStatus(app.id, 'Cancelled');
                                    alert(`Consulta de ${app.patientName} REJEITADA/CANCELADA.`);
                                  }}
                                  className="w-7 h-7 bg-red-100 text-red-600 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-all cursor-pointer"
                                  title="Recusar Consulta"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-[10px]">Sem pendências</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: APPOINTMENTS CENTER */}
          {activeTab === 'appointments' && (
            <AppointmentsCenter 
              appointments={appointments}
              patients={patients}
              dentists={dentists}
              onUpdateAppointmentStatus={onUpdateAppointmentStatus}
              onAddAppointment={onAddAppointment}
              onSelectPatientById={(patientName) => {
                const found = patients.find(p => p.name.toLowerCase().includes(patientName.toLowerCase()));
                if (found) {
                  setSelectedPatientId(found.id);
                }
                setActiveTab('patients');
              }}
              onSwitchTab={(tab) => {
                setActiveTab(tab);
              }}
            />
          )}

          {/* TAB 3: PATIENT DIRECTORY & TOOTH CLINICAL CHART (Image 4/5 integration!) */}
          {activeTab === 'patients' && (
            <PatientRecordsCenter 
              patients={patients}
              appointments={appointments}
              dentists={dentists}
              onAddPatient={onAddPatient}
              selectedPatientId={selectedPatientId}
              setSelectedPatientId={setSelectedPatientId}
            />
          )}

          {/* TAB 4: DENTISTS TEAM MANAGER */}
          {activeTab === 'dentists' && (
            <DentistsTeamCenter 
              dentists={dentists}
              appointments={appointments}
              patients={patients}
              onAddDentist={onAddDentist}
              onUpdateDentistStatus={onUpdateDentistStatus}
            />
          )}

          {/* TAB 5: FINANCIAL RECORDS */}
          {activeTab === 'financial' && (
            <FinancialRevenueCenter 
              transactions={transactions}
              appointments={appointments}
              dentists={dentists}
              patients={patients}
              onAddTransaction={onAddTransaction}
              onUpdateTransactionStatus={onUpdateTransactionStatus}
            />
          )}

          {/* TAB 6: SERVICES MANAGEMENT */}
          {activeTab === 'services' && (
            <ClinicServicesCenter 
              services={services}
              dentists={dentists}
              onAddService={onAddService}
              onUpdateService={onUpdateService}
              onDeleteService={onDeleteService}
            />
          )}

        </div>
      </main>

      {/* WALKIN CREATE APPOINTMENT MODAL */}
      <AnimatePresence>
        {showWalkinModal && (
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
              className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-[#0b1c30]">Agendamento Manual Interno (Walk-in/Telefone)</h3>
                <button 
                  onClick={() => setShowWalkinModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateWalkin} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Paciente</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Nome do Paciente"
                      value={walkinForm.patientName}
                      onChange={e => setWalkinForm(prev => ({ ...prev, patientName: e.target.value }))}
                      className="w-full border border-gray-250 rounded-lg p-2.5 text-xs focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">E-mail</label>
                    <input 
                      type="email" 
                      required
                      placeholder="Ex: paciente@corp.com"
                      value={walkinForm.email}
                      onChange={e => setWalkinForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full border border-gray-250 rounded-lg p-2.5 text-xs focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Telefone</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="(11) 9..."
                      value={walkinForm.phone}
                      onChange={e => setWalkinForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full border border-gray-250 rounded-lg p-2.5 text-xs focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Data</label>
                    <input 
                      type="date" 
                      required
                      value={walkinForm.date}
                      onChange={e => setWalkinForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full border border-gray-250 rounded-lg p-2.5 text-xs text-gray-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Horário</label>
                    <select
                      value={walkinForm.time}
                      required
                      onChange={e => setWalkinForm(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full border border-gray-250 rounded-lg p-2.5 text-xs text-gray-500 focus:border-blue-500 outline-none"
                    >
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:30 AM">10:30 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:30 PM">03:30 PM</option>
                      <option value="05:00 PM">05:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Especialista Dentista</label>
                    <select
                      value={walkinForm.dentistName}
                      onChange={e => setWalkinForm(prev => ({ ...prev, dentistName: e.target.value }))}
                      className="w-full border border-gray-250 rounded-lg p-2.5 text-xs text-gray-500 focus:border-blue-500 outline-none"
                    >
                      {dentists.map((d) => (
                        <option key={d.id} value={d.name}>{d.name} ({d.specialty})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Procedimento</label>
                    <select
                      value={walkinForm.treatment}
                      onChange={e => setWalkinForm(prev => ({ ...prev, treatment: e.target.value }))}
                      className="w-full border border-gray-250 rounded-lg p-2.5 text-xs text-gray-500 focus:border-blue-500 outline-none"
                    >
                      {services.filter(s => s.status === 'Active').length > 0 ? (
                        services.filter(s => s.status === 'Active').map(s => (
                          <option key={s.id} value={s.name}>{s.name} (€ {s.price})</option>
                        ))
                      ) : (
                        <>
                          <option value="Teeth Whitening">Teeth Whitening</option>
                          <option value="Dental Implants">Dental Implants</option>
                          <option value="Orthodontics">Orthodontics</option>
                          <option value="Smile Makeovers">Smile Makeovers</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Notas Clínicas Privadas</label>
                  <textarea
                    rows={2}
                    placeholder="Sintomas relatados ou queixas primordiais..."
                    value={walkinForm.notes}
                    onChange={e => setWalkinForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full border border-gray-250 rounded-lg p-2.5 text-xs focus:border-blue-500 outline-none resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow transition-colors cursor-pointer"
                >
                  Registrar Consulta
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PATIENT CREATION MODAL */}
      <AnimatePresence>
        {showPatientCreationModal && (
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
              className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-[#0b1c30]">Ficha de Cadastro de Novo Paciente</h3>
                <button 
                  onClick={() => setShowPatientCreationModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreatePatient} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Sarah Connor"
                    value={patientForm.name}
                    onChange={e => setPatientForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-250 rounded-lg p-2.5 text-xs focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Idade</label>
                    <input 
                      type="number" 
                      required
                      placeholder="Anos"
                      value={patientForm.age}
                      onChange={e => setPatientForm(prev => ({ ...prev, age: Number(e.target.value) }))}
                      className="w-full border border-gray-250 rounded-lg p-2.5 text-xs focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Gênero</label>
                    <select
                      value={patientForm.gender}
                      onChange={e => setPatientForm(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full border border-gray-250 rounded-lg p-2.5 text-xs text-gray-500 focus:border-blue-500 outline-none"
                    >
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">E-mail</label>
                    <input 
                      type="email" 
                      required
                      placeholder="Email"
                      value={patientForm.email}
                      onChange={e => setPatientForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full border border-gray-250 rounded-lg p-2.5 text-xs focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">WhatsApp</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="Telefone"
                      value={patientForm.phone}
                      onChange={e => setPatientForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full border border-gray-250 rounded-lg p-2.5 text-xs focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Histórico de Alergias (Separados por vírgula)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Penicilina, Látex, Dipirona"
                    value={patientForm.medicalHistory}
                    onChange={e => setPatientForm(prev => ({ ...prev, medicalHistory: e.target.value }))}
                    className="w-full border border-gray-250 rounded-lg p-2.5 text-xs focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Anotações Preliminares de Saúde</label>
                  <textarea
                    rows={2}
                    placeholder="Diagnóstico odontológico primário, hábitos como bruxismo, fumante, etc..."
                    value={patientForm.notes}
                    onChange={e => setPatientForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full border border-gray-250 rounded-lg p-2.5 text-xs focus:border-blue-500 outline-none resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow transition-colors cursor-pointer"
                >
                  Confirmar Cadastro
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
