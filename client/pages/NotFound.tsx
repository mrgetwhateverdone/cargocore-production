import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">Oops! Page not found</p>

          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Link>

          <div className="mt-6 text-sm text-gray-500">
            🔒 Secure navigation maintained
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
