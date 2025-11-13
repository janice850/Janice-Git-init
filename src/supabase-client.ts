import { createClient } from '@supabase/supabase-js'


const supabaseUrl = 'https://fuypjyeihifyjqfmnqeu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1eXBqeWVpaGlmeWpxZm1ucWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NzAxNjUsImV4cCI6MjA3NTU0NjE2NX0.cMVE7hDrRbr7LTU-9-wuqcwf63Y5N4cXvAD8AqHTcNY'


export const supabase = createClient(supabaseUrl, supabaseKey)


