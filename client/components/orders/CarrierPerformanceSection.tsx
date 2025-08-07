interface CarrierPerformanceSectionProps {
  isLoading?: boolean;
}

export function CarrierPerformanceSection({ isLoading }: CarrierPerformanceSectionProps) {
  if (isLoading) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Carrier Performance
        </h2>
        <div className="h-48 bg-gray-100 border border-gray-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Carrier Performance
      </h2>
      
      {/* This part of the code shows a message when carrier data is not available */}
      <div className="h-48 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            Information not in dataset.
          </p>
        </div>
      </div>
    </div>
  );
}
