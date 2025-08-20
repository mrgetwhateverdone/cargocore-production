import { useState } from "react";
import type { WarehousePerformanceRanking } from "@/types/api";
import { WarehouseModal } from "./WarehouseModal";

interface WarehousePerformanceSectionProps {
  rankings: WarehousePerformanceRanking[];
  isLoading?: boolean;
}

/**
 * This part of the code creates warehouse performance rankings table
 * Shows comprehensive performance-based sorting with interactive hover effects
 */
export function WarehousePerformanceSection({ rankings, isLoading }: WarehousePerformanceSectionProps) {
  const [showFullModal, setShowFullModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // This part of the code determines which rankings to show by default (top 10 + bottom 3)
  const topRankings = rankings.slice(0, 10);
  const bottomRankings = rankings.slice(-3);
  const defaultRankings = rankings.length > 13 ? [...topRankings, ...bottomRankings] : rankings;

  // This part of the code handles modal search and filtering
  const filteredRankings = rankings.filter(ranking => {
    const matchesSearch = ranking.warehouseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ranking.warehouseId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ranking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // This part of the code creates filter options with counts
  const statusCounts = rankings.reduce((acc, ranking) => {
    acc[ranking.status] = (acc[ranking.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filters = [
    {
      label: "All Status",
      value: "all",
      count: rankings.length,
      active: statusFilter === "all",
      onClick: () => setStatusFilter("all")
    },
    {
      label: "Excellent",
      value: "Excellent",
      count: statusCounts["Excellent"] || 0,
      active: statusFilter === "Excellent",
      onClick: () => setStatusFilter("Excellent")
    },
    {
      label: "Good",
      value: "Good", 
      count: statusCounts["Good"] || 0,
      active: statusFilter === "Good",
      onClick: () => setStatusFilter("Good")
    },
    {
      label: "Needs Attention",
      value: "Needs Attention",
      count: statusCounts["Needs Attention"] || 0,
      active: statusFilter === "Needs Attention",
      onClick: () => setStatusFilter("Needs Attention")
    }
  ];

  // This part of the code handles loading state
  if (isLoading) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Warehouse Performance Rankings
        </h2>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="animate-pulse p-4">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // This part of the code determines status badge colors
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Excellent":
        return "bg-green-100 text-green-800";
      case "Good":
        return "bg-blue-100 text-blue-800";
      case "Needs Attention":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // This part of the code creates a ranking row component
  const renderRankingRow = (warehouse: WarehousePerformanceRanking) => (
    <div
      key={warehouse.warehouseId}
      className="px-4 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="grid grid-cols-7 gap-4 items-center">
        {/* Rank */}
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-900">
            #{warehouse.rank}
          </span>
          {/* This part of the code adds trophy icons for top performers */}
          {warehouse.rank === 1 && (
            <span className="ml-2 text-yellow-500">🏆</span>
          )}
          {warehouse.rank === 2 && (
            <span className="ml-2 text-gray-400">🥈</span>
          )}
          {warehouse.rank === 3 && (
            <span className="ml-2 text-yellow-600">🥉</span>
          )}
        </div>

        {/* Warehouse ID and Name */}
        <div className="col-span-2">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 truncate">
              {warehouse.warehouseName}
            </span>
            <span className="text-xs text-gray-500">
              {warehouse.warehouseId}
            </span>
          </div>
        </div>

        {/* SLA Performance */}
        <div className="text-right">
          <div className="flex items-center justify-end">
            <span className="text-sm font-semibold text-gray-900">
              {warehouse.slaPerformance.toFixed(1)}%
            </span>
            <div 
              className={`w-2 h-2 rounded-full ml-2 ${
                warehouse.slaPerformance >= 95 ? 'bg-green-500' : 
                warehouse.slaPerformance >= 85 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            ></div>
          </div>
        </div>

        {/* Active Orders */}
        <div className="text-right">
          <span className="text-sm text-gray-900">
            {warehouse.activeOrders.toLocaleString()}
          </span>
        </div>

        {/* Average Fulfillment Time */}
        <div className="text-right">
          <span className="text-sm text-gray-900">
            {warehouse.avgFulfillmentTime.toFixed(1)}h
          </span>
        </div>

        {/* Status Badge */}
        <div className="text-center">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(warehouse.status)}`}>
            {warehouse.status}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mb-6">
      {/* Section Header with View Full Rankings Button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          Warehouse Performance Rankings
        </h2>
        {rankings.length > defaultRankings.length && (
          <button
            onClick={() => setShowFullModal(true)}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            View Full Rankings ({rankings.length})
          </button>
        )}
      </div>

      {/* Summary Banner */}
      {rankings.length > 13 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">📊 Showing top 10 and bottom 3 performers</span>
            <span className="mx-2">•</span>
            <span>Click "View Full Rankings" to see all {rankings.length} warehouses</span>
          </p>
        </div>
      )}
      
      {rankings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-500">
            No performance rankings available
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="grid grid-cols-7 gap-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
              <div>Rank</div>
              <div className="col-span-2">Warehouse</div>
              <div className="text-right">SLA %</div>
              <div className="text-right">Active Orders</div>
              <div className="text-right">Avg Time</div>
              <div className="text-center">Status</div>
            </div>
          </div>

          {/* Table Body - Show default rankings */}
          <div className="divide-y divide-gray-200">
            {defaultRankings.map(renderRankingRow)}
            

          </div>

          {/* Table Footer with summary */}
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>
                Showing {defaultRankings.length} of {rankings.length} warehouse{rankings.length !== 1 ? 's' : ''} sorted by performance score
              </span>
              <span>
                Performance rankings updated in real-time
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Full Rankings */}
      <WarehouseModal
        isOpen={showFullModal}
        onClose={() => setShowFullModal(false)}
        title={`Full Performance Rankings (${rankings.length})`}
        searchPlaceholder="Search by warehouse name or ID..."
        onSearch={setSearchTerm}
        filters={filters}
        showExport={true}
        onExport={() => {
          // This part of the code handles rankings data export
          const csvData = rankings.map(r => ({
            Rank: r.rank,
            Name: r.warehouseName,
            ID: r.warehouseId,
            SLA: r.slaPerformance,
            ActiveOrders: r.activeOrders,
            AvgTime: r.avgFulfillmentTime,
            Status: r.status
          }));
          
          const csv = [
            Object.keys(csvData[0]).join(','),
            ...csvData.map(row => Object.values(row).join(','))
          ].join('\n');
          
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'warehouse-rankings.csv';
          a.click();
        }}
      >
        {/* Modal Content */}
        <div className="space-y-4">
          {/* Results Summary */}
          <div className="text-sm text-gray-600">
            Showing {filteredRankings.length} of {rankings.length} warehouses
          </div>
          
          {/* Full Rankings Table */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="grid grid-cols-7 gap-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                <div>Rank</div>
                <div className="col-span-2">Warehouse</div>
                <div className="text-right">SLA %</div>
                <div className="text-right">Active Orders</div>
                <div className="text-right">Avg Time</div>
                <div className="text-center">Status</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {filteredRankings.map(renderRankingRow)}
            </div>
          </div>
          
          {filteredRankings.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No warehouses match your current filters.</p>
            </div>
          )}
        </div>
      </WarehouseModal>
    </div>
  );
}
