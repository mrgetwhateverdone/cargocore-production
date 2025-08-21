import { useEffect } from 'react';
import { X, Globe, MapPin } from 'lucide-react';

interface SupplierCountriesOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: {
    supplier_name: string;
    countries: string[];
    concentration_risk: number;
    total_value: number;
    sku_count: number;
  } | null;
}

/**
 * This part of the code creates an overlay for displaying supplier countries list
 * Shows detailed geographic distribution for supply chain analysis
 */
export function SupplierCountriesOverlay({ isOpen, onClose, supplier }: SupplierCountriesOverlayProps) {
  // This part of the code handles escape key and prevents body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // This part of the code determines risk level styling based on concentration
  const getRiskLevel = (concentration: number) => {
    if (concentration >= 50) return { level: "Critical", color: "text-red-600", bgColor: "bg-red-50 border-red-200" };
    if (concentration >= 30) return { level: "High", color: "text-orange-600", bgColor: "bg-orange-50 border-orange-200" };
    if (concentration >= 15) return { level: "Medium", color: "text-yellow-600", bgColor: "bg-yellow-50 border-yellow-200" };
    return { level: "Low", color: "text-green-600", bgColor: "bg-green-50 border-green-200" };
  };

  // This part of the code generates supply chain analysis based on country count
  const getSupplyChainAnalysis = (countryCount: number, _riskLevel: string) => {
    if (countryCount >= 20) {
      return `Geographic diversification across ${countryCount} countries provides excellent supply chain resilience and reduces dependency risk. This global distribution strategy minimizes potential disruptions from regional issues.`;
    } else if (countryCount >= 10) {
      return `Moderate geographic distribution across ${countryCount} countries offers good supply chain diversification. Consider expanding to additional regions to further reduce concentration risk.`;
    } else if (countryCount >= 5) {
      return `Limited geographic distribution across ${countryCount} countries creates moderate supply chain concentration. Expanding sourcing regions could improve resilience.`;
    } else {
      return `High geographic concentration with only ${countryCount} source countries presents significant supply chain risk. Urgent diversification recommended to reduce dependency.`;
    }
  };

  if (!isOpen || !supplier) return null;

  const risk = getRiskLevel(supplier.concentration_risk);
  const analysis = getSupplyChainAnalysis(supplier.countries.length, risk.level);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Globe className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{supplier.supplier_name}</h2>
              <p className="text-sm text-gray-500">Source Countries & Geographic Distribution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {supplier.countries.length}
              </div>
              <p className="text-sm text-blue-800">Countries</p>
            </div>
            <div className={`rounded-lg border p-4 text-center ${risk.bgColor}`}>
              <div className={`text-2xl font-bold ${risk.color}`}>
                {supplier.concentration_risk}%
              </div>
              <p className={`text-sm ${risk.color}`}>{risk.level} Risk</p>
            </div>
          </div>

          {/* Countries List */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Countries List</h3>
            <div className="bg-gray-50 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
              <div className="p-4">
                <div className="space-y-2">
                  {supplier.countries.map((country, index) => (
                    <div key={index} className="flex items-center space-x-3 py-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{country}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Supply Chain Analysis */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Supply Chain Analysis</h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-700 leading-relaxed">{analysis}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
