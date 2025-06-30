import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { HomePage } from "./pages/HomePage"
import { BuildingDetailPage } from "./pages/BuildingDetailPage"
import { BlankPage } from "./pages/BlankPage"
import { AdminPage } from "./pages/AdminPage"
import { HomeEditor } from "./pages/admin/HomeEditor"

function App() {
  console.log('Initializing Kaiville Interactive Map App');

  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/building/:id" element={<BuildingDetailPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/home" element={<HomeEditor />} />
          <Route path="*" element={<BlankPage />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  )
}

export default App