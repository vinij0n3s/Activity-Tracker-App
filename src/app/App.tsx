import { useState } from 'react';
import { ActivityTracker } from '@/app/components/ActivityTracker';

export default function App() {
  return (
    <div className="size-full bg-gradient-to-br from-blue-50 to-indigo-100 overflow-auto">
      <ActivityTracker />
    </div>
  );
}
