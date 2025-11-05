'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/lib/store/authStore';
import { useToast } from '@/lib/hooks/useToast';

const loginSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const { login, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      // Try to extract the error message from various possible fields
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Login failed. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        {...register('userId')}
        label="User ID"
        type="text"
        leftIcon={<Mail size={18} />}
        error={errors.userId?.message}
        disabled={isLoading}
      />

      <Input
        {...register('password')}
        label="Password"
        type="password"
        leftIcon={<Lock size={18} />}
        error={errors.password?.message}
        disabled={isLoading}
      />

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        isLoading={isLoading}
        disabled={isLoading}
      >
        Sign In
      </Button>
    </form>
  );
};

