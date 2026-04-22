"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { BookOpen, Eye, File as FileIcon, Download, ShieldAlert, CheckCircle, AlertTriangle, XCircle, Trash2 } from "lucide-react";
import { useAuthStore } from "../../../store/authStore";

export default function RepositoryPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [repo, setRepo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [plagiarismFile, setPlagiarismFile] = useState<File | null>(null);
  const [checkingPlagiarism, setCheckingPlagiarism] = useState(false);
  const [plagiarismResult, setPlagiarismResult] = useState<any>(null);

  useEffect(() => {
    if (id) {
      api.get(`/repositories/${id}`)
        .then(res => setRepo(res.data.repository))
        .catch(err => setError("Repository not found or private."))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPlagiarismFile(e.target.files[0]);
      setPlagiarismResult(null); // Reset previous results
    }
  };

  const handleCheckPlagiarism = async () => {
    if (!plagiarismFile) return;
    
    setCheckingPlagiarism(true);
    setPlagiarismResult(null);
    try {
      const data = new FormData();
      data.append('file', plagiarismFile);
      data.append('repositoryId', id);

      const res = await api.post("/ml/plagiarism-check", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setPlagiarismResult(res.data.report);
    } catch(err) {
      console.error(err);
      alert("Failed to run plagiarism check. Ensure you're logged in.");
    } finally {
      setCheckingPlagiarism(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to completely delete this repository and all its files? This action cannot be undone.")) {
      try {
        await api.delete(`/repositories/${id}`);
        router.push("/dashboard");
      } catch (err) {
        alert("Failed to delete repository");
        console.error(err);
      }
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>;
  
  if (error || !repo) return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
       <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
       <h1 className="text-2xl font-bold text-white mb-2">Repository Error</h1>
       <p className="text-slate-400">{error || "Could not load repository."}</p>
    </div>
  );

  const getScoreColor = (score: number) => {
    if (score < 30) return "text-emerald-400";
    if (score < 60) return "text-yellow-400";
    return "text-red-400";
  };
  const getScoreBg = (score: number) => {
    if (score < 30) return "bg-emerald-500/10 border-emerald-500/30";
    if (score < 60) return "bg-yellow-500/10 border-yellow-500/30";
    return "bg-red-500/10 border-red-500/30";
  };
  const getScoreIcon = (score: number) => {
    if (score < 30) return <CheckCircle className="w-6 h-6 text-emerald-400" />;
    if (score < 60) return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
    return <XCircle className="w-6 h-6 text-red-400" />;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xl md:text-2xl mb-2">
            <BookOpen className="w-6 h-6 text-slate-400" />
            <span className="text-purple-400 hover:underline cursor-pointer">{repo.owner.username}</span>
            <span className="text-slate-500">/</span>
            <span className="font-bold text-white tracking-tight">{repo.name}</span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full border border-white/10 text-slate-400 align-middle">
              {repo.isPublic ? "Public" : "Private"}
            </span>
          </div>
          <p className="text-slate-400 mt-1 max-w-3xl">{repo.description}</p>
        </div>
        
        <div className="flex items-center gap-3 bg-navy-900/50 border border-white/10 rounded-lg p-1">
           <div className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-300">
             <Eye className="w-4 h-4" /> <span>{repo.views} views</span>
           </div>
           {user && user._id === repo.owner._id && (
             <button
               onClick={handleDelete}
               className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors"
             >
               <Trash2 className="w-4 h-4" /> <span>Delete</span>
             </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
           
           {/* Files */}
           <div className="glass-panel border border-white/10 rounded-xl overflow-hidden">
             <div className="bg-white/5 px-4 py-3 border-b border-white/10 text-sm font-medium text-slate-300 flex justify-between">
                <span>{repo.owner.username} initially committed files</span>
                <span className="text-slate-500">{new Date(repo.createdAt).toLocaleDateString()}</span>
             </div>
             <div>
                {repo.files?.length === 0 ? (
                   <div className="p-8 text-center text-slate-500">No files in this repository.</div>
                ) : (
                   <div className="divide-y divide-white/5">
                      {repo.files?.map((file: any) => (
                        <div key={file._id} className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors">
                           <div className="flex items-center gap-3">
                             <FileIcon className="w-4 h-4 text-slate-400" />
                             <span className="text-slate-300 text-sm">{file.originalName}</span>
                           </div>
                           <div className="flex items-center gap-4 text-slate-500 text-xs">
                             <span>{(file.size / 1024).toFixed(1)} KB</span>
                             <a 
                               href={`${api.defaults.baseURL}/repositories/${repo._id}/files/${file._id}`} 
                               target="_blank" rel="noopener noreferrer"
                               className="hover:text-purple-400"
                             >
                               <Download className="w-4 h-4" />
                             </a>
                           </div>
                        </div>
                      ))}
                   </div>
                )}
             </div>
           </div>

           {/* Readme or default display */}
           {repo.readme && (
             <div className="glass-panel border border-white/10 rounded-xl p-6">
               <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                 <FileIcon className="w-5 h-5 text-slate-400" /> README.md
               </h3>
               <div className="prose prose-invert max-w-none">
                 {repo.readme}
               </div>
             </div>
           )}

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
           <div className="glass-panel border border-white/10 p-5 rounded-xl">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 tracking-wider uppercase">About</h3>
              {repo.university && (
                <div className="text-sm text-teal-400 mb-4 pb-4 border-b border-white/5">
                  Hosted at {repo.university}
                </div>
              )}
              {repo.language && (
                <div className="flex items-center gap-2 mt-4 text-sm text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span> {repo.language}
                </div>
              )}
              {repo.tags && repo.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {repo.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-1 bg-white/5 rounded-md text-xs text-purple-300 hover:bg-white/10 transition-colors cursor-pointer">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
           </div>

           {/* ML Plagiarism Checker */}
           {user && ( // Only logged in users can check plagiarism
             <div className="glass-panel border-2 border-purple-500/20 p-5 rounded-xl bg-purple-500/[0.02]">
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-purple-400" />
                  Plagiarism Check
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Check a file against all existing repositories in the database using ML (TF-IDF & Cosine Similarity).
                </p>

                <div className="space-y-3">
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
                  />
                  <button 
                    onClick={handleCheckPlagiarism}
                    disabled={checkingPlagiarism || !plagiarismFile}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-md transition-all flex items-center justify-center gap-2"
                  >
                    {checkingPlagiarism ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Parsing...</>
                    ) : (
                      "Check File"
                    )}
                  </button>
                </div>

                {plagiarismResult && (
                  <div className={`mt-4 p-3 rounded-lg border ${getScoreBg(plagiarismResult.score)} animate-in fade-in slide-in-from-top-2`}>
                    <div className="flex items-center gap-3 mb-2">
                      {getScoreIcon(plagiarismResult.score)}
                      <div>
                        <div className={`font-bold text-lg ${getScoreColor(plagiarismResult.score)}`}>
                          {plagiarismResult.score}% Similarity
                        </div>
                        <div className="text-xs text-slate-300 font-medium">{plagiarismResult.label}</div>
                      </div>
                    </div>
                    
                    {plagiarismResult.matches && plagiarismResult.matches.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="text-xs font-semibold text-slate-400 mb-2">Top Matches:</div>
                        <ul className="text-xs text-slate-300 space-y-1">
                          {plagiarismResult.matches.map((m: any, i: number) => (
                            <li key={i} className="flex justify-between items-center bg-black/20 p-1.5 rounded">
                              <span className="truncate pr-2">{m.repositoryName}</span>
                              <span className={getScoreColor(m.similarity)}>{m.similarity}%</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
             </div>
           )}

        </div>
      </div>
    </div>
  );
}
