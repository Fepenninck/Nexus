import { supabase } from './supabaseClient'

export async function logEvent(userId, eventType, success, details = {}) {
  const { error } = await supabase.from('audit_logs').insert({
    user_id: userId,
    event_type: eventType,
    success: success,
    details: details,
  })

  if (error) {
    console.warn('Falha ao gravar log de auditoria:', error.message)
  }
}
