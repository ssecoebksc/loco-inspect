
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * FIND YOUR CREDENTIALS HERE:
 * 1. Open your Supabase Dashboard.
 * 2. Select your project.
 * 3. Go to Project Settings (Gear Icon) -> API.
 * 4. Look for "Project URL" (Copy this into SUPABASE_URL).
 * 5. Look for "Project API keys" -> 'anon' 'public' key (Copy this into SUPABASE_ANON_KEY).
 */

const SUPABASE_URL = 'https://fvliubkpbhvkjtcakupu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bGl1YmtwYmh2a2p0Y2FrdXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMDE4OTIsImV4cCI6MjA4NTU3Nzg5Mn0._wklBZi2-sNLLjZqKhaozaOqqrhkJ4xynBZHxriF9Io';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
