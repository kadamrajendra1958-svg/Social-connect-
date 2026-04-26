import { useState, useRef } from "react";
import { motion } from "motion/react";
import { Camera, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useAuth } from "../auth-provider";
import { resizeImageFile } from "@/lib/utils";

export default function ProfileSetup({ onComplete }: { onComplete?: () => void }) {
  const { updateProfile } = useAuth();
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const resizedBase64 = await resizeImageFile(file, 400, 400);
        setAvatarPreview(resizedBase64);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      await updateProfile({
        name,
        handle,
        ...(avatarPreview && { avatar: avatarPreview }),
      });
      if (onComplete) onComplete();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="absolute inset-0 flex flex-col bg-white p-6 sm:p-12 z-40 max-w-md mx-auto"
    >
      <div className="flex-1 pt-12">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Set up your profile</h2>
        <p className="text-slate-500 mb-10">Make it yours. You can always change this later.</p>

        <div className="mb-10 flex justify-center">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative h-32 w-32 rounded-full bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center cursor-pointer group"
          >
            {avatarPreview ? (
              <Image src={avatarPreview} alt="Avatar preview" fill className="object-cover" unoptimized />
            ) : (
              <Camera className="h-10 w-10 text-slate-400 group-hover:text-slate-600 transition-colors" />
            )}
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              {avatarPreview && <Camera className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />}
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full rounded-xl border border-slate-200 px-4 py-3.5 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all bg-slate-50 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Username</label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="e.g. @janedoe"
              className="w-full rounded-xl border border-slate-200 px-4 py-3.5 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all bg-slate-50 focus:bg-white"
            />
          </div>
        </div>
      </div>

      <div className="pb-8">
        <button
          onClick={handleComplete}
          disabled={!name || !handle || loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98]"
        >
          {loading ? 'Saving...' : 'Complete Setup'} <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
}
