import { useEffect, useState } from 'react'
import AppLayout from '../layouts/AppLayout'
import { supabase } from '../services/supabase'
import { getUsuarioLogado } from '../utils/auth'
import {
  ClipboardList,
  Save,
  RotateCcw,
  Package,
  MapPin,
  UserRound,
  Hash,
  FileText,
  Truck,
} from 'lucide-react'

const hoje = () => new Date().toISOString().slice(0, 10)

const formInicial = {
  glpi: '',
  data_coleta: hoje(),
  origem: '',
  tecnico_atendimento: '',
  quantidade: '1',
  equipamento: '',
  patrimonio: '',
  fonte: '',
  grp: '',
  entregue_por: '',
  tipo_rota: 'capital',
}

export default function TecnicoPage() {
  const usuario = getUsuarioLogado()

  const [form, setForm] = useState(formInicial)
  const [salvando, setSalvando] = useState(false)
  const [ultimos, setUltimos] = useState([])

  const [locais, setLocais] = useState([])
  const [equipamentos, setEquipamentos] = useState([])
  const [usuariosRota, setUsuariosRota] = useState([])

  useEffect(() => {
    setForm((atual) => ({
      ...atual,
      tecnico_atendimento: usuario?.nome || usuario?.email || '',
    }))

    carregarListas()
    carregarUltimos()
  }, [])

  async function carregarListas() {
    const [locaisRes, equipamentosRes, usuariosRes] = await Promise.all([
      supabase.from('locais').select('*').order('nome', { ascending: true }),
      supabase.from('equipamentos').select('*').order('nome', { ascending: true }),
      supabase.from('usuarios_rotas').select('*').order('nome', { ascending: true }),
    ])

    if (!locaisRes.error) setLocais(locaisRes.data || [])
    else console.error('Erro ao carregar locais:', locaisRes.error)

    if (!equipamentosRes.error) setEquipamentos(equipamentosRes.data || [])
    else console.error('Erro ao carregar equipamentos:', equipamentosRes.error)

    if (!usuariosRes.error) setUsuariosRota(usuariosRes.data || [])
    else console.error('Erro ao carregar usuários da rota:', usuariosRes.error)
  }

  async function carregarUltimos() {
    const { data, error } = await supabase
      .from('coletas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(8)

    if (!error) setUltimos(data || [])
  }

  function atualizarCampo(campo, valor) {
    setForm((atual) => ({
      ...atual,
      [campo]: valor,
    }))
  }

  function limparFormulario() {
    setForm({
      ...formInicial,
      tecnico_atendimento: usuario?.nome || usuario?.email || '',
    })
  }

  async function salvarColeta(e) {
    e.preventDefault()

    if (!form.glpi.trim()) {
      alert('Informe o número do GLPI.')
      return
    }

    if (!form.origem.trim()) {
      alert('Informe a origem.')
      return
    }

    if (!form.equipamento.trim()) {
      alert('Informe o equipamento.')
      return
    }

    if (!form.fonte) {
      alert('Informe se tem fonte.')
      return
    }

    if (!form.entregue_por.trim()) {
      alert('Informe quem entregou.')
      return
    }

    setSalvando(true)

    const destinoRota =
      form.tipo_rota === 'interior'
        ? 'Rota Interior'
        : 'Rota Capital'

    const { error } = await supabase
      .from('coletas')
      .insert([
        {
          glpi: form.glpi.trim(),
          data_coleta: form.data_coleta,
          origem: form.origem.trim(),
          tecnico_atendimento: form.tecnico_atendimento.trim(),
          quantidade: Number(form.quantidade || 1),
          equipamento: form.equipamento.trim(),
          patrimonio: form.patrimonio.trim(),
          fonte: form.fonte === 'sim',
          grp: form.grp.trim(),
          entregue_por: form.entregue_por.trim(),
          status: 'Aguardando rota',
          rota_apenas: destinoRota,
        },
      ])

    setSalvando(false)

    if (error) {
      console.error(error)
      alert(JSON.stringify(error))
      return
    }

    alert('Coleta cadastrada e enviada para a rota.')

    limparFormulario()
    await carregarUltimos()
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Atendimento Técnico
          </h1>

          <p className="text-slate-500 mt-1">
            Preenchimento inicial da coleta e direcionamento para Rota Capital ou Rota Interior.
          </p>
        </div>

        <form
          onSubmit={salvarColeta}
          className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm"
        >
          <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
            <div className="w-12 h-12 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shadow-sm">
              <ClipboardList size={24} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Nova coleta
              </h2>

              <p className="text-sm text-slate-500">
                Dados que alimentam a primeira parte da planilha.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Campo
              label="GLPI"
              icon={Hash}
              value={form.glpi}
              onChange={(e) => atualizarCampo('glpi', e.target.value)}
              placeholder="Ex: 2026000000"
              required
            />

            <Campo
              label="Data Coleta"
              type="date"
              icon={FileText}
              value={form.data_coleta}
              onChange={(e) => atualizarCampo('data_coleta', e.target.value)}
              required
            />

            <CampoSelect
              label="Origem"
              icon={MapPin}
              value={form.origem}
              onChange={(e) => atualizarCampo('origem', e.target.value)}
              options={locais}
              placeholder="Selecione a origem"
              required
              getLabel={(item) => item.nome || item.name || item.local || item.descricao || ''}
              getValue={(item) => item.nome || item.name || item.local || item.descricao || ''}
            />

            <Campo
              label="Quantidade"
              type="number"
              icon={Package}
              value={form.quantidade}
              onChange={(e) => atualizarCampo('quantidade', e.target.value)}
              min="1"
              required
            />

            <Campo
              label="Técnico do Atendimento / Solicitante"
              icon={UserRound}
              value={form.tecnico_atendimento}
              onChange={(e) => atualizarCampo('tecnico_atendimento', e.target.value)}
              placeholder="Nome do técnico ou solicitante"
            />

            <CampoSelect
              label="Equipamento"
              icon={Package}
              value={form.equipamento}
              onChange={(e) => atualizarCampo('equipamento', e.target.value)}
              options={equipamentos}
              placeholder="Selecione o equipamento"
              required
              getLabel={(item) => item.nome || item.name || item.equipamento || item.descricao || ''}
              getValue={(item) => item.nome || item.name || item.equipamento || item.descricao || ''}
            />

            <Campo
              label="Patrimônio"
              icon={Hash}
              value={form.patrimonio}
              onChange={(e) => atualizarCampo('patrimonio', e.target.value)}
              placeholder="Número do patrimônio"
            />

            <CampoSelectManual
              label="Fonte"
              icon={Package}
              value={form.fonte}
              onChange={(e) => atualizarCampo('fonte', e.target.value)}
              required
              options={[
                { label: 'Sim', value: 'sim' },
                { label: 'Não', value: 'nao' },
              ]}
              placeholder="Selecione"
            />

            <Campo
              label="GRP"
              icon={FileText}
              value={form.grp}
              onChange={(e) => atualizarCampo('grp', e.target.value)}
              placeholder="Número da GRP"
            />

            <CampoSelect
              label="Entregue por"
              icon={UserRound}
              value={form.entregue_por}
              onChange={(e) => atualizarCampo('entregue_por', e.target.value)}
              options={usuariosRota}
              placeholder="Selecione quem entregou"
              required
              getLabel={(item) =>
                item.nome ||
                item.name ||
                item.full_name ||
                item.nome_completo ||
                item.matricula ||
                item.email ||
                ''
              }
              getValue={(item) =>
                item.nome ||
                item.name ||
                item.full_name ||
                item.nome_completo ||
                item.matricula ||
                item.email ||
                ''
              }
            />

            <div className="md:col-span-2">
              <label className="text-sm text-slate-700 mb-2 block">
                Direcionar para rota
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => atualizarCampo('tipo_rota', 'capital')}
                  className={`
                    border rounded-2xl p-4 text-left transition
                    ${form.tipo_rota === 'capital'
                      ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Truck size={20} />
                    <div>
                      <p className="font-bold">Rota Capital</p>
                      <p className="text-xs opacity-80">Aparece para equipe da capital</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => atualizarCampo('tipo_rota', 'interior')}
                  className={`
                    border rounded-2xl p-4 text-left transition
                    ${form.tipo_rota === 'interior'
                      ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Truck size={20} />
                    <div>
                      <p className="font-bold">Rota Interior</p>
                      <p className="text-xs opacity-80">Aparece para equipe do interior</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={limparFormulario}
              className="bg-slate-50 border border-slate-200 text-slate-700 px-5 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-100 transition"
            >
              <RotateCcw size={18} />
              Limpar
            </button>

            <button
              type="submit"
              disabled={salvando}
              className="bg-[#2563EB] text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-blue-700 transition shadow-sm"
            >
              <Save size={18} />
              {salvando ? 'Salvando...' : 'Salvar e enviar para rota'}
            </button>
          </div>
        </form>

        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ClipboardList className="text-[#2563EB]" />
              <h2 className="font-semibold text-slate-900">
                Histórico de coletas geradas
              </h2>
            </div>

            <span className="text-sm text-slate-500">
              {ultimos.length} registro(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1200px]">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left p-4">GLPI</th>
                  <th className="text-left p-4">Data</th>
                  <th className="text-left p-4">Origem</th>
                  <th className="text-left p-4">Equipamento</th>
                  <th className="text-left p-4">Patrimônio</th>
                  <th className="text-left p-4">Fonte</th>
                  <th className="text-left p-4">GRP</th>
                  <th className="text-left p-4">Entregue por</th>
                  <th className="text-left p-4">Rota</th>
                  <th className="text-left p-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {ultimos.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="p-5 text-slate-500">
                      Nenhuma coleta cadastrada ainda.
                    </td>
                  </tr>
                ) : (
                  ultimos.map((item) => (
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

                      <td className="p-4 text-slate-700">
                        {item.entregue_por || '-'}
                      </td>

                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700">
                          {item.rota_apenas || '-'}
                        </span>
                      </td>

                      <td className="p-4">
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function Campo({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  min,
}) {
  return (
    <div>
      <label className="text-sm text-slate-700 mb-2 block">
        {label}
      </label>

      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-[#2563EB] focus-within:bg-white transition">
        {Icon && <Icon size={18} className="text-slate-400 shrink-0" />}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          className="bg-transparent outline-none w-full text-sm text-slate-900 placeholder:text-slate-400"
        />
      </div>
    </div>
  )
}

function CampoSelect({
  label,
  icon: Icon,
  value,
  onChange,
  options = [],
  placeholder = 'Selecione...',
  required = false,
  getLabel = (item) => item.nome || item.name || item.full_name || item.email || '',
  getValue = (item) => item.nome || item.name || item.full_name || item.email || '',
}) {
  return (
    <div>
      <label className="text-sm text-slate-700 mb-2 block">
        {label}
      </label>

      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-[#2563EB] focus-within:bg-white transition">
        {Icon && <Icon size={18} className="text-slate-400 shrink-0" />}

        <select
          value={value}
          onChange={onChange}
          required={required}
          className="bg-transparent outline-none w-full text-sm text-slate-900"
        >
          <option value="">
            {placeholder}
          </option>

          {options.map((item) => {
            const label = getLabel(item)
            const valor = getValue(item)

            return (
              <option key={item.id || valor} value={valor}>
                {label}
              </option>
            )
          })}
        </select>
      </div>
    </div>
  )
}

function CampoSelectManual({
  label,
  icon: Icon,
  value,
  onChange,
  options = [],
  placeholder = 'Selecione...',
  required = false,
}) {
  return (
    <div>
      <label className="text-sm text-slate-700 mb-2 block">
        {label}
      </label>

      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-[#2563EB] focus-within:bg-white transition">
        {Icon && <Icon size={18} className="text-slate-400 shrink-0" />}

        <select
          value={value}
          onChange={onChange}
          required={required}
          className="bg-transparent outline-none w-full text-sm text-slate-900"
        >
          <option value="">
            {placeholder}
          </option>

          {options.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const colors = {
    'Aguardando rota': 'bg-yellow-100 text-yellow-700',
    Coletado: 'bg-cyan-100 text-cyan-700',
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