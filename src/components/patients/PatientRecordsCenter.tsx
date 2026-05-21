import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Filter, 
  ChevronRight, 
  Plus, 
  FileText, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Upload, 
  Trash2, 
  CalendarRange, 
  Phone, 
  Mail, 
  FolderLock, 
  Download, 
  Sparkles,
  Stethoscope,
  Smile,
  Shield,
  Briefcase,
  Layers,
  Heart,
  Edit2,
  FileBadge,
  Sparkle,
  History,
  Info,
  Check,
  PlusCircle,
  AlertOctagon,
  Image as ImageIcon,
  CheckCircle,
  FileMinus,
  X
} from 'lucide-react';
import { Patient, Appointment, Dentist } from '../../types';

interface PatientRecordsCenterProps {
  patients: Patient[];
  appointments: Appointment[];
  dentists: Dentist[];
  onAddPatient: (patient: Omit<Patient, 'id'>) => void;
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
}

// Highly Realistic Patient Avatars mapped by patient identifiers for a premium touch
const PATIENT_AVATARS: Record<string, string> = {
  'pat-1': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120', // Roberta Silva
  'pat-2': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120', // Carlos Mendes
  'pat-3': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120', // Ana Oliveira
  'pat-4': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120', // Marcos Souza
};

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120';

