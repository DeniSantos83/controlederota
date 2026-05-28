import { useEffect, useMemo, useState } from 'react'
import AppLayout from '../layouts/AppLayout'
import { supabase } from '../services/supabase'
import {
  ClipboardList,
  Search,
  CheckCircle,
  Clock3,
  RefreshCw,
  MapPin,
  Wrench,
} from 'lucide-react'

const opcoesStatus = ['Aguardando rota', 'Coletado', 'Cancelado']

const opcoesRotaApenas = [
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

export default function RotaCapitalPage({ tipoRota = 'capital' }) {
  const [coletas, setColetas] = useState([])
  const [usuariosRota, setUsuariosRota] = useState([])
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)

  const tituloPagina = tipoRota === 'interior' ? 'Rota Interior' : 'Rota Capital'

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    setCarregando(true)

    const [coletasRes, usuariosRes] = await Promise.all([
      supabase
        .from('coletas')
        .select('*')
        .order('created_at', { ascending: false }),

      supabase
        .from('usuarios_rotas')
        .select('*')
        .order('nome', { ascending: true }),
    ])

    if (coletasRes.error) {
      console.error(coletasRes.error)
      alert('Erro ao carregar coletas.')
    } else {
      setColetas(coletasRes.data || [])
    }

    if (usuariosRes.error) {
      console.error(usuariosRes.error)
    } else {
      setUsuariosRota(usuariosRes.data || [])
    }

    setCarregando(false)
  }

  const coletasDaRota = useMemo(() => {
  return coletas.filter((item) => {
    const rota = `${item.rota_apenas || ''}`.toLowerCase()
    const status = `${item.status || ''}`.toLowerCase()

    // ROTA INTERIOR
    if (tipoRota === 'interior') {
      return (
        rota.includes('interior') ||
        status === 'aguardando coleta'
      )
    }

    // ROTA CAPITAL
    return (
      rota.includes('capital') ||
      status === 'aguardando coleta'
    )
  })
}, [coletas, tipoRota])

  const itensFiltrados = coletasDaRota.filter((item) => {
    const termo = busca.toLowerCase()

    return (
      item.glpi?.toLowerCase().includes(termo) ||
      item.equipamento?.toLowerCase().includes(termo) ||
      item.patrimonio?.toLowerCase().includes(termo) ||
      item.origem?.toLowerCase().includes(termo) ||
      item.tecnico_atendimento?.toLowerCase().includes(termo) ||
      item.entregue_por?.toLowerCase().includes(termo)
    )
  })

  const total = coletasDaRota.length
  const aguardando = coletasDaRota.filter((i) => i.status === 'Aguardando rota').length
  const coletados = coletasDaRota.filter((i) => i.status === 'Coletado').length
  const manutencao = coletasDaRota.filter((i) => i.rota_apenas === 'Finalizado - manutenção').length

  async function atualizarItem(id, campo, valor) {
    const { error } = await supabase
      .from('coletas')
      .update({ [campo]: valor })
      .eq('id', id)

    if (error) {
      console.error(error)
      alert('Erro ao atualizar registro.')
      return
    }

    await carregarDados()
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {tituloPagina}
            </h1>

            <p className="text-slate-500 mt-1">
              Conferência da rota, recebimento e definição do destino final.
            </p>
          </div>

          <button
            onClick={carregarDados}
            className="bg-white border border-slate-200 rounded-2xl px-5 py-4 hover:bg-slate-50 transition shadow-sm"
          >
            <div className="flex items-center gap-3">
              <RefreshCw className="text-[#2563EB]" />

              <div className="text-left">
                <p className="text-xs text-slate-500">Atualização</p>
                <p className="font-semibold text-slate-900">
                  {carregando ? 'Carregando...' : 'Atualizar agora'}
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ResumoCard titulo="Total da rota" valor={total} icon={ClipboardList} />
          <ResumoCard titulo="Aguardando" valor={aguardando} icon={Clock3} />
          <ResumoCard titulo="Coletados" valor={coletados} icon={CheckCircle} />
          <ResumoCard titulo="Manutenção" valor={manutencao} icon={Wrench} />
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-[#2563EB] focus-within:bg-white transition">
            <Search size={20} className="text-slate-400" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar por GLPI, equipamento, patrimônio, origem, técnico ou entregue por..."
              className="bg-transparent outline-none w-full text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="text-[#2563EB]" />
              <h2 className="font-semibold text-slate-900">
                Fila da {tituloPagina}
              </h2>
            </div>

            <span className="text-sm text-slate-500">
              {itensFiltrados.length} registro(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1700px]">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left p-4">GLPI</th>
                  <th className="text-left p-4">Data Coleta</th>
                  <th className="text-left p-4">Origem</th>
                  <th className="text-left p-4">Téc. Atendimento / Solicitante</th>
                  <th className="text-left p-4">Quant.</th>
                  <th className="text-left p-4">Equipamento</th>
                  <th className="text-left p-4">Patrimônio</th>
                  <th className="text-left p-4">Fonte</th>
                  <th className="text-left p-4">GRP</th>
                  <th className="text-left p-4">Entregue por</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Recebimento</th>
                  <th className="text-left p-4">Rota Apenas</th>
                </tr>
              </thead>

              <tbody>
                {carregando ? (
                  <tr>
                    <td className="p-4 text-slate-500" colSpan="13">
                      Carregando registros...
                    </td>
                  </tr>
                ) : itensFiltrados.length === 0 ? (
                  <tr>
                    <td className="p-4 text-slate-500" colSpan="13">
                      Nenhum registro encontrado para esta rota.
                    </td>
                  </tr>
                ) : (
                  itensFiltrados.map((item) => (
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
  <SelectTabela
    value={item.entregue_por || ''}
    onChange={(e) =>
      atualizarItem(item.id, 'entregue_por', e.target.value)
    }
    options={usuariosRota
      .map((u) =>
        u.nome ||
        u.name ||
        u.full_name ||
        u.nome_completo ||
        u.matricula ||
        u.email ||
        ''
      )
      .filter(Boolean)}
    placeholder="Selecione"
  />
</td>

                      <td className="p-4">
                        <SelectTabela
                          value={item.status || 'Aguardando rota'}
                          onChange={(e) => atualizarItem(item.id, 'status', e.target.value)}
                          options={opcoesStatus}
                        />
                      </td>

                      <td className="p-4">
                        <SelectTabela
                          value={item.recebimento || ''}
                          onChange={(e) => atualizarItem(item.id, 'recebimento', e.target.value)}
                          options={usuariosRota
                            .map((u) =>
                              u.nome ||
                              u.name ||
                              u.full_name ||
                              u.nome_completo ||
                              u.matricula ||
                              u.email ||
                              ''
                            )
                            .filter(Boolean)}
                          placeholder="Selecione"
                        />
                      </td>

                      <td className="p-4">
                        <SelectTabela
                          value={item.rota_apenas || ''}
                          onChange={(e) => atualizarItem(item.id, 'rota_apenas', e.target.value)}
                          options={opcoesRotaApenas}
                          placeholder="Selecione"
                        />
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

function ResumoCard({ titulo, valor, icon: Icon }) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition">
      <div>
        <p className="text-sm text-slate-500">{titulo}</p>
        <h3 className="text-3xl font-bold mt-2 text-slate-900">{valor}</h3>
      </div>

      <div className="w-12 h-12 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shadow-sm">
        <Icon size={24} />
      </div>
    </div>
  )
}

function SelectTabela({ value, onChange, options = [], placeholder }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none min-w-[180px] focus:border-[#2563EB] focus:bg-white transition"
    >
      {placeholder && (
        <option value="">
          {placeholder}
        </option>
      )}

      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}