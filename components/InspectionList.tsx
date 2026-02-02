
import React, { useState } from 'react';
import { Inspection, User } from '../types';
import { ICONS, APP_NAME } from '../constants';

interface InspectionListProps {
  inspections: Inspection[];
  users: User[];
  currentUser: User;
  onDeleteInspection: (id: string) => void;
}

const InspectionList: React.FC<InspectionListProps> = ({ inspections, users, currentUser, onDeleteInspection }) => {
  const [locoFilter, setLocoFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(''); // Format: YYYY-MM-DD from input

  const canDelete = currentUser.role === 'admin' || currentUser.role === 'supervisor' || currentUser.role === 'officer';

  const getUserNameById = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.username} (${user.hrmsId})` : 'Unknown Staff';
  };

  const filtered = inspections.filter(i => {
    // Loco Number Filter
    const matchesLoco = i.locoNumber.toLowerCase().includes(locoFilter.toLowerCase());
    
    // Date Filter (timestamp is DD/MM/YYYY HH:mm:ss)
    let matchesDate = true;
    if (dateFilter) {
      const [year, month, day] = dateFilter.split('-');
      const formattedFilterDate = `${day}/${month}/${year}`;
      matchesDate = i.timestamp.startsWith(formattedFilterDate);
    }

    return matchesLoco && matchesDate;
  });

  const handleDelete = (id: string, locoNo: string) => {
    if (!canDelete) return;
    if (confirm(`Are you sure you want to delete inspection record for Loco #${locoNo}? This action cannot be undone locally.`)) {
      onDeleteInspection(id);
    }
  };

  const exportToCSV = () => {
    const dataToExport = filtered;
    if (dataToExport.length === 0) return;

    const headers = ["Loco Number", "Base Shed", "Schedule", "Pantograph", "Timestamp", "Inspected By", "Sync Status", "Reference ID"];
    const rows = dataToExport.map(i => [
      `"${i.locoNumber}"`,
      `"${i.baseShed}"`,
      `"${i.schedule}"`,
      `"${i.pantographNumber}"`,
      `"${i.timestamp}"`,
      `"${getUserNameById(i.userId)}"`,
      `"${i.syncStatus}"`,
      `"${i.id}"`
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Loco_Filtered_Data_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToHTMLReport = () => {
    const dataToExport = filtered;
    if (dataToExport.length === 0) return;

    const rowsHtml = dataToExport.map(i => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; font-weight: bold;">${i.locoNumber}</td>
        <td style="padding: 12px;">${i.baseShed}</td>
        <td style="padding: 12px;">${i.schedule}</td>
        <td style="padding: 12px;">${i.pantographNumber}</td>
        <td style="padding: 12px; font-family: monospace; font-size: 11px;">${i.timestamp}</td>
        <td style="padding: 12px; font-size: 12px;">${getUserNameById(i.userId)}</td>
        <td style="padding: 12px; text-align: center;">
          <img src="${i.photoUrl}" style="width: 150px; height: 110px; object-fit: cover; border-radius: 8px; border: 1px solid #cbd5e1;" />
        </td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Filtered Locomotive Inspection Report</title>
        <style>
          body { font-family: sans-serif; color: #1e293b; padding: 40px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #f8fafc; padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; }
          .header { border-bottom: 4px solid #312e81; padding-bottom: 20px; margin-bottom: 30px; }
          .footer { margin-top: 40px; font-size: 12px; color: #64748b; text-align: center; }
          .filter-info { font-size: 12px; color: #64748b; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Locomotive Inspection Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <div class="filter-info">
            Applied Filters: 
            ${locoFilter ? `Loco: ${locoFilter} | ` : ''}
            ${dateFilter ? `Date: ${dateFilter} | ` : ''}
            Records: ${dataToExport.length}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Loco No</th>
              <th>Base Shed</th>
              <th>Schedule</th>
              <th>Panto</th>
              <th>Timestamp</th>
              <th>Inspected By</th>
              <th>Visual Proof</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <div class="footer">
          <p>This is a computer-generated report from ${APP_NAME}. All data and images are stored securely on Google Drive.</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Loco_Filtered_Report_${new Date().getTime()}.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSyncBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-md border border-amber-200 uppercase"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Pending</span>;
      case 'synced':
        return <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-200 uppercase"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Synced</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Search & Filter</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex-1 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 flex items-center gap-3">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Loco Number..."
              className="bg-transparent text-sm text-slate-700 font-medium outline-none w-full"
              value={locoFilter}
              onChange={e => setLocoFilter(e.target.value)}
            />
          </div>

          <div className="flex-1 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 flex items-center gap-3">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <input 
              type="date" 
              className="bg-transparent text-sm text-slate-700 font-medium outline-none w-full"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button 
              onClick={exportToCSV}
              disabled={filtered.length === 0}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-200 transition-all disabled:opacity-30"
            >
              CSV
            </button>
            <button 
              onClick={exportToHTMLReport}
              disabled={filtered.length === 0}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-30 shadow-lg shadow-indigo-100"
            >
              PDF/HTML
            </button>
          </div>
        </div>
        { (locoFilter || dateFilter) && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-[10px] text-slate-500 font-medium italic">
              Showing {filtered.length} of {inspections.length} records
            </p>
            <button 
              onClick={() => { setLocoFilter(''); setDateFilter(''); }}
              className="text-[10px] text-indigo-600 font-bold hover:underline"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <ICONS.History />
          </div>
          <h3 className="text-xl font-bold text-slate-700">No matching records</h3>
          <p className="text-slate-400 mt-2">Try adjusting your filters or create a new entry.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 pb-20">
          {filtered.map(item => (
            <div key={item.id} className="group bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-48 h-48 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                <img src={item.photoUrl} alt="Loco" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2">
                  {getSyncBadge(item.syncStatus)}
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-2xl font-bold text-slate-800">{item.locoNumber}</h4>
                    <p className="text-indigo-600 font-semibold text-sm">{item.baseShed} Shed</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-slate-50 text-slate-700 text-[10px] font-bold rounded-full border border-slate-100 uppercase">
                      Schedule {item.schedule}
                    </span>
                    {canDelete && (
                      <button 
                        onClick={() => handleDelete(item.id, item.locoNumber)}
                        className="p-1.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-colors border border-rose-100"
                        title="Delete record"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pantograph</p>
                    <p className="text-slate-700 font-semibold">{item.pantographNumber}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Inspected By</p>
                    <p className="text-slate-700 font-semibold truncate text-xs">{getUserNameById(item.userId)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                   <div className="flex items-center gap-2 text-slate-400 text-xs font-medium font-mono">
                    {item.timestamp}
                   </div>
                   <div className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                     Verified Report
                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InspectionList;
