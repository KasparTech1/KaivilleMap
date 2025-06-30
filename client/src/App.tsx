import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { HomePage } from "./pages/HomePage"
import { BuildingDetailPage } from "./pages/BuildingDetailPage"
import { BlankPage } from "./pages/BlankPage"

function App() {
  console.log('Initializing Kaiville Interactive Map App');

  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/building/:id" element={<BuildingDetailPage />} />
          <Route path="*" element={<BlankPage />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  )
}

export default App