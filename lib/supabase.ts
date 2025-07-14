import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://dymnrqqubwfgxwuysllk.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5bW5ycXF1YndmZ3h3dXlzbGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MTAzNjYsImV4cCI6MjA2Nzk4NjM2Nn0.wnT_ZCFdKMIUxl8gpEh6c9Rw_ambLByVfdJvx_B0VY0"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface User {
  id: string
  email: string
  name: string
  role: string
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  name: string
  phone?: string
  email?: string
  city?: string
  lead_status: "New" | "In Follow-up" | "Quoted" | "Closed" | "Not Interested"
  assigned_to?: string
  created_at: string
  updated_at: string
}

export interface Vehicle {
  id: string
  make: string
  model: string
  year?: number
  price?: number
  status: string
  created_at: string
}

export interface CustomerVehicleInterest {
  id: string
  customer_id: string
  vehicle_id: string
  interest_level: string
  created_at: string
  vehicle?: Vehicle
}

export interface FollowUp {
  id: string
  customer_id: string
  user_id?: string
  type: "call" | "email" | "meeting" | "note"
  notes?: string
  next_action?: string
  scheduled_date?: string
  completed_date?: string
  status: "pending" | "done" | "overdue"
  created_at: string
  user?: User
}
