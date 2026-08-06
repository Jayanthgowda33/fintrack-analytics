'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Transaction {
  id: number;
  amount: string;
  type: string;
  note: string;
  date: string;
  category: number | null;
}

interface Category {
  id: number;
  name: string;
  type: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // form state
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [workspaceId, setWorkspaceId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const [txRes, catRes, wsRes] = await Promise.all([
        api.get('/transactions/'),
        api.get('/categories/'),
        api.get('/workspaces/'),
      ]);
      setTransactions(txRes.data.results || txRes.data);
      setCategories(catRes.data.results || catRes.data);
      const workspaces = wsRes.data.results || wsRes.data;
if (workspaces.length > 0) {
  setWorkspaceId(workspaces[0].id);
} else {
  const created = await api.post('/workspaces/', { name: 'My Workspace' });
  setWorkspaceId(created.data.id);
}
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadData();
  }, [router]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) {
      alert('No workspace found. Create one first.');
      return;
    }
    try {
      await api.post('/transactions/', {
        workspace: workspaceId,
        category: category || null,
        amount,
        type,
        note,
        date,
      });
      setAmount('');
      setNote('');
      setDate('');
      setCategory('');
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to add transaction');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this transaction?')) return;
    await api.delete(`/transactions/${id}/`);
    loadData();
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Transactions</h1>
          <a href="/dashboard" className="text-blue-600 underline">
            ← Back to Dashboard
          </a>
        </div>

        {/* Add Transaction Form */}
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-lg shadow mb-6 space-y-4">
          <h2 className="text-lg font-semibold">Add Transaction</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border rounded px-3 py-2"
              required
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">No Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded px-3 py-2"
              required
            />
            <input
              type="text"
              placeholder="Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="border rounded px-3 py-2 col-span-2"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Transaction
          </button>
        </form>

        {/* Transaction List */}
        <div className="bg-white rounded-lg shadow divide-y">
          {transactions.length === 0 ? (
            <p className="p-6 text-gray-500">No transactions yet.</p>
          ) : (
            transactions.map((t) => (
              <div key={t.id} className="flex justify-between items-center p-4">
                <div>
                  <p className="font-medium">{t.note || '(no note)'}</p>
                  <p className="text-sm text-gray-500">{t.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`font-semibold ${
                      t.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {t.type === 'income' ? '+' : '-'}₹{t.amount}
                  </span>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}