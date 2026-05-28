import { useEffect, useState } from 'react'
import AppLayout from '../layouts/AppLayout'
import { supabase } from '../services/supabase'
import {
  Wrench,
  Search,
  CheckCircle,
  Clock3,
  AlertTriangle,
  Save,
  RefreshCw,
} from 'lucide-react'
import { getUsuarioLogado } from '../utils/auth'

const hoje = () => new Date().toISOString().slice(0, 10)

export default function ManutencaoPage() {
  const usuario = getUsuarioLogado()

  const [itens, setItens] = useState([])
  const [tecnicosManutencao, setTecnicosManutencao] = useState([])
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    carregarItens()
  }, [])

  async function carregarItens() {
  setCarregando(true)

  const [itensRes, tecnicosRes] = await Promise.all([
    supabase
      .from('coletas')
      .select('*')
      .in('rota_apenas', [
        'Finalizado - manutenção',
        'Finalizado manutenção',
      ])
      .order('created_at', { ascending: false }),

    supabase
      .from('usuarios_rotas')
      .select('*')
      .eq('ativo', true)
      .eq('perfil', 'manutencao')
      .order('nome', { ascending: true }),
  ])

  if (itensRes.error) {
    console.error(itensRes.error)
    alert('Erro ao carregar manutenção.')
  } else {
    setItens(itensRes.data || [])
  }

  if (tecnicosRes.error) {
    console.error(tecnicosRes.error)
  } else {
    setTecnicosManutencao(tecnicosRes.data || [])
  }

  setCarregando(false)
}

  async function atualizarItem(id, campo, valor) {
    const { error } = await supabase
      .from('coletas')
      .update({ [campo]: valor })
      .eq('id', id)

    if (error) {
      console.error(error)
      alert('Erro ao atualizar manutenção.')
      return
    }

    await carregarItens()
  }

  async function finalizarManutencao(item) {
    const confirmar = confirm('Finalizar manutenção deste equipamento?')
    if (!confirmar) return

    const { error } = await supabase
      .from('coletas')
      .update({
        manutencao_finalizada: true,
        data_manutencao: hoje(),
        tecnico_manutencao: item.tecnico_manutencao || usuario?.nome || '',
      })
      .eq('id', item.id)

    if (error) {
      console.error(error)
      alert('Erro ao finalizar manutenção.')
      return
    }

    await carregarItens()
  }

  const itensFiltrados = itens.filter((item) => {
    const termo = busca.toLowerCase()

    return (
      item.glpi?.toLowerCase().includes(termo) ||
      item.equipamento?.toLowerCase().includes(termo) ||
      item.patrimonio?.toLowerCase().includes(termo) ||
      item.origem?.toLowerCase().includes(termo) ||
      item.tecnico_atendimento?.toLowerCase().includes(termo) ||
      item.tecnico_manutencao?.toLowerCase().includes(termo) ||
      item.recebimento?.toLowerCase().includes(termo)
    )
  })

  const total = itens.length
  const conferidos = itens.filter((i) => i.equipamento_conferido).length
  const pendentes = itens.filter((i) => !i.equipamento_conferido).length
  const finalizados = itens.filter((i) => i.manutencao_finalizada).length

  return (
    <AppLayout>
      <div className="space-y-6">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Manutenção
            </h1>

            <p className="text-slate-500 mt-1">
              Equipamentos enviados pela rota para conferência e manutenção.
            </p>
          </div>

          <button
            onClick={carregarItens}
            className="bg-white border border-slate-200 rounded-2xl px-5 py-4 hover:bg-slate-50 transition shadow-sm"
          >
            <div className="flex items-center gap-3">
              <RefreshCw className="text-[#2563EB]" />

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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ResumoCard titulo="Na fila" valor={total} icon={Wrench} />
          <ResumoCard titulo="Conferidos" valor={conferidos} icon={CheckCircle} />
          <ResumoCard titulo="Pendentes" valor={pendentes} icon={AlertTriangle} />
          <ResumoCard titulo="Finalizados" valor={finalizados} icon={Clock3} />
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-[#2563EB] focus-within:bg-white transition">
            <Search size={20} className="text-slate-400" />

            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar por GLPI, equipamento, patrimônio, origem, recebimento ou técnico..."
              className="bg-transparent outline-none w-full text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wrench className="text-[#2563EB]" />

              <h2 className="font-semibold text-slate-900">
                Fila da manutenção
              </h2>
            </div>

            <span className="text-sm text-slate-500">
              {itensFiltrados.length} registro(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1300px]">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left p-4">GLPI</th>
                  <th className="text-left p-4">Recebimento</th>
                  <th className="text-left p-4">Téc. Manutenção</th>
                  <th className="text-left p-4">Equipamento</th>
                  <th className="text-left p-4">Patrimônio</th>
                  <th className="text-left p-4">Conferido</th>
                  <th className="text-left p-4">Completo?</th>
                  <th className="text-left p-4">Técnico Rota</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Ação</th>
                </tr>
              </thead>

              <tbody>
                {carregando ? (
                  <tr>
                    <td className="p-4 text-slate-500" colSpan="10">
                      Carregando manutenção...
                    </td>
                  </tr>
                ) : itensFiltrados.length === 0 ? (
                  <tr>
                    <td className="p-4 text-slate-500" colSpan="10">
                      Nenhum equipamento enviado para manutenção.
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
                        {item.recebimento || '-'}
                      </td>

                      <td className="p-4">
  <select
    value={item.tecnico_manutencao || ''}
    onChange={(e) =>
      atualizarItem(
        item.id,
        'tecnico_manutencao',
        e.target.value
      )
    }
    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none min-w-[190px] focus:border-[#2563EB] focus:bg-white transition"
  >
    <option value="">
      Selecionar técnico
    </option>

    {tecnicosManutencao.map((tecnico) => (
      <option
        key={tecnico.id}
        value={tecnico.nome}
      >
        {tecnico.nome}
      </option>
    ))}
  </select>
</td>

                      <td className="p-4">
                        <div>
                          <p className="font-medium text-slate-800">
                            {item.equipamento || '-'}
                          </p>

                          <p className="text-xs text-slate-500">
                            {item.origem || ''}
                          </p>
                        </div>
                      </td>

                      <td className="p-4 text-slate-700">
                        {item.patrimonio || '-'}
                      </td>

                      <td className="p-4">
                        <SelectTabela
                          value={item.equipamento_conferido ? 'sim' : 'nao'}
                          onChange={(e) =>
                            atualizarItem(
                              item.id,
                              'equipamento_conferido',
                              e.target.value === 'sim'
                            )
                          }
                          options={[
                            { label: 'Não', value: 'nao' },
                            { label: 'Sim', value: 'sim' },
                          ]}
                        />
                      </td>

                      <td className="p-4">
                        <SelectTabela
                          value={item.completo ? 'sim' : 'nao'}
                          onChange={(e) =>
                            atualizarItem(item.id, 'completo', e.target.value === 'sim')
                          }
                          options={[
                            { label: 'Não', value: 'nao' },
                            { label: 'Sim', value: 'sim' },
                          ]}
                        />
                      </td>

                      <td className="p-4 text-slate-700">
                        {item.entregue_por || item.tecnico_atendimento || '-'}
                      </td>

                      <td className="p-4">
                        {item.manutencao_finalizada ? (
                          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                            Finalizado
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                            Em manutenção
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => finalizarManutencao(item)}
                          disabled={item.manutencao_finalizada}
                          className="bg-[#2563EB] text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50 hover:bg-blue-700 transition shadow-sm"
                        >
                          <Save size={16} />
                          Finalizar
                        </button>
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

function SelectTabela({ value, onChange, options = [] }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white transition"
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  )
}