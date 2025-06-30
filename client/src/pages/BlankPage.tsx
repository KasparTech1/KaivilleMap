
import { Construction, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate, useLocation, Link } from "react-router-dom"

export function BlankPage() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-sky-100">
      {/* Header with Welcome Sign */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link to="/" className="group inline-block">
            <div className="flex items-center space-x-3">
              <img
                src="/assets/kai-sign-small.png"
                alt="Back to Home"
                className="h-20 w-auto transition-transform duration-200 group-hover:scale-105"
              />
              <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">
                Back to Map
              </span>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Construction className="h-10 w-10 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Page Under Construction</CardTitle>
          <CardDescription>
            This page is not yet implemented.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please tell Pythagora to implement the {location.pathname} page
            </p>
            <Button 
              onClick={() => navigate("/")} 
              className="w-full"
              variant="default"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back Home
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
