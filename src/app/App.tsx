import { ActivityTracker } from '@/app/components/ActivityTracker';
import { InstallPrompt } from '@/app/components/InstallPrompt';

export default function App() {
  return (
    <div className="size-full bg-gradient-to-br from-blue-50 to-indigo-100 overflow-auto">
      <ActivityTracker />
      <InstallPrompt />
    </div>
  );
}
