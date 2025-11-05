'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/lib/store/authStore';
import { useToast } from '@/lib/hooks/useToast';

const registerSchema = z.object({
  userId: z.string().min(3, 'User ID must be at least 3 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const { register: registerUser, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        userId: data.userId,
        name: data.name,
        email: data.email || undefined,
        password: data.password
      });
      
      toast.success('Registration successful! Please login.');
      router.push('/login');
    } catch (error: any) {
      // Try to extract the error message from various possible fields
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Registration failed. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        {...register('userId')}
        label="User ID"
        type="text"
        leftIcon={<User size={18} />}
        error={errors.userId?.message}
        disabled={isLoading}
      />

      <Input
        {...register('name')}
        label="Full Name"
        type="text"
        leftIcon={<User size={18} />}
        error={errors.name?.message}
        disabled={isLoading}
      />

      <Input
        {...register('email')}
        label="Email (Optional)"
        type="email"
        leftIcon={<Mail size={18} />}
        error={errors.email?.message}
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
        Create Account
      </Button>
    </form>
  );
};

