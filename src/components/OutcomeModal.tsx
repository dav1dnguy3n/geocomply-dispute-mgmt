"use client";
import { useState } from 'react';
import { Dispute, updateOutcome } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle } from 'lucide-react';

export default function OutcomeModal({ dispute, onClose, onSuccess }: { dispute: Dispute, onClose: () => void, onSuccess: () => void }) {
  const [outcome, setOutcome] = useState(dispute.outcome || 'won');
  const [note, setNote] = useState(dispute.outcome_note || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await updateOutcome(dispute.case_id, outcome, note);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg glass-panel bg-slate-900/90 overflow-hidden"
        >
          <div className="flex justify-between items-center p-6 border-b border-slate-700/50">
            <h3 className="text-xl font-semibold text-white">Resolve Dispute</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <p className="text-sm text-slate-400 mb-1">Case ID</p>
              <p className="font-mono text-indigo-300">{dispute.case_id}</p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-300">Outcome</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'won', label: 'Won' },
                  { id: 'lost', label: 'Lost' },
                  { id: 'fraud_confirmed', label: 'Fraud Confirmed' }
                ].map((opt) => (
                  <label 
                    key={opt.id}
                    className={`
                      cursor-pointer rounded-xl border p-3 flex flex-col items-center justify-center gap-2 transition-all
                      ${outcome === opt.id ? 'bg-indigo-500/20 border-indigo-500 ring-2 ring-indigo-500/50' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'}
                    `}
                  >
                    <input 
                      type="radio" 
                      name="outcome" 
                      value={opt.id}
                      checked={outcome === opt.id}
                      onChange={(e) => setOutcome(e.target.value)}
                      className="hidden"
                    />
                    <span className="text-sm font-medium text-slate-200 text-center leading-tight">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Note (Optional)</label>
              <textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add context about this decision..."
                className="w-full h-24 bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 rounded-lg font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-indigo-900/20 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Outcome'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
