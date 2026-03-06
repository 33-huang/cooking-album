import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mhwlhwjgfsyxddknncdi.supabase.co'
const supabaseKey = 'sb_publishable_pQXVzxW9zmNjkChcLKMiog_05p8sIID'

export const supabase = createClient(supabaseUrl, supabaseKey)
