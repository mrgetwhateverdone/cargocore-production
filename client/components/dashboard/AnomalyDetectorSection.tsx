import type { Anomaly } from "@/types/api";

interface AnomalyDetectorSectionProps {
  anomalies: Anomaly[];
  isLoading?: boolean;
}

export function AnomalyDetectorSection({
  anomalies,
  isLoading,
}: AnomalyDetectorSectionProps) {
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 text-red-800 border-red-200";
      case "warning":
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
      case "info":
        return "bg-blue-50 text-blue-800 border-blue-200";
      default:
        return "bg-gray-50 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Anomaly Detector
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-100"
            >
              <div className="flex-1">
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-64 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-6 w-6 bg-gray-200 rounded animate-pulse ml-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Anomaly Detector
      </h2>

      {anomalies.length > 0 ? (
        <div className="space-y-3">
          {anomalies?.map((anomaly) => (
            <div
              key={anomaly.id}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all hover:opacity-80 cursor-pointer ${getSeverityStyles(anomaly.severity)}`}
            >
              <div className="flex-1">
                <h3 className="font-medium text-sm mb-1">{anomaly.title}</h3>
                <p className="text-sm opacity-90">{anomaly.description}</p>
              </div>
              <div className="ml-4 text-lg">{anomaly.icon}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-2xl mb-2">✅</div>
          <h3 className="font-medium text-green-800 mb-1">
            All Systems Normal
          </h3>
          <p className="text-sm text-green-700">
            No anomalies detected in current operations
          </p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        Real-time anomaly detection powered by operational data analysis
      </div>
    </div>
  );
}
