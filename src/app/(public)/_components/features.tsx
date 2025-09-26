import {
  Sparkles,
  Database,
  Award,
  GraduationCap,
  UserPlus,
  LockKeyhole,
} from 'lucide-react';
import { motion } from 'motion/react';

const features = [
  {
    icon: <Sparkles className="h-6 w-6 text-cyan-400" />,
    title: 'AI Guidance',
    desc: 'Personal AI tutor tracks your learning, nudges progress, and suggests the next step every time.',
  },
  {
    icon: <Database className="h-6 w-6 text-emerald-400" />,
    title: 'Verifiable Rewards',
    desc: 'Earn NFT badges, points, and certificates—instantly accessible and verifiable on-chain or off-chain.',
  },
  {
    icon: <Award className="h-6 w-6 text-blue-400" />,
    title: 'NFT Credentials',
    desc: 'Unique NFTs and ENS profiles showcase your portfolio and track achievements for real-world credibility.',
  },
  {
    icon: <GraduationCap className="h-6 w-6 text-teal-400" />,
    title: 'Courses & Micro-Challenges',
    desc: 'Wide range of hands-on learning modules tailored for every skill level, beginner to expert.',
  },
  {
    icon: <UserPlus className="h-6 w-6 text-cyan-500" />,
    title: 'Easy Onboarding',
    desc: 'Sign up with email or phone, no wallet required. Upgrade later for full Web3 ownership.',
  },
  {
    icon: <LockKeyhole className="h-6 w-6 text-emerald-500" />,
    title: 'Secure & Private',
    desc: 'Your ENS identity lets you verify progress across platforms without exposing private user data.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { 
      type: 'spring' as const, // Use string instead of number
      stiffness: 76, 
      damping: 17 
    }
  },
  hover: {
    scale: 1.04,
    boxShadow: '0 4px 40px 0 #38bdf833, 0 2px 10px #0e74902e',
    transition: { type: 'spring'as const, stiffness: 140, damping: 12 },
  },
};

const iconPulse = {
  rest: { scale: 1, filter: 'drop-shadow(0 0 0 #5eead4)' },
  hover: { scale: 1.12, filter: 'drop-shadow(0 0 16px #22d3ee)', transition: { yoyo: 2, duration: 0.35 } },
};

export default function EthEdFeatures() {
  return (
    <section className="relative py-14">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <div className="relative mx-auto max-w-2xl sm:text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ type: 'spring', duration: 0.7 }}
            className="relative z-10"
          >
            <h3 className="font-geist mt-4 text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Built for Web3 Learners
            </h3>
            <p className="font-geist text-foreground/60 mt-3">
              EthEd combines on-chain rewards, AI support, and ENS identity to help everyone master blockchain—securely and transparently.
            </p>
          </motion.div>
          <div
            className="absolute inset-0 mx-auto h-44 max-w-xs blur-[118px]"
            style={{
              background:
                'linear-gradient(122deg,rgba(36,180,231,0.15) 20%,rgba(52,217,196,0.16) 50%,rgba(36,180,231,0.08) 100%)',
            }}
          ></div>
        </div>
        <hr className="bg-cyan-300/30 mx-auto mt-5 h-px w-1/2" />
        <motion.ul
          className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true, amount: 0.13 }}
        >
          {features.map((item, idx) => (
            <motion.li
              key={idx}
              variants={cardVariants}
              whileHover="hover"
              initial="hidden"
              animate="visible"
              className="transform-gpu space-y-3 rounded-xl border border-cyan-300/20 bg-gradient-to-br from-blue-900/20 via-teal-800/10 to-emerald-900/10 p-4 [box-shadow:0_-16px_56px_-26px_#38bdf833_inset] transition-all duration-300"
              style={{ cursor: 'pointer' }}
            >
              <motion.div
                variants={iconPulse}
                initial="rest"
                whileHover="hover"
                className="w-fit rounded-full border border-emerald-200 bg-gradient-to-br from-cyan-400/20 to-blue-700/20 p-4 [box-shadow:0_-16px_56px_-24px_#38bdf85e_inset] transition-all duration-200"
              >
                {item.icon}
              </motion.div>
              <h4 className="font-geist text-lg font-bold tracking-tighter text-cyan-300">
                {item.title}
              </h4>
              <p className="text-slate-400">{item.desc}</p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
