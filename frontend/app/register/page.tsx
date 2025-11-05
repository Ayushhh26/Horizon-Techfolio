'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard className="p-8">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="flex items-center justify-center gap-2 mb-3"
            >
              <TrendingUp className="h-10 w-10 text-brand-primary" />
              <h1 className="text-4xl font-bold gradient-text">
                Horizon
              </h1>
            </motion.div>
            <p className="text-gray-400 text-sm">
              Technical Analysis Portfolio Management
            </p>
          </div>

          {/* Register Form */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2 text-brand-light">
              Create Account
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Start your investment journey with $10,000
            </p>
            
            <RegisterForm />
          </div>

          {/* Login Link */}
          <div className="text-center pt-6 border-t border-white/10">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link 
                href="/login"
                className="text-brand-primary hover:text-brand-secondary transition-colors font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </GlassCard>

        {/* Additional Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6 text-gray-500 text-sm"
        >
          Free virtual trading • Real market data
        </motion.p>
      </motion.div>
    </div>
  );
}

