import React, { useState, useEffect } from 'react';
import { Appointment, Dentist, Patient, Transaction, ClinicService } from './types';
import PublicLanding from './components/PublicLanding';
import ClinicDashboard from './components/ClinicDashboard';

const INITIAL_SERVICES: ClinicService[] = [
  {
    id: 'srv-1',
    name: 'Teeth Whitening',
    category: 'Cosmetic Dentistry',
    description: 'Professional, safe, and highly effective whitening treatments to restore the natural brilliance of your smile, removing years of stains and discoloration.',
    duration: 45,
    price: 450,
    assignedDentists: ['Dr. Sarah Jenkins'],
    status: 'Active',
    onlineBooking: true,
    complexity: 'Low',
    prepTime: 10,
    color: '#3b82f6',
    icon: '✨',
    bookingCount: 42,
    revenueGenerated: 18900,
    createdAt: '2026-01-10'
  },
  {
    id: 'srv-2',
    name: 'Dental Implants',
    category: 'Implants',
    description: 'Permanent, natural-looking solutions for missing teeth. Our implant procedures restore full function and aesthetics, giving you back your confidence.',
    duration: 90,
    price: 2500,
    assignedDentists: ['Dr. Marcus Reynolds'],
    status: 'Active',
    onlineBooking: true,
    complexity: 'High',
    prepTime: 20,
    color: '#8b5cf6',
    icon: '🦷',
    bookingCount: 18,
    revenueGenerated: 45000,
    createdAt: '2026-01-15'
  },
  {
    id: 'srv-3',
    name: 'Orthodontics',
    category: 'Orthodontics',
    description: 'Modern alignment solutions, including clear aligners, to straighten teeth discreetly and comfortably, improving both bite function and appearance.',
    duration: 60,
    price: 3800,
    assignedDentists: ['Dr. Emily Chen'],
    status: 'Active',
    onlineBooking: true,
    complexity: 'Medium',
    prepTime: 15,
    color: '#06b6d4',
    icon: '🦷',
    bookingCount: 29,
    revenueGenerated: 110200,
    createdAt: '2026-02-01'
  },
  {
    id: 'srv-4',
    name: 'Smile Makeovers',
    category: 'Cosmetic Dentistry',
    description: 'Comprehensive cosmetic transformations combining various treatments like veneers, whitening, and contouring for a completely revitalized, stunning smile.',
    duration: 120,
    price: 5000,
    assignedDentists: ['Dr. Sarah Jenkins', 'Dr. Marcus Reynolds'],
    status: 'Active',
    onlineBooking: true,
    complexity: 'High',
    prepTime: 30,
    color: '#ec4899',
    icon: '💎',
    bookingCount: 11,
    revenueGenerated: 55000,
    createdAt: '2026-02-10'
  },
  {
    id: 'srv-5',
    name: 'Limpeza e Profilaxia',
    category: 'Preventive Dentistry',
    description: 'Sessão completa de higienização profissional profunda, remoção de tártaro, jato de bicarbonato e aplicação de flúor protetor do esmalte.',
    duration: 30,
    price: 250,
    assignedDentists: ['Dr. Emily Chen', 'Dr. David Lee'],
    status: 'Active',
    onlineBooking: true,
    complexity: 'Low',
    prepTime: 5,
    color: '#10b981',
    icon: '🧼',
    bookingCount: 84,
    revenueGenerated: 21000,
    createdAt: '2026-01-05'
  }
];

