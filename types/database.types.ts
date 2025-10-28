
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
