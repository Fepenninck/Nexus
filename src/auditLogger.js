import { supabase } from './supabaseClient'

/**
 * Função que registra qualquer evento de segurança no banco de dados.
 * Esta é a engrenagem que garante o princípio de Auditoria e Irretratabilidade do projeto.
 */
export async function logEvent(userId, eventType, success, details = {}) {
  const { error } = await supabase.from('audit_logs').insert({
    user_id: userId,
    event_type: eventType,
    success: success,
    details: details
  })

  if (error) {
    // Registra o erro no console para não travar a aplicação caso o banco falhe
    console.warn('Falha ao gravar log de auditoria:', error.message)
  }
}