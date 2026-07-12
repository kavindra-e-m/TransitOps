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
    let csvContent = 'Category,Parameter,Value,Formula/Context\n';
    csvContent += `KPI,Fuel Efficiency,${summary.fuelEfficiency} L/100km,Avg liters consumed per 100km\n`;
    csvContent += `KPI,Fleet Utilization,${summary.fleetUtilization.toFixed(1)}%,active vehicles / total vehicles\n`;
    csvContent += `KPI,Operational Cost,$${summary.operationalCost.toFixed(2)},"Fuel + Maintenance + Expenses"\n`;
    csvContent += `KPI,Vehicle ROI,${(summary.vehicleROI * 100).toFixed(1)}%,"ROI = (Revenue - (Maint + Fuel)) / Acq Cost"\n`;

    csvContent += '\nMonthly Operational Spend\nMonth,Spend ($)\n';
    monthlyRevenue.forEach(r => { csvContent += `${r.month},${r.revenue}\n`; });

    csvContent += '\nTop Costliest Vehicles\nRegistration Number,Total Operational Cost ($)\n';
    costliestVehicles.forEach(r => { csvContent += `${r.reg_no},${r.totalCost}\n`; });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TransitOps_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('CSV report downloaded successfully.');
  } catch (err) {
    console.error(err);
    toast.error('Failed to generate CSV export.');
  }
};
