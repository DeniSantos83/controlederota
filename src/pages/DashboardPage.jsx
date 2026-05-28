import { useEffect, useMemo, useState } from 'react'
import AppLayout from '../layouts/AppLayout'
import { supabase } from '../services/supabase'

import {
  Package,
  ClipboardList,
  CheckCircle,
  Clock3,
  AlertTriangle,
  Wrench,
  MapPin,
  UserRound,
  Monitor,
} from 'lucide-react'

export default function DashboardPage() {
  const [coletas, setColetas] = useState([])
  const [carregando, setCarregando] = useState(true)

  async function carregarDados() {
    setCarregando(true)

    const { data, error } = await supabase
      .from('coletas')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      alert('Erro ao carregar dashboard.')
    } else {
      setColetas(data || [])
    }

    setCarregando(false)
  }

  useEffect(() => {
    carregarDados()
  }, [])

  const total = coletas.length
  
  const aguardandoColeta = coletas.filter((i) => i.status === 'Aguardando coleta').length
  const coletados = coletas.filter((i) => i.status === 'Coletado').length
  const pendentes = coletas.filter((i) => i.status === 'Pendente').length
  const cancelados = coletas.filter((i) => i.status === 'Cancelado').length
  const manutencao = coletas.filter((i) => i.rota_apenas === 'Finalizado - manutenção' || i.rota_apenas === 'Finalizado manutenção').length
  const finalizados = coletas.filter((i) => i.rota_apenas?.toLowerCase().startsWith('finalizado')).length

  const cards = [
    { title: 'Total de Coletas', value: total, icon: Package, color: 'bg-blue-500' },
    
    { title: 'Aguardando Coleta', value: aguardandoColeta, icon: ClipboardList, color: 'bg-amber-500' },
    { title: 'Coletados', value: coletados, icon: CheckCircle, color: 'bg-cyan-500' },
    { title: 'Pendentes', value: pendentes, icon: AlertTriangle, color: 'bg-orange-500' },
    { title: 'Manutenção', value: manutencao, icon: Wrench, color: 'bg-green-500' },
  ]

  const ultimasColetas = coletas.slice(0, 7)
  const filaManutencao = coletas
    .filter((i) => i.rota_apenas === 'Finalizado - manutenção' || i.rota_apenas === 'Finalizado manutenção')
    .slice(0, 7)

  const rankingEquipamentos = useMemo(() => {
    return criarRanking(coletas, 'equipamento').slice(0, 6)
  }, [coletas])

  const rankingOrigens = useMemo(() => {
    return criarRanking(coletas, 'origem').slice(0, 6)
  }, [coletas])

  const rankingTecnicos = useMemo(() => {
    return criarRanking(coletas, 'tecnico_atendimento').slice(0, 6)
  }, [coletas])

  return (
    <AppLayout>
      <div className="space-y-8">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Dashboard Operacional
            </h1>

            <p className="text-slate-500 mt-1">
              Visão geral das coletas, rotas, pendências e manutenção.
            </p>
          </div>

          <button
            onClick={carregarDados}
            className="bg-white border border-slate-200 rounded-2xl px-5 py-4 hover:bg-slate-50 transition shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Clock3 className="text-[#2563EB]" />

              <div className="text-left">
                <p className="text-xs text-slate-500">
                  Atualização
                </p>

                <p className="font-semibold text-slate-900">
                  {carregando ? 'Carregando...' : 'Atualizar agora'}
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-5">
          {cards.map((card) => {
            const Icon = card.icon

            return (
              <div
                key={card.title}
                className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-slate-500 text-sm">
                      {card.title}
                    </p>

                    <h2 className="text-3xl font-bold mt-2 text-slate-900">
                      {card.value}
                    </h2>
                  </div>

                  <div className={`${card.color} w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white`}>
                    <Icon size={24} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          <PainelLista
            titulo="Últimas coletas"
            icon={Package}
            vazio="Nenhuma coleta cadastrada."
          >
            {ultimasColetas.map((item) => (
              <LinhaColeta key={item.id} item={item} />
            ))}
          </PainelLista>

          <PainelLista
            titulo="Fila da manutenção"
            icon={Wrench}
            vazio="Nenhum item enviado para manutenção."
          >
            {filaManutencao.map((item) => (
              <LinhaColeta key={item.id} item={item} />
            ))}
          </PainelLista>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h2 className="font-semibold mb-5 text-slate-900">
              Resumo por status
            </h2>

            <div className="space-y-4">
              
              <ResumoItem label="Aguardando coleta" value={aguardandoColeta} />
              <ResumoItem label="Coletado" value={coletados} />
              <ResumoItem label="Pendente" value={pendentes} />
              <ResumoItem label="Cancelado" value={cancelados} />
              <ResumoItem label="Finalizados" value={finalizados} />
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          <RankingCard
            titulo="Equipamentos mais registrados"
            icon={Monitor}
            items={rankingEquipamentos}
          />

          <RankingCard
            titulo="Origens com mais coletas"
            icon={MapPin}
            items={rankingOrigens}
          />

          <RankingCard
            titulo="Técnicos com mais registros"
            icon={UserRound}
            items={rankingTecnicos}
          />

        </div>

      </div>
    </AppLayout>
  )
}

function criarRanking(lista, campo) {
  const mapa = {}

  lista.forEach((item) => {
    const valor = item[campo] || 'Não informado'
    mapa[valor] = (mapa[valor] || 0) + 1
  })

  return Object.entries(mapa)
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total)
}

function PainelLista({ titulo, icon: Icon, children, vazio }) {
  const temItens = Array.isArray(children)
    ? children.length > 0
    : !!children

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-200 flex items-center gap-3">
        <Icon className="text-[#2563EB]" />
        <h2 className="font-semibold text-slate-900">{titulo}</h2>
      </div>

      <div className="divide-y divide-slate-200">
        {temItens ? (
          children
        ) : (
          <div className="p-5 text-slate-500">
            {vazio}
          </div>
        )}
      </div>
    </div>
  )
}

function LinhaColeta({ item }) {
  return (
    <div className="p-5 hover:bg-slate-50 transition">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-[#2563EB]">
            {item.glpi || 'Sem GLPI'}
          </p>

          <p className="text-sm text-slate-700 mt-1">
            {item.equipamento || 'Equipamento não informado'}
          </p>

          <p className="text-xs text-slate-500 mt-1">
            {item.origem || 'Origem não informada'}
          </p>
        </div>

        <StatusBadge status={item.status} />
      </div>
    </div>
  )
}

function RankingCard({ titulo, icon: Icon, items }) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <Icon className="text-[#2563EB]" />
        <h2 className="font-semibold text-slate-900">{titulo}</h2>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-slate-500 text-sm">
            Nenhum dado disponível.
          </p>
        ) : (
          items.map((item, index) => (
            <div
              key={`${item.nome}-${index}`}
              className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-sm text-slate-800">
                  {item.nome}
                </p>

                <p className="text-xs text-slate-500">
                  #{index + 1} no ranking
                </p>
              </div>

              <span className="text-xl font-bold text-[#2563EB]">
                {item.total}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function ResumoItem({ label, value }) {
  return (
    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4">
      <span className="text-slate-700">
        {label}
      </span>

      <span className="font-bold text-xl text-slate-900">
        {value}
      </span>
    </div>
  )
}

function StatusBadge({ status }) {
  const colors = {
    
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