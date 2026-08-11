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
  const [loadingDisputes, setLoadingDisputes] = useState(false);

  const [selectedCase, setSelectedCase] = useState<Dispute | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadTrends = async () => {
    try {
      const trendsData = await fetchTrends();
      setTrends(trendsData);
    } catch (err) {
      console.error(err);
    }
  };

  const loadDisputes = async () => {
    setLoadingDisputes(true);
    try {
      const res = await fetchDisputes(page, 50, search);
      setDisputes(res.data);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDisputes(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadTrends(), loadDisputes()]);
      setLoading(false);
    };
    init();
  }, []); // Only on mount

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        loadDisputes();
      }, 300); // Debounce search
      return () => clearTimeout(timer);
    }
  }, [page, search]);

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
          <section className="glass-panel p-6 relative">
            <h2 className="text-xl font-semibold mb-6 text-white/90">Recent Disputes</h2>
            <DisputeList
              disputes={disputes}
              onSelectCase={(c) => setSelectedCase(c)}
              search={search}
              onSearchChange={(val) => { setSearch(val); setPage(1); }}
              page={page}
              totalPages={totalPages}
              total={total}
              limit={50}
              onPageChange={(p) => setPage(p)}
              loading={loadingDisputes}
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
            loadDisputes();
            loadTrends();
          }}
        />
      )}
    </main>
  );
}
