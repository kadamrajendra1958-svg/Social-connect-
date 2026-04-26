import { motion } from "motion/react";
import { formatDistanceToNow } from "date-fns";
import { Heart, UserPlus, MessageCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { useAuth } from "../auth-provider";
import { useNotifications } from "@/lib/hooks";

export default function Notifications() {
  const { profile } = useAuth();
  const { notifications, loading } = useNotifications(profile?.id);

  if (!profile) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-slate-50"
    >
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 py-3 sm:py-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Notifications</h1>
      </header>
      
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-20 sm:pb-0">
        <div className="max-w-2xl mx-auto w-full bg-white min-h-screen">
          {notifications.map((notif: any) => notif.actor && (
            <div key={notif.id} className={`flex items-start gap-4 border-b border-slate-100 p-4 transition-colors hover:bg-slate-50 cursor-pointer ${!notif.isRead ? 'bg-blue-50/20' : ''}`}>
              <div className="pt-1 flex-shrink-0 w-8 flex justify-end">
                {notif.type === 'like' && <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />}
                {notif.type === 'follow' && <UserPlus className="h-6 w-6 text-blue-500 fill-blue-500" />}
                {notif.type === 'comment' && <MessageCircle className="h-6 w-6 text-green-500 fill-green-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <Image 
                  src={notif.actor.avatar || '/placeholder-u.jpg'} 
                  alt={notif.actor.name} 
                  width={32} 
                  height={32} 
                  className="mb-2 h-8 w-8 rounded-full object-cover bg-slate-100 border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <p className="text-slate-900 text-[15px] leading-snug">
                  <span className="font-bold hover:underline cursor-pointer">{notif.actor.name}</span>{' '}
                  {notif.type === 'like' && 'liked your post'}
                  {notif.type === 'follow' && 'followed you'}
                  {notif.type === 'comment' && 'commented on your post'}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {notif.timestamp ? formatDistanceToNow(notif.timestamp, { addSuffix: true }) : ''}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="p-8 flex justify-center items-center text-slate-400">
              <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
            </div>
          )}
          {!loading && notifications.length === 0 && (
             <div className="p-8 text-center text-slate-500">
               No notifications yet.
             </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
