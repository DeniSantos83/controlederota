import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://arnkkoxjeglyatsrlvap.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybmtrb3hqZWdseWF0c3JsdmFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3ODAyNzMsImV4cCI6MjA5NTM1NjI3M30.27fJG7mcy4hsK4Z7L9j7JmHBd-dbQVZNc6qItXAd24w'

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)