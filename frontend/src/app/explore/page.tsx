"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "../../lib/api";
import Link from "next/link";
import { Search, MapPin, BookOpen } from "lucide-react";

export default function ExplorePage() {
  const [repositories, setRepositories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUni, setSelectedUni] = useState("");
  const [universities, setUniversities] = useState<any[]>([]);

  // Fetch filter options once
  useEffect(() => {
    api.get("/universities?limit=50")
      .then(res => setUniversities(res.data.universities))
      .catch(console.error);
  }, []);

  const fetchRepos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (selectedUni) params.set("university", selectedUni);
      
      const res = await api.get(`/repositories?${params.toString()}`);
      setRepositories(res.data.repositories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedUni]);

  // Trigger fetch when university changes
  useEffect(() => {
    fetchRepos();
  }, [selectedUni]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRepos();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Explore Projects</h1>
        <p className="text-slate-400">Discover academic repositories from top Indian universities</p>
      </div>

      {/* Search and Filters */}
      <div className="glass-panel p-4 rounded-xl border border-white/5 mb-8 flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search projects, tags, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-navy-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </form>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedUni}
              onChange={(e) => setSelectedUni(e.target.value)}
              className="w-full bg-navy-900/50 border border-white/10 rounded-lg pl-9 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none text-sm"
            >
              <option value="" className="bg-slate-800 text-white">All Universities</option>
              {universities.map((u, i) => (
                <option key={i} value={u} className="bg-slate-800 text-white">
                  {u}
                </option>
              ))}
            </select>
          </div>
          <button 
            onClick={fetchRepos}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : repositories.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-xl border border-dashed border-white/10">
          <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No projects found</h3>
          <p className="text-slate-400">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repositories.map((repo) => (
             <div key={repo._id} className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
               <div className="flex items-start gap-3 mb-3">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-teal-400 flex items-center justify-center font-bold text-white shadow-md flex-shrink-0">
                    {repo.owner.username[0].toUpperCase()}
                 </div>
                 <div className="truncate">
                    <Link href={`/repositories/${repo._id}`} className="font-semibold text-lg text-purple-400 hover:underline block truncate">
                       {repo.owner.username} / {repo.name}
                    </Link>
                    {repo.university && (
                      <p className="text-xs text-teal-400 truncate mt-0.5">{repo.university}</p>
                    )}
                 </div>
               </div>

               <p className="text-sm text-slate-400 mb-4 line-clamp-3 flex-1">
                 {repo.description || "No description provided."}
               </p>

               <div className="flex flex-wrap gap-2 mb-4">
                 {repo.tags?.slice(0, 3).map((tag: string) => (
                   <span key={tag} className="text-xs px-2 py-1 bg-white/5 border border-white/10 rounded-md text-slate-300">
                     {tag}
                   </span>
                 ))}
                 {repo.tags?.length > 3 && (
                    <span className="text-xs px-2 py-1 bg-white/5 border border-white/10 rounded-md text-slate-300">+{repo.tags.length - 3}</span>
                 )}
               </div>
               
               <div className="flex items-center justify-between text-xs text-slate-500 mt-auto pt-4 border-t border-white/5">
                 <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-teal-400"></span> {repo.language || 'Other'}
                 </span>
               </div>
             </div>
          ))}
        </div>
      )}

    </div>
  );
}
