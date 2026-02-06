import { createClient } from '@supabase/supabase-js'

export async function handler() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL!
  const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!

  if (!supabaseUrl || !supabaseKey) {
    return {
      statusCode: 500,
      body: 'Supabase env missing'
    }
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // 🔹 Query super ringan (read-only)
  const { error } = await supabase
    .from('company')
    .select('id')
    .limit(1)

  if (error) {
    return {
      statusCode: 500,
      body: 'Ping failed'
    }
  }

  return {
    statusCode: 200,
    body: 'Supabase is alive'
  }
}
