import toast from 'react-hot-toast';

/**
 * Builds and triggers a CSV download for the analytics report.
 * @param {object} summary          - from GET /analytics/summary
 * @param {Array}  monthlyRevenue   - from GET /analytics/monthly-revenue
 * @param {Array}  costliestVehicles - from GET /analytics/top-costliest-vehicles
 */
export const exportAnalyticsCSV = (summary, monthlyRevenue = [], costliestVehicles = []) => {
  if (!summary) {
    toast.error('No analytics data available to export.');
    return;
  }
  try {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'Category,Parameter,Value,Formula/Context\n';
    csv += `KPI,Fuel Efficiency,${summary.fuelEfficiency} L/100km,Avg liters consumed per 100km\n`;
    csv += `KPI,Fleet Utilization,${summary.fleetUtilization.toFixed(1)}%,active vehicles / total vehicles\n`;
    csv += `KPI,Operational Cost,$${summary.operationalCost.toFixed(2)},"Fuel + Maintenance + Expenses"\n`;
    csv += `KPI,Vehicle ROI,${(summary.vehicleROI * 100).toFixed(1)}%,"ROI = (Revenue - (Maint + Fuel)) / Acq Cost"\n`;

    csv += '\nMonthly Revenue Records\nMonth,Revenue ($)\n';
    monthlyRevenue.forEach(r => { csv += `${r.month},${r.revenue}\n`; });

    csv += '\nTop Costliest Vehicles\nRegistration Number,Total Operational Cost ($)\n';
    costliestVehicles.forEach(r => { csv += `${r.reg_no},${r.totalCost}\n`; });

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `TransitOps_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV report downloaded successfully.');
  } catch {
    toast.error('Failed to generate CSV export.');
  }
};
