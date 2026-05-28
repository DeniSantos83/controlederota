import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import {
  Shield,
  MapPinned,
  Map,
  UserRound,
  Wrench,
  X,
  ArrowRight,
} from 'lucide-react'

const perfis = [
  {
    titulo: 'ADMIN',
    perfil: 'admin',
    rota: '/admin',
    icon: Shield,
    descricao: 'Acesso total ao sistema',
  },
  {
    titulo: 'ROTA CAPITAL',
    perfil: 'rota_capital',
    rota: '/rota-capital',
    icon: MapPinned,
    descricao: 'Atualiza rotas da capital',
  },
  {
    titulo: 'ROTA INTERIOR',
    perfil: 'rota_interior',
    rota: '/rota-interior',
    icon: Map,
    descricao: 'Atualiza rotas do interior',
  },
  {
    titulo: 'TÉCNICO',
    perfil: 'tecnico',
    rota: '/tecnico',
    icon: UserRound,
    descricao: 'Registra as coletas',
  },
  {
    titulo: 'MANUTENÇÃO',
    perfil: 'manutencao',
    rota: '/admin/manutencao',
    icon: Wrench,
    descricao: 'Recebe equipamentos finalizados',
  },
]

export default function AccessPage() {
  const navigate = useNavigate()

  const [perfilSelecionado, setPerfilSelecionado] = useState(null)
  const [matricula, setMatricula] = useState('')
  const [carregando, setCarregando] = useState(false)

  function abrirModal(perfil) {
    setPerfilSelecionado(perfil)
    setMatricula('')
  }

  function fecharModal() {
    setPerfilSelecionado(null)
    setMatricula('')
  }

  async function entrar(e) {
    e.preventDefault()

    if (!matricula.trim()) {
      alert('Digite sua matrícula.')
      return
    }

    setCarregando(true)

    const matriculaDigitada = matricula.trim().toLowerCase()

    const { data, error } = await supabase
      .from('usuarios_rotas')
      .select('*')
      .or(
        `matricula.eq.${matriculaDigitada},registration.eq.${matriculaDigitada}`
      )
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error(error)
      alert('Erro ao validar matrícula.')
      setCarregando(false)
      return
    }

    if (!data) {
      alert('Matrícula não encontrada.')
      setCarregando(false)
      return
    }

    const perfilUsuario =
      data.perfil || data.employee_type || 'tecnico'

    const perfilNormalizado = normalizarPerfil(perfilUsuario)

    if (
      perfilNormalizado !== perfilSelecionado.perfil &&
      perfilNormalizado !== 'admin'
    ) {
      alert('Sua matrícula não tem permissão para esta área.')
      setCarregando(false)
      return
    }

    localStorage.setItem(
  'rota_usuario',
  JSON.stringify({
    id: data.id,
    nome: data.nome || data.name,
    matricula: data.matricula || data.registration,
    perfil: perfilNormalizado,
  })
)

localStorage.setItem('perfil', perfilNormalizado)

navigate('/loading', {
  state: {
    rota: perfilSelecionado.rota,
    perfil: perfilNormalizado,
  },
})

}
  return (
    <div className="min-h-screen bg-[#F6F8FB] text-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-7xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#2563EB] text-white mb-5 shadow-sm">
            <MapPinned size={34} />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
            Controle de Rotas
          </h1>

          <p className="text-slate-500 mt-3 text-lg">
            Selecione sua área de acesso e informe sua matrícula.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
          {perfis.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.perfil}
                onClick={() => abrirModal(item)}
                className="
                  bg-white
                  border
                  border-slate-200
                  rounded-3xl
                  p-6
                  text-left
                  hover:border-[#2563EB]
                  hover:-translate-y-1
                  hover:shadow-md
                  transition
                  shadow-sm
                "
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5 text-[#2563EB]">
                  <Icon size={28} />
                </div>

                <h2 className="text-xl font-bold text-slate-900">
                  {item.titulo}
                </h2>

                <p className="text-slate-500 text-sm mt-2 min-h-[40px]">
                  {item.descricao}
                </p>

                <div className="mt-5 flex items-center gap-2 text-[#2563EB] text-sm font-semibold">
                  Acessar
                  <ArrowRight size={16} />
                </div>
              </button>
            )
          })}
        </div>

        <div className="text-center text-xs text-slate-400 mt-10">
          TJSE • Sistema interno de controle de coletas e rotas
        </div>
      </div>

      {perfilSelecionado && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {perfilSelecionado.titulo}
                </h2>

                <p className="text-sm text-slate-500">
                  Informe sua matrícula para continuar.
                </p>
              </div>

              <button
                onClick={fecharModal}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={entrar} className="p-6 space-y-5">
              <div>
                <label className="text-sm text-slate-600">
                  Matrícula
                </label>

                <input
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  placeholder="Ex: ll3868"
                  autoFocus
                  className="mt-2 w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none text-slate-900 placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white transition"
                />
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="
                  w-full
                  bg-[#2563EB]
                  text-white
                  px-5
                  py-3
                  rounded-2xl
                  font-semibold
                  flex
                  items-center
                  justify-center
                  gap-2
                  hover:bg-blue-700
                  disabled:opacity-60
                  transition
                  shadow-sm
                "
              >
                {carregando ? 'Validando...' : 'Entrar'}
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function normalizarPerfil(perfil) {
  if (!perfil) return 'tecnico'

  const valor = perfil.toLowerCase().trim()

  if (valor === 'admin') return 'admin'
  if (valor === 'manutencao') return 'manutencao'
  if (valor === 'manutenção') return 'manutencao'
  if (valor === 'rota_capital') return 'rota_capital'
  if (valor === 'rota_interior') return 'rota_interior'
  if (valor === 'rota') return 'rota_capital'
  if (valor === 'tecnico') return 'tecnico'
  if (valor === 'técnico') return 'tecnico'

  return 'tecnico'
}