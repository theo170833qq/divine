import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://glnzklcolxrbzmhgfcvd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbnprbGNvbHhyYnptaGdmY3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwODkwNzAsImV4cCI6MjA4NTY2NTA3MH0.d9Aq9SYB2o45HfoQs-xTlyZwY1dPogXcaMxWE4aqOsc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
