import { useEffect, useState } from 'react'
import AppLayout from '../layouts/AppLayout'
import { supabase } from '../services/supabase'
import {
  Plus,
  Search,
  ClipboardList,
  X,
  Save,
} from 'lucide-react'
import { getUsuarioLogado } from '../utils/auth'

const hoje = () => new Date().toISOString().slice(0, 10)

const initialForm = {
  glpi: '',
  data_coleta: hoje(),
  origem: '',
  tecnico_atendimento: '',
  solicitante: '',
  quantidade: 1,
  equipamento: '',
  patrimonio: '',
  fonte: false,
  grp: '',
  status: 'Aguardando coleta',
  rota_apenas: '',
}

const statusOptions = [
  'Todos',
  'Aguardando rota',
  'Aguardando coleta',
  'Coletado',
  'Pendente',
  'Cancelado',
]

const tipoRotaOptions = [
  'Rota Capital',
  'Rota Interior',
]

const rotaApenasOptions = [
  'Rota Capital',
  'Rota Interior',
  'Aguardando rota',
  'Coletado',
  'Finalizado - manutenção',
  'Finalizado - VEC',
  'Finalizado - depósito',
  'Finalizado - bessa',
  'Finalizado - redes',
  'Finalizado - F.integrados II',
  'Finalizado - F.integrados III',
  'Finalizado - F.integrados IV',
  'Audiência e Sessões',
]

