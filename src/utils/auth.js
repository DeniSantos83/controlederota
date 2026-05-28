export function getUsuarioLogado() {
  const data = localStorage.getItem('rota_usuario')

  if (!data) return null

  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

export function sairDoSistema() {
  localStorage.removeItem('rota_usuario')
  window.location.href = '/'
}