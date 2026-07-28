import PublicLayout from '@mathlers/ui/PublicLayout';
import Link from 'next/link';

export default function RequestAccessPage() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-2xl px-6 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Mathlers access</p>
        <h1 className="mt-3 text-4xl font-bold text-gray-900">Access is provided by your organization</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-gray-600">
          Students receive access from their school or competition organizer. School administrators and teachers can request a Mathlers workspace for their organization.
        </p>
        <Link href="/sign-up" className="mt-8 inline-flex rounded-xl border border-transparent bg-brand-primary px-6 py-3 font-semibold text-white transition-colors hover:border-brand-dark hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2">
          Create admin or teacher account
        </Link>
        <p className="mt-5 text-sm text-gray-500">Already invited? Use the sign-in link in the navigation.</p>
      </section>
    </PublicLayout>
  );
}
