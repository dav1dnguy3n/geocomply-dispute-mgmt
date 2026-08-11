"use client";
import { useState } from 'react';
import { Dispute } from '@/lib/api';
import { Search, Gavel } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DisputeList({ disputes, onSelectCase }: { disputes: Dispute[], onSelectCase: (c: Dispute) => void }) {
  const [search, setSearch] = useState('');

  const filtered = disputes.filter(d => 
    d.case_id.toLowerCase().includes(search.toLowerCase()) ||
    d.user_email.toLowerCase().includes(search.toLowerCase()) ||
    d.device_id.toLowerCase().includes(search.toLowerCase()) ||
    d.user_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by Email, User ID, Device ID..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-900/50">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="text-slate-400 border-b border-slate-700/50 bg-slate-800/50">
              <th className="py-3 px-4 font-medium">Case ID</th>
              <th className="py-3 px-4 font-medium">User Email</th>
              <th className="py-3 px-4 font-medium">Device ID</th>
              <th className="py-3 px-4 font-medium">Amount</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filtered.map(d => (
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
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">No disputes found matching your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
