"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, ShieldCheck, Search, Users, ArrowRight } from "lucide-react";
import { useAuthStore } from "../store/authStore";

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="w-full py-20 lg:py-32 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        
        {/* Background blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-sm font-medium text-slate-300">Open source collaboration platform</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mb-6"
        >
          Where Indian Universities <br className="hidden md:block" />
          <span className="text-gradient">Collaborate & Build</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed"
        >
          AcadRepo is a unified academic platform designed for students to host projects, detect plagiarism with built-in ML, and explore research across institutions.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link href={isAuthenticated ? "/dashboard" : "/register"} className="h-12 px-8 inline-flex items-center justify-center rounded-md bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors gap-2 w-full sm:w-auto">
            {isAuthenticated ? "Go to Dashboard" : "Get Started"} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href={isAuthenticated ? "/explore" : "/register"} className="h-12 px-8 inline-flex items-center justify-center rounded-md glass-panel hover:bg-white/10 text-white font-medium transition-colors w-full sm:w-auto">
            Explore Projects
          </Link>
        </motion.div>

      </section>

      {/* Features Section */}
      <section className="w-full py-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
             icon={<BookOpen className="w-8 h-8 text-purple-400" />}
             title="Project Repositories"
             description="Host your academic projects, assignments, and research papers with a clean Git-style interface."
             delay={0.1}
          />
          <FeatureCard 
             icon={<ShieldCheck className="w-8 h-8 text-teal-400" />}
             title="Plagiarism Detection"
             description="Built-in ML engine automatically checks your code against the database to ensure originality."
             delay={0.2}
          />
          <FeatureCard 
             icon={<Search className="w-8 h-8 text-blue-400" />}
             title="Cross-University Search"
             description="Find projects and researchers across 80+ top Indian universities and institutions."
             delay={0.3}
          />
          <FeatureCard 
             icon={<Users className="w-8 h-8 text-pink-400" />}
             title="Collaboration"
             description="Build your profile, list your skills, and connect with peers working on similar domains."
             delay={0.4}
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-20 border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">80+</div>
              <div className="text-slate-400 text-sm">Universities</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">10k+</div>
              <div className="text-slate-400 text-sm">Projects</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">99%</div>
              <div className="text-slate-400 text-sm">Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">Free</div>
              <div className="text-slate-400 text-sm">Forever</div>
            </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="glass-panel p-6 rounded-2xl flex flex-col hover:-translate-y-1 transition-transform duration-300"
    >
      <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  )
}
