
export type UserRole = 'admin' | 'parent' | 'teacher';

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

export interface Parent {
  parent_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  created_at: string;
  updated_at: string;
}

export interface Staff {
  staff_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'teacher' | 'assistant' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChildStaffAssignment {
  assignment_id: string;
  child_id: string;
  staff_id: string;
  assigned_at: string;
}

export interface Child {
  child_id: string;
  first_name: string;
  last_name: string;
  dob: string;
  allergies?: string;
  medical_info?: string;
  parent_id: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
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

export interface Notification {
  notification_id: string;
  parent_id: string;
  notification_type: 'absence' | 'event' | 'announcement' | 'payment' | 'general';
  title: string;
  message: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface Payment {
  payment_id: string;
  parent_id: string;
  amount: number;
  payment_type: string;
  status: 'pending' | 'paid' | 'overdue';
  payment_date: string;
  due_date?: string;
  reminder_sent?: boolean;
  stripe_payment_url?: string;
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

export interface MediaConsent {
  consent_id: string;
  parent_id: string;
  child_id: string;
  consent_granted: boolean;
  consent_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
