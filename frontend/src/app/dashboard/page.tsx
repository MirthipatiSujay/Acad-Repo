"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { api } from "../../lib/api";
import Link from "next/link";
import { BookOpen, MapPin, Eye, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [repositories, setRepositories] = useState<any[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user?._id || user?.id) {
       const fetchRepos = async () => {
         try {
           const id = user._id || user.id;
           const res = await api.get(`/users/${id}`);
           setRepositories(res.data.repositories || []);
         } catch(e) {
             console.error(e);
         } finally {
             setLoadingRepos(false);
         }
       };
       fetchRepos();
    }
  }, [user]);

  if (isLoading || loadingRepos) {
    return <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Profile Overview Card */}
      <div className="glass-panel p-6 rounded-2xl mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 border border-white/5">
         <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-teal-400 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
           {user.name ? user.name[0].toUpperCase() : user.username[0].toUpperCase()}
         </div>
         <div className="flex-1 text-center md:text-left">
           <h1 className="text-2xl font-bold text-white mb-2">{user.name || user.username}</h1>
           <p className="text-slate-400 font-medium mb-3">@{user.username}</p>
           {user.university && (
             <div className="flex items-center justify-center md:justify-start gap-1 text-sm text-teal-400 mb-4">
               <MapPin className="w-4 h-4" />
               <span>{user.university}</span>
             </div>
           )}
           <div className="flex flex-wrap gap-2 justify-center md:justify-start">
             {user.skills?.map((skill: string) => (
                <span key={skill} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
                  {skill}
                </span>
             ))}
           </div>
         </div>
         <div>
            <Link href="/repositories/new" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" /> New Repository
            </Link>
         </div>
      </div>

      {/* Repositories */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
           <BookOpen className="w-5 h-5 text-purple-400" />
           Your Repositories <span className="text-slate-500 text-sm font-normal">({repositories.length})</span>
        </h2>

        {repositories.length === 0 ? (
          <div className="glass-panel p-8 rounded-xl text-center border-dashed border-2 border-white/10">
             <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-slate-500" />
             </div>
             <h3 className="text-lg font-medium text-white mb-2">No repositories yet</h3>
             <p className="text-slate-400 mb-6 max-w-sm mx-auto">Create your first repository to start hosting your projects and academic work.</p>
             <Link href="/repositories/new" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md inline-flex items-center gap-2 transition-colors">
                <Plus className="w-4 h-4" /> Create Repository
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {repositories.map((repo) => (
              <Link href={`/repositories/${repo._id}`} key={repo._id} className="block group">
                <div className="glass-panel p-5 rounded-xl h-full border border-white/5 hover:border-purple-500/50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-purple-400 group-hover:text-purple-300 transition-colors text-lg truncate pr-2">
                       {repo.name}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-slate-400">
                      {repo.isPublic ? "Public" : "Private"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                    {repo.description || "No description provided."}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-auto pt-4 border-t border-white/5">
                    {repo.language && (
                       <span className="flex items-center gap-1">
                         <span className="w-2 h-2 rounded-full bg-teal-400"></span> {repo.language}
                       </span>
                    )}
                    <span className="flex items-center gap-1 hover:text-slate-300">
                       <Eye className="w-3.5 h-3.5" /> {repo.views}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
