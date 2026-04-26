import { motion } from "motion/react";
import { Share2 } from "lucide-react";

export default function Splash() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-blue-600 text-white z-50"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 1, bounce: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="mb-4 rounded-3xl bg-white p-4 shadow-xl">
          <Share2 className="h-12 w-12 text-blue-600" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">Social Connect</h1>
      </motion.div>
    </motion.div>
  );
}
