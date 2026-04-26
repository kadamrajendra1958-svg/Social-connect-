import { motion } from "motion/react";
import { Users, Sparkles, Image as ImageIcon, ArrowRight } from "lucide-react";
import { useAuth } from "../auth-provider";
import { useState } from "react";

export default function Onboarding() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await signIn();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const features = [
    { icon: Users, title: "Connect", desc: "Find friends and communities that share your vibe." },
    { icon: ImageIcon, title: "Share", desc: "Post your favorite moments instantly." },
    { icon: Sparkles, title: "Discover", desc: "See what's trending across the globe." }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="absolute inset-0 flex flex-col bg-white p-6 sm:p-12 justify-between z-40 max-w-md mx-auto"
    >
      <div className="pt-12">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Welcome to your new world</h2>
        <p className="text-slate-500 mb-12 text-lg">Join millions of users already connected.</p>

        <div className="space-y-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.15 }}
              className="flex items-center gap-4"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                <f.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
                <p className="text-sm sm:text-base text-slate-500">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="pb-8">
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          onClick={handleSignIn}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-700 hover:shadow-blue-700/30 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? 'Please wait...' : 'Continue'} <ArrowRight className="h-5 w-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
