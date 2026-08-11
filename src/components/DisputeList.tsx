"use client";
import { Dispute } from '@/lib/api';
import { Search, Gavel, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  disputes: Dispute[];
  onSelectCase: (c: Dispute) => void;
  search: string;
  onSearchChange: (s: string) => void;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (p: number) => void;
  loading: boolean;
}

export default function DisputeList({ disputes, onSelectCase, search, onSearchChange, page, totalPages, total, limit, onPageChange, loading }: Props) {
  const startRecord = total > 0 ? (page - 1) * limit + 1 : 0;
  const endRecord = Math.min(page * limit, total);

  return (
    <div className="space-y-4">
      {/* Header Area: Search and Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Email, User ID, Device ID..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-4 text-sm text-slate-400">
          {total > 0 && (
            <span>Showing {startRecord}-{endRecord} of {total}</span>
          )}
          {totalPages > 1 && (
            <div className="flex gap-2">
              <button
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 bg-slate-800/50 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-2 bg-slate-800/50 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-900/50 relative">
        {loading && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        )}
        <table className="w-full table-fixed text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="text-slate-400 border-b border-slate-700/50 bg-slate-800/50">
              <th className="py-3 px-4 font-medium">Case ID</th>
              <th className="w-[400px] py-3 px-4 font-medium">User Email</th>
              <th className="py-3 px-4 font-medium">Device ID</th>
              <th className="py-3 px-4 font-medium">Amount</th>
              <th className="py-3 px-4 font-medium">Region</th>
              <th className="py-3 px-4 font-medium">Created At</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {disputes.map(d => (
                <motion.tr
                  key={d.case_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3 px-4 text-indigo-300 font-mono">{d.case_id}</td>
                  <td className="py-3 px-4 text-slate-300">{d.user_email}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-xs">{d.device_id}</td>
                  <td className="py-3 px-4 text-slate-200">{d.amount} {d.currency}</td>
                  <td className="py-3 px-4 text-slate-200">{d.region}</td>
                  <td className="py-3 px-4 text-slate-400 text-xs">
                    {new Date(d.created_at).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td className="py-3 px-4">
                    {d.status === 'open' ? (
                      <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded-md text-xs font-medium">Open</span>
                    ) : (
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md text-xs font-medium capitalize">
                        {d.outcome?.replace('_', ' ')}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectCase(d)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-xs font-medium shadow-lg shadow-indigo-900/20"
                    >
                      <Gavel className="w-4 h-4" />
                      {d.status === 'open' ? 'Resolve' : 'Edit'}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {disputes.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">No disputes found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


    </div>
  );
}