const INITIAL_DENTISTS: Dentist[] = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Jenkins',
    specialty: 'Cosmetic Dentistry',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuMfMISirZQjS_fmCtdWUQ4dO_I5fbyKLY5gaSHo22GMZMqvjkj3bZtHe3B5gmMVVp3xqQxbejQJaqyBUGdhQ4qzPji_aYazZ6NsCrbmFtdZ0y8eaC1dZ0JjVUeo4jTh1tlQY8Fc4AJ3CJzjYLvd-8rAIPJPRQjsSFW0jIFfKASAFIVuA2haObd8v8OloKR3AEj-aUGl3294Ujr6ydXQZ4cbVGjZ74TR8jYpDX29GpcpGUnBVxZERKssPP8ERxIl6_5El4WDgG2Lca8',
    rating: 4.9,
    description: 'Expert in dynamic aesthetic restorations and premium complete smile makeovers with an eye for anatomical natural beauty.',
    status: 'Available',
    schedules: ['Mon-Thu: 8:00 AM - 5:00 PM']
  },
  {
    id: 'doc-2',
    name: 'Dr. Marcus Reynolds',
    specialty: 'Implantology',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuHCHWJ2h8S5SefRscz2a7_2_9Yk_GfPzqT5qZHyG0qF8hSvd4tGUp_eY6sX7_X8_M7_-Y5_Y2P',
    rating: 4.8,
    description: 'Expert in advanced micro-surgical procedures, computer-guided dental implants, and full-mouth biological rehabilitation.',
    status: 'Available',
    schedules: ['Tue-Fri: 9:00 AM - 6:00 PM']
  },
  {
    id: 'doc-3',
    name: 'Dr. Emily Chen',
    specialty: 'Orthodontics',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuERm5tX6pX-1y9_GfPz2mK8hS9vJfWw_cUp7t_v_M_w_cUp7tYm-D6bN5N9Z0_X',
    rating: 4.9,
    description: 'Specializes in clear dental aligner therapies, skeletal expansion, and cosmetic orthodontic alignment for teens and adults.',
    status: 'Available',
    schedules: ['Mon-Wed: 9:00 AM - 4:00 PM']
  },
  {
    id: 'doc-4',
    name: 'Dr. David Lee',
    specialty: 'Periodontics',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuE8_7P2V5bX_YfPfQ2m8_C7P6W_GfTqZ2mK8hS_Y2bV_c8w_cUp7t_V_N_w_Y',
    rating: 4.7,
    description: 'Focuses on structural oral health, cosmetic gum recontouring, and advanced pocket disinfection therapies.',
    status: 'On Leave',
    schedules: ['Thu-Fri: 10:00 AM - 6:00 PM']
  }
];

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    name: 'Arlene McCoy',
    email: 'arlene@mccoy.com',
    phone: '(11) 98765-4321',
    age: 34,
    gender: 'Feminino',
    lastVisit: '2026-05-12',
    medicalHistory: ['Alergia a Penicilina'],
    status: 'Active',
    notes: 'Apresenta sensibilidade dentária moderada nos incisivos superiores devido a leve desgaste do esmalte.'
  },
  {
    id: 'pat-2',
    name: 'Jerome Bell',
    email: 'jerome.bell@gmail.com',
    phone: '(11) 91234-5678',
    age: 42,
    gender: 'Masculino',
    lastVisit: '2026-04-30',
    medicalHistory: ['Pressão Alta'],
    status: 'Active',
    notes: 'Em tratamento pós-operatório de implante no dente 36. Tecido de cicatrização integro.'
  },
  {
    id: 'pat-3',
    name: 'Albert Flores',
    email: 'albert@flores.com',
    phone: '(11) 96543-2109',
    age: 28,
    gender: 'Masculino',
    lastVisit: '2026-05-01',
    medicalHistory: [],
    status: 'Active',
    notes: 'Agendou raspagem periodontal preventiva rotineira.'
  }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'app-1',
    patientName: 'Arlene McCoy',
    email: 'arlene@mccoy.com',
    phone: '(11) 98765-4321',
    date: '2026-05-21',
    time: '10:30 AM',
    treatment: 'Teeth Whitening',
    dentistName: 'Dr. Sarah Jenkins',
    status: 'Confirmed',
    notes: 'Deseja clareamento rápido em sessão única.',
    price: 450
  },
  {
    id: 'app-2',
    patientName: 'Jerome Bell',
    email: 'jerome.bell@gmail.com',
    phone: '(11) 91234-5678',
    date: '2026-05-21',
    time: '02:00 PM',
    treatment: 'Dental Implants',
    dentistName: 'Dr. Marcus Reynolds',
    status: 'Pending',
    notes: 'Consulta de retorno para avaliação de osseointegração.',
    price: 2500
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TX-1004',
    patientName: 'Arlene McCoy',
    treatment: 'Teeth Whitening',
    amount: 450,
    date: '2026-05-21',
    status: 'Paid'
  },
  {
    id: 'TX-1003',
    patientName: 'Jerome Bell',
    treatment: 'Dental Implants',
    amount: 2500,
    date: '2026-05-20',
    status: 'Paid'
  },
  {
    id: 'TX-1002',
    patientName: 'Albert Flores',
    treatment: 'Orthodontics',
    amount: 3800,
    date: '2026-05-18',
    status: 'Paid'
  },
  {
    id: 'TX-1001',
    patientName: 'Jane Cooper',
    treatment: 'Smile Makeover',
    amount: 5000,
    date: '2026-05-15',
    status: 'Paid'
  }
];

