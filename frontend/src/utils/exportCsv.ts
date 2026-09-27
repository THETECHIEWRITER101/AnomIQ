import { Anomaly } from '../services/api';

/**
 * Client-Side CSV Export Utility for Quality Teams & Maintenance Logs.
 * Runs 100% in the user's browser with 0 backend CPU or server memory footprint.
 */
export const exportAnomaliesToCsv = (anomalies: Anomaly[], filename: string = 'AnomIQ_Anomalies_Register.csv') => {
  if (!anomalies || anomalies.length === 0) return;

  const headers = [
    'Incident ID',
    'Anomaly Title',
    'Machine ID',
    'Production Line',
    'Severity',
    'Status',
    'Monitored Metric',
    'Observed Reading',
    'Threshold Limit',
    'Reporting Operator',
    'Detected Timestamp (UTC)',
    'Resolved Timestamp (UTC)'
  ];

  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = anomalies.map((a) => [
    escapeCsv(a.id),
    escapeCsv(a.title),
    escapeCsv(a.machine_id),
    escapeCsv(a.production_line),
    escapeCsv(a.severity),
    escapeCsv(a.status),
    escapeCsv(a.metric_name || 'N/A'),
    escapeCsv(a.metric_value !== undefined ? a.metric_value : 'N/A'),
    escapeCsv(a.threshold_value !== undefined ? a.threshold_value : 'N/A'),
    escapeCsv(a.operator_name || 'N/A'),
    escapeCsv(a.detected_at),
    escapeCsv(a.resolved_at || 'UNRESOLVED'),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
