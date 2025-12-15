import { Link } from "react-router-dom";

export default function MainPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/10 p-4">
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-4xl font-extrabold">Welcome to StockPip</h1>
        <p className="text-muted-foreground">Main landing page. Please sign in to access your dashboard.</p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/login" className="btn btn-primary px-4 py-2">
            Sign In
          </Link>
          <Link to="/register" className="btn btn-ghost px-4 py-2">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
