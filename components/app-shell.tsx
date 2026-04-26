import { useState } from "react";
import { Home, Bell, User, PlusCircle, Search } from "lucide-react";
import HomeFeed from "./screens/home-feed";
import Notifications from "./screens/notifications";
import Profile from "./screens/profile";
import CreatePost from "./screens/create-post";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useAuth } from "./auth-provider";

export default function AppShell() {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'notifications' | 'profile'>('home');
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const { profile } = useAuth();

  const handleNavigateProfile = (userId?: string) => {
    setViewingUserId(userId || profile?.id || null);
    setActiveTab('profile');
  };

  type Tab = {
    id: string;
    icon: React.ElementType;
    label: string;
    action?: () => void;
  };

  const tabs: Tab[] = [
    { id: 'home', icon: Home, label: 'Home', action: () => { setActiveTab('home'); setViewingUserId(null); } },
    { id: 'search', icon: Search, label: 'Search', action: () => { setActiveTab('search'); setViewingUserId(null); } },
    { id: 'create', icon: PlusCircle, label: 'Post', action: () => setIsCreatingPost(true) },
    { id: 'notifications', icon: Bell, label: 'Notifications', action: () => { setActiveTab('notifications'); setViewingUserId(null); } },
    { id: 'profile', icon: User, label: 'Profile', action: () => handleNavigateProfile() }
  ];

  return (
    <div className="flex h-[100dvh] w-full bg-white sm:bg-slate-50 overflow-hidden relative mx-auto">
      {/* Desktop Sidebar */}
      <div className="hidden sm:flex sm:w-20 lg:w-64 flex-col justify-between border-r border-slate-200 bg-white shadow-sm z-40 fixed h-full lg:left-[calc(50%-512px)] sm:left-0 z-50">
        <div className="p-4 flex flex-col gap-2 relative h-full">
          {/* Logo */}
          <div className="mb-6 flex w-12 h-12 rounded-full hover:bg-blue-50 items-center justify-center text-blue-600 transition-colors cursor-pointer mx-auto lg:mx-0">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-8 h-8 fill-current"><path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"></path></svg>
          </div>
          
          {/* Nav Items */}
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            const isViewingOwnProfile = !viewingUserId || viewingUserId === profile?.id;
            const isProfileTab = t.id === 'profile';
            const isTabActive = isActive && (!isProfileTab || isViewingOwnProfile);
            return (
               <button
                 key={t.id}
                 onClick={() => t.action ? t.action() : setActiveTab(t.id as any)}
                 className={cn(
                   "flex items-center gap-4 p-3 rounded-full hover:bg-slate-100 transition-colors w-fit lg:w-full lg:pr-6 mx-auto lg:mx-0",
                   isTabActive && t.id !== 'create' ? "font-bold" : "font-medium"
                 )}
              >
                <t.icon className={cn("w-7 h-7", isTabActive && t.id !== 'create' ? "text-slate-900" : "text-slate-700")} />
                <span className="hidden lg:block text-[21px] text-slate-900">{t.label}</span>
              </button>
            );
          })}

          <button 
            onClick={() => setIsCreatingPost(true)}
            className="hidden lg:block w-full mt-4 bg-blue-600 text-white font-bold rounded-full py-4 text-lg shadow-lg hover:bg-blue-700 transition-colors"
          >
            Post
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 relative bg-white border-x border-slate-100 max-w-2xl mx-auto w-full shadow-sm sm:shadow-none min-h-screen pb-[env(safe-area-inset-bottom)] sm:ml-20 lg:ml-64">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && <HomeFeed key="home" onNavigateProfile={handleNavigateProfile} />}
          {activeTab === 'notifications' && <Notifications key="notifications" />}
          {activeTab === 'profile' && <Profile key={`profile-${viewingUserId}`} userId={viewingUserId} />}
          {activeTab === 'search' && (
             <div key="search" className="p-8 mt-20 text-center text-slate-500 font-medium">Search feature coming soon...</div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="sm:hidden absolute bottom-0 w-full bg-white border-t border-slate-200 flex items-center justify-around pb-[env(safe-area-inset-bottom)] z-40">
        {tabs.map(t => {
          const isActive = activeTab === t.id;
          const isViewingOwnProfile = !viewingUserId || viewingUserId === profile?.id;
          const isProfileTab = t.id === 'profile';
          const isTabActive = isActive && (!isProfileTab || isViewingOwnProfile);
          
          return (
            <button
              key={t.id}
              onClick={() => t.action ? t.action() : setActiveTab(t.id as any)}
              className="p-3 my-1 flex items-center justify-center relative w-14 h-14"
            >
              {isTabActive && t.id !== 'create' && (
                <div className="absolute inset-2 bg-slate-100 rounded-full" />
              )}
              <t.icon className={cn(
                 "w-6 h-6 relative z-10 transition-colors",
                 t.id === 'create' ? "w-7 h-7 text-white -mt-2 p-1.5 rounded-full bg-blue-600 shadow-lg" : 
                 (isTabActive ? "text-slate-900" : "text-slate-500")
              )} />
            </button>
          );
        })}
      </nav>

      {/* Create Post Modal Overlay */}
      <AnimatePresence>
        {isCreatingPost && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 bg-black/40 z-[60] hidden sm:block" 
               onClick={() => setIsCreatingPost(false)}
            />
            <div className="fixed inset-0 z-[70] pointer-events-none flex flex-col items-center sm:pt-20">
               <div className="pointer-events-auto w-full h-full sm:w-auto sm:h-auto">
                 <CreatePost onCancel={() => setIsCreatingPost(false)} />
               </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
