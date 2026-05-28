import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  Loader2,
  Route,
  CheckCircle2,
} from 'lucide-react'

export default function LoadingAccessPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const rotaDestino = location.state?.rota || '/acompanhamento'
  const perfil = location.state?.perfil || 'usuario'

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(rotaDestino, { replace: true })
    }, 1600)

    return () => clearTimeout(timer)
  }, [navigate, rotaDestino])

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm p-8 md:p-10 text-center overflow-hidden relative">

          <div className="absolute -top-24 -right-24 w-56 h-56 bg-blue-100 rounded-full blur-3xl opacity-80" />
          <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-emerald-100 rounded-full blur-3xl opacity-80" />

          <div className="relative z-10">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-[#2563EB] text-white flex items-center justify-center shadow-sm mb-6">
              <Route size={38} />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Preparando seu acesso
            </h1>

            <p className="text-slate-500 mt-3">
              Estamos carregando o ambiente do perfil{' '}
              <span className="font-semibold text-[#2563EB]">
                {formatarPerfil(perfil)}
              </span>
              .
            </p>

            <div className="mt-8 bg-slate-50 border border-slate-200 rounded-3xl p-5 text-left space-y-4">
              <LoadingStep
                icon={ShieldCheck}
                title="Validando permissões"
                description="Conferindo seu perfil de acesso."
              />

              <LoadingStep
                icon={CheckCircle2}
                title="Carregando módulos"
                description="Organizando menus e recursos disponíveis."
              />

              <div className="flex items-center gap-4 pt-2">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                  <Loader2 size={24} className="animate-spin" />
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    Redirecionando
                  </p>

                  <p className="text-sm text-slate-500">
                    Abrindo a área correspondente ao seu perfil.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#2563EB] rounded-full animate-[loadingBar_1.6s_ease-in-out_forwards]" />
              </div>

              <p className="text-xs text-slate-400 mt-4">
                Controle de Rotas • TJSE
              </p>
            </div>
          </div>

          <style>
            {`
              @keyframes loadingBar {
                from {
                  width: 8%;
                }
                to {
                  width: 100%;
                }
              }
            `}
          </style>

        </div>
      </div>
    </div>
  )
}

function LoadingStep({ icon: Icon, title, description }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
        <Icon size={23} />
      </div>

      <div>
        <p className="font-semibold text-slate-900">
          {title}
        </p>

        <p className="text-sm text-slate-500">
          {description}
        </p>
      </div>
    </div>
  )
}

function formatarPerfil(perfil) {
  const nomes = {
    admin: 'Administrador',
    rota_capital: 'Rota Capital',
    rota_interior: 'Rota Interior',
    tecnico: 'Técnico',
    manutencao: 'Manutenção',
  }

  return nomes[perfil] || 'Usuário'
}