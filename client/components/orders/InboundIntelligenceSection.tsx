import { useState } from "react";
import { Package, AlertTriangle, Clock, TrendingDown, Globe, Search } from "lucide-react";
import type { InboundShipmentIntelligence, OrderData } from "@/types/api";

interface InboundIntelligenceSectionProps {
  inboundIntelligence: InboundShipmentIntelligence;
  isLoading?: boolean;
}

export function InboundIntelligenceSection({ inboundIntelligence, isLoading }: InboundIntelligenceSectionProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'delayed' | 'all'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // This part of the code defines the intelligence overview cards
  const intelligenceCards = [
    {
      title: "Total Inbound",
      value: inboundIntelligence.totalInbound,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Active shipments",
    },
    {
      title: "Delayed Shipments",
      value: `${inboundIntelligence.delayedShipments.count} (${inboundIntelligence.delayedShipments.percentage.toFixed(1)}%)`,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: "Behind schedule",
    },
    {
      title: "Avg Delay Days",
      value: inboundIntelligence.avgDelayDays.toFixed(1),
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      description: "Average delay period",
    },
    {
      title: "Value at Risk",
      value: `$${Math.round(inboundIntelligence.valueAtRisk / 1000)}K`,
      icon: TrendingDown,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Potential impact",
    },
  ];

  // This part of the code filters data based on the active tab and search term
  const getFilteredData = () => {
    let data: OrderData[] = [];
    
    switch (activeTab) {
      case 'overview':
        data = inboundIntelligence.recentShipments || [];
        break;
      case 'delayed':
        data = inboundIntelligence.delayedShipmentsList || [];
        break;
      case 'all':
        data = [...(inboundIntelligence.recentShipments || []), ...(inboundIntelligence.delayedShipmentsList || [])];
        break;
    }

    if (searchTerm) {
      data = data.filter(item =>
        item.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ship_from_country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product_sku?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return data;
  };

  // This part of the code formats currency values
  const formatCurrency = (value: number | null) => {
    if (!value) return '$0';
    return `$${value.toLocaleString()}`;
  };

  // This part of the code formats dates for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Inbound Shipments Intelligence
        </h2>
        
        {/* Intelligence Overview Cards Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mr-3" />
                <div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-1" />
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Data Table Loading */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredData = getFilteredData();

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Inbound Shipments Intelligence
      </h2>

      {/* This part of the code displays the intelligence overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {intelligenceCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${card.bgColor} mr-3`}>
                  <IconComponent className={`h-5 w-5 ${card.color}`} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">
                    {card.title}
                  </div>
                  <div className={`text-lg font-bold ${card.color}`}>
                    {card.value}
                  </div>
                  <div className="text-xs text-gray-500">
                    {card.description}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* This part of the code displays geopolitical risk warning if applicable */}
      {inboundIntelligence.geopoliticalRisks && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Globe className="h-5 w-5 text-amber-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-amber-800">
                Geopolitical Risk Alert
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                {inboundIntelligence.geopoliticalRisks.affectedShipments} shipments from risk-prone regions: {' '}
                {inboundIntelligence.geopoliticalRisks.riskCountries.join(', ')}. 
                Average delay increase: +{inboundIntelligence.geopoliticalRisks.avgDelayIncrease} days.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* This part of the code displays the data table with tabs */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview ({inboundIntelligence.recentShipments?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('delayed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'delayed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Delayed ({inboundIntelligence.delayedShipments.count})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Shipments
            </button>
          </nav>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search PO numbers, suppliers, origins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {filteredData.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No shipments found matching your criteria</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item, index) => (
                  <tr key={`${item.order_id}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.product_sku || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.supplier || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 text-gray-400 mr-2" />
                        {item.ship_from_country || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(item.expected_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency((item.unit_cost || 0) * item.expected_quantity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.expected_quantity} / {item.received_quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