export default function ColetasPage() {
  const usuario = getUsuarioLogado()
  const perfil = usuario?.perfil || 'tecnico'

  const podeCadastrar = perfil === 'tecnico' || perfil === 'admin'

  const podeAtualizarRota =
    perfil === 'rota_capital' ||
    perfil === 'rota_interior' ||
    perfil === 'admin'

  const somenteManutencao = perfil === 'manutencao'

  const [coletas, setColetas] = useState([])
  const [locais, setLocais] = useState([])
  const [equipamentos, setEquipamentos] = useState([])
  const [usuarios, setUsuarios] = useState([])

  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('Todos')
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [salvando, setSalvando] = useState(false)
  const [carregando, setCarregando] = useState(true)

  async function carregarColetas() {
    setCarregando(true)

    let query = supabase
      .from('coletas')
      .select('*')
      .order('created_at', { ascending: false })

    if (somenteManutencao) {
      query = query.in('rota_apenas', [
        'Finalizado - manutenção',
        'Finalizado manutenção',
      ])
    }

    const [
      coletasRes,
      locaisRes,
      equipamentosRes,
      usuariosRes,
    ] = await Promise.all([
      query,

      supabase
        .from('locais')
        .select('*')
        .order('nome', { ascending: true }),

      supabase
        .from('equipamentos')
        .select('*')
        .order('nome', { ascending: true }),

      supabase
        .from('usuarios_rotas')
        .select('*')
        .eq('ativo', true)
        .order('nome', { ascending: true }),
    ])

    if (coletasRes.error) {
      console.error('Erro Supabase:', coletasRes.error)
      alert(coletasRes.error.message)
    } else {
      setColetas(coletasRes.data || [])
    }

    if (!locaisRes.error) setLocais(locaisRes.data || [])
    else console.error('Erro ao carregar locais:', locaisRes.error)

    if (!equipamentosRes.error) setEquipamentos(equipamentosRes.data || [])
    else console.error('Erro ao carregar equipamentos:', equipamentosRes.error)

    if (!usuariosRes.error) setUsuarios(usuariosRes.data || [])
    else console.error('Erro ao carregar usuários:', usuariosRes.error)

    setCarregando(false)
  }

  useEffect(() => {
    carregarColetas()
  }, [])

  function handleChange(e) {
    const { name, value, type, checked } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function abrirNovaColeta() {
    setForm({
      ...initialForm,
      data_coleta: hoje(),
      tecnico_atendimento: usuario?.nome || '',
    })

    setModalAberto(true)
  }

  async function salvarColeta(e) {
    e.preventDefault()

    if (!form.rota_apenas) {
      alert('Selecione se a coleta é da Rota Capital ou Rota Interior.')
      return
    }

    setSalvando(true)

    const payload = {
      ...form,
      quantidade: Number(form.quantidade || 1),
      entregue_por: '',
      recebimento: '',
    }

    const { error } = await supabase
      .from('coletas')
      .insert([payload])

    if (error) {
      console.error(error)
      alert('Erro ao salvar coleta.')
    } else {
      setModalAberto(false)

      setForm({
        ...initialForm,
        data_coleta: hoje(),
      })

      await carregarColetas()
    }

    setSalvando(false)
  }

  async function atualizarCampoRota(id, campo, valor) {
    const { error } = await supabase
      .from('coletas')
      .update({ [campo]: valor })
      .eq('id', id)

    if (error) {
      console.error(error)
      alert('Erro ao atualizar informação da rota.')
    } else {
      await carregarColetas()
    }
  }

  const totalColetas = coletas.length
  const totalAguardando = coletas.filter((i) => i.status === 'Aguardando rota').length
  const totalAguardandoColeta = coletas.filter((i) => i.status === 'Aguardando coleta').length
  const totalColetado = coletas.filter((i) => i.status === 'Coletado').length
  const totalPendentes = coletas.filter((i) => i.status === 'Pendente').length

  const coletasFiltradas = coletas.filter((item) => {
    const termo = busca.toLowerCase()

    const bateBusca =
      item.glpi?.toLowerCase().includes(termo) ||
      item.data_coleta?.toLowerCase().includes(termo) ||
      item.origem?.toLowerCase().includes(termo) ||
      item.tecnico_atendimento?.toLowerCase().includes(termo) ||
      item.solicitante?.toLowerCase().includes(termo) ||
      item.equipamento?.toLowerCase().includes(termo) ||
      item.patrimonio?.toLowerCase().includes(termo) ||
      item.grp?.toLowerCase().includes(termo) ||
      item.entregue_por?.toLowerCase().includes(termo) ||
      item.recebimento?.toLowerCase().includes(termo) ||
      item.status?.toLowerCase().includes(termo) ||
      item.rota_apenas?.toLowerCase().includes(termo)

    const bateStatus =
      filtroStatus === 'Todos' ||
      item.status === filtroStatus ||
      item.rota_apenas === filtroStatus

    return bateBusca && bateStatus
  })

  const locaisOptions = locais
    .map((local) => local.nome || local.name)
    .filter(Boolean)

  const equipamentosOptions = equipamentos
    .map((item) => item.nome || item.name)
    .filter(Boolean)

  const usuariosOptions = usuarios
    .map((user) => user.nome || user.name)
    .filter(Boolean)

  return (
    <AppLayout>
      <div className="space-y-6">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Coletas / Rotas
            </h1>

            <p className="text-slate-500 mt-1">
              Perfil atual:{' '}
              <span className="text-[#2563EB] font-semibold">
                {perfil}
              </span>
              {usuario?.nome ? ` • ${usuario.nome}` : ''}
            </p>
          </div>

          {podeCadastrar && (
            <button
              onClick={abrirNovaColeta}
              className="bg-[#2563EB] text-white px-5 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:bg-blue-700 transition shadow-sm"
            >
              <Plus size={20} />
              Nova coleta
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          <ResumoCard titulo="Total" valor={totalColetas} />
          <ResumoCard titulo="Aguard. rota" valor={totalAguardando} />
          <ResumoCard titulo="Aguard. coleta" valor={totalAguardandoColeta} />
          <ResumoCard titulo="Coletado" valor={totalColetado} />
          <ResumoCard titulo="Pendentes" valor={totalPendentes} />
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-[#2563EB] focus-within:bg-white transition">
            <Search size={20} className="text-slate-400" />

            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar por GLPI, patrimônio, origem, equipamento, GRP, técnico, recebimento ou rota..."
              className="bg-transparent outline-none w-full text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setFiltroStatus(status)}
                className={`
                  px-4 py-2 rounded-xl text-sm transition
                  ${
                    filtroStatus === status
                      ? 'bg-[#2563EB] text-white font-semibold shadow-sm'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }
                `}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClipboardList className="text-[#2563EB]" />

              <h2 className="font-semibold text-slate-900">
                {somenteManutencao
                  ? 'Equipamentos enviados para manutenção'
                  : 'Registros da rota'}
              </h2>
            </div>

            <span className="text-sm text-slate-500">
              {coletasFiltradas.length} registro(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1650px]">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left p-4">GLPI</th>
                  <th className="text-left p-4">Data Coleta</th>
                  <th className="text-left p-4">Origem</th>
                  <th className="text-left p-4">Técnico</th>
                  <th className="text-left p-4">Solicitante</th>
                  <th className="text-left p-4">Quant.</th>
                  <th className="text-left p-4">Equipamento</th>
                  <th className="text-left p-4">Patrimônio</th>
                  <th className="text-left p-4">Fonte</th>
                  <th className="text-left p-4">GRP</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Entregue por</th>
                  <th className="text-left p-4">Recebimento</th>
                  <th className="text-left p-4">ROTA APENAS</th>
                </tr>
              </thead>

              <tbody>
                {carregando ? (
                  <tr>
                    <td className="p-4 text-slate-500" colSpan="14">
                      Carregando coletas...
                    </td>
                  </tr>
                ) : coletasFiltradas.length === 0 ? (
                  <tr>
                    <td className="p-4 text-slate-500" colSpan="14">
                      Nenhuma coleta encontrada.
                    </td>
                  </tr>
                ) : (
                  coletasFiltradas.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-slate-200 hover:bg-slate-50 transition"
                    >
                      <td className="p-4 font-semibold text-[#2563EB]">
                        {item.glpi || '-'}
                      </td>

                      <td className="p-4 text-slate-700">
                        {item.data_coleta || '-'}
                      </td>

                      <td className="p-4 text-slate-700">
                        {item.origem || '-'}
                      </td>

                      <td className="p-4 text-slate-700">
                        {item.tecnico_atendimento || '-'}
                      </td>

                      <td className="p-4 text-slate-700">
                        {item.solicitante || '-'}
                      </td>

                      <td className="p-4 text-slate-700">
                        {item.quantidade || '-'}
                      </td>

                      <td className="p-4 font-medium text-slate-800">
                        {item.equipamento || '-'}
                      </td>

                      <td className="p-4 text-slate-700">
                        {item.patrimonio || '-'}
                      </td>

                      <td className="p-4 text-slate-700">
                        {item.fonte ? 'Sim' : 'Não'}
                      </td>

                      <td className="p-4 text-slate-700">
                        {item.grp || '-'}
                      </td>

                      <td className="p-4">
                        {podeAtualizarRota ? (
                          <SelectTabela
                            value={item.status || 'Aguardando rota'}
                            onChange={(e) =>
                              atualizarCampoRota(item.id, 'status', e.target.value)
                            }
                            options={statusOptions.filter((status) => status !== 'Todos')}
                          />
                        ) : (
                          <StatusBadge status={item.status} />
                        )}
                      </td>

                      <td className="p-4">
                        {podeAtualizarRota ? (
                          <SelectTabela
                            value={item.entregue_por || ''}
                            onChange={(e) =>
                              atualizarCampoRota(item.id, 'entregue_por', e.target.value)
                            }
                            options={usuariosOptions}
                            placeholder="Selecionar"
                            minWidth="min-w-[190px]"
                          />
                        ) : (
                          <span className="text-slate-700">
                            {item.entregue_por || '-'}
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        {podeAtualizarRota ? (
                          <SelectTabela
                            value={item.recebimento || ''}
                            onChange={(e) =>
                              atualizarCampoRota(item.id, 'recebimento', e.target.value)
                            }
                            options={usuariosOptions}
                            placeholder="Selecionar"
                            minWidth="min-w-[190px]"
                          />
                        ) : (
                          <span className="text-slate-700">
                            {item.recebimento || '-'}
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        {podeAtualizarRota ? (
                          <SelectTabela
                            value={item.rota_apenas || ''}
                            onChange={(e) =>
                              atualizarCampoRota(item.id, 'rota_apenas', e.target.value)
                            }
                            options={rotaApenasOptions}
                            placeholder="Selecionar"
                            minWidth="min-w-[230px]"
                          />
                        ) : (
                          <span className="text-slate-700">
                            {item.rota_apenas || '-'}
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

        {modalAberto && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">

              <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Nova coleta
                  </h2>

                  <p className="text-slate-500 text-sm">
                    Preencha os dados iniciais da coleta.
                  </p>
                </div>

                <button
                  onClick={() => setModalAberto(false)}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={salvarColeta} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label="GLPI" name="glpi" value={form.glpi} onChange={handleChange} />

                  <Input
                    label="Data Coleta"
                    name="data_coleta"
                    type="date"
                    value={form.data_coleta}
                    onChange={handleChange}
                  />

                  <Select
                    label="Origem"
                    name="origem"
                    value={form.origem}
                    onChange={handleChange}
                    options={locaisOptions}
                  />

                  <Select
                    label="Técnico do Atendimento"
                    name="tecnico_atendimento"
                    value={form.tecnico_atendimento}
                    onChange={handleChange}
                    options={usuariosOptions}
                  />

                  <Select
                    label="Solicitante"
                    name="solicitante"
                    value={form.solicitante}
                    onChange={handleChange}
                    options={usuariosOptions}
                  />

                  <Input
                    label="Quantidade"
                    name="quantidade"
                    type="number"
                    value={form.quantidade}
                    onChange={handleChange}
                  />

                  <Select
                    label="Equipamento"
                    name="equipamento"
                    value={form.equipamento}
                    onChange={handleChange}
                    options={equipamentosOptions}
                  />

                  <Input
                    label="Patrimônio"
                    name="patrimonio"
                    value={form.patrimonio}
                    onChange={handleChange}
                  />

                  <Input
                    label="GRP"
                    name="grp"
                    value={form.grp}
                    onChange={handleChange}
                  />

                  <Select
                    label="Status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    options={statusOptions.filter((status) => status !== 'Todos')}
                  />

                  <Select
                    label="Tipo da rota"
                    name="rota_apenas"
                    value={form.rota_apenas}
                    onChange={handleChange}
                    options={tipoRotaOptions}
                  />

                  <label className="flex items-center gap-3 mt-8 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700">
                    <input
                      type="checkbox"
                      name="fonte"
                      checked={form.fonte}
                      onChange={handleChange}
                    />

                    <span>Possui fonte?</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setModalAberto(false)}
                    className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={salvando}
                    className="px-5 py-3 rounded-2xl bg-[#2563EB] text-white font-semibold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-60 transition shadow-sm"
                  >
                    <Save size={18} />
                    {salvando ? 'Salvando...' : 'Salvar coleta'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </AppLayout>
  )
}

function ResumoCard({ titulo, valor }) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition">
      <p className="text-sm text-slate-500">{titulo}</p>
      <h3 className="text-3xl font-bold mt-2 text-slate-900">{valor}</h3>
    </div>
  )
}

function Input({ label, name, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="text-sm text-slate-600">{label}</label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="mt-2 w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white transition"
      />
    </div>
  )
}

function Select({ label, name, value, onChange, options = [] }) {
  return (
    <div>
      <label className="text-sm text-slate-600">{label}</label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="mt-2 w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white transition"
      >
        <option value="">Selecione...</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

function SelectTabela({
  value,
  onChange,
  options = [],
  placeholder = 'Selecionar',
  minWidth = 'min-w-[150px]',
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none ${minWidth} focus:border-[#2563EB] focus:bg-white transition`}
    >
      <option value="">{placeholder}</option>

      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

function StatusBadge({ status }) {
  const colors = {
    'Aguardando rota': 'bg-yellow-100 text-yellow-700',
    'Aguardando coleta': 'bg-amber-100 text-amber-700',
    Coletado: 'bg-cyan-100 text-cyan-700',
    Pendente: 'bg-orange-100 text-orange-700',
    Cancelado: 'bg-red-100 text-red-700',
  }

  return (
    <span
      className={`
        px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap
        ${colors[status] || 'bg-slate-100 text-slate-600'}
      `}
    >
      {status || 'Sem status'}
    </span>
  )
}