export default function PatientRecordsCenter({
  patients,
  appointments,
  dentists,
  onAddPatient,
  selectedPatientId,
  setSelectedPatientId
}: PatientRecordsCenterProps) {

  // Local Patient addition simulation & list enhancements
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | 'Critical' | 'Active' | 'Follow-up' | 'Completed'>('All');
  const [activeSegment, setActiveSegment] = useState<'anamnese' | 'odonto' | 'notes' | 'gallery' | 'files'>('anamnese');
  
  // Custom states that enrich the baseline patients on-the-fly for maximum EHR fidelity
  const [patientExtras, setPatientExtras] = useState<Record<string, {
    risk: 'Low' | 'Medium' | 'High' | 'Critical';
    bloodType: 'O+' | 'A+' | 'B+' | 'AB+' | 'O-' | 'A-' | 'B-';
    emergencyContact: string;
    emergencyPhone: string;
    insurance: string;
    insuranceNum: string;
    genderName: string;
    avatarUrl: string;
    tags: string[];
    timeline: Array<{
      id: string;
      date: string;
      title: string;
      type: 'Note' | 'Exam' | 'Prescription' | 'Surgery' | 'Diagnostic';
      dentist: string;
      description: string;
      fileAttached?: string;
    }>;
    files: Array<{
      id: string;
      name: string;
      type: 'PDF' | 'X-Ray' | 'Image';
      date: string;
      size: string;
      url: string;
    }>;
    clinicalNotes: Array<{
      id: string;
      date: string;
      dentist: string;
      category: string;
      note: string;
    }>;
    beforeUrl: string;
    afterUrl: string;
    teeth: Record<number, 'Healthy' | 'Decay' | 'Missing' | 'Treated'>;
  }>>({
    'pat-1': {
      risk: 'Medium',
      bloodType: 'O+',
      emergencyContact: 'Juliana Silva (Irmã)',
      emergencyPhone: '(11) 98888-2321',
      insurance: 'Unimed Dental Premium',
      insuranceNum: '8872-1100-29112',
      genderName: 'Feminino',
      avatarUrl: PATIENT_AVATARS['pat-1'],
      tags: ['Implante', 'Ortodontia Estética'],
      timeline: [
        { id: 't-1', date: '21 Mai, 2026', title: 'Adequação de conduto e implantação', type: 'Surgery', dentist: 'Dr. Marcus Reynolds', description: 'Instalação de pino de titânio na região do dente 16 sob anestesia local. Ótima estabilidade primária (45Ncm).' },
        { id: 't-2', date: '10 Mar, 2026', title: 'Radiografia Panorâmica Inicial', type: 'Exam', dentist: 'Dra. Emily Chen', description: 'Diagnóstico de perda óssea no elemento 26. Tomografia recomendada.', fileAttached: 'panoramica_roberta.png' },
        { id: 't-3', date: '10 Mar, 2026', title: 'Prescrição Clássica de Analgésico', type: 'Prescription', dentist: 'Dra. Emily Chen', description: 'Ibuprofeno 600mg de 8h em 8h em caso de dor persistente por no máximo 3 dias.' }
      ],
      files: [
        { id: 'f-1', name: 'Laudo Tomográfico Cone-Beam.pdf', type: 'PDF', date: '15 Mai, 2026', size: '4.2 MB', url: '#' },
        { id: 'f-2', name: 'X-Ray Lateral Esquerdo Maxilar.jpg', type: 'X-Ray', date: '10 Mar, 2026', size: '1.8 MB', url: '#' }
      ],
      clinicalNotes: [
        { id: 'c-1', date: '21 Mai, 2026', dentist: 'Dr. Marcus Reynolds', category: 'Implantodontia', note: 'Paciente relata excelente recuperação. O dente 16 foi finalizado e preparado para receber o dente provisório em 90 dias.' },
        { id: 'c-2', date: '12 Abr, 2026', dentist: 'Dr. Sarah Jenkins', category: 'Profilaxia', note: 'Raspagem periodontal supragengival concluída em mandíbula. Gengiva apresentava sangramento leve no quadrante 3.' }
      ],
      beforeUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=400', // Dental visual
      afterUrl: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&q=80&w=400',
      teeth: { 18: 'Healthy', 17: 'Treated', 16: 'Decay', 15: 'Healthy', 11: 'Healthy', 21: 'Healthy', 26: 'Missing', 36: 'Treated', 46: 'Healthy' }
    },
    'pat-2': {
      risk: 'Critical',
      bloodType: 'A-',
      emergencyContact: 'Paula Mendes (Esposa)',
      emergencyPhone: '(11) 97721-3944',
      insurance: 'SulAmérica Odonto Coletivo',
      insuranceNum: '9112-9921-00129',
      genderName: 'Masculino',
      avatarUrl: PATIENT_AVATARS['pat-2'],
      tags: ['Dores de ATM', 'Cirurgia Oral'],
      timeline: [
        { id: 't-4', date: '18 Mai, 2026', title: 'Tratamento de Canal (Elemento 12)', type: 'Surgery', dentist: 'Dra. Emily Chen', description: 'Tratamento endodôntico de urgência devido à dor pulsátil e abcesso periapical.' },
        { id: 't-5', date: '04 Fev, 2026', title: 'Placa Noturna de Ajuste de ATM', type: 'Patient Care', dentist: 'Dr. Sarah Jenkins', description: 'Molde em silicona de adição para confecção de placa miorrelaxante rígida.' } as any
      ],
      files: [
        { id: 'f-3', name: 'Documento Anamnese Completa.pdf', type: 'PDF', date: '04 Fev, 2026', size: '890 KB', url: '#' }
      ],
      clinicalNotes: [
        { id: 'c-3', date: '18 Mai, 2026', dentist: 'Dra. Emily Chen', category: 'Endodontia', note: 'Infiltrado curativo de hidróxido de cálcio no elemento 12. Retorno em 14 dias para selamento definitivo.' }
      ],
      beforeUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=400',
      afterUrl: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&q=80&w=400',
      teeth: { 12: 'Decay', 11: 'Healthy', 21: 'Healthy', 32: 'Decay', 42: 'Treated' }
    },
    'pat-3': {
      risk: 'Low',
      bloodType: 'O-',
      emergencyContact: 'Reginaldo Oliveira (Pai)',
      emergencyPhone: '(11) 98111-0021',
      insurance: 'Amil Dental 400',
      insuranceNum: '0034-7721-23211',
      genderName: 'Feminino',
      avatarUrl: PATIENT_AVATARS['pat-3'],
      tags: ['Clareamento Estético', 'Manutenção'],
      timeline: [
        { id: 't-6', date: '03 Mai, 2026', title: 'Protocolo Clareamento Consultório', type: 'Note', dentist: 'Dr. Sarah Jenkins', description: 'Aplicação de peróxido de hidrogênio a 35% por 3 sessões de 15 minutos.' }
      ],
      files: [
        { id: 'f-4', name: 'Contrato Clareamento Estético.pdf', type: 'PDF', date: '03 Mai, 2026', size: '1.2 MB', url: '#' }
      ],
      clinicalNotes: [
        { id: 'c-4', date: '03 Mai, 2026', dentist: 'Dr. Sarah Jenkins', category: 'Dentística', note: 'Paciente extremamente satisfeita com o resultado. Recomendados cuidados com alimentos cromogênicos (café, vinho).' }
      ],
      beforeUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=400',
      afterUrl: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&q=80&w=400',
      teeth: { 11: 'Treated', 21: 'Treated', 12: 'Healthy', 22: 'Healthy' }
    }
  });

  // Modal registration
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: 30,
    gender: 'Feminino',
    notes: '',
    medicalHistory: '',
    risk: 'Low' as 'Low' | 'Medium' | 'High' | 'Critical',
    bloodType: 'O+' as any,
    insurance: 'Particular',
    emergencyContact: '',
    emergencyPhone: ''
  });

  // Before / After Slider Position State
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Drag and Drop simulated upload state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Note State
  const [newNote, setNewNote] = useState({
    category: 'Geral',
    note: ''
  });

  // Safe fetch helper for Patient Extras
  const getPatientExtra = (id: string) => {
    return patientExtras[id] || {
      risk: 'Low',
      bloodType: 'O+',
      emergencyContact: 'Responsável legal',
      emergencyPhone: '(11) 90000-0000',
      insurance: 'Particular',
      insuranceNum: 'N/A',
      genderName: 'Não especificado',
      avatarUrl: DEFAULT_AVATAR,
      tags: ['Geral'],
      timeline: [
        { id: 't-new', date: '21 Mai, 2026', title: 'Ficha Clínica Criada', type: 'Note', dentist: 'Administrador', description: 'Paciente ingressou na base de dados.' }
      ],
      files: [],
      clinicalNotes: [],
      beforeUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=400',
      afterUrl: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&q=80&w=400',
      teeth: {}
    };
  };

  // Safe status badges for Patient Directory cards
  const getRiskBadgeStyles = (risk: string) => {
    switch(risk) {
      case 'Critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'High':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Toggle single tooth status dynamically in local storage states
  const toggleToothStatus = (patientId: string, toothNum: number) => {
    setPatientExtras(prev => {
      const activeRecord = getPatientExtra(patientId);
      const currentTeeth = activeRecord.teeth || {};
      const states: ('Healthy' | 'Decay' | 'Missing' | 'Treated')[] = ['Healthy', 'Decay', 'Missing', 'Treated'];
      const currentIndex = states.indexOf(currentTeeth[toothNum] || 'Healthy');
      const nextIndex = (currentIndex + 1) % states.length;

      return {
        ...prev,
        [patientId]: {
          ...activeRecord,
          teeth: {
            ...currentTeeth,
            [toothNum]: states[nextIndex]
          }
        }
      };
    });
  };

  // Dynamic calculations for Stat Widgets
  const clinicalStats = useMemo(() => {
    const total = patients.length;
    // Count active cases
    const extrasArray = Object.values(patientExtras) as any[];
    const criticalCount = extrasArray.filter(ex => ex.risk === 'Critical' || ex.risk === 'High').length;
    const activeTreatments = extrasArray.filter(e => e.tags && e.tags.length > 0).length;
    const totalFiles = extrasArray.reduce((acc, ex) => acc + (ex.files?.length || 0), 0) + 12;

    return {
      total,
      criticalCount,
      activeTreatments,
      totalFiles
    };
  }, [patients, patientExtras]);

  // Real-time directory filters
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone.includes(searchQuery);

      const extras = getPatientExtra(p.id);
      
      let matchRisk = true;
      if (riskFilter === 'Critical') matchRisk = extras.risk === 'Critical' || extras.risk === 'High';
      if (riskFilter === 'Active') matchRisk = p.status === 'Active';
      if (riskFilter === 'Completed') matchRisk = extras.risk === 'Low';
      if (riskFilter === 'Follow-up') matchRisk = extras.risk === 'Medium';

      return matchSearch && matchRisk;
    });
  }, [patients, searchQuery, riskFilter, patientExtras]);

  // Active full patient object
  const activePatient = useMemo(() => {
    if (!selectedPatientId) return null;
    return patients.find(p => p.id === selectedPatientId) || null;
  }, [selectedPatientId, patients]);

  const activeExtras = useMemo(() => {
    if (!selectedPatientId) return getPatientExtra('');
    return getPatientExtra(selectedPatientId);
  }, [selectedPatientId, patientExtras]);

  // Add clinical notes action
  const handleAddNewClinicalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !newNote.note.trim()) return;

    const newLogItem = {
      id: `c-note-${Date.now()}`,
      date: '21 Mai, 2026',
      dentist: dentists[0]?.name || 'Dr. Sarah Jenkins',
      category: newNote.category,
      note: newNote.note.trim()
    };

    const newTimelineItem = {
      id: `timeline-${Date.now()}`,
      date: '21 Mai, 2026',
      title: `Evolução Clínica: ${newNote.category}`,
      type: 'Note' as const,
      dentist: dentists[0]?.name || 'Dr. Sarah Jenkins',
      description: newNote.note.trim()
    };

    setPatientExtras(prev => {
      const ext = getPatientExtra(selectedPatientId);
      return {
        ...prev,
        [selectedPatientId]: {
          ...ext,
          clinicalNotes: [newLogItem, ...(ext.clinicalNotes || [])],
          timeline: [newTimelineItem, ...(ext.timeline || [])]
        }
      };
    });

    setNewNote({ category: 'Geral', note: '' });
  };

  // Submit Patient Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name.trim()) return;

    const parsedHistory = registerForm.medicalHistory
      ? registerForm.medicalHistory.split(',').map(s => s.trim())
      : [];

    // Trigger parent callback
    onAddPatient({
      name: registerForm.name,
      email: registerForm.email || `${registerForm.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      phone: registerForm.phone,
      age: registerForm.age,
      gender: registerForm.gender,
      medicalHistory: parsedHistory,
      status: 'Active',
      lastVisit: '2026-05-21',
      notes: registerForm.notes
    });

    // Populate advanced extras locally
    const lastId = `pat-${patients.length + 1}`;
    setPatientExtras(prev => ({
      ...prev,
      [lastId]: {
        risk: registerForm.risk,
        bloodType: registerForm.bloodType,
        emergencyContact: registerForm.emergencyContact || 'Familiar Próximo',
        emergencyPhone: registerForm.emergencyPhone || registerForm.phone,
        insurance: registerForm.insurance,
        insuranceNum: 'INS-' + Math.floor(100000 + Math.random() * 900000),
        genderName: registerForm.gender,
        avatarUrl: DEFAULT_AVATAR,
        tags: [registerForm.risk === 'Critical' ? 'Acompanhamento' : 'Geral'],
        timeline: [
          { id: 't-init', date: '21 Mai, 2026', title: 'Abertura de Cadastro Clínico', type: 'Note', dentist: 'Dra. Sarah Jenkins', description: 'Prontuário clínico devidamente inaugurado.' }
        ],
        files: [],
        clinicalNotes: [],
        beforeUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=400',
        afterUrl: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&q=80&w=400',
        teeth: {}
      }
    }));

    // Reset and select newly created patient
    setSelectedPatientId(lastId);
    setShowRegisterModal(false);
    setRegisterForm({
      name: '',
      email: '',
      phone: '',
      age: 28,
      gender: 'Feminino',
      notes: '',
      medicalHistory: '',
      risk: 'Low',
      bloodType: 'O+',
      insurance: 'Unimed Dental',
      emergencyContact: '',
      emergencyPhone: ''
    });
  };

  // Slider Mouse Move Events
  const handleSliderMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 105));
    setSliderPosition(percentage);
  };

  // File drag & upload simulators
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const performMockFileUpload = (fileName: string, fileSize: string) => {
    if (!selectedPatientId) return;

    const newFile = {
      id: `f-${Date.now()}`,
      name: fileName,
      type: fileName.toLowerCase().endsWith('.pdf') ? 'PDF' as const : 'X-Ray' as const,
      date: '21 Mai, 2026',
      size: fileSize,
      url: '#'
    };

    const newTimeline = {
      id: `t-file-${Date.now()}`,
      date: '21 Mai, 2026',
      title: `Upload de Documento: ${fileName}`,
      type: 'Exam' as const,
      dentist: 'Admin',
      description: `Arquivo de exames de suporte clínico inserido na galeria do prontuário.`
    };

    setPatientExtras(prev => {
      const ext = getPatientExtra(selectedPatientId);
      return {
        ...prev,
        [selectedPatientId]: {
          ...ext,
          files: [...(ext.files || []), newFile],
          timeline: [newTimeline, ...(ext.timeline || [])]
        }
      };
    });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!selectedPatientId) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      performMockFileUpload(file.name, sizeStr);
    }
  };

  const handleManualFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      performMockFileUpload(file.name, sizeStr);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#0b1c30]">
      
      {/* 1. HEADER SECTION AND NAVIGATION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold mb-1">
            <span>DentaFlow Core</span>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="text-gray-500 font-medium">Histórico Clínico Unificado</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0b1c30]">Prontuários &amp; Fichas Clínicas EHR</h1>
          <p className="text-xs text-gray-500 mt-1">
            Prontuário eletrônico completo com mapa dental interativo ISO, documentos, galeria de progresso estético e alertas de risco.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowRegisterModal(true)}
            className="bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl py-2.5 px-4.5 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Cadastrar Novo Paciente
          </button>
        </div>
      </div>

      {/* 2. PREMIUM CLINICAL STATS PANEL */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Stat 1: Total Patients */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Fichas Cadastradas</span>
            <h3 className="text-xl font-extrabold">{clinicalStats.total} Pacientes</h3>
          </div>
        </div>

        {/* Stat 2: Active Treatments */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Em Planejamento</span>
            <h3 className="text-xl font-extrabold">{clinicalStats.activeTreatments} Ativos</h3>
          </div>
        </div>

        {/* Stat 3: High-Risk Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Alertas Médicos / Crítico</span>
            <h3 className="text-xl font-extrabold">{clinicalStats.criticalCount} Alertas</h3>
          </div>
        </div>

        {/* Stat 4: Total Uploaded Files */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
            <FolderLock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Exames &amp; Arquivos</span>
            <h3 className="text-xl font-extrabold">{clinicalStats.totalFiles} Exames</h3>
          </div>
        </div>

      </div>

      {/* 3. MULTI-COLUMN INTERACTIVE WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: ACTIVE PATENT DIRECTORY (COL-SPAN-4) */}
        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" /> Diretório Clínico
            </h2>
            <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {filteredPatients.length} Perfis
            </span>
          </div>

          {/* Directory Filters & Search */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3+0.5 top-1/2 -translate-y-1/2 pl-1" />
              <input 
                type="text" 
                placeholder="Pesquisar por nome ou celular..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-medium"
              />
            </div>

            {/* Quick Filter segmentation chips */}
            <div className="flex flex-wrap gap-1.5">
              <button 
                onClick={() => setRiskFilter('All')}
                className={`text-[9px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${riskFilter === 'All' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-gray-500 hover:bg-slate-100'}`}
              >
                Todos
              </button>
              <button 
                onClick={() => setRiskFilter('Critical')}
                className={`text-[9px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${riskFilter === 'Critical' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-50 text-gray-400 hover:bg-slate-100'}`}
              >
                Crítico / Alto
              </button>
              <button 
                onClick={() => setRiskFilter('Active')}
                className={`text-[9px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${riskFilter === 'Active' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-50 text-gray-400 hover:bg-slate-100'}`}
              >
                Ativo
              </button>
              <button 
                onClick={() => setRiskFilter('Follow-up')}
                className={`text-[9px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${riskFilter === 'Follow-up' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-gray-400 hover:bg-slate-100'}`}
              >
                Retornos
              </button>
              <button 
                onClick={() => setRiskFilter('Completed')}
                className={`text-[9px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${riskFilter === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-gray-400 hover:bg-slate-100'}`}
              >
                Tratado
              </button>
            </div>
          </div>

          {/* Directory Listings */}
          <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {filteredPatients.map(patient => {
                const isSelected = selectedPatientId === patient.id;
                const extra = getPatientExtra(patient.id);
                const isCritical = extra.risk === 'Critical' || extra.risk === 'High';

                return (
                  <motion.div 
                    key={patient.id}
                    layoutId={`pat-card-${patient.id}`}
                    onClick={() => setSelectedPatientId(patient.id)}
                    className={`block p-4 rounded-xl border text-left transition-all cursor-pointer relative group ${isSelected ? 'border-2 border-blue-600 bg-blue-50/15 shadow-sm' : 'border-gray-150 hover:bg-slate-50/60 bg-white'}`}
                  >
                    {/* High risk alert badge marker left */}
                    {isCritical && (
                      <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-bl-lg"></div>
                    )}

                    <div className="flex items-center gap-3">
                      <img 
                        src={extra.avatarUrl || DEFAULT_AVATAR} 
                        alt={patient.name} 
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full border object-cover border-gray-200 shrink-0" 
                      />
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-[#0b1c30] truncate block">
                            {patient.name}
                          </span>
                          <span className="text-[9px] text-gray-400 font-mono font-medium">{patient.age}a • {patient.gender.charAt(0)}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium truncate block mb-1">
                          {patient.phone}
                        </span>

                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold uppercase tracking-tight ${getRiskBadgeStyles(extra.risk)}`}>
                            {extra.risk === 'Critical' ? 'Alerta Crítico' : extra.risk === 'High' ? 'Alto Risco' : extra.risk === 'Medium' ? 'Retorno' : 'Paciente Estável'}
                          </span>
                          <span className="text-[9px] text-gray-400 font-semibold">• Visita: {patient.lastVisit}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {filteredPatients.length === 0 && (
                <div className="p-8 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl">
                  <span className="text-xs font-semibold block">Nenhum paciente encontrado</span>
                  <p className="text-[10px] mt-1 text-gray-400">Tente ajustar a busca ou o seletor de risco clínico.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COLUMN: INTEGRATED DETAILED PATIENT WORKSPACE (COL-SPAN-8) */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {activePatient ? (
              <motion.div 
                key={activePatient.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                
                {/* 1. CENTRAL PROFILE OVERVIEW CARD */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full filter blur-xl"></div>
                  
                  {/* Avatar & Key Tags */}
                  <div className="flex flex-col items-center min-w-[120px] shrink-0 border-r border-gray-100/70 md:pr-6">
                    <img 
                      src={activeExtras.avatarUrl || DEFAULT_AVATAR} 
                      alt={activePatient.name} 
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-full border-4 border-blue-50 object-cover shadow-xs" 
                    />
                    <h3 className="text-md font-extrabold text-[#0b1c30] text-center mt-3">{activePatient.name}</h3>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full mt-1.5 font-bold">
                      Prontuário #{activePatient.id.toUpperCase()}
                    </span>

                    {/* Active tags list */}
                    <div className="flex flex-wrap gap-1 justify-center mt-3.5">
                      {activeExtras.tags.map((t, idx) => (
                        <span key={idx} className="text-[8px] bg-blue-50 text-blue-700 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider border border-blue-100">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Core Demographics & Info list */}
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-xs text-left">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Gênero / Sexo</span>
                      <span className="font-semibold text-gray-700">{activeExtras.genderName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Idade Cronológica</span>
                      <span className="font-semibold text-gray-700">{activePatient.age} anos</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Tipo Sanguíneo</span>
                      <span className="font-extrabold text-red-600 bg-red-50/50 px-1.5 rounded w-max block border border-red-100">{activeExtras.bloodType}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Contato Direto</span>
                      <span className="font-semibold text-gray-700 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-gray-400" /> {activePatient.phone}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">E-mail Cadastrado</span>
                      <span className="font-semibold text-gray-700 flex items-center gap-1 truncate block max-w-[180px]">
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {activePatient.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Convênio / Registro</span>
                      <span className="font-semibold text-gray-700 truncate block max-w-[160px]">{activeExtras.insurance}</span>
                      <span className="text-[10px] text-gray-400 block font-mono">Num: {activeExtras.insuranceNum}</span>
                    </div>
                    <div className="col-span-2 md:col-span-3 border-t border-dashed border-gray-100/80 pt-4 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider block flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 animate-bounce" /> Alergias / Alertas Médicos
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {activePatient.medicalHistory.length > 0 ? (
                            activePatient.medicalHistory.map((alert, aIdx) => (
                              <span key={aIdx} className="text-[9px] bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-bold">
                                {alert}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">Sem alergias notificadas</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Contato de Emergência</span>
                        <span className="font-bold text-gray-700 block mt-0.5 text-[11px]">{activeExtras.emergencyContact}</span>
                        <span className="text-gray-400 block">{activeExtras.emergencyPhone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CLINICAL TABS BAR SEGMENTS */}
                <div className="flex border-b border-gray-100 overflow-x-auto shrink-0">
                  <button 
                    onClick={() => setActiveSegment('anamnese')}
                    className={`px-4 py-3 text-xs font-bold border-b-2 cursor-pointer whitespace-nowrap transition-all ${activeSegment === 'anamnese' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                  >
                    Anamnese &amp; Linha do Tempo
                  </button>
                  <button 
                    onClick={() => setActiveSegment('odonto')}
                    className={`px-4 py-3 text-xs font-bold border-b-2 cursor-pointer whitespace-nowrap transition-all flex items-center gap-1 ${activeSegment === 'odonto' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                  >
                    Odontograma ISO Dentadura <span className="text-[8px] bg-blue-100 text-blue-800 px-1 py-0.2 rounded">Interativo</span>
                  </button>
                  <button 
                    onClick={() => setActiveSegment('notes')}
                    className={`px-4 py-3 text-xs font-bold border-b-2 cursor-pointer whitespace-nowrap transition-all flex items-center gap-1 ${activeSegment === 'notes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                  >
                    Evolução Clínica &amp; Prescrições <span className="text-[8px] bg-blue-500 text-white px-1 py-0.2 rounded font-mono font-bold">Lançar</span>
                  </button>
                  <button 
                    onClick={() => setActiveSegment('gallery')}
                    className={`px-4 py-3 text-xs font-bold border-b-2 cursor-pointer whitespace-nowrap transition-all flex items-center gap-1.5 ${activeSegment === 'gallery' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                  >
                    Comparações Antes/Depois Estético
                  </button>
                  <button 
                    onClick={() => setActiveSegment('files')}
                    className={`px-4 py-3 text-xs font-bold border-b-2 cursor-pointer whitespace-nowrap transition-all flex items-center gap-1 ${activeSegment === 'files' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                  >
                    X-Rays &amp; Laudos Clínicos
                  </button>
                </div>

                {/* 2. TAB CONTENT: ANAMNESE & TIMELINE */}
                {activeSegment === 'anamnese' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Diagnostic notes Left */}
                    <div className="lg:col-span-5 space-y-5 bg-white border border-gray-100 rounded-2xl p-5 shadow-xs text-left">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>QUEIXA PRINCIPAL / HISTÓRICO GERAL</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed italic bg-slate-50 p-4 rounded-xl border border-gray-100">
                        "{activePatient.notes || "Paciente relata cansaço e dores recorrentes nas articulações frontais ATM durante a fala continuada. Encaminhado para avaliação clínica estrita e raspagem inicial periodontal para prevenção gengival."}"
                      </p>

                      <div className="border-t border-gray-100 pt-4 space-y-3 text-xs">
                        <span className="font-bold text-gray-500 block">SINAIS DIAGNÓSTICOS PREVENTIVOS</span>
                        <div className="space-y-2">
                          <span className="flex items-center gap-2 text-gray-650">
                            <CheckCircle className="w-4 h-4 text-emerald-600" /> Profilaxia completa recomendada semestralmente
                          </span>
                          <span className="flex items-center gap-2 text-gray-650">
                            <CheckCircle className="w-4 h-4 text-emerald-600" /> Checkup radiográfico completo em dia
                          </span>
                          <span className="flex items-center gap-2 text-gray-650">
                            <CheckCircle className="w-4 h-4 text-emerald-600" /> Termo de consentimento e LGPD recolhidos
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline representation Right */}
                    <div className="lg:col-span-7 space-y-4 text-left">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <History className="w-4 h-4 text-indigo-650" /> Linha do Tempo de Intervenções
                      </h3>

                      <div className="relative border-l-2 border-slate-100 pl-4 space-y-5 ml-1.5">
                        {activeExtras.timeline.map((event, eIdx) => (
                          <div key={event.id || eIdx} className="relative">
                            {/* Dot indicator */}
                            <span className={`absolute -left-[23px] top-1.5 w-2 h-2 rounded-full ring-4 ring-white ${
                              event.type === 'Surgery' ? 'bg-red-500' :
                              event.type === 'Exam' ? 'bg-indigo-600' :
                              event.type === 'Prescription' ? 'bg-amber-600' : 'bg-blue-650'
                            }`}></span>

                            <div className="bg-white border border-gray-100 rounded-xl p-4.5 shadow-xs hover:border-gray-200 transition-all">
                              <span className="text-[10px] text-gray-400 font-bold block">{event.date}</span>
                              <div className="flex justify-between items-start mt-0.5">
                                <h4 className="font-bold text-xs text-[#0b1c30]">{event.title}</h4>
                                <span className="text-[8px] uppercase font-bold bg-slate-100 px-1.5 py-0.2 rounded text-gray-500">
                                  {event.type}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                                {event.description}
                              </p>
                              <div className="text-[9px] text-gray-400 mt-2 font-semibold">
                                Atendido por: <span className="text-gray-600">{event.dentist}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* 3. TAB CONTENT: INTERACTIVE DENTAL CHART */}
                {activeSegment === 'odonto' && (
                  <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm text-left space-y-5">
                    <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-bold text-[#0b1c30]">Mapa Dental Clínico ISO (Odontograma Clínico)</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Clique diretamente em cima dos elementos dentários para ciclar e salvar diagnósticos.</p>
                      </div>
                      <span className="text-[9px] font-bold bg-[#2563eb]/20 text-[#2563eb] border border-blue-200 px-2 py-0.5 rounded-full uppercase">
                        Série de Dentição Permanente
                      </span>
                    </div>

                    {/* Interactive dental grid */}
                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-gray-100 text-center space-y-6">
                      
                      {/* Upper arcade */}
                      <div className="space-y-2">
                        <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest block font-mono">Maxilar Superior (Eixo Posterior/Anterior)</span>
                        <div className="flex justify-center flex-wrap gap-1.5">
                          {[18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28].map((t) => {
                            const status = activeExtras.teeth[t] || 'Healthy';
                            
                            // Visual colors for teeth buttons
                            const colorMap = {
                              Healthy: 'bg-white text-[#0b1c30] border-gray-300 hover:border-emerald-500',
                              Decay: 'bg-red-500 text-white border-red-600 hover:bg-red-650',
                              Missing: 'bg-gray-400 text-white border-gray-500 hover:bg-gray-500',
                              Treated: 'bg-[#2563eb] text-white border-blue-700 hover:bg-blue-750'
                            };

                            return (
                              <button
                                key={t}
                                onClick={() => toggleToothStatus(activePatient.id, t)}
                                className={`w-10 h-14 text-[10px] font-extrabold rounded-xl border flex flex-col items-center justify-between py-2 transition-all hover:scale-105 shadow-2xs cursor-pointer ${colorMap[status]}`}
                                title={`Elemento ${t}: ${status}`}
                              >
                                <span>{t}</span>
                                {/* Visual icon representing anatomical tooth root block */}
                                <div className="w-5 h-5 flex items-center justify-center font-bold text-[8px] opacity-70">
                                  tooth
                                </div>
                                <span className={`w-1.5 h-1.5 rounded-full ${status === 'Healthy' ? 'bg-emerald-500' : 'bg-white'}`}></span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Lower arcade */}
                      <div className="space-y-2">
                        <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest block font-mono">Maxilar Inferior (Mandíbula)</span>
                        <div className="flex justify-center flex-wrap gap-1.5">
                          {[48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38].map((t) => {
                            const status = activeExtras.teeth[t] || 'Healthy';
                            
                            const colorMap = {
                              Healthy: 'bg-white text-[#0b1c30] border-gray-300 hover:border-emerald-500',
                              Decay: 'bg-red-500 text-white border-red-600 hover:bg-red-650',
                              Missing: 'bg-gray-400 text-white border-gray-500 hover:bg-gray-500',
                              Treated: 'bg-[#2563eb] text-white border-blue-700 hover:bg-blue-750'
                            };

                            return (
                              <button
                                key={t}
                                onClick={() => toggleToothStatus(activePatient.id, t)}
                                className={`w-10 h-14 text-[10px] font-extrabold rounded-xl border flex flex-col items-center justify-between py-2 transition-all hover:scale-105 shadow-2xs cursor-pointer ${colorMap[status]}`}
                                title={`Elemento ${t}: ${status}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${status === 'Healthy' ? 'bg-emerald-500' : 'bg-white'}`}></span>
                                <div className="w-5 h-5 flex items-center justify-center font-bold text-[8px] opacity-70">
                                  tooth
                                </div>
                                <span>{t}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                    {/* Legend keys block */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-md bg-white border border-gray-300 block shadow-3xs"></span>
                        <span className="text-gray-600">Elemento Saudável / Livre</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-md bg-red-500 border border-red-600 block"></span>
                        <span className="text-gray-600">Cárie Ativa detectada</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-md bg-[#2563eb] border border-blue-700 block"></span>
                        <span className="text-gray-600">Restaurado / Tratado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-md bg-gray-450 bg-gray-400 border border-gray-550 block"></span>
                        <span className="text-gray-600">Ausente / Extraído / Protético</span>
                      </div>
                    </div>

                  </div>
                )}

                {/* 4. CLINICAL NOTES AND TREATMENT PROGRESS */}
                {activeSegment === 'notes' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Add clinical note Left */}
                    <form onSubmit={handleAddNewClinicalNote} className="lg:col-span-5 bg-white border border-gray-100 rounded-2xl p-5 shadow-xs text-left space-y-4">
                      <h3 className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-1">
                        <PlusCircle className="w-4 h-4 text-blue-600" /> Detalhar Lançamento Clínico
                      </h3>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Segmento de Procedimento</label>
                        <select 
                          value={newNote.category}
                          onChange={e => setNewNote(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:bg-white focus:border-blue-500 font-semibold"
                        >
                          <option value="Implantodontia">Implantodontia (Titânio/Cirúrgico)</option>
                          <option value="Ortodontia">Ortodontia Estética/Alinhador</option>
                          <option value="Endodontia">Endodontia (Canal Radicular)</option>
                          <option value="Periodontia">Periodontia / Tratamentos gengivais</option>
                          <option value="Profilaxia">Profilaxia &amp; Prevenção geral</option>
                          <option value="Estética">Dentística Estética / Clareamento</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Lançar Evolução de Prontuário</label>
                        <textarea 
                          rows={4} 
                          placeholder="Descreva fisicamente os testes efetuados, presenças de dor ou prescrições médicas executadas..."
                          value={newNote.note}
                          onChange={e => setNewNote(prev => ({ ...prev, note: e.target.value }))}
                          className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:bg-white focus:border-blue-500 font-medium resize-none"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-slate-900 hover:bg-black text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                      >
                        Gravar no Prontuário Oficial (EHR)
                      </button>
                    </form>

                    {/* List notes Right */}
                    <div className="lg:col-span-7 space-y-4 text-left">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Registros Clínicos Recorrentes
                      </h3>

                      <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                        {activeExtras.clinicalNotes.length > 0 ? (
                          activeExtras.clinicalNotes.map((log) => (
                            <div key={log.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs space-y-2 relative">
                              <span className="text-[10px] text-gray-400 font-bold block">{log.date}</span>
                              
                              <div className="flex justify-between items-start">
                                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-1.5 py-0.2 rounded uppercase">
                                  {log.category}
                                </span>
                                <span className="text-[10px] text-gray-400 font-semibold">Doutor: {log.dentist}</span>
                              </div>
                              <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                                {log.note}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-gray-400 bg-white border border-gray-100 rounded-xl shadow-2xs">
                            <FileMinus className="w-10 h-10 mx-auto text-gray-300 mb-1" />
                            <span className="text-xs font-bold">Nenhum registro lançado ainda</span>
                            <p className="text-[10px] text-gray-400">Insira sua anotação no painel esquerdo para inaugurar o prontuário.</p>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* 5. TAB CONTENT: COMPARISON GALLERY SLIDER (Stunning before/after beauty) */}
                {activeSegment === 'gallery' && (
                  <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm text-left space-y-6">
                    <div>
                      <h3 className="text-md font-bold text-[#0b1c30] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600" /> Galeria de Progresso Clínico (Estético / Reabilitação)
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">Mova o controle deslizante abaixo para comparar o avanço estético periodontal do paciente entre a fase diagnóstica e pós operatória imediata.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      
                      {/* Interactive slide view component */}
                      <div className="lg:col-span-8 flex flex-col items-center">
                        <div 
                          ref={sliderContainerRef}
                          onMouseMove={(e) => handleSliderMove(e.clientX)}
                          onTouchMove={(e) => handleSliderMove(e.touches[0].clientX)}
                          className="relative w-full max-w-[500px] h-[300px] rounded-2xl overflow-hidden shadow-md select-none border border-slate-200 cursor-ew-resize bg-slate-50"
                        >
                          {/* After image background */}
                          <img 
                            src={activeExtras.afterUrl} 
                            alt="Pós-operatório" 
                            className="absolute inset-0 w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute bottom-3 right-3 bg-black/60 text-white font-bold text-[9px] px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
                            Pós-Tratamento
                          </div>

                          {/* Before image slide overlay */}
                          <div 
                            className="absolute inset-0 pointer-events-none overflow-hidden"
                            style={{ width: `${sliderPosition}%` }}
                          >
                            <img 
                              src={activeExtras.beforeUrl} 
                              alt="Fase Diagnóstica Inicial" 
                              className="absolute inset-0 w-full h-full object-cover"
                              style={{ width: '500px', maxWidth: 'none' }}
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute bottom-3 left-3 bg-blue-600 text-white font-bold text-[9px] px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
                              Pré-Tratamento / Diagnóstico
                            </div>
                          </div>

                          {/* Divisor line */}
                          <div 
                            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none"
                            style={{ left: `${sliderPosition}%` }}
                          >
                            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 bg-white rounded-full shadow-md border border-slate-200 flex items-center justify-center font-bold text-[10px] text-gray-700">
                              ↔
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Side instructions & facts */}
                      <div className="lg:col-span-4 bg-slate-50 p-5 rounded-2xl space-y-4">
                        <span className="text-[10px] font-bold text-gray-400 block uppercase">CONDIÇÕES CLÍNICAS ANALISADAS</span>
                        
                        <div className="space-y-3 font-semibold text-xs">
                          <div>
                            <span className="text-gray-400 block text-[10px]">PLANEJAMENTO REALIZADO</span>
                            <span className="text-[#0b1c30]">Harmonização de Arcos &amp; Alinhador Premium</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[10px]">TAXA DE SUCESSO DO TRATAMENTO</span>
                            <span className="text-emerald-600 block flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> 100% De Sucesso Clínico
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 font-normal italic leading-relaxed pt-2 border-t border-slate-250 border-gray-200">
                            "Excelentes ganhos volumétricos nas papilas gengivais estéticas. O dente foi provisoriamente estabilizado e apresenta alta compatibilidade."
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* 6. TAB CONTENT: X-RAYS AND DOCUMENTS */}
                {activeSegment === 'files' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Drag and drop upload */}
                    <div className="lg:col-span-5 bg-white border border-gray-150 rounded-2xl p-5 shadow-xs text-left space-y-4">
                      <h3 className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider">
                        Anexar Exame / X-Ray (Drag &amp; Drop)
                      </h3>

                      <div 
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                          isDragging ? 'border-blue-500 bg-blue-50/20' : 'border-gray-200 hover:border-blue-500 bg-slate-50/50'
                        }`}
                      >
                        <Upload className="w-10 h-10 text-gray-400 mb-2" />
                        <span className="text-xs font-bold block">Arraste seus laudos e radiografias aqui</span>
                        <p className="text-[10px] text-gray-400 mt-1">Ou clique para selecionar de forma manual</p>
                        
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleManualFileSelected}
                          className="hidden" 
                        />
                      </div>

                      <div className="text-[9px] text-gray-400 leading-relaxed font-semibold">
                        * Extensões aceitas: PDF, JPG, PNG de até 10MB. Todos os arquivos anexados são salvos sob criptografia HIPAA.
                      </div>
                    </div>

                    {/* Files listing */}
                    <div className="lg:col-span-7 space-y-3 text-left">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Documentos Clínicos Registrados ({activeExtras.files.length})
                      </h3>

                      <div className="space-y-3.5">
                        {activeExtras.files.length > 0 ? (
                          activeExtras.files.map(file => (
                            <div key={file.id} className="bg-white border border-gray-150 rounded-xl p-4 flex items-center justify-between shadow-3xs">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs uppercase">
                                  {file.type}
                                </div>
                                <div>
                                  <span className="font-bold text-xs text-gray-800 block">{file.name}</span>
                                  <span className="text-[10px] text-gray-400 block">{file.date} • {file.size}</span>
                                </div>
                              </div>

                              <button 
                                className="w-8 h-8 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-slate-100 flex items-center justify-center transition-all"
                                title="Fazer Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-gray-400 bg-[#fbfbfe] border border-gray-100 rounded-xl shadow-inner">
                            <FolderLock className="w-10 h-10 mx-auto text-gray-300 mb-1" />
                            <span className="text-xs font-bold text-gray-400">Nenhum exame clínico anexado</span>
                            <p className="text-[10px] text-gray-400">Insira sua tomografia ou laudo no painel ao lado.</p>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}

              </motion.div>
            ) : (
              <div className="h-[400px] bg-white rounded-3xl border border-gray-100 border-dashed flex flex-col items-center justify-center p-8 text-center text-gray-450 text-gray-400">
                <FolderLock className="w-14 h-14 text-indigo-200 mb-2 animate-pulse" />
                <h3 className="text-md font-bold text-[#0b1c30]">Workspace Integrado EHR</h3>
                <p className="text-xs text-gray-500 max-w-sm mt-1">
                  Selecione um paciente na lista à esquerda para começar a diagnosticar, editar mapa odontológico, gerenciar arquivos de laudo e monitorar progressos.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* 4. MODAL: REGISTER PATIENT COMPREHENSIVE */}
      <AnimatePresence>
        {showRegisterModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-left">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-2xl border border-gray-100 shadow-xl overflow-hidden"
            >
              
              <div className="bg-slate-900 px-6 py-5 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-md font-extrabold flex items-center gap-1.5">
                    <Users className="w-5 h-5 text-blue-400" /> Cadastrar Ficha do Paciente (EHR)
                  </h3>
                  <p className="text-[11px] text-gray-400">Inaugure logs clínicos e libere a ficha de agendamento na clínica.</p>
                </div>
                <button 
                  onClick={() => setShowRegisterModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Nome Completo do Paciente</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Roberta Mendes da Silva"
                      value={registerForm.name}
                      onChange={e => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:bg-white focus:border-blue-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Celular / WhatsApp institucional</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: (11) 98888-2222"
                      value={registerForm.phone}
                      onChange={e => setRegisterForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:bg-white focus:border-blue-500 font-semibold text-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Email eletrônico</label>
                    <input 
                      type="email" 
                      placeholder="Ex: roberta@gmail.com"
                      value={registerForm.email}
                      onChange={e => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:bg-white focus:border-blue-500 font-semibold text-gray-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Idade</label>
                      <input 
                        type="number" 
                        required
                        value={registerForm.age}
                        onChange={e => setRegisterForm(prev => ({ ...prev, age: parseInt(e.target.value) || 30 }))}
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:bg-white focus:border-blue-500 font-semibold text-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Gênero</label>
                      <select 
                        value={registerForm.gender}
                        onChange={e => setRegisterForm(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:bg-white focus:border-blue-500 font-semibold text-gray-700"
                      >
                        <option value="Feminino">Feminino</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Nível de Risco Clínico</label>
                    <select 
                      value={registerForm.risk}
                      onChange={e => setRegisterForm(prev => ({ ...prev, risk: e.target.value as any }))}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:bg-white focus:border-blue-500 font-semibold text-gray-755 text-gray-700"
                    >
                      <option value="Low">Baixo Risco (Profilaxia/Comum)</option>
                      <option value="Medium">Risco Médio (Retornos necessários)</option>
                      <option value="High">Alto Risco (Planejamento complexo)</option>
                      <option value="Critical">Risco Crítico (Urgências e Alertas)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Sangue</label>
                      <select 
                        value={registerForm.bloodType}
                        onChange={e => setRegisterForm(prev => ({ ...prev, bloodType: e.target.value as any }))}
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:bg-white focus:border-blue-500 font-semibold text-gray-700"
                      >
                        <option value="O+">O+</option>
                        <option value="A+">A+</option>
                        <option value="B+">B+</option>
                        <option value="AB+">AB+</option>
                        <option value="O-">O-</option>
                        <option value="A-">A-</option>
                        <option value="B-">B-</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Convênio</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Amil Dental"
                        value={registerForm.insurance}
                        onChange={e => setRegisterForm(prev => ({ ...prev, insurance: e.target.value }))}
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:bg-white focus:border-blue-500 font-semibold text-gray-700"
                      />
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 space-y-1.5">
                    <label className="block text-[10px] uppercase font-bold text-gray-400">Alergias e Restrições Médicas (Vírgula para múltiplos)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Alergia à Penicilina, Hipertensão grave, diabetes tipo II"
                      value={registerForm.medicalHistory}
                      onChange={e => setRegisterForm(prev => ({ ...prev, medicalHistory: e.target.value }))}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:bg-white focus:border-blue-500 font-semibold text-red-600 focus:text-red-650"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Queixa Principal / Notas Clínica Iniciais</label>
                    <textarea 
                      rows={2}
                      placeholder="Escreva brevemente o diagnóstico inicial ou queixa relatada no cadastramento..."
                      value={registerForm.notes}
                      onChange={e => setRegisterForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:bg-white focus:border-blue-500 font-medium resize-none"
                    />
                  </div>

                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                  <button 
                    type="button" 
                    onClick={() => setShowRegisterModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-slate-50 cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    Gravar Ficha de Prontuário
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
