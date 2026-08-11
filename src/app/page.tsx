"use client";

import { useEffect, useState } from "react";
import { fetchDisputes, fetchTrends, Dispute } from "@/lib/api";
import TrendChart from "@/components/TrendChart";
import DisputeList from "@/components/DisputeList";
import OutcomeModal from "@/components/OutcomeModal";
import { motion } from "framer-motion";
import { LayoutDashboard } from "lucide-react";

export default function Dashboard() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedCase, setSelectedCase] = useState<Dispute | null>(null);

  const loadData = async () => {
    try {
      const [disputesData, trendsData] = await Promise.all([
        fetchDisputes(),
        fetchTrends()
      ]);
      setDisputes(disputesData);
      setTrends(trendsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-12 space-y-8">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <div className="p-3 bg-indigo-500/20 rounded-xl glass-panel">
          <LayoutDashboard className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dispute Center</h1>
          <p className="text-slate-400">Track and manage customer chargebacks</p>
        </div>
      </motion.header>

      {loading ? (
        <div className="flex justify-center py-20 text-indigo-400">Loading data...</div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {/* Trend View */}
          <section className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-6 text-white/90">Resolution Trends</h2>
            <TrendChart trends={trends} />
          </section>

          {/* Dispute List */}
          <section className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-6 text-white/90">Recent Disputes</h2>
            <DisputeList 
              disputes={disputes} 
              onSelectCase={(c) => setSelectedCase(c)} 
            />
          </section>
        </motion.div>
      )}

      {/* Outcome Modal */}
      {selectedCase && (
        <OutcomeModal 
          dispute={selectedCase} 
          onClose={() => setSelectedCase(null)}
          onSuccess={() => {
            setSelectedCase(null);
            loadData();
          }}
        />
      )}
    </main>
  );
}
