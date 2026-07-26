import PublicLayout from '@/components/layouts/PublicLayout';
import LoginForm from '@/components/forms/LoginForm';
import Card from '@/components/ui/Card';

export default function LoginPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Login to your Mathlers account</p>
          </div>
          <LoginForm />
        </Card>
      </div>
    </PublicLayout>
  );
}
