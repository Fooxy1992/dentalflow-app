export interface ClinicService {
  id: string;
  name: string;
  category: string;
  description: string;
  duration: number; // minutes
  price: number;
  assignedDentists: string[]; // names of dentists
  status: 'Active' | 'Hidden' | 'Draft' | 'Archived';
  onlineBooking: boolean;
  complexity: 'Low' | 'Medium' | 'High';
  prepTime: number; // minutes
  color: string;
  icon?: string;
  bookingCount: number;
  revenueGenerated: number;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  treatment: string;
  dentistName: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  notes: string;
  price: number;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  lastVisit: string;
  medicalHistory: string[];
  status: 'Active' | 'Inactive';
  notes: string;
}

export interface Dentist {
  id: string;
  name: string;
  specialty: string;
  imageUrl: string;
  rating: number;
  description: string;
  status: 'Available' | 'On Leave';
  schedules: string[]; // e.g. ["Mon-Thu: 8:00 AM - 5:00 PM", "Fri: 8:00 AM - 2:00 PM"]
}

export interface Transaction {
  id: string;
  patientName: string;
  treatment: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}
