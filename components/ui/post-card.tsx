import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'motion/react';
import { Post } from '@/lib/data';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useAuth } from '../auth-provider';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp, increment, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PostCardProps {
  post: Post;
  onNavigateProfile?: (userId: string) => void;
}

export function PostCard({ post, onNavigateProfile }: PostCardProps) {
  const { profile } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile || !post.id) return;
    const fetchLike = async () => {
      const likeRef = doc(db, 'posts', post.id, 'likes', profile.id);
      const snap = await getDoc(likeRef);
      setIsLiked(snap.exists());
    };
    fetchLike();
  }, [profile, post.id]);

  useEffect(() => {
    setLikesCount(post.likesCount || 0);
  }, [post.likesCount]);

  const toggleLike = async () => {
    if (!profile || loading) return;
    setLoading(true);
    const likeRef = doc(db, 'posts', post.id, 'likes', profile.id);
    const postRef = doc(db, 'posts', post.id);
    try {
      if (isLiked) {
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
        await deleteDoc(likeRef);
        await updateDoc(postRef, { likesCount: increment(-1) });
      } else {
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        await setDoc(likeRef, { createdAt: serverTimestamp() });
        await updateDoc(postRef, { likesCount: increment(1) });
        
        // Add Notification
        if (post.authorId !== profile.id) {
          await addDoc(collection(db, 'users', post.authorId, 'notifications'), {
            actorId: profile.id,
            type: 'like',
            postId: post.id,
            isRead: false,
            createdAt: serverTimestamp()
          });
        }
      }
    } catch (err) {
      console.error(err);
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
    } finally {
      setLoading(false);
    }
  };

  if (!post.author) return null;

  return (
    <article className="border-b border-slate-200 bg-white p-4 sm:p-5 transition-colors">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 cursor-pointer" onClick={() => onNavigateProfile?.(post.authorId)}>
          <Image 
            src={post.author.avatar || '/placeholder-u.jpg'} 
            alt={post.author.name} 
            width={48} 
            height={48} 
            className="rounded-full object-cover border border-slate-100 bg-slate-100 h-10 w-10 sm:h-12 sm:w-12"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div 
                 className="flex items-center gap-1.5 flex-wrap cursor-pointer group" 
                 onClick={() => onNavigateProfile?.(post.authorId)}
              >
                <span className="font-bold text-slate-900 truncate group-hover:underline">{post.author.name}</span>
                <span className="text-slate-500 truncate">@{post.author.handle}</span>
                <span className="text-slate-400 text-sm">·</span>
                <span className="text-slate-500 text-sm hover:underline">
                  {post.timestamp ? formatDistanceToNow(post.timestamp, { addSuffix: true }).replace('about ', '') : ''}
                </span>
              </div>
            </div>
            <button className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="mt-1 text-slate-800 text-[15px] leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>

          {/* Media */}
          {post.image && (
            <div className="mt-3 relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <Image 
                src={post.image} 
                alt="Post media" 
                width={600} 
                height={400} 
                className="w-full h-auto object-cover max-h-[500px]"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex items-center justify-between text-slate-500 max-w-md">
            <button className="flex items-center gap-2 group transition-colors hover:text-blue-500">
              <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">{post.commentsCount > 0 ? post.commentsCount : ''}</span>
            </button>

            <button className="flex items-center gap-2 group transition-colors hover:text-green-500">
              <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">{post.sharesCount > 0 ? post.sharesCount : ''}</span>
            </button>

            <button 
              onClick={toggleLike}
              disabled={loading}
              className={cn(
                "flex items-center gap-2 group transition-colors disabled:opacity-50",
                isLiked ? "text-rose-500" : "hover:text-rose-500"
              )}
            >
              <div className={cn(
                "p-2 rounded-full transition-colors",
                isLiked ? "bg-rose-50" : "group-hover:bg-rose-50"
              )}>
                <motion.div whileTap={{ scale: loading ? 1 : 0.8 }}>
                  <Heart className={cn("w-5 h-5 transition-all", isLiked && "fill-current")} />
                </motion.div>
              </div>
              <span className={cn("text-sm font-medium", isLiked && "text-rose-500")}>
                {likesCount > 0 ? likesCount : ''}
              </span>
            </button>

            <button 
              onClick={() => setIsSaved(!isSaved)}
              className={cn(
                "flex items-center gap-2 group transition-colors hover:text-blue-500",
                isSaved && "text-blue-500"
              )}
            >
              <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                <motion.div whileTap={{ scale: 0.8 }}>
                  <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
                </motion.div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
