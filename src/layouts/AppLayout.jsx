import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  BarChart3,
  Route,
  Users,
} from 'lucide-react'

import { getUsuarioLogado } from '../utils/auth'

export default function AppLayout({ children }) {
  const usuario = getUsuarioLogado()

  const perfil =
    usuario?.perfil ||
    localStorage.getItem('perfil') ||
    'admin'

  const menu = [
    {
      label: 'Dashboard',
      path: '/admin',
      icon: LayoutDashboard,
      perfis: ['admin', 'rota_capital', 'rota_interior'],
    },
    {
      label: 'Usuários',
      path: '/admin/usuarios',
      icon: Users,
      perfis: ['admin'],
    },
    {
      label: 'Nova Coleta',
      path: '/tecnico',
      icon: ClipboardList,
      perfis: ['tecnico'],
    },
    {
      label: 'Acompanhamento',
      path: '/acompanhamento',
      icon: ClipboardList,
      perfis: ['admin', 'rota_capital', 'rota_interior', 'tecnico', 'manutencao'],
    },
    {
      label: 'Coletas',
      path:
        perfil === 'rota_capital'
          ? '/rota-capital'
          : perfil === 'rota_interior'
            ? '/rota-interior'
            : '/admin/coletas',
      icon: ClipboardList,
      perfis: ['admin', 'rota_capital', 'rota_interior'],
    },
    {
      label: 'Manutenção',
      path: '/admin/manutencao',
      icon: Wrench,
      perfis: ['admin', 'manutencao'],
    },
    {
      label: 'Relatórios',
      path: '/relatorios',
      icon: BarChart3,
      perfis: ['admin'],
    },
  ]

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-slate-900 flex">

      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col shadow-sm">

        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white shadow-sm">
              <Route size={26} />
            </div>

            <div>
              <h1 className="font-bold text-lg text-slate-900">
                Controle de Rotas
              </h1>

              <p className="text-xs text-slate-500">
                TJSE - Capital
              </p>
            </div>

          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          {menu
            .filter((item) => item.perfis.includes(perfil))
            .map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `
                    flex items-center gap-3 px-4 py-3 rounded-2xl transition
                    ${isActive
                      ? 'bg-[#2563EB] text-white font-semibold shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }
                    `
                  }
                >
                  <Icon size={20} />
                  {item.label}
                </NavLink>
              )
            })}
        </nav>

        <div className="p-5 border-t border-slate-200 space-y-4">

          <div>
            <p className="text-sm font-semibold text-slate-900">
              {usuario?.nome || 'Usuário logado'}
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Perfil: {perfil}
            </p>
          </div>

          <button
  onClick={() => {
    window.location.href = '/logout'
  }}
  className="
    w-full bg-red-50 border border-red-200
    hover:bg-red-100
    text-red-600
    rounded-2xl
    py-3
    font-semibold
    transition
  "
>
  Sair do sistema
</button>

          <div className="text-xs text-slate-400 text-center">
            deniCreativeStudio
          </div>

        </div>

      </aside>

      <main className="flex-1 min-w-0">

        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shadow-sm">

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Sistema de Rotas
            </h2>

            <p className="text-sm text-slate-500">
              Controle intuitivo baseado na planilha atual
            </p>
          </div>

          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-slate-900">
              Acesso interno
            </p>

            <p className="text-xs text-slate-500">
              Equipe de rotas
            </p>
          </div>

        </header>

        <div className="p-5 lg:p-8">
          {children}
        </div>

      </main>

    </div>
  )
}