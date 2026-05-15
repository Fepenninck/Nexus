import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validação de igualdade e tamanho (mínimo 8 caracteres) 
    if (form.password !== form.confirm) { 
      setError('As senhas não coincidem!')
      return 
    }
    
    if (form.password.length < 8) { 
      setError('A senha deve ter pelo menos 8 caracteres.')
      return 
    }

    setError('')
    setLoading(true)

    // O Supabase atualiza a senha usando bcrypt + salt internamente 
    const { error: err } = await supabase.auth.updateUser({ 
      password: form.password 
    })

    setLoading(false)

    if (err) { 
      // Se o link de 15 min expirou, o sistema retorna erro [cite: 53, 58, 80]
      setError('Link expirado ou inválido. Solicite outro.')
      return 
    }

    setSuccess(true)
    // Redireciona após sucesso [cite: 54]
    setTimeout(() => navigate('/login'), 2000)
  }

  if (success) return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h2>Senha redefinida!</h2>
      <p>Redirecionando para o login...</p>
    </div>
  )

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '0 16px' }}>
      <h2>Nova Senha</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nova senha (mín. 8 caracteres)"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          required
          style={{ width: '100%', padding: 10, marginBottom: 12 }}
        />
        <input
          type="password"
          placeholder="Confirme a nova senha"
          value={form.confirm}
          onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
          required
          style={{ width: '100%', padding: 10, marginBottom: 12 }}
        />
        <button 
          type="submit" 
          disabled={loading} 
          style={{ width: '100%', padding: 10, cursor: 'pointer' }}
        >
          {loading ? 'Salvando...' : 'Alterar senha'}
        </button>
      </form>
    </div>
  )
}