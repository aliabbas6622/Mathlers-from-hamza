'use client';

import { useState } from 'react';
import { redirect } from 'next/navigation';
import { useAuth } from '@mathlers/hooks';
import GlassCard from '@mathlers/ui/GlassCard';
import PrimaryButton from '@mathlers/ui/PrimaryButton';

type Credential = { fullName: string; email: string; password: string; role: string };

export default function SchoolPeoplePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [role, setRole] = useState<'teacher' | 'student'>('student');
  const [rows, setRows] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [credentials, setCredentials] = useState<Credential[]>([]);

  if (!isLoading && !isAuthenticated) {
    redirect('/sign-in');
  }

  const provision = async () => {
    const accounts = rows.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
      const [fullName = '', email = '', grade] = line.split(',').map((value) => value.trim());
      return { fullName, email, ...(role === 'student' && { grade }) };
    });
    if (!accounts.length) {
      setNotice('Add at least one account.');
      return;
    }
    setBusy(true);
    setNotice('');
    setCredentials([]);
    try {
      const response = await fetch('/api/admin/provision-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, accounts }),
      });
      const data = await response.json() as { created?: Credential[]; error?: string };
      if (!response.ok) throw new Error(data.error || 'Unable to provision accounts.');
      setCredentials(data.created || []);
      setRows('');
      setNotice(`${data.created?.length || 0} account(s) created. Download the credentials now.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to provision accounts.');
    } finally {
      setBusy(false);
    }
  };

  const downloadCsv = () => {
    const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const content = ['Name,Email,Temporary password,Role', ...credentials.map((c) => [c.fullName, c.email, c.password, c.role].map(escape).join(','))].join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    link.download = `mathlers-credentials-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="border-b border-gray-200 pb-7">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">School workspace</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-950">School people</h1>
        <p className="mt-2 text-gray-600">Provision teacher and student accounts for your school. Credentials are returned once for secure distribution.</p>
      </div>
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-gray-950">Provision accounts</h2>
        <p className="mt-2 text-sm text-gray-600">Students never self-register. Generate a one-time Excel-compatible credentials file for school distribution.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-gray-700">
            Role
            <select value={role} onChange={(e) => setRole(e.target.value as typeof role)} className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5">
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </label>
        </div>
        <label className="mt-4 block text-sm font-semibold text-gray-700">
          Accounts
          <textarea value={rows} onChange={(e) => setRows(e.target.value)} rows={8} className="mt-2 w-full rounded-lg border border-gray-200 p-3 font-mono text-sm" placeholder={role === 'student' ? 'Ayesha Khan, ayesha@example.com, 7\nBilal Ahmed, bilal@example.com, 8' : 'Fatima Ali, fatima@example.com\nUsman Raza, usman@example.com'} />
        </label>
        <p className="mt-2 text-xs text-gray-500">One account per line: name, email{role === 'student' ? ', grade' : ''}. Maximum 100 at once.</p>
        <PrimaryButton onClick={() => void provision()} disabled={busy} className="mt-5">
          {busy ? 'Creating accounts…' : 'Create accounts'}
        </PrimaryButton>
        {notice && <p className="mt-4 text-sm text-gray-700" role="status">{notice}</p>}
        {credentials.length > 0 && (
          <PrimaryButton variant="secondary" onClick={downloadCsv} className="mt-3">
            Download Excel-compatible CSV
          </PrimaryButton>
        )}
      </GlassCard>
    </div>
  );
}
