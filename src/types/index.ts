export type UserRole = 'admin' | 'fisioterapeuta' | 'recepcionista' | 'paciente';

export interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  role: UserRole;
  professional_id?: string;
  patient_id?: string;
  status: 'ativo' | 'inativo';
}

export interface Patient {
  id: string;
  name: string;
  cpf: string;
  birth_date?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  profession?: string;
  emergency_contact?: string;
  insurance?: string;
  clinical_notes?: string;
  pain_score?: number;
  weight?: string;
  height?: string;
  status: 'ativo' | 'inativo';
  created_at: string;
  updated_at?: string;
}

export type AppointmentStatus = 'agendado' | 'confirmado' | 'em_atendimento' | 'realizado' | 'falta' | 'cancelado';

export interface Appointment {
  id: string;
  patient_id: string;
  patient_name: string;
  professional_id: string;
  professional_name: string;
  date: string;
  time: string;
  duration_minutes: number;
  service_type: string;
  procedure?: string;
  treatment_plan_id?: string;
  room?: string;
  status: AppointmentStatus;
  notes?: string;
  reschedule_pending?: boolean;
  reschedule_request_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  professional_id: string;
  professional_name: string;
  chief_complaint: string;
  anamnesis: string;
  clinical_history?: string;
  injuries_history?: string;
  postural_assessment?: string;
  functional_assessment?: string;
  mobility?: string;
  muscle_strength?: string;
  pain_scale: number;
  physio_diagnosis: string;
  therapeutic_goals: string;
  treatment_plan: string;
  created_at: string;
  updated_at?: string;
}

export interface ClinicalEvolution {
  id: string;
  patient_id: string;
  treatment_plan_id?: string;
  session_number: number;
  session_date: string;
  professional_id: string;
  professional_name: string;
  pain_before: number;
  pain_after: number;
  procedures: string;
  conduct: string;
  patient_response?: string;
  notes?: string;
  next_recommendations?: string;
  shared_with_patient: boolean;
  created_at?: string;
}

export interface TreatmentPlan {
  id: string;
  patient_id: string;
  patient_name: string;
  professional_id: string;
  professional_name: string;
  title: string;
  diagnosis?: string;
  total_sessions: number;
  completed_sessions: number;
  remaining_sessions: number;
  frequency: string;
  status: 'em_andamento' | 'concluido' | 'suspenso';
  start_date: string;
  completion_date?: string;
  price?: number;
  shared_with_patient: boolean;
  therapeutic_goals?: string;
  created_at: string;
}

export type TransactionType = 'receita' | 'despesa';
export type PaymentStatus = 'pago' | 'pendente' | 'cancelado';
export type PaymentMethod = 'Pix' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro' | 'Transferência Bancária' | 'Boleto / Pix';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  description: string;
  patient_id?: string;
  patient_name?: string;
  amount: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  payment_date?: string;
  due_date?: string;
  receipt_number?: string;
  treatment_plan_id?: string;
  notes?: string;
  created_at: string;
}

export interface Professional {
  id: string;
  name: string;
  cpf?: string;
  crefito: string;
  specialty: string;
  phone: string;
  email: string;
  avatar?: string;
  bio?: string;
  status: 'ativo' | 'inativo';
  available_hours?: string;
  total_appointments?: number;
  completed_appointments?: number;
  active_treatment_plans?: number;
}

export type WebRequestStatus = 'nova' | 'em_analise' | 'em_contato' | 'confirmada' | 'cancelada';

export interface WebRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  specialty: string;
  preferred_shift: string;
  preferred_date: string;
  message?: string;
  status: WebRequestStatus;
  converted_appointment_id?: string;
  created_at: string;
}

export interface ClinicSettings {
  id: string;
  clinic_name: string;
  cnpj: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  operating_hours: string;
  default_session_duration: number;
  payment_methods: string[];
}

export interface LandingCms {
  hero_title: string;
  hero_subtitle: string;
  hero_badge: string;
  about_title: string;
  about_description: string;
  differentials: Array<{ title: string; desc: string }>;
  specialties: Array<{ id: string; title: string; desc: string; icon: string; image?: string }>;
  treatment_programs?: Array<{ title: string; category: string; desc: string; image: string }>;
  locations: Array<{ name: string; address: string; phone: string }>;
  testimonials: Array<{ name: string; treatment: string; text: string; rating: number; avatar?: string }>;
}

