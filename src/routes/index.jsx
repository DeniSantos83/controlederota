import { Routes, Route } from 'react-router-dom'

import AccessPage from '../pages/AccessPage'
import LoadingAccessPage from '../pages/LoadingAccessPage'
import DashboardPage from '../pages/DashboardPage'
import AdminPage from '../pages/AdminPage'
import ColetasPage from '../pages/ColetasPage'
import ManutencaoPage from '../pages/ManutencaoPage'
import RotaInteriorPage from '../pages/RotaInteriorPage'
import TecnicoPage from '../pages/TecnicoPage'
import AcompanhamentoPage from '../pages/AcompanhamentoPage'
import LoadingLogoutPage from '../pages/LoadingLogoutPage'

import RotaCapitalPage from '../pages/RotaCapitalPage'

export default function AppRoutes() {
  return (
    <Routes>
  <Route path="/" element={<AccessPage />} />
  <Route path="/loading" element={<LoadingAccessPage />} />
  <Route path="/logout" element={<LoadingLogoutPage />} />
  

  <Route path="/admin/" element={<DashboardPage />} />
  <Route path="/admin/usuarios" element={<AdminPage />} />
  <Route path="/admin/coletas" element={<ColetasPage />} />
  <Route path="/admin/manutencao" element={<ManutencaoPage />} />
  <Route path="/manutencao" element={<ManutencaoPage />} />
  <Route path="/tecnico" element={<TecnicoPage />} />
  <Route path="/acompanhamento" element={<AcompanhamentoPage />} />

  <Route path="/rota-capital" element={<RotaCapitalPage />} />
  <Route path="/rota-interior" element={<RotaInteriorPage />} />
</Routes>
  )
}