import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://yuohzuyzuoiwynxcwxgs.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1b2h6dXl6dW9pd3lueGN3eGdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNjkyMjMsImV4cCI6MjA2NTc0NTIyM30.zENY8JrJnush3VdN9wbKaxY11CRcSpTu0QqSf7K4OkA"

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Expense = {
  id: string
  date: string
  description: string
  amount: number
  category: string
  created_at: string
}

export type Income = {
  id: number
  date: string
  description: string
  amount: number
  category: string
  created_at: string
}
