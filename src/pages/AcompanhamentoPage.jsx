import { useEffect, useMemo, useState } from 'react'
import AppLayout from '../layouts/AppLayout'
import { supabase } from '../services/supabase'
import {
  ClipboardList,
  Search,
  RefreshCw,
  CalendarDays,
  FileText,
  Package,
  CheckCircle,
} from 'lucide-react'

export default function AcompanhamentoPage() {
  const [coletas, setColetas] = useState([])
  const [busca, setBusca] = useState('')
  const [dataFiltro, setDataFiltro] = useState('')
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    carregarColetas()
  }, [])

  async function carregarColetas() {
    setCarregando(true)

    const { data, error } = await supabase
      .from('coletas')
      .select('*')
      .order('data_coleta', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      alert('Erro ao carregar acompanhamento.')
    } else {
      setColetas(data || [])
    }

    setCarregando(false)
  }

  const coletasFiltradas = useMemo(() => {
    const termo = busca.toLowerCase().trim()

    return coletas.filter((item) => {
      const correspondeBusca =
        !termo ||
        item.glpi?.toLowerCase().includes(termo) ||
        item.origem?.toLowerCase().includes(termo) ||
        item.tecnico_atendimento?.toLowerCase().includes(termo) ||
        item.equipamento?.toLowerCase().includes(termo) ||
        item.patrimonio?.toLowerCase().includes(termo) ||
        item.grp?.toLowerCase().includes(termo) ||
        item.entregue_por?.toLowerCase().includes(termo) ||
        item.status?.toLowerCase().includes(termo) ||
        item.recebimento?.toLowerCase().includes(termo) ||
        item.rota_apenas?.toLowerCase().includes(termo)

      const correspondeData =
        !dataFiltro || item.data_coleta === dataFiltro

      return correspondeBusca && correspondeData
    })
  }, [coletas, busca, dataFiltro])

  const total = coletasFiltradas.length
  const aguardando = coletasFiltradas.filter((i) => i.status === 'Aguardando rota').length
  const coletados = coletasFiltradas.filter((i) => i.status === 'Coletado').length
  const finalizados = coletasFiltradas.filter((i) =>
    i.rota_apenas?.toLowerCase().startsWith('finalizado')
  ).length

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Acompanhamento das Coletas
            </h1>

            <p className="text-slate-500 mt-1">
              Histórico geral por data, disponível para todos os perfis.
            </p>
          </div>

          <button
            onClick={carregarColetas}
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
          <ResumoCard titulo="Registros" valor={total} icon={ClipboardList} />
          <ResumoCard titulo="Aguardando rota" valor={aguardando} icon={CalendarDays} />
          <ResumoCard titulo="Coletados" valor={coletados} icon={CheckCircle} />
          <ResumoCard titulo="Finalizados" valor={finalizados} icon={FileText} />
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-[#2563EB] focus-within:bg-white transition">
              <Search size={20} className="text-slate-400" />

              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar por GLPI, origem, técnico, equipamento, patrimônio, GRP, status, recebimento ou rota..."
                className="bg-transparent outline-none w-full text-sm text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-[#2563EB] focus-within:bg-white transition">
              <CalendarDays size={20} className="text-slate-400" />

              <input
                type="date"
                value={dataFiltro}
                onChange={(e) => setDataFiltro(e.target.value)}
                className="bg-transparent outline-none w-full text-sm text-slate-900"
              />
            </div>
          </div>

          {dataFiltro && (
            <button
              onClick={() => setDataFiltro('')}
              className="mt-4 text-sm text-[#2563EB] hover:underline font-medium"
            >
              Limpar filtro de data
            </button>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Package className="text-[#2563EB]" />

              <h2 className="font-semibold text-slate-900">
                Histórico geral
              </h2>
            </div>

            <span className="text-sm text-slate-500">
              {coletasFiltradas.length} registro(s)
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
                      Carregando histórico...
                    </td>
                  </tr>
                ) : coletasFiltradas.length === 0 ? (
                  <tr>
                    <td className="p-4 text-slate-500" colSpan="13">
                      Nenhum registro encontrado.
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
                        {formatarData(item.data_coleta)}
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

                      <td className="p-4 text-slate-700">
                        {item.entregue_por || '-'}
                      </td>

                      <td className="p-4">
                        <StatusBadge status={item.status} />
                      </td>

                      <td className="p-4 text-slate-700">
                        {item.recebimento || '-'}
                      </td>

                      <td className="p-4">
                        <RotaBadge rota={item.rota_apenas} />
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
        <p className="text-sm text-slate-500">
          {titulo}
        </p>

        <h3 className="text-3xl font-bold mt-2 text-slate-900">
          {valor}
        </h3>
      </div>

      <div className="w-12 h-12 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shadow-sm">
        <Icon size={24} />
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

function RotaBadge({ rota }) {
  return (
    <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700 whitespace-nowrap">
      {rota || '-'}
    </span>
  )
}

function formatarData(data) {
  if (!data) return '-'

  const [ano, mes, dia] = data.split('-')

  if (!ano || !mes || !dia) return data

  return `${dia}/${mes}/${ano}`
}