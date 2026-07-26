import PublicLayout from '@/components/layouts/PublicLayout';
import RegisterForm from '@/components/forms/RegisterForm';
import Card from '@/components/ui/Card';

export default function RegisterPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
            <p className="text-gray-600">Join Mathlers and start your mathematics journey</p>
          </div>
          <RegisterForm />
        </Card>
      </div>
    </PublicLayout>
  );
}
