import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { HomePage } from "./pages/HomePage"
import { BuildingDetailPage } from "./pages/BuildingDetailPage"
import { StewardshipHallPage } from "./pages/StewardshipHallPage"
import { InnovationPlazaPage } from "./pages/InnovationPlazaPage"
import { SkillsAcademyPage } from "./pages/SkillsAcademyPage"
import { KaizenTowerPage } from "./pages/KaizenTowerPage"
import { JobJunctionPage } from "./pages/JobJunctionPage"
import { CityHallPage } from "./pages/CityHallPage"
import { KNNFeedPage } from "./pages/KNNFeedPage"
import { ArticlePage } from "./pages/ArticlePage"
import { BlankPage } from "./pages/BlankPage"
import { AdminPage } from "./pages/AdminPage"
import { HomeEditor } from "./pages/admin/HomeEditor"
import { BuildingEditor } from "./pages/admin/BuildingEditor"
import { TestPage } from "./pages/TestPage"

function App() {
  console.log('Initializing Kaiville Interactive Map App');

  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/building/knn_tower" element={<Navigate to="/news" replace />} />
          <Route path="/building/heritage_center" element={<StewardshipHallPage />} />
          <Route path="/building/celebration_station" element={<InnovationPlazaPage />} />
          <Route path="/building/learning_lodge" element={<SkillsAcademyPage />} />
          <Route path="/building/kasp_tower" element={<KaizenTowerPage />} />
          <Route path="/building/community-center" element={<JobJunctionPage />} />
          <Route path="/building/city_hall" element={<CityHallPage />} />
          <Route path="/city-hall" element={<CityHallPage />} />
          <Route path="/building/:id" element={<BuildingDetailPage />} />
          <Route path="/news" element={<KNNFeedPage />} />
          <Route path="/news/*" element={<ArticlePage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/home" element={<HomeEditor />} />
          <Route path="/admin/building/:id" element={<BuildingEditor />} />
          <Route path="*" element={<BlankPage />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  )
}

export default App