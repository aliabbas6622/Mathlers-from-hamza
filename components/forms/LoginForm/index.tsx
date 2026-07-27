'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const validatedData = loginSchema.parse(formData);

      const result = await signIn('credentials', {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false,
      });

      if (result?.error) {
        setToast({ type: 'error', message: 'Invalid email or password' });
      } else {
        // Fetch session to get user role
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        
        if (session?.user?.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/student/dashboard');
        }
        router.refresh();
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err: any) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setToast({ type: 'error', message: 'An error occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBypassLogin = async (role: 'student' | 'admin') => {
    setIsLoading(true);
    setErrors({});
    setToast(null);

    try {
      const result = await signIn('credentials', {
        bypassRole: role,
        redirect: false,
      });

      if (result?.error) {
        setToast({ type: 'error', message: 'Bypass login failed' });
        return;
      }

      router.push(role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
      router.refresh();
    } catch (error) {
      setToast({ type: 'error', message: 'Bypass login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="your@email.com"
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="Enter your password"
          required
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
          <a href="/forgot-password" className="text-sm text-red-primary hover:underline">
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full py-4 text-lg"
        >
          Login
        </Button>

        {process.env.NODE_ENV !== 'production' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              disabled={isLoading}
              onClick={() => handleBypassLogin('student')}
              className="w-full"
            >
              Bypass as Student
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={isLoading}
              onClick={() => handleBypassLogin('admin')}
              className="w-full"
            >
              Bypass as Admin
            </Button>
          </div>
        )}

        <p className="text-center text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-red-primary hover:underline font-semibold">
            Register
          </a>
        </p>
      </form>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default LoginForm;
