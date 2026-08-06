'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import AppLayout from '@/components/AppLayout';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

interface CategoryBreakdown {
  category__name: string;
  total: number;
}

interface Summary {
  income: number;
  expense: number;
  balance: number;
  by_category: CategoryBreakdown[];
}

interface TrendPoint {
  date: string;
  income: number | null;
  expense: number | null;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#14b8a6', '#ec4899'];

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    Promise.all([api.get('/dashboard/summary/'), api.get('/dashboard/trend/')])
      .then(([summaryRes, trendRes]) => {
        setSummary(summaryRes.data);
        setTrend(trendRes.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load dashboard');
        setLoading(false);
      });
  }, [router]);

  if (loading) return <AppLayout><div>Loading...</div></AppLayout>;
  if (error) return <AppLayout><div className="text-red-500">{error}</div></AppLayout>;
  if (!summary) return null;

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your financial activity</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Total Income</p>
          <p className="text-2xl font-bold text-emerald-600 mt-2">₹{summary.income.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Total Expense</p>
          <p className="text-2xl font-bold text-red-500 mt-2">₹{summary.expense.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Net Balance</p>
          <p className={`text-2xl font-bold mt-2 ${summary.balance >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
            ₹{summary.balance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-5 gap-5">
        {/* Bar chart - trend */}
        <div className="col-span-3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Income vs Expense Trend</h2>
          {trend.length === 0 ? (
            <p className="text-gray-400 text-sm">No transaction data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart - category breakdown */}
        <div className="col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Spending by Category</h2>
          {summary.by_category.length === 0 ? (
            <p className="text-gray-400 text-sm">No expense data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={summary.by_category}
                  dataKey="total"
                  nameKey="category__name"
                  outerRadius={90}
                  label={{ fontSize: 11 }}
                >
                  {summary.by_category.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </AppLayout>
  );
}