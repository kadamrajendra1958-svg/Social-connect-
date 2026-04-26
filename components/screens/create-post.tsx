import { useState, useRef } from "react";
import { motion } from "motion/react";
import { X, Image as ImageIcon, Sparkles } from "lucide-react";
import Image from "next/image";
import { useAuth } from "../auth-provider";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { resizeImageFile } from "@/lib/utils";

export default function CreatePost({ onCancel }: { onCancel: () => void }) {
  const { profile } = useAuth();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePost = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      await addDoc(collection(db, 'posts'), {
        authorId: profile.id,
        content: text,
        image: imagePreview || "",
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      onCancel();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const resizedBase64 = await resizeImageFile(file, 800, 800);
        setImagePreview(resizedBase64);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="absolute inset-0 z-50 flex flex-col bg-white sm:h-auto sm:max-w-lg sm:mx-auto sm:top-20 sm:bottom-auto sm:rounded-2xl sm:shadow-2xl sm:overflow-hidden"
    >
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="text-slate-500 p-1.5 hover:bg-slate-100 rounded-full transition-colors">
            <X className="h-6 w-6" />
          </button>
          <span className="font-bold sm:hidden">Draft</span>
        </div>
        <button 
          onClick={handlePost}
          disabled={!text.trim() || loading}
          className="rounded-full bg-blue-600 px-5 py-1.5 font-bold text-white transition-colors hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </header>

      <div className="flex-1 p-4 sm:p-5 overflow-y-auto">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            {profile?.avatar ? (
              <Image 
                src={profile.avatar} 
                alt="Current User" 
                width={48} 
                height={48} 
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border border-slate-100"
                referrerPolicy="no-referrer"
              />
            ) : (
               <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border border-slate-100 bg-slate-200" />
            )}
          </div>
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's happening?"
              autoFocus
              className="mt-1.5 sm:mt-2 w-full resize-none border-none text-lg sm:text-xl placeholder-slate-400 outline-none min-h-[100px] bg-transparent"
            />
            {imagePreview && (
              <div className="relative mt-2 rounded-xl overflow-hidden border border-slate-200">
                 <button onClick={() => setImagePreview(null)} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors">
                   <X className="w-5 h-5" />
                 </button>
                 <Image src={imagePreview} alt="upload preview" width={600} height={400} className="w-full h-auto object-cover max-h-[300px]" unoptimized />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center border-t border-slate-200 p-3 sm:px-4 gap-2 text-blue-600 pb-[env(safe-area-inset-bottom)] bg-white">
        <button onClick={() => fileInputRef.current?.click()} className="rounded-full flex items-center justify-center hover:bg-blue-50 p-2.5 transition-colors">
          <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        <input 
           type="file" 
           ref={fileInputRef}
           onChange={handleImageChange}
           accept="image/*"
           className="hidden"
        />
        <button className="rounded-full flex items-center justify-center hover:bg-blue-50 p-2.5 transition-colors">
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>
    </motion.div>
  );
}
