import React from 'react';
import { motion } from 'motion/react';
import { PostCard } from '@/components/ui/post-card';
import { useFeed } from '@/lib/hooks';
import { useAuth } from '@/components/auth-provider';
import Image from 'next/image';

export default function HomeFeed({ onNavigateProfile }: { onNavigateProfile?: (userId: string) => void }) {
  const { posts, loading } = useFeed();
  const { profile } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-slate-50"
    >
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 py-3 sm:hidden">
        {profile?.avatar ? (
          <Image 
            src={profile.avatar} 
            alt="Profile" 
            width={32} 
            height={32} 
            onClick={() => onNavigateProfile?.(profile.id)}
            className="w-8 h-8 rounded-full border border-slate-200 cursor-pointer object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-200 cursor-pointer" onClick={() => onNavigateProfile?.(profile?.id as string)} />
        )}
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">Home</h1>
        <div className="w-8 h-8" /> {/* Spacer for centering */}
      </header>

      {/* Desktop/Tablet Header */}
      <div className="hidden sm:block sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 py-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Home</h1>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-20 sm:pb-0">
        <div className="max-w-2xl mx-auto w-full min-h-screen">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onNavigateProfile={onNavigateProfile} />
          ))}
          {loading && (
            <div className="p-8 flex justify-center items-center text-slate-400">
              <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
            </div>
          )}
          {!loading && posts.length === 0 && (
             <div className="p-8 text-center text-slate-500">
               No posts yet. Be the first to share something!
             </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
