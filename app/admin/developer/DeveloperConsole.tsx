'use client';

import { useState } from 'react';
import Link from 'next/link';

type School = { id: string; name: string };
type Applicant = { id: string; fullName: string; email: string };
type Credential = { fullName: string; email: string; password: string; role: string };

const downloadCsv = (credentials: Credential[]) => {
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const content = ['Name,Email,Temporary password,Role', ...credentials.map((credential) => [credential.fullName, credential.email, credential.password, credential.role].map(escape).join(','))].join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  link.download = `mathlers-credentials-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export default function DeveloperConsole({ schools, applicants = [], allowedRoles = ['admin', 'teacher', 'student'], title = 'Platform controls', description = 'Create school-scoped accounts and use the operations portals to configure learning, competitions, themes, and curriculum.', showPlatformControls = true }: { schools: School[]; applicants?: Applicant[]; allowedRoles?: Array<'admin' | 'teacher' | 'student'>; title?: string; description?: string; showPlatformControls?: boolean }) {
  const [role, setRole] = useState<'admin' | 'teacher' | 'student'>(allowedRoles[0] ?? 'student');
  const [schoolOptions, setSchoolOptions] = useState(schools);
  const [schoolId, setSchoolId] = useState(schools[0]?.id || '');
  const [rows, setRows] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [newSchool, setNewSchool] = useState({ name: '', city: '', address: '', contactNumber: '', email: '' });

  const provision = async () => {
    const accounts = rows.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
      const [fullName = '', email = '', grade] = line.split(',').map((value) => value.trim());
      return { fullName, email, ...(role === 'student' && { grade }) };
    });
    if (!schoolId || !accounts.length) return setNotice('Choose a school and add at least one account.');
    setBusy(true); setNotice(''); setCredentials([]);
    try {
      const response = await fetch('/api/admin/provision-users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role, schoolId, accounts }) });
      const data = await response.json() as { created?: Credential[]; error?: string };
      if (!response.ok) throw new Error(data.error || 'Unable to provision accounts.');
      setCredentials(data.created || []);
      setRows('');
      setNotice(`${data.created?.length || 0} account(s) created. Download the credentials now; Mathlers does not retain the plaintext passwords.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to provision accounts.');
    } finally { setBusy(false); }
  };

  const createSchool = async () => {
    const response = await fetch('/api/admin/schools', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newSchool) });
    const data = await response.json() as { school?: School; error?: string };
    const school = data.school;
    if (!response.ok || !school) return setNotice(data.error || 'Unable to create school.');
    setSchoolOptions((current) => [...current, school].sort((a, b) => a.name.localeCompare(b.name)));
    setSchoolId(school.id); setNewSchool({ name: '', city: '', address: '', contactNumber: '', email: '' }); setNotice(`${school.name} is ready for account provisioning.`);
  };

  return <div className="mx-auto max-w-5xl space-y-8">
    <div className="border-b border-gray-200 pb-7"><p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">{showPlatformControls ? 'Developer console' : 'School workspace'}</p><h1 className="mt-1 text-3xl font-bold text-gray-950">{title}</h1><p className="mt-2 text-gray-600">{description}</p></div>
    {showPlatformControls && applicants.length > 0 && <section className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-xl font-bold text-gray-950">Pending access requests</h2>
      <p className="mt-2 text-sm text-gray-600">Choose a role and school below, then select an applicant to prepare their approval.</p>
      <div className="mt-4 divide-y divide-gray-100">
        {applicants.map((applicant) => <div key={applicant.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div><p className="font-semibold text-gray-900">{applicant.fullName}</p><p className="text-sm text-gray-500">{applicant.email}</p></div>
          <button onClick={() => setRows(`${applicant.fullName}, ${applicant.email}`)} className="rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-brand-primary hover:border-brand-primary">Select applicant</button>
        </div>)}
      </div>
    </section>}
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-xl font-bold text-gray-950">Provision accounts</h2><p className="mt-2 text-sm text-gray-600">Students never self-register. Generate a one-time Excel-compatible credentials file for school distribution; passwords are only returned in this browser response.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2"><label className="text-sm font-semibold text-gray-700">Role<select value={role} onChange={(event) => setRole(event.target.value as typeof role)} className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5">{allowedRoles.includes('admin') && <option value="admin">School admin</option>}{allowedRoles.includes('teacher') && <option value="teacher">Teacher</option>}{allowedRoles.includes('student') && <option value="student">Student</option>}</select></label><label className="text-sm font-semibold text-gray-700">School<select value={schoolId} onChange={(event) => setSchoolId(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5">{schoolOptions.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}</select></label></div>
      <label className="mt-4 block text-sm font-semibold text-gray-700">Accounts<textarea value={rows} onChange={(event) => setRows(event.target.value)} rows={8} className="mt-2 w-full rounded-lg border border-gray-200 p-3 font-mono text-sm" placeholder={role === 'student' ? 'Ayesha Khan, ayesha@example.com, 7\nBilal Ahmed, bilal@example.com, 8' : 'Fatima Ali, fatima@example.com\nUsman Raza, usman@example.com'} /></label>
      <p className="mt-2 text-xs text-gray-500">One account per line: name, email{role === 'student' ? ', grade' : ''}. Maximum 100 at once.</p>
      <button disabled={busy || !schoolOptions.length} onClick={() => void provision()} className="mt-5 rounded-lg border border-transparent bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:border-brand-dark hover:bg-brand-dark disabled:opacity-50">{busy ? 'Creating accounts…' : 'Create accounts'}</button>
      {notice && <p className="mt-4 text-sm text-gray-700" role="status">{notice}</p>}
      {credentials.length > 0 && <button onClick={() => downloadCsv(credentials)} className="mt-3 rounded-lg border border-transparent px-4 py-2 text-sm font-semibold text-brand-primary hover:border-brand-primary hover:bg-brand-lighter">Download Excel-compatible CSV</button>}
    </section>
    {showPlatformControls && <><section className="rounded-xl border border-gray-200 bg-white p-6"><h2 className="text-xl font-bold text-gray-950">Add a school</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{(['name', 'city', 'address', 'contactNumber', 'email'] as const).map((field) => <input key={field} value={newSchool[field]} onChange={(event) => setNewSchool((current) => ({ ...current, [field]: event.target.value }))} placeholder={{ name: 'School name', city: 'City', address: 'Address', contactNumber: 'Contact number', email: 'School email (optional)' }[field]} className="rounded-lg border border-gray-200 px-3 py-2.5" />)}</div><button onClick={() => void createSchool()} className="mt-4 rounded-lg border border-transparent px-4 py-2 text-sm font-semibold text-brand-primary hover:border-brand-primary hover:bg-brand-lighter">Create school</button></section><section className="grid gap-4 md:grid-cols-3"><Link href="/admin/settings" className="rounded-xl border border-gray-200 bg-white p-5 hover:border-brand-primary"><h2 className="font-bold text-gray-950">Theme variants</h2><p className="mt-2 text-sm text-gray-600">Set distinct global, staff, and student visual palettes.</p></Link><Link href="/admin/content" className="rounded-xl border border-gray-200 bg-white p-5 hover:border-brand-primary"><h2 className="font-bold text-gray-950">Learning configuration</h2><p className="mt-2 text-sm text-gray-600">Adjust curriculum structure and available subjects.</p></Link><Link href="/admin/competitions" className="rounded-xl border border-gray-200 bg-white p-5 hover:border-brand-primary"><h2 className="font-bold text-gray-950">Competition variants</h2><p className="mt-2 text-sm text-gray-600">Configure eligibility, sections, schedules, and access modes.</p></Link></section></>}
  </div>;
}