export default function App() {
  const [activeView, setActiveView] = useState<'public' | 'admin'>('public');
  
  // Database states with LocalStorage persistence to link them flawlessly
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('serene_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('serene_patients');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });

  const [dentists, setDentists] = useState<Dentist[]>(() => {
    const saved = localStorage.getItem('serene_dentists');
    return saved ? JSON.parse(saved) : INITIAL_DENTISTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('serene_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [services, setServices] = useState<ClinicService[]>(() => {
    const saved = localStorage.getItem('serene_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  // Keep state sync
  useEffect(() => {
    localStorage.setItem('serene_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('serene_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('serene_dentists', JSON.stringify(dentists));
  }, [dentists]);

  useEffect(() => {
    localStorage.setItem('serene_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('serene_services', JSON.stringify(services));
  }, [services]);

  // Appointment managers
  const handleAddAppointment = (newApp: Omit<Appointment, 'id' | 'status' | 'price'>) => {
    // Infer prices based on the dynamic services list!
    const matchedService = services.find(s => s.name.toLowerCase() === newApp.treatment.toLowerCase() || s.id === newApp.treatment);
    const price = matchedService ? matchedService.price : 450;
    const finalTreatmentName = matchedService ? matchedService.name : newApp.treatment;

    const appointmentItem: Appointment = {
      ...newApp,
      treatment: finalTreatmentName,
      id: `app-${Date.now()}`,
      status: 'Pending',
      price
    };

    setAppointments(prev => [...prev, appointmentItem]);

    // Update dynamic booking stats and revenue generated under service analytics!
    if (matchedService) {
      setServices(prev => prev.map(s => {
        if (s.id === matchedService.id) {
          return {
            ...s,
            bookingCount: s.bookingCount + 1,
            revenueGenerated: s.revenueGenerated + s.price
          };
        }
        return s;
      }));
    }

    // Also auto-append them to patient list if patient does not exist yet!
    const patientExists = patients.some(p => p.name.toLowerCase() === newApp.patientName.toLowerCase());
    if (!patientExists) {
      const patientItem: Patient = {
        id: `pat-${Date.now()}`,
        name: newApp.patientName,
        email: newApp.email,
        phone: newApp.phone,
        age: 30, // defaulted
        gender: 'Não Informado',
        lastVisit: newApp.date,
        medicalHistory: [],
        status: 'Active',
        notes: newApp.notes || 'Cadastrado espontaneamente via página de agendamentos no site da clínica.'
      };
      setPatients(prev => [...prev, patientItem]);
    }
  };

  const handleUpdateAppointmentStatus = (id: string, status: 'Confirmed' | 'Pending' | 'Cancelled') => {
    setAppointments(prev => prev.map(app => {
      if (app.id === id) {
        // If confirmed, trigger a virtual transaction invoice automatically too!
        if (status === 'Confirmed' && app.status !== 'Confirmed') {
          const txItem: Transaction = {
            id: `TX-${Math.floor(Math.random() * 9000) + 1000}`,
            patientName: app.patientName,
            treatment: app.treatment,
            amount: app.price,
            date: app.date,
            status: 'Paid'
          };
          setTransactions(t => [txItem, ...t]);
        }
        return { ...app, status };
      }
      return app;
    }));
  };

  const handleAddPatient = (newPatient: Omit<Patient, 'id'>) => {
    const patientItem: Patient = {
      ...newPatient,
      id: `pat-${Date.now()}`
    };
    setPatients(prev => [...prev, patientItem]);
  };

  const handleAddDentist = (newDentist: Omit<Dentist, 'id'>) => {
    const dentistItem: Dentist = {
      ...newDentist,
      id: `doc-${Date.now()}`
    };
    setDentists(prev => [...prev, dentistItem]);
  };

  const handleUpdateDentistStatus = (id: string, status: 'Available' | 'On Leave') => {
    setDentists(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  };

  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const txItem: Transaction = {
      ...newTx,
      id: `TX-${Math.floor(1001 + Math.random() * 8999)}`
    };
    setTransactions(prev => [txItem, ...prev]);
  };

  const handleAddService = (newSrv: Omit<ClinicService, 'id' | 'bookingCount' | 'revenueGenerated' | 'createdAt'>) => {
    const srvItem: ClinicService = {
      ...newSrv,
      id: `srv-${Date.now()}`,
      bookingCount: 0,
      revenueGenerated: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setServices(prev => [srvItem, ...prev]);
  };

  const handleUpdateService = (updatedSrv: ClinicService) => {
    setServices(prev => prev.map(s => s.id === updatedSrv.id ? updatedSrv : s));
  };

  const handleDeleteService = (id: string) => {
    // Soft delete/archive logic to preserve historical analytics and invoices
    setServices(prev => prev.map(s => s.id === id ? { ...s, status: 'Archived' } : s));
  };

  const handleUpdateTransactionStatus = (id: string, status: 'Paid' | 'Pending' | 'Overdue') => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  return (
    <div>
      {activeView === 'public' ? (
        <PublicLanding 
          services={services}
          dentists={dentists} 
          onAddAppointment={handleAddAppointment} 
          onSwitchToAdmin={() => setActiveView('admin')} 
        />
      ) : (
        <ClinicDashboard 
          services={services}
          appointments={appointments}
          patients={patients}
          dentists={dentists}
          transactions={transactions}
          onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
          onAddAppointment={handleAddAppointment}
          onAddPatient={handleAddPatient}
          onSwitchToPublic={() => setActiveView('public')}
          onAddDentist={handleAddDentist}
          onUpdateDentistStatus={handleUpdateDentistStatus}
          onAddTransaction={handleAddTransaction}
          onUpdateTransactionStatus={handleUpdateTransactionStatus}
          onAddService={handleAddService}
          onUpdateService={handleUpdateService}
          onDeleteService={handleDeleteService}
        />
      )}
    </div>
  );
}
