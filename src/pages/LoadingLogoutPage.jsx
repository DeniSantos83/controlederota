import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LogOut,
  Loader2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'

export default function LoadingLogoutPage() {
  const navigate = useNavigate()

  useEffect(() => {
    localStorage.removeItem('usuarioLogado')
    localStorage.removeItem('usuario')
    localStorage.removeItem('perfil')
    localStorage.removeItem('rota_usuario')

    const timer = setTimeout(() => {
      navigate('/', { replace: true })
    }, 1400)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm p-8 md:p-10 text-center overflow-hidden relative">
          <div className="absolute -top-24 -right-24 w-56 h-56 bg-blue-100 rounded-full blur-3xl opacity-80" />
          <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-rose-100 rounded-full blur-3xl opacity-80" />

          <div className="relative z-10">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-red-500 text-white flex items-center justify-center shadow-sm mb-6">
              <LogOut size={38} />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Encerrando acesso
            </h1>

            <p className="text-slate-500 mt-3">
              Estamos finalizando sua sessão com segurança.
            </p>

            <div className="mt-8 bg-slate-50 border border-slate-200 rounded-3xl p-5 text-left space-y-4">
              <LoadingStep
                icon={ShieldCheck}
                title="Limpando sessão"
                description="Removendo dados temporários do acesso."
              />

              <LoadingStep
                icon={CheckCircle2}
                title="Protegendo o sistema"
                description="Preparando a tela inicial para novo login."
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
                    Voltando para a seleção de perfil.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full animate-[loadingBar_1.4s_ease-in-out_forwards]" />
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
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </div>
  )
}