'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface UploadResult {
  created: number;
  errors: string[];
  total_errors: number;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [workspaceId, setWorkspaceId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    router.push('/login');
    return;
  }
  api.get('/workspaces/').then(async (res) => {
    const workspaces = res.data.results || res.data;
    if (workspaces.length > 0) {
      setWorkspaceId(workspaces[0].id);
    } else {
      const created = await api.post('/workspaces/', { name: 'My Workspace' });
      setWorkspaceId(created.data.id);
    }
  });
}, [router]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!file) {
      setError('Please select a file first');
      return;
    }
    if (!workspaceId) {
      setError('No workspace found');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('workspace', String(workspaceId));

    setUploading(true);
    try {
      const res = await api.post('/transactions/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Upload Data</h1>
          <a href="/dashboard" className="text-blue-600 underline">
            ← Back to Dashboard
          </a>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 mb-4 text-sm">
            Upload a CSV or Excel file with your transactions. Required columns:{' '}
            <code className="bg-gray-100 px-1 rounded">date</code>,{' '}
            <code className="bg-gray-100 px-1 rounded">amount</code>,{' '}
            <code className="bg-gray-100 px-1 rounded">type</code> (income/expense). Optional:{' '}
            <code className="bg-gray-100 px-1 rounded">category</code>,{' '}
            <code className="bg-gray-100 px-1 rounded">note</code>.
          </p>

          <form onSubmit={handleUpload} className="space-y-4">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full border rounded px-3 py-2"
            />

            <button
              type="submit"
              disabled={uploading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload File'}
            </button>
          </form>

          {error && (
            <p className="mt-4 text-red-500 text-sm">{error}</p>
          )}

          {result && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-green-700 font-medium">
                ✅ Successfully created {result.created} transactions.
              </p>
              {result.total_errors > 0 && (
                <div className="mt-2">
                  <p className="text-yellow-700 text-sm font-medium">
                    {result.total_errors} row(s) had errors:
                  </p>
                  <ul className="text-sm text-yellow-600 list-disc pl-5">
                    {result.errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
              <a href="/dashboard" className="text-blue-600 underline text-sm block mt-3">
                Go to Dashboard to see updated data →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}