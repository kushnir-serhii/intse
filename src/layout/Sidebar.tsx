import { Navigation } from '@/components/common';
import { Logo } from '@/components/ui';

export const Sidebar: React.FC = () => {
  return (
    <aside className="bg-bg fixed bottom-0 z-50 w-screen flex-col border-t border-neutral-900 p-3 md:relative md:flex md:w-18.5 md:border-t-0 md:bg-transparent xl:min-h-full">
      <div className="hidden md:block">
        <Logo />
      </div>
      <Navigation />
    </aside>
  );
};
