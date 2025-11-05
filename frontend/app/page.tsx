'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Loading } from '@/components/ui/Loading';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = Cookies.get('auth_token');
    
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading size="lg" text="Loading..." />
    </div>
  );
}
