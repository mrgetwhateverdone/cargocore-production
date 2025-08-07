import { Layout } from "@/components/layout/Layout";
import { Construction, ArrowRight } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <Construction className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-gray-600 mb-8">{description}</p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-center text-blue-700">
              <span className="text-sm font-medium">
                Continue prompting to build this page
              </span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
            <div className="mt-3 text-xs text-blue-600">
              🔒 Ready for secure API integration via internal endpoints
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
