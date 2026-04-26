import { motion } from "motion/react";
import { PostCard } from "@/components/ui/post-card";
import { Calendar, MapPin, Loader2, UserPlus, Check } from "lucide-react";
import Image from "next/image";
import { useAuth } from "../auth-provider";
import { useUserPosts } from "@/lib/hooks";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp, increment, updateDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/lib/data";

export default function Profile({ userId }: { userId?: string | null }) {
  const { profile: currentUser, logOut } = useAuth();
  
  const targetId = userId || currentUser?.id;
  const { posts, loading: postsLoading } = useUserPosts(targetId);
  const [profileData, setProfileData] = useState<User | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!targetId) return;
    if (targetId === currentUser?.id) {
       setProfileData(currentUser);
       return;
    }
    
    // Fetch external profile
    const fetchProfile = async () => {
       const snap = await getDoc(doc(db, 'users', targetId));
       if (snap.exists()) {
          setProfileData({ id: snap.id, ...snap.data() } as User);
       }
    };
    fetchProfile();
  }, [targetId, currentUser]);

  useEffect(() => {
    if (!currentUser || !targetId || targetId === currentUser.id) return;
    const fetchFollow = async () => {
      const followId = `${currentUser.id}_${targetId}`;
      const snap = await getDoc(doc(db, 'follows', followId));
      setIsFollowing(snap.exists());
    };
    fetchFollow();
  }, [currentUser, targetId]);

  const toggleFollow = async () => {
    if (!currentUser || !targetId || targetId === currentUser.id || followLoading) return;
    setFollowLoading(true);
    const followId = `${currentUser.id}_${targetId}`;
    const followRef = doc(db, 'follows', followId);
    
    try {
      if (isFollowing) {
        setIsFollowing(false);
        await deleteDoc(followRef);
        // Decrease followers on target, decrease following on current
        await updateDoc(doc(db, 'users', targetId), { followers: increment(-1) });
        await updateDoc(doc(db, 'users', currentUser.id), { following: increment(-1) });
      } else {
        setIsFollowing(true);
        await setDoc(followRef, {
           followerId: currentUser.id,
           followingId: targetId,
           createdAt: serverTimestamp()
        });
        await updateDoc(doc(db, 'users', targetId), { followers: increment(1) });
        await updateDoc(doc(db, 'users', currentUser.id), { following: increment(1) });

        await addDoc(collection(db, 'users', targetId, 'notifications'), {
           actorId: currentUser.id,
           type: 'follow',
           isRead: false,
           createdAt: serverTimestamp()
        });
      }
    } catch (e) {
      console.error(e);
      setIsFollowing(!isFollowing);
    } finally {
      setFollowLoading(false);
    }
  };

  if (!profileData) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === targetId;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-slate-50"
    >
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 py-3 sm:py-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 ml-2">{profileData.name}</h1>
        {isOwnProfile && <button onClick={logOut} className="text-sm font-semibold text-rose-600 hover:text-rose-700">Logout</button>}
      </header>

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-20 sm:pb-0">
        <div className="max-w-2xl mx-auto w-full bg-white sm:border-x sm:border-slate-200 min-h-screen pb-12">
          {/* Cover Header */}
          <div className="h-32 sm:h-48 bg-slate-300 relative w-full overflow-hidden">
            {profileData.coverImage && (
              <Image 
                src={profileData.coverImage} 
                alt="Cover" 
                fill 
                className="object-cover" 
                referrerPolicy="no-referrer" 
              />
            )}
          </div>
          
          <div className="px-4 sm:px-5 relative pb-4 border-b border-slate-200">
            {/* Avatar & Edit Button */}
            <div className="flex justify-between items-start mb-3">
              <div className="relative -mt-12 sm:-mt-16 w-24 sm:w-32 h-24 sm:h-32 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-sm">
                <Image 
                  src={profileData.avatar || '/placeholder-u.jpg'} 
                  alt={profileData.name} 
                  fill 
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              {isOwnProfile ? (
                 <button className="mt-3 rounded-full border border-slate-300 px-4 py-1.5 font-bold text-slate-900 transition-colors hover:bg-slate-50">
                   Edit profile
                 </button>
              ) : (
                 <button 
                   onClick={toggleFollow}
                   disabled={followLoading}
                   className={`mt-3 rounded-full border px-4 py-1.5 font-bold transition-colors flex items-center gap-2 ${isFollowing ? 'border-slate-300 text-slate-900 hover:bg-slate-50' : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'}`}
                 >
                   {isFollowing ? "Following" : "Follow"}
                 </button>
              )}
            </div>

            {/* Profile Info */}
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">{profileData.name}</h2>
              <p className="text-slate-500">@{profileData.handle}</p>
            </div>

            {profileData.bio && (
              <p className="mt-4 text-[15px] text-slate-900 whitespace-pre-wrap leading-snug">
                {profileData.bio}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
              <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Earth</div>
              <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined Recently</div>
            </div>

            <div className="mt-5 flex gap-5 text-[15px]">
              <div className="flex items-center gap-1.5 cursor-pointer hover:underline">
                <span className="font-bold text-slate-900">{profileData.following || 0}</span> 
                <span className="text-slate-500">Following</span>
              </div>
              <div className="flex items-center gap-1.5 cursor-pointer hover:underline">
                <span className="font-bold text-slate-900">{profileData.followers || 0}</span> 
                <span className="text-slate-500">Followers</span>
              </div>
            </div>
          </div>

          {/* User Posts Tabs */}
          <div>
            <div className="border-b border-slate-200 flex">
              <div className="flex-1 text-center font-bold text-slate-900 py-3 sm:py-4 border-b-[3px] border-blue-500">Posts</div>
              <div className="flex-1 text-center font-medium text-slate-500 py-3 sm:py-4 hover:bg-slate-50 cursor-pointer transition-colors">Replies</div>
              <div className="flex-1 text-center font-medium text-slate-500 py-3 sm:py-4 hover:bg-slate-50 cursor-pointer transition-colors">Likes</div>
            </div>
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
            {postsLoading && (
              <div className="p-8 flex justify-center items-center text-slate-400">
                <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
              </div>
            )}
            {!postsLoading && posts.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                No posts yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
