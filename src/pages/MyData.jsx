import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function MyData() {
  const [profile, setProfile] = useState(null)
  const [user, setUser] = useState(null)
  const [msg, setMsg] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUser(user)

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(data)
    }

    load()
  }, [])

  function exportData() {
    const exportObj = { user, profile }
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'meus-dados.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function deleteAccount() {
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir sua conta? Esta ação é irreversível.'
    )

    if (!confirmed) return

    // Remove dados do perfil
    await supabase.from('profiles').delete().eq('id', user.id)

    // Faz logout (exclusão do auth requer service_role no backend)
    await supabase.auth.signOut()

    navigate('/login')
  }

  return (
    <>
      <Navbar />

      <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
        <h2>Meus Dados (LGPD)</h2>

        {profile && (
          <div>
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>Nome:</strong> {profile.full_name || 'Não informado'}
            </p>
            <p>
              <strong>2FA ativado:</strong>{' '}
              {profile.totp_enabled ? 'Sim' : 'Não'}
            </p>
            <p>
              <strong>Conta criada em:</strong>{' '}
              {new Date(user?.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
        )}

        <br />

        <button onClick={exportData}>
          Exportar dados (JSON)
        </button>

        <br />
        <br />

        <button onClick={deleteAccount} style={{ color: 'red' }}>
          Excluir minha conta
        </button>

        <p>{msg}</p>
      </div>
    </>
  )
}
