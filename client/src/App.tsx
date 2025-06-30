import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { HomePage } from "./pages/HomePage"
import { BuildingDetailPage } from "./pages/BuildingDetailPage"
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
          <Route path="/building/:id" element={<BuildingDetailPage />} />
          <Route path="/news" element={<KNNFeedPage />} />
          <Route path="/news/:slug" element={<ArticlePage />} />
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