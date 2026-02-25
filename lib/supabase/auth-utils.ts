import { createClient } from './server'

/**
 * Moves a user's credentials from pending_credentials to approved_users.
 * This should only be called once payment is confirmed.
 */
export async function moveUserToApproved(email: string) {
    if (!email) return { success: false, error: 'Email is required' }

    try {
        const supabase = await createClient()

        // 1. Get pending credentials
        const { data: pending, error: fetchError } = await supabase
            .from('pending_credentials')
            .select('email, password')
            .eq('email', email)
            .single()

        if (fetchError || !pending) {
            // Might already be moved or doesn't exist
            console.log(`[Auth Utils] No pending credentials found for ${email} (already moved or never existed)`)
            return { success: true, message: 'No pending credentials to move' }
        }

        console.log(`[Auth Utils] Moving credentials for ${email} to approved_users`)

        // 2. Insert into approved_users
        const { error: insertError } = await supabase.from('approved_users').insert({
            email: pending.email,
            password: pending.password
        })

        if (insertError) {
            // Check if it's a conflict (already exists in approved_users)
            if (insertError.code === '23505') {
                await supabase.from('pending_credentials').delete().eq('email', email)
                return { success: true, message: 'User already in approved_users, cleaned up pending.' }
            }
            throw insertError
        }

        // 3. Cleanup pending
        await supabase.from('pending_credentials').delete().eq('email', email)

        console.log(`[Auth Utils] User ${email} successfully moved to approved_users`)
        return { success: true }
    } catch (error) {
        console.error(`[Auth Utils] Error moving credentials for ${email}:`, error)
        return { success: false, error }
    }
}
