import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bihqharjyezzxhsghell.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpaHFoYXJqeWV6enhoc2doZWxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU5NzM0MjMsImV4cCI6MjA0MTU0OTQyM30.7W7Vpd7fol3UWLUFLqUiHty2hdTrD-H3-4LT78wveFk';

export const supabase = createClient(supabaseUrl, supabaseKey);
