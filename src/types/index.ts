// ============================================================
// PLATFORM TYPE DEFINITIONS
// ============================================================

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'student' | 'admin' | 'instructor'
  avatar_url?: string
  created_at: string
}

export interface Course {
  id: string
  title: string
  slug: string
  description: string
  price_kes: number
  thumbnail?: string
  is_active: boolean
  created_at: string
}

export interface Module {
  id: string
  course_id: string
  title: string
  description: string
  order_index: number
  is_active: boolean
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  module_id: string
  title: string
  content?: string
  video_url?: string
  duration_min: number
  order_index: number
  lesson_type: 'video' | 'text' | 'quiz' | 'assignment'
  is_preview: boolean
  is_active: boolean
  completed?: boolean
}

export interface Assignment {
  id: string
  module_id: string
  lesson_id?: string
  title: string
  description: string
  instructions?: string
  rubric?: Record<string, unknown>
  due_days: number
  is_required: boolean
}

export interface Submission {
  id: string
  assignment_id: string
  user_id: string
  content?: string
  file_url?: string
  status: 'draft' | 'submitted' | 'reviewed' | 'approved'
  feedback?: string
  score?: number
  submitted_at: string
}

export interface Payment {
  id: string
  user_id?: string
  course_id?: string
  amount: number
  currency: string
  phone: string
  checkout_request_id?: string
  merchant_request_id?: string
  transaction_id?: string
  mpesa_receipt?: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  failure_reason?: string
  created_at: string
  updated_at: string
}

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  payment_id?: string
  payment_status: 'pending' | 'completed' | 'failed'
  course_access: boolean
  enrolled_at?: string
  expires_at?: string
  completed_at?: string
  certificate_url?: string
  created_at: string
}

export interface Progress {
  id: string
  user_id: string
  lesson_id: string
  completed: boolean
  watch_time: number
  completed_at?: string
}

export interface CapstoneProject {
  id: string
  user_id: string
  course_id: string
  portfolio_url?: string
  freelance_service?: string
  business_idea?: string
  content_samples?: string
  automation_flow?: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  feedback?: string
  certificate_issued: boolean
}

export interface Review {
  id: string
  name: string
  role?: string | null
  rating: number
  comment: string
  avatar_initials: string
  status: 'published' | 'pending' | 'hidden'
  created_at: string
}

// M-Pesa types
export interface MpesaSTKPushRequest {
  phone: string
  amount: number
  accountRef: string
  description: string
}

export interface MpesaSTKPushResponse {
  MerchantRequestID: string
  CheckoutRequestID: string
  ResponseCode: string
  ResponseDescription: string
  CustomerMessage: string
}

export interface MpesaCallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string
      CheckoutRequestID: string
      ResultCode: number
      ResultDesc: string
      CallbackMetadata?: {
        Item: Array<{ Name: string; Value: string | number }>
      }
    }
  }
}

// Enrollment form
export interface EnrollmentFormData {
  name: string
  email: string
  phone: string
}

// Admin types
export interface AdminStats {
  totalUsers: number
  totalEnrollments: number
  totalRevenue: number
  completionRate: number
  recentPayments: Payment[]
  revenueByDay: Array<{ date: string; amount: number }>
}
