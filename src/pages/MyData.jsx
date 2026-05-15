import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function MyData() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [deleted, setDeleted] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Tem certeza? Essa ação é irreversível.')) return
    setLoading(true)
    await supabase.auth.signOut()
    setLoading(false)
    setDeleted(true)
    setTimeout(() => navigate('/login'), 2000)
  }

  if (deleted) return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h2>Dados removidos.</h2>
      <p>Redirecionando...</p>
    </div>
  )

  return (
    <div style={{ maxWidth: 500, margin: '80px auto', padding: '0 16px' }}>
      <h2>Meus Dados (LGPD)</h2>
      <p style={{ color: '#8892b0', marginBottom: 24 }}>
        Em conformidade com a Lei 13.709/2018, você tem direito de acessar,
        corrigir ou solicitar a exclusão dos seus dados pessoais.
      </p>
      <div style={{ marginBottom: 24 }}>
        <h3>Dados coletados</h3>
        <ul style={{ color: '#8892b0', marginTop: 8, lineHeight: 2 }}>
          <li>E-mail (autenticação)</li>
          <li>Nome completo</li>
          <li>Data de cadastro</li>
          <li>Preferências de segurança (2FA)</li>
        </ul>
      </div>
      <button
        onClick={handleDelete}
        disabled={loading}
        style={{
          background: '#ef4444',
          color: '#fff',
          border: 'none',
          padding: '10px 20px',
          borderRadius: 8,
          cursor: 'pointer'
        }}
      >
        {loading ? 'Removendo...' : 'Solicitar exclusão dos meus dados'}
      </button>
    </div>
  )
}


const { data: { user } } = await supabase.auth.getUser() 

await supabase.from('profiles').upsert({ 
  id: user.id, 
  full_name: name,
  consent_given: true, 
  consent_date: new Date().toISOString() 
})