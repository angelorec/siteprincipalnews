import { createClient } from './lib/supabase/client'

async function testSupabase() {
    console.log('Testing Supabase connection...')
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

    const supabase = createClient()

    try {
        const { data, error } = await supabase.from('plans').select('*').limit(1)
        if (error) {
            console.error('Supabase connection error:', error.message)
            return
        }
        console.log('Supabase connection successful! Data:', data)
    } catch (err) {
        console.error('Unexpected error:', err)
    }
}

testSupabase()
