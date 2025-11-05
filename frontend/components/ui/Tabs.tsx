'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  className
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={cn('w-full', className)}>
      {/* Tab Headers */}
      <div className="flex gap-2 border-b border-white/10 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-3 font-medium transition-colors',
              activeTab === tab.id
                ? 'text-brand-primary'
                : 'text-gray-400 hover:text-brand-light'
            )}
          >
            {tab.icon}
            {tab.label}
            
            {/* Active indicator */}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-primary to-brand-secondary"
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeContent}
      </motion.div>
    </div>
  );
};

