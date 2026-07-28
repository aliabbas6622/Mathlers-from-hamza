import Link from 'next/link';
import PublicLayout from '@/components/layouts/PublicLayout';

type LegalNoticeProps = {
  title: string;
  children: React.ReactNode;
};

export default function LegalNotice({ title, children }: LegalNoticeProps) {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-3xl px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Mathlers legal</p>
        <h1 className="mt-3 text-4xl font-bold text-gray-900">{title}</h1>
        <div className="mt-8 space-y-6 rounded-2xl border border-gray-200 bg-white p-8 text-gray-700 shadow-sm">
          {children}
        </div>
        <p className="mt-8 text-sm text-gray-500">Questions about these notices? <a className="text-brand-primary hover:underline" href="mailto:info@mathlers.com?subject=Mathlers%20legal%20question">Contact Mathlers</a>.</p>
        <Link href="/landing" className="mt-6 inline-block text-sm font-semibold text-brand-primary hover:underline">Back to Mathlers</Link>
      </section>
    </PublicLayout>
  );
}
