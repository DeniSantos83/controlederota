import { useEffect, useState } from 'react'
import AppLayout from '../layouts/AppLayout'
import { supabase } from '../services/supabase'
import {
  Users,
  MapPin,
  Monitor,
  RefreshCw,
  Save,
} from 'lucide-react'

const usuarioInicial = {
  nome: '',
  matricula: '',
  perfil: 'tecnico',
  ativo: true,
}

const localInicial = {
  nome: '',
}

const equipamentoInicial = {
  nome: '',
}

export default function AdminPage() {
  const [usuarios, setUsuarios] = useState([])
  const [locais, setLocais] = useState([])
  const [equipamentos, setEquipamentos] = useState([])

  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  const [novoUsuario, setNovoUsuario] = useState(usuarioInicial)
  const [novoLocal, setNovoLocal] = useState(localInicial)
  const [novoEquipamento, setNovoEquipamento] = useState(equipamentoInicial)

  async function carregarDados() {
    setCarregando(true)

    const [usuariosRes, locaisRes, equipamentosRes] = await Promise.all([
      supabase
        .from('usuarios_rotas')
        .select('*')
        .order('nome', { ascending: true }),

      supabase
        .from('locais')
        .select('*')
        .order('nome', { ascending: true }),

      supabase
        .from('equipamentos')
        .select('*')
        .order('nome', { ascending: true }),
    ])

    if (usuariosRes.error) console.error(usuariosRes.error)
    if (locaisRes.error) console.error(locaisRes.error)
    if (equipamentosRes.error) console.error(equipamentosRes.error)

    setUsuarios(usuariosRes.data || [])
    setLocais(locaisRes.data || [])
    setEquipamentos(equipamentosRes.data || [])

    setCarregando(false)
  }

  useEffect(() => {
    carregarDados()
  }, [])

  async function cadastrarUsuario(e) {
    e.preventDefault()

    if (!novoUsuario.nome.trim()) {
      alert('Informe o nome do usuário.')
      return
    }

    if (!novoUsuario.matricula.trim()) {
      alert('Informe a matrícula.')
      return
    }

    setSalvando(true)

    const { error } = await supabase
      .from('usuarios_rotas')
      .insert([
        {
          nome: novoUsuario.nome.trim(),
          matricula: novoUsuario.matricula.trim().toLowerCase(),
          perfil: novoUsuario.perfil,
          ativo: novoUsuario.ativo,
        },
      ])

    setSalvando(false)

    if (error) {
      console.error(error)
      alert('Erro ao cadastrar usuário.')
      return
    }

    setNovoUsuario(usuarioInicial)
    await carregarDados()
  }

  async function cadastrarLocal(e) {
    e.preventDefault()

    if (!novoLocal.nome.trim()) {
      alert('Informe o nome do local.')
      return
    }

    setSalvando(true)

    const { error } = await supabase
      .from('locais')
      .insert([
        {
          nome: novoLocal.nome.trim(),
        },
      ])

    setSalvando(false)

    if (error) {
      console.error(error)
      alert('Erro ao cadastrar local.')
      return
    }

    setNovoLocal(localInicial)
    await carregarDados()
  }

  async function cadastrarEquipamento(e) {
    e.preventDefault()

    if (!novoEquipamento.nome.trim()) {
      alert('Informe o nome do equipamento.')
      return
    }

    setSalvando(true)

    const { error } = await supabase
      .from('equipamentos')
      .insert([
        {
          nome: novoEquipamento.nome.trim(),
        },
      ])

    setSalvando(false)

    if (error) {
      console.error(error)
      alert('Erro ao cadastrar equipamento.')
      return
    }

    setNovoEquipamento(equipamentoInicial)
    await carregarDados()
  }

  return (
    <AppLayout>
      <div className="space-y-6">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Administração
            </h1>

            <p className="text-slate-500 mt-1">
              Cadastre usuários, locais e equipamentos do sistema.
            </p>
          </div>

          <button
            onClick={carregarDados}
            className="bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-2xl flex items-center gap-2 hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw size={18} />

            {carregando ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ResumoCard
            titulo="Usuários"
            valor={usuarios.length}
            icon={Users}
          />

          <ResumoCard
            titulo="Locais"
            valor={locais.length}
            icon={MapPin}
          />

          <ResumoCard
            titulo="Equipamentos"
            valor={equipamentos.length}
            icon={Monitor}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          <CadastroCard
            titulo="Cadastrar usuário"
            descricao="Adicione servidores e defina o perfil de acesso."
            icon={Users}
          >
            <form
              onSubmit={cadastrarUsuario}
              className="space-y-4"
            >
              <Campo
                label="Nome"
                value={novoUsuario.nome}
                onChange={(e) =>
                  setNovoUsuario((atual) => ({
                    ...atual,
                    nome: e.target.value,
                  }))
                }
                placeholder="Nome do usuário"
              />

              <Campo
                label="Matrícula"
                value={novoUsuario.matricula}
                onChange={(e) =>
                  setNovoUsuario((atual) => ({
                    ...atual,
                    matricula: e.target.value,
                  }))
                }
                placeholder="Ex: ll3868"
              />

              <div>
                <label className="text-sm text-slate-600">
                  Perfil
                </label>

                <select
                  value={novoUsuario.perfil}
                  onChange={(e) =>
                    setNovoUsuario((atual) => ({
                      ...atual,
                      perfil: e.target.value,
                    }))
                  }
                  className="mt-2 w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white transition"
                >
                  <option value="admin">Admin</option>
                  <option value="rota_capital">Rota Capital</option>
                  <option value="rota_interior">Rota Interior</option>
                  <option value="tecnico">Técnico</option>
                  <option value="manutencao">Manutenção</option>
                </select>
              </div>

              <label className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700">
                <input
                  type="checkbox"
                  checked={novoUsuario.ativo}
                  onChange={(e) =>
                    setNovoUsuario((atual) => ({
                      ...atual,
                      ativo: e.target.checked,
                    }))
                  }
                />

                Usuário ativo
              </label>

              <BotaoSalvar
                salvando={salvando}
                texto="Salvar usuário"
              />
            </form>
          </CadastroCard>

          <CadastroCard
            titulo="Cadastrar local"
            descricao="Cadastre setores, fóruns e unidades."
            icon={MapPin}
          >
            <form
              onSubmit={cadastrarLocal}
              className="space-y-4"
            >
              <Campo
                label="Nome do local"
                value={novoLocal.nome}
                onChange={(e) =>
                  setNovoLocal((atual) => ({
                    ...atual,
                    nome: e.target.value,
                  }))
                }
                placeholder="Ex: Fórum Integrado II"
              />

              <BotaoSalvar
                salvando={salvando}
                texto="Salvar local"
              />
            </form>
          </CadastroCard>

          <CadastroCard
            titulo="Cadastrar equipamento"
            descricao="Cadastre os tipos de equipamentos."
            icon={Monitor}
          >
            <form
              onSubmit={cadastrarEquipamento}
              className="space-y-4"
            >
              <Campo
                label="Nome do equipamento"
                value={novoEquipamento.nome}
                onChange={(e) =>
                  setNovoEquipamento((atual) => ({
                    ...atual,
                    nome: e.target.value,
                  }))
                }
                placeholder="Ex: CPU, Monitor..."
              />

              <BotaoSalvar
                salvando={salvando}
                texto="Salvar equipamento"
              />
            </form>
          </CadastroCard>

        </div>

        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200">
            <h2 className="font-semibold text-lg text-slate-900">
              Usuários e Perfis
            </h2>

            <p className="text-sm text-slate-500">
              Usuários cadastrados no sistema.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left p-4">Nome</th>
                  <th className="text-left p-4">Matrícula</th>
                  <th className="text-left p-4">Perfil</th>
                  <th className="text-left p-4">Ativo</th>
                </tr>
              </thead>

              <tbody>
                {carregando ? (
                  <tr>
                    <td
                      className="p-4 text-slate-500"
                      colSpan="4"
                    >
                      Carregando...
                    </td>
                  </tr>
                ) : usuarios.length === 0 ? (
                  <tr>
                    <td
                      className="p-4 text-slate-500"
                      colSpan="4"
                    >
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                ) : (
                  usuarios.map((user) => (
                    <tr
                      key={user.id}
                      className="border-t border-slate-200 hover:bg-slate-50 transition"
                    >
                      <td className="p-4 font-semibold text-slate-900">
                        {user.nome}
                      </td>

                      <td className="p-4 text-[#2563EB] font-medium">
                        {user.matricula}
                      </td>

                      <td className="p-4">
                        <PerfilSelect
                          user={user}
                          onAtualizar={carregarDados}
                        />
                      </td>

                      <td className="p-4">
                        {user.ativo ? (
                          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                            Ativo
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                            Inativo
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          <ListagemSimples
            titulo="Locais cadastrados"
            descricao="Setores e unidades disponíveis."
            dados={locais}
            carregando={carregando}
            campoPrincipal="nome"
            vazio="Nenhum local encontrado."
            icon={MapPin}
          />

          <ListagemSimples
            titulo="Equipamentos cadastrados"
            descricao="Equipamentos disponíveis no sistema."
            dados={equipamentos}
            carregando={carregando}
            campoPrincipal="nome"
            vazio="Nenhum equipamento encontrado."
            icon={Monitor}
          />

        </div>

      </div>
    </AppLayout>
  )
}

function ResumoCard({ titulo, valor, icon: Icon }) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition">
      <div>
        <p className="text-sm text-slate-500">
          {titulo}
        </p>

        <h3 className="text-3xl font-bold mt-2 text-slate-900">
          {valor}
        </h3>
      </div>

      <div className="w-12 h-12 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center">
        <Icon size={24} />
      </div>
    </div>
  )
}

function CadastroCard({
  titulo,
  descricao,
  icon: Icon,
  children,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
          <Icon size={22} />
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">
            {titulo}
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            {descricao}
          </p>
        </div>
      </div>

      {children}
    </div>
  )
}

function Campo({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label className="text-sm text-slate-600">
        {label}
      </label>

      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-2 w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white transition"
      />
    </div>
  )
}

function BotaoSalvar({ salvando, texto }) {
  return (
    <button
      type="submit"
      disabled={salvando}
      className="w-full bg-[#2563EB] text-white px-5 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-60 transition"
    >
      <Save size={18} />

      {salvando ? 'Salvando...' : texto}
    </button>
  )
}

function PerfilSelect({ user, onAtualizar }) {
  const [salvando, setSalvando] = useState(false)

  async function alterarPerfil(novoPerfil) {
    setSalvando(true)

    const { error } = await supabase
      .from('usuarios_rotas')
      .update({
        perfil: novoPerfil,
      })
      .eq('id', user.id)

    if (error) {
      console.error(error)
      alert('Erro ao atualizar perfil.')
    } else {
      await onAtualizar()
    }

    setSalvando(false)
  }

  return (
    <select
      disabled={salvando}
      value={user.perfil || 'tecnico'}
      onChange={(e) =>
        alterarPerfil(e.target.value)
      }
      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none min-w-[160px] focus:border-[#2563EB] focus:bg-white transition"
    >
      <option value="admin">Admin</option>
      <option value="rota_capital">Rota Capital</option>
      <option value="rota_interior">Rota Interior</option>
      <option value="tecnico">Técnico</option>
      <option value="manutencao">Manutenção</option>
    </select>
  )
}

function ListagemSimples({
  titulo,
  descricao,
  dados,
  carregando,
  campoPrincipal,
  vazio,
  icon: Icon,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-200 flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
          <Icon size={22} />
        </div>

        <div>
          <h2 className="font-semibold text-lg text-slate-900">
            {titulo}
          </h2>

          <p className="text-sm text-slate-500">
            {descricao}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left p-4">
                Nome
              </th>

              <th className="text-left p-4">
                ID
              </th>
            </tr>
          </thead>

          <tbody>
            {carregando ? (
              <tr>
                <td
                  className="p-4 text-slate-500"
                  colSpan="2"
                >
                  Carregando...
                </td>
              </tr>
            ) : dados.length === 0 ? (
              <tr>
                <td
                  className="p-4 text-slate-500"
                  colSpan="2"
                >
                  {vazio}
                </td>
              </tr>
            ) : (
              dados.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-slate-200 hover:bg-slate-50 transition"
                >
                  <td className="p-4 font-semibold text-slate-900">
                    {item[campoPrincipal]}
                  </td>

                  <td className="p-4 text-slate-500">
                    {item.id}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}