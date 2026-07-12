import React from 'react';
import { Download } from 'lucide-react';
import { exportAnalyticsCSV } from '../../utils/exportCSV';

/**
 * ExportReportButton
 *
 * Reusable export trigger for the analytics report.
 * Props:
 *   summary           {object} - from GET /analytics/summary
 *   monthlyRevenue    {Array}  - from GET /analytics/monthly-revenue
 *   costliestVehicles {Array}  - from GET /analytics/top-costliest-vehicles
 *   disabled          {bool}   - disables button while data is loading
 */
const ExportReportButton = ({ summary, monthlyRevenue = [], costliestVehicles = [], disabled = false }) => (
  <button
    onClick={() => exportAnalyticsCSV(summary, monthlyRevenue, costliestVehicles)}
    disabled={disabled}
    className="px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-[#0B0E14] font-semibold text-xs rounded-lg shadow-lg shadow-accent/10 border border-transparent transition-all flex items-center gap-2 select-none"
  >
    <Download size={14} />
    Export CSV Report
  </button>
);

export default ExportReportButton;
export { ExportReportButton };
