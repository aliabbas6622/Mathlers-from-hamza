import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10">
      <div className="space-y-5 text-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Organization access</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">Create an admin or teacher account</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            Your account will remain pending until a Mathlers developer approves it. Student accounts are issued by schools.
          </p>
        </div>
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/access-pending"
        />
      </div>
    </div>
  );
}
