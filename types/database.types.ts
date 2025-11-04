<<<<<<< HEAD

export type UserRole = 'admin' | 'parent';

export interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: UserRole;
  created_at: string;
  is_active: boolean;
  // Address information
  address?: string;
  city?: string;
  postal_code?: string;
  id_number?: string;
  work_phone?: string;
  // Emergency contacts
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  secondary_emergency_contact_name?: string;
  secondary_emergency_contact_phone?: string;
  secondary_emergency_contact_relationship?: string;
}

export interface Staff {
  staff_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'teacher' | 'assistant' | 'coordinator' | 'other';
  specialization?: string;
  qualifications?: string;
  hire_date?: string;
  is_active: boolean;
  created_at: string;
}

export interface Child {
  child_id: string;
  first_name: string;
  last_name: string;
  dob: string;
  gender?: 'male' | 'female' | 'other';
  allergies?: string;
  medical_info?: string;
  parent_id: string;
  assigned_teacher_id?: string;
  created_at: string;
  // Medical information
  blood_type?: string;
  doctor_name?: string;
  doctor_phone?: string;
  medical_aid_name?: string;
  medical_aid_number?: string;
  chronic_conditions?: string;
  medications?: string;
  // Emergency contact
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  // Special needs
  special_needs?: string;
  dietary_restrictions?: string;
}

export interface Attendance {
  attendance_id: string;
  child_id: string;
  date: string;
  is_present: boolean;
  marked_by: string;
  created_at: string;
}

export interface Event {
  event_id: string;
  title: string;
  description: string;
  event_datetime: string;
  created_by_id: string;
  created_at: string;
}

export interface EventNotification {
  notification_id: string;
  event_id: string;
  parent_id: string;
  sent_at: string;
  is_read: boolean;
}

export interface Payment {
  payment_id: string;
  parent_id: string;
  amount: number;
  payment_type: string;
  status: 'pending' | 'paid' | 'overdue';
  payment_date: string;
  due_date?: string;
  description?: string;
  receipt_url?: string;
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  stripe_customer_id?: string;
  receipt_number?: string;
  created_at: string;
}

export interface StripeReceipt {
  receipt_url: string;
  receipt_number: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  description: string;
  payment_method_details: any;
}

export interface StripePaymentHistory {
  payment_intent_id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  description: string;
  receipt_url: string | null;
  receipt_number: string | null;
  payment_method: string;
  charge_id: string | null;
}

export interface Announcement {
  announcement_id: string;
  title: string;
  message: string;
  created_by_id: string;
  created_at: string;
}

export interface Media {
  media_id: string;
  child_id: string;
  uploaded_by: string;
  media_kind: 'photo' | 'video';
  media_url: string;
  consent_granted: boolean;
  uploaded_at: string;
  caption?: string;
}

export interface AbsenceNotification {
  notification_id: string;
  child_id: string;
  parent_id: string;
  date: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface AnnouncementNotification {
  notification_id: string;
  announcement_id: string;
  parent_id: string;
  is_read: boolean;
  created_at: string;
}

export type ConsentType = 'photos' | 'videos' | 'both' | 'none';
export type UsagePermission = 'internal' | 'website' | 'social_media' | 'promotional';

export interface MediaConsent {
  consent_id: string;
  child_id: string;
  parent_id: string;
  consent_granted: boolean;
  consent_date?: string;
  consent_type: ConsentType;
  usage_permissions?: UsagePermission[];
  special_conditions?: string;
  signature_data?: string;
  created_at: string;
  updated_at: string;
}
=======

export type UserRole = 'admin' | 'parent';

export interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: UserRole;
  created_at: string;
  is_active: boolean;
}

export interface Child {
  child_id: string;
  first_name: string;
  last_name: string;
  dob: string;
  allergies?: string;
  medical_info?: string;
  parent_id: string;
  created_at: string;
}

export interface Attendance {
  attendance_id: string;
  child_id: string;
  date: string;
  is_present: boolean;
  marked_by: string;
  created_at: string;
  notes?: string;
}

export interface Event {
  event_id: string;
  title: string;
  description: string;
  event_datetime: string;
  created_by_id: string;
  created_at: string;
}

export interface EventNotification {
  notification_id: string;
  event_id: string;
  parent_id: string;
  sent_at: string;
  is_read: boolean;
}

export interface Payment {
  payment_id: string;
  parent_id: string;
  amount: number;
  payment_type: string;
  status: 'pending' | 'paid' | 'overdue';
  payment_date: string;
  receipt_url?: string;
  created_at: string;
}

export interface Announcement {
  announcement_id: string;
  title: string;
  message: string;
  created_by_id: string;
  created_at: string;
}

export interface Media {
  media_id: string;
  child_id: string;
  uploaded_by: string;
  media_kind: 'photo' | 'video';
  media_url: string;
  consent_granted: boolean;
  uploaded_at: string;
  caption?: string;
}
>>>>>>> 4ee07c23b8b30b33b6521095f629acf8b8660df1
