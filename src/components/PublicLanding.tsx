import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Award, 
  ShieldCheck, 
  Heart, 
  Sparkles,
  CheckCircle2,
  FileCheck2,
  Lock
} from 'lucide-react';
import { Appointment, Dentist, ClinicService } from '../types';

interface PublicLandingProps {
  services?: ClinicService[];
  dentists: Dentist[];
  onAddAppointment: (appointment: Omit<Appointment, 'id' | 'status' | 'price'>) => void;
  onSwitchToAdmin: () => void;
}

export default function PublicLanding({ services, dentists, onAddAppointment, onSwitchToAdmin }: PublicLandingProps) {
  // CENTRALIZED REGISTER SYNC: Filter deactivated/hidden/archived items and only display active services for online booking
  const activeServices = services 
    ? services.filter(s => s.status === 'Active' && s.onlineBooking) 
    : [];

  const treatmentsList = activeServices.length > 0
    ? activeServices.map(s => ({
        name: s.name,
        description: s.description,
        price: s.price,
        icon: s.icon || '✨'
      }))
    : [
        {
          name: 'Teeth Whitening',
          description: 'Professional, safe, and highly effective whitening treatments to restore the natural brilliance of your smile, removing years of stains and discoloration.',
          price: 450,
          icon: '✨'
        },
        {
          name: 'Dental Implants',
          description: 'Permanent, natural-looking solutions for missing teeth. Our implant procedures restore full function and aesthetics, giving you back your confidence.',
          price: 2500,
          icon: '🦷'
        },
        {
          name: 'Orthodontics',
          description: 'Modern alignment solutions, including clear aligners, to straighten teeth discreetly and comfortably, improving both bite function and appearance.',
          price: 3800,
          icon: '🦷'
        },
        {
          name: 'Smile Makeovers',
          description: 'Comprehensive cosmetic transformations combining various treatments like veneers, whitening, and contouring for a completely revitalized, stunning smile.',
          price: 5000,
          icon: '💎'
        }
      ];

  const defaultTreatmentName = treatmentsList[0]?.name || 'Teeth Whitening';

  const [formData, setFormData] = useState({
    patientName: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    treatment: defaultTreatmentName,
    dentistName: dentists[0]?.name || 'Dr. Sarah Jenkins',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [beforeAfterFilter, setBeforeAfterFilter] = useState<'all' | 'whitening' | 'implants'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName || !formData.email || !formData.phone || !formData.date || !formData.time) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate minor network delay
    setTimeout(() => {
      onAddAppointment(formData);
      setIsSubmitting(false);
      setShowSuccessModal(true);
      // Reset form but keep dentist & treatment defaults
      setFormData({
        patientName: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        treatment: defaultTreatmentName,
        dentistName: dentists[0]?.name || 'Dr. Sarah Jenkins',
        notes: ''
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#fbf9fa] text-[#1b1c1d] relative overflow-hidden selection:bg-[#fed65b] selection:text-[#745c00]">
      {/* Clinician switch banner */}
      <div className="bg-[#162839] text-[#eaf1ff] py-2 px-4 shadow-inner text-center text-xs md:text-sm flex justify-between items-center z-50 relative">
        <div className="flex items-center gap-1.5 mx-auto">
          <span className="inline-block w-2 h-2 rounded-full bg-[#fed65b] animate-pulse"></span>
          <span><strong>Ambiente Clínico Integrado:</strong> Agende uma consulta aqui e veja o painel administrativo atualizar na mesma hora!</span>
        </div>
        <button 
          onClick={onSwitchToAdmin}
          className="bg-[#fed65b] hover:bg-[#ffe088] text-[#162839] font-medium px-3  py-1 rounded-full text-xs transition-colors py-0.5 flex items-center gap-1 shrink-0"
        >
          <Lock className="w-3 h-3" /> Painel DentaFlow Dashboard
        </button>
      </div>

      {/* Top Navigation */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#162839] flex items-center justify-center text-white font-bold text-lg">S</span>
            <div>
              <span className="font-bold text-lg tracking-tight text-[#162839] block leading-none">SERENE DENTAL</span>
              <span className="text-[10px] text-[#74777d] tracking-widest uppercase">Clinical Wellness</span>
            </div>
          </div>

          <nav className="hidden md:flex gap-8 items-center font-medium text-sm text-[#43474c]">
            <a href="#services" className="hover:text-[#162839] transition-colors">Tratamentos</a>
            <a href="#team" className="hover:text-[#162839] transition-colors">Nossa Equipe</a>
            <a href="#transformations" className="hover:text-[#162839] transition-colors">Resultados</a>
            <a href="#booking" className="hover:text-[#162839] transition-colors">Agendar</a>
          </nav>

          <div className="flex gap-4 items-center">
            <button 
              onClick={onSwitchToAdmin} 
              className="text-[#162839] text-xs md:text-sm font-semibold hover:opacity-80 transition-opacity hidden sm:block"
            >
              Área Médica
            </button>
            <a 
              href="#booking"
              className="bg-[#162839] text-white hover:bg-[#2c3e50] text-sm font-medium px-5 py-2.5 rounded-full transition-all tracking-tight"
            >
              Agendar Consulta
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ffe088]/30 border border-[#fed65b]/40 text-[#574500] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Harmonia, Saúde &amp; Bem-Estar Clínico Superior</span>
          </div>
          
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light text-[#162839] leading-[1.1] tracking-tight">
            Sorrisos Saudáveis <br />
            <span className="font-bold text-[#4e6073]">Começam com um Cuidado Excepcional</span>
          </h1>
          
          <p className="font-sans text-base sm:text-lg text-[#43474c] max-w-xl leading-relaxed font-light">
            Odontologia moderna concebida em torno do conforto, confiança e tratamentos personalizados para cada paciente. Experimente a excelência clínica em um ambiente sereno e acolhedor.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <a 
              href="#booking" 
              className="bg-[#162839] text-white font-medium text-center px-8 py-4 rounded-full hover:bg-[#2c3e50] transform hover:-translate-y-0.5 transition-all duration-300 shadow-md flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" /> Marcar Minha Consulta
            </a>
            <a 
              href="#team"
              className="border border-[#c4c6cd] text-[#162839] text-center font-medium px-8 py-4 rounded-full hover:bg-gray-50 transition-colors"
            >
              Conhecer Especialistas
            </a>
          </div>

          <div className="pt-6 grid grid-cols-3 gap-6 border-t border-gray-100 max-w-lg">
            <div>
              <span className="block text-2xl font-bold text-[#162839]">99.4%</span>
              <span className="text-xs text-[#74777d]">Satisfação Geral</span>
            </div>
            <div>
              <span className="block text-2xl font-bold text-[#162839]">15k+</span>
              <span className="text-xs text-[#74777d]">Sorrisos Renováveis</span>
            </div>
            <div>
              <span className="block text-2xl font-bold text-[#162839]">4</span>
              <span className="text-xs text-[#74777d]">Líderes Especiais</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#fed65b]/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-[#4e6073]/10 rounded-full blur-3xl"></div>
          
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-square ambient-shadow border border-white">
            <img 
              alt="Clínica Serene Dental" 
              className="w-full h-full object-cover select-none" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCF955SoTse43-BwsFwxSgmzp1onG04S8r1VCG_2JwXeD2DhffxBTEpO9pUaa9aHO-XLXUx6ojc6CmV635DILuTAIf8AjYLs2Xfp_tcxIiqaKaR-2Eisafv_uhXXEnKDukARoIKmd-rxhvh_hJrf3IiBaQInJEZMXQHur6RHB4sMyoyRwqQuUI9SHRmt4I0dAWxCvCY5Eu9kv08MRWkYGSKR8hrjBiMaB7EexunsomS5W0B1nJJl7rqHChuIPO06frpHZT_nWdLY0E" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#162839]/30 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* Trust Blocks */}
      <section className="bg-white py-16 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-xl bg-[#fbf9fa] hover:bg-white border border-gray-100 hover:border-gray-200 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-[#162839]/5 text-[#162839] flex items-center justify-center mb-5">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg text-[#162839] mb-2">Especialistas Renomados</h3>
              <p className="text-sm text-[#43474c] leading-relaxed">Nossa equipe conta com profissionais titulados com décadas de prática moderna.</p>
            </div>

            <div className="p-6 rounded-xl bg-[#fbf9fa] hover:bg-white border border-gray-100 hover:border-gray-200 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-[#162839]/5 text-[#162839] flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg text-[#162839] mb-2">Tecnologia Avançada</h3>
              <p className="text-sm text-[#43474c] leading-relaxed">Equipamentos odontológicos digitais de última geração para exames menos invasivos.</p>
            </div>

            <div className="p-6 rounded-xl bg-[#fbf9fa] hover:bg-white border border-gray-100 hover:border-gray-200 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-[#162839]/5 text-[#162839] flex items-center justify-center mb-5">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg text-[#162839] mb-2">Cuidados Personalizados</h3>
              <p className="text-sm text-[#43474c] leading-relaxed">Seu plano de tratamento é desenhado sob medida com suas metas e ritmos exclusivos.</p>
            </div>

            <div className="p-6 rounded-xl bg-[#fbf9fa] hover:bg-white border border-gray-100 hover:border-gray-200 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-[#162839]/5 text-[#162839] flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg text-[#162839] mb-2">Ambiente Acolhedor</h3>
              <p className="text-sm text-[#43474c] leading-relaxed">Especialmente planejado para acalmar a ansiedade e proporcionar tranquilidade.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <span className="text-xs uppercase tracking-widest text-[#4e6073] font-semibold">Tecnologia &amp; Estética</span>
          <h2 className="text-3xl sm:text-4xl font-light text-[#162839]">
            Nossos Tratamentos <span className="font-semibold">Especializados</span>
          </h2>
          <div className="w-16 h-1 bg-[#fed65b] mx-auto rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {treatmentsList.map((treatment, i) => (
            <div 
              key={i}
              className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 transition-all group hover:shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="text-4xl mb-6">{treatment.icon}</div>
                <h3 className="text-xl font-bold text-[#162839] mb-3">{treatment.name}</h3>
                <p className="text-sm text-[#43474c] leading-relaxed mb-6">{treatment.description}</p>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                <span className="text-xs text-[#74777d]">Valor Estimado: R$ {treatment.price.toLocaleString('pt-BR')}</span>
                <a 
                  href="#booking" 
                  onClick={() => setFormData(prev => ({ ...prev, treatment: treatment.name }))}
                  className="text-sm text-[#162839] font-semibold flex items-center gap-1.5 group-hover:text-[#4e6073] transition-colors"
                >
                  Agendar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Team Section */}
      <section id="team" className="py-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <span className="text-xs uppercase tracking-widest text-[#4e6073] font-semibold">Corpo Clínico Premium</span>
            <h2 className="text-3xl sm:text-4xl font-light text-[#162839]">
              Conheça Nossos <span className="font-semibold">Especialistas</span>
            </h2>
            <p className="text-sm text-[#43474c] max-w-md mx-auto">Excelência profissional multidisciplinar dedicada a redefinir seu bem-estar bucal com toque artístico.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {dentists.map((dentist, idx) => (
              <div key={dentist.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="h-64 overflow-hidden relative group bg-gray-100">
                  <img 
                    alt={dentist.name} 
                    className="w-full h-full object-cover object-top filter group-hover:scale-105 transition-transform duration-500" 
                    src={dentist.imageUrl} 
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full text-xs font-bold text-[#735c00] flex items-center gap-0.5 shadow-sm">
                    <Star className="w-3 h-3 fill-[#fed65b] stroke-[#735c00]" /> {dentist.rating}
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] bg-[#162839]/5 text-[#162839] uppercase font-bold tracking-wider px-2 py-1 rounded-full">
                      {dentist.specialty}
                    </span>
                    <h3 className="text-lg font-bold text-[#162839] mt-3 leading-tight">{dentist.name}</h3>
                    <p className="text-xs text-[#43474c] mt-2 leading-relaxed flex-grow">
                      {dentist.description}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-gray-50 text-xs text-[#74777d]">
                    <Clock className="w-3.5 h-3.5 inline mr-1 text-[#162839]" /> {dentist.schedules[0]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before / After Gallery */}
      <section id="transformations" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <span className="text-xs uppercase tracking-widest text-[#4e6073] font-semibold">Galeria de Resultados</span>
          <h2 className="text-3xl sm:text-4xl font-light text-[#162839]">
            Transformações do <span className="font-semibold">Sorriso</span>
          </h2>
          <p className="text-sm text-[#43474c] max-w-xl mx-auto">Presencie a perfeição estética alcançada por meio de metodologias clínicas modernas e personalizadas.</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 ambient-shadow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-4 space-y-6">
              <h3 className="text-2xl font-semibold text-[#162839]">Resultados Reais de Pacientes</h3>
              <p className="text-sm text-[#43474c] leading-relaxed">
                Nossos procedimentos de clareamento a laser de alta intensidade e implantes de titânio reproduzem o contorno, brilho e anatomia de forma absolutamente natural e harmoniosa.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#10b981]/10 text-[#10b981] flex items-center justify-center mt-0.5 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-[#43474c]"><strong>Laser Clareamento:</strong> Subida de até 8 tons em sessão única.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#10b981]/10 text-[#10b981] flex items-center justify-center mt-0.5 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-[#43474c]"><strong>Faceta Dentária de Cerâmica:</strong> Zero desgaste invasivo prejudicial.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#10b981]/10 text-[#10b981] flex items-center justify-center mt-0.5 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-[#43474c]"><strong>Alinhador Invisalign:</strong> Liberdade e invisibilidade completa.</p>
                </div>
              </div>

              <div className="pt-4">
                <a 
                  href="#booking" 
                  className="inline-flex items-center gap-2 bg-[#162839] hover:bg-[#2c3e50] text-white text-xs font-semibold px-5 py-3 rounded-full transition-colors"
                >
                  Fazer Uma Avaliação Estética <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
                <img 
                  alt="Smile Transformation Before and After" 
                  className="w-full h-auto select-none duration-700 transition-all group-hover:scale-[1.02]" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGFumHbqv47rLRRMBvtX-EL7TMDFGRobLmGWUlSorHqBZYegUs-qcMpTKfv7N8Qm3F5DcfPmUUQwISX8pklujsfI_mFmHTVe2AapTJC0IH9ucwxf-kNrrptEyznbZ4KdLSvbT20Tj7J87lmrOBm3lnnOcENG6vx7OsR7EzOZ3AsXsszxXJ804ZIgYBPJeTU08AsSBFvypby0aw91YG0wc_jrpbPhbEQQVZcXa-0yKf0aVONwSY9Eg0eaun1z-fpzDbQwnJ2GAdNTo" 
                />
                <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:bg-black/5"></div>
              </div>
              <div className="mt-4 flex justify-between text-xs text-[#74777d]">
                <span>*Fotos reais sem photoshop de reabilitação estética nos dentes anteriores.</span>
                <span className="font-semibold text-[#162839]">Serene Clinical Dental ©</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form Section */}
      <section id="booking" className="py-20 bg-white border-t border-gray-100 relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12 space-y-4">
            <span className="text-xs uppercase tracking-widest text-[#4e6073] font-semibold">Agendamento Simplificado</span>
            <h2 className="text-3xl font-light text-[#162839]">
              Inicie Sua Jornada Para Um <span className="font-semibold">Novo Sorriso</span>
            </h2>
            <p className="text-sm text-[#43474c] max-w-md mx-auto">Preencha o formulário abaixo e garanta a sua vaga. Nossa equipe entrará em contato via WhatsApp para confirmar o seu horário preferido.</p>
          </div>

          <div className="bg-[#fbf9fa] rounded-2xl p-8 border border-gray-100 ambient-shadow">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-[#162839] uppercase tracking-wider mb-2">Seu Nome Completo *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Sarah Jenkins"
                    value={formData.patientName}
                    onChange={e => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                    className="w-full bg-white border border-[#c4c6cd] focus:border-[#162839] focus:ring-1 focus:ring-[#162839] rounded-lg px-4 py-3 text-sm transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#162839] uppercase tracking-wider mb-2">E-mail de Contato *</label>
                  <input 
                    type="email" 
                    required
                    placeholder="Ex: sarah@email.com"
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-white border border-[#c4c6cd] focus:border-[#162839] focus:ring-1 focus:ring-[#162839] rounded-lg px-4 py-3 text-sm transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-[#162839] uppercase tracking-wider mb-2">Telefone Celular (WhatsApp) *</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="Ex: (11) 99999-9999"
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-white border border-[#c4c6cd] focus:border-[#162839] focus:ring-1 focus:ring-[#162839] rounded-lg px-4 py-3 text-sm transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#162839] uppercase tracking-wider mb-2">Data Desejada *</label>
                  <input 
                    type="date" 
                    required
                    value={formData.date}
                    onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-white border border-[#c4c6cd] focus:border-[#162839] focus:ring-1 focus:ring-[#162839] rounded-lg px-4 py-3 text-sm text-[#43474c] transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#162839] uppercase tracking-wider mb-2">Horário Preferido *</label>
                  <select
                    value={formData.time}
                    required
                    onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full bg-white border border-[#c4c6cd] focus:border-[#162839] focus:ring-1 focus:ring-[#162839] rounded-lg px-4 py-3 text-sm text-[#43474c] transition-all outline-none"
                  >
                    <option value="">Selecione...</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-[#162839] uppercase tracking-wider mb-2">Tipo de Tratamento</label>
                  <select
                    value={formData.treatment}
                    onChange={e => setFormData(prev => ({ ...prev, treatment: e.target.value }))}
                    className="w-full bg-white border border-[#c4c6cd] focus:border-[#162839] focus:ring-1 focus:ring-[#162839] rounded-lg px-4 py-3 text-sm text-[#43474c] transition-all outline-none"
                  >
                    {treatmentsList.map((t, idx) => (
                      <option key={idx} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#162839] uppercase tracking-wider mb-2">Especialista de Preferência</label>
                  <select
                    value={formData.dentistName}
                    onChange={e => setFormData(prev => ({ ...prev, dentistName: e.target.value }))}
                    className="w-full bg-white border border-[#c4c6cd] focus:border-[#162839] focus:ring-1 focus:ring-[#162839] rounded-lg px-4 py-3 text-sm text-[#43474c] transition-all outline-none"
                  >
                    {dentists.map((d) => (
                      <option key={d.id} value={d.name}>{d.name} ({d.specialty})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#162839] uppercase tracking-wider mb-2">Alguma observação, alergia ou queixa especial?</label>
                <textarea 
                  rows={3}
                  placeholder="Ex: Desejo clareamento rápido para evento social no fim do mês"
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-white border border-[#c4c6cd] focus:border-[#162839] focus:ring-1 focus:ring-[#162839] rounded-lg px-4 py-3 text-sm transition-all outline-none resize-none"
                />
              </div>

              <div className="pt-4 text-center">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-[#162839] hover:bg-[#2c3e50] font-semibold text-white px-10 py-4 rounded-full transition-all text-sm tracking-wide shadow-md disabled:opacity-50 inline-flex items-center gap-2 justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" 
                      />
                      Enviando Solicitação...
                    </>
                  ) : (
                    <>
                      Enviar Solicitação de Consulta <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#4e6073] font-semibold">Avaliações Científicas</span>
            <h2 className="text-3xl font-light text-[#162839]">Relatos de Pacientes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 ambient-shadow">
              <div className="flex gap-1 text-[#fed65b] mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current stroke-[#735c00]" />)}
              </div>
              <p className="text-sm text-[#43474c] italic mb-6 leading-relaxed">
                "A experiência de saúde odontológica mais amigável e refinada que já vivenciei. A Dra. Sarah Jenkins reconstruiu meu sorriso com um critério estético e calma estonteantes. Recomendo imensamente."
              </p>
              <span className="block text-xs font-bold text-[#162839]">— Eleanor T., Diretora de Criação</span>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 ambient-shadow">
              <div className="flex gap-1 text-[#fed65b] mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current stroke-[#735c00]" />)}
              </div>
              <p className="text-sm text-[#43474c] italic mb-6 leading-relaxed">
                "Assim que entramos, o clima de spa dissipa toda a ansiedade de dentista habitual. A instrumentação é rápida, eficaz e indolor. A equipe inteira merece notas máximas em prestreza técnica."
              </p>
              <span className="block text-xs font-bold text-[#162839]">— James L., Engenheiro de Software</span>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 ambient-shadow">
              <div className="flex gap-1 text-[#fed65b] mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current stroke-[#735c00]" />)}
              </div>
              <p className="text-sm text-[#43474c] italic mb-6 leading-relaxed">
                "Realizei a inserção de dois implantes cirúrgicos com Dr. Marcus Reynolds. A coordenação radiográfica computadorizada e a explicação detalhada de cada passo me deslumbraram. Ficou perfeito."
              </p>
              <span className="block text-xs font-bold text-[#162839]">— Michael S., Professor Universitário</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#162839] text-[#eaf1ff]/90 pt-16 pb-12 border-t border-gray-950">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
          <div className="space-y-4">
            <span className="font-bold text-lg text-white block">SERENE DENTAL</span>
            <p className="text-xs text-[#96a9be] leading-relaxed">
              Alta performance clínica integrada e refinamento terapêutico com foco absoluto no seu conforto e bem-estar odontológico permanente.
            </p>
          </div>

          <div>
            <span className="font-bold text-white block mb-4 uppercase tracking-widest text-xs">Clínica</span>
            <p className="text-xs text-[#96a9be] leading-relaxed">
              Endereço: Avenida Faria Lima, 1500 - 4º Andar<br />
              Itaim Bibi, São Paulo - SP<br />
              <span className="text-white">Fone: (11) 5553-4567</span><br />
              Email: agendamento@serenedental.com
            </p>
          </div>

          <div>
            <span className="font-bold text-white block mb-4 uppercase tracking-widest text-xs">Atendimento</span>
            <p className="text-xs text-[#96a9be] leading-relaxed">
              Segunda a Quinta: 8:00 AM - 5:00 PM<br />
              Sexta-feira: 8:00 AM - 2:00 PM<br />
              Sábado e Domingo: Fechado (Sob Emergência)
            </p>
          </div>

          <div>
            <span className="font-bold text-white block mb-4 uppercase tracking-widest text-xs">Ambientes</span>
            <div className="space-y-2">
              <button 
                onClick={onSwitchToAdmin} 
                className="block text-xs bg-[#fed65b] text-[#162839] font-semibold px-4 py-2 rounded-lg hover:bg-white transition-colors"
              >
                Painel Clínico DentaFlow
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between text-xs text-[#96a9be] gap-4">
          <span>© 2026 Serene Clinical Dental. Todos os direitos reservados.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Políticas de Privacidade</a>
            <a href="#" className="hover:text-white">Termos de Atendimento</a>
          </div>
        </div>
      </footer>

      {/* Booking Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl max-w-md w-full p-8 relative shadow-2xl text-center space-y-5"
            >
              <div className="w-16 h-16 rounded-full bg-[#10b981]/15 text-[#10b981] flex items-center justify-center mx-auto text-3xl">
                <FileCheck2 className="w-8 h-8" />
              </div>
              
              <h3 className="text-xl font-bold text-[#162839]">Solicitação Efetuada com Sucesso!</h3>
              
              <p className="text-sm text-[#43474c] leading-relaxed">
                Parabéns! Sua proposta de consulta médica residencial foi inserida com sucesso no banco de dados e está pendente de aprovação pela equipe do <strong>DentaFlow</strong>.
              </p>

              <div className="p-4 bg-[#fbf9fa] rounded-lg text-xs text-left text-[#43474c] space-y-1">
                <div><strong>Status Inicial:</strong> Pendente no Painel de Controle</div>
                <div><strong>Para testar:</strong> Mude para o Painel Administrativo do DentaFlow no menu do topo para ver seu agendamento, aceitá-lo ou cancelá-lo!</div>
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold px-5 py-3 rounded-full transition-colors"
                >
                  OK, fechar
                </button>
                <button 
                  onClick={() => {
                    setShowSuccessModal(false);
                    onSwitchToAdmin();
                  }}
                  className="bg-[#162839] hover:bg-[#2c3e50] text-[#fed65b] text-xs font-bold px-5 py-3 rounded-full transition-all flex items-center gap-1"
                >
                  Ver no DentaFlow! <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
