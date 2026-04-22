"use client";

import { useState } from "react";
import { api } from "../../lib/api";
import { ShieldAlert, CheckCircle, AlertTriangle, XCircle, Upload, File as FileIcon } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PlagiarismPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [plagiarismFile, setPlagiarismFile] = useState<File | null>(null);
  const [checkingPlagiarism, setCheckingPlagiarism] = useState(false);
  const [plagiarismResult, setPlagiarismResult] = useState<any>(null);
  const router = useRouter();

  if (!isLoading && !isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
         <ShieldAlert className="w-16 h-16 text-purple-500 mb-4" />
         <h1 className="text-2xl font-bold text-white mb-2">Authentication Required</h1>
         <p className="text-slate-400 mb-6">You must be logged in to use the ML Plagiarism Engine.</p>
         <button onClick={() => router.push('/login')} className="px-6 py-2 bg-purple-600 text-white rounded-md font-medium">Log In Now</button>
      </div>
    );
  }

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
      // Not passing repositoryId so it checks against ALL repositories

      const res = await api.post("/ml/plagiarism-check", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setPlagiarismResult(res.data.report);
    } catch(err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to run plagiarism check.");
    } finally {
      setCheckingPlagiarism(false);
    }
  };

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
    if (score < 30) return <CheckCircle className="w-8 h-8 text-emerald-400" />;
    if (score < 60) return <AlertTriangle className="w-8 h-8 text-yellow-400" />;
    return <XCircle className="w-8 h-8 text-red-400" />;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 glass-panel rounded-full mb-4">
          <ShieldAlert className="w-8 h-8 text-purple-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Global Plagiarism Engine</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Built-in machine learning (TF-IDF & Cosine Similarity) checks your code or document 
          against thousands of open repositories across top Indian Universities to ensure originality.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Upload Section */}
        <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col">
          <h2 className="text-xl font-semibold text-white mb-6">Upload File</h2>
          
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-6 bg-navy-900/50 hover:bg-white/5 transition-colors relative mb-6">
            <input 
              type="file" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {plagiarismFile ? (
              <div className="text-center">
                 <FileIcon className="w-12 h-12 text-teal-400 mx-auto mb-3" />
                 <p className="font-medium text-white">{plagiarismFile.name}</p>
                 <p className="text-xs text-slate-400 mt-1">{(plagiarismFile.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="text-center">
                 <Upload className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                 <p className="font-medium text-white">Click or drag file to upload</p>
                 <p className="text-xs text-slate-400 mt-1">Supports code (.js, .py, .cpp), .txt, .md</p>
              </div>
            )}
          </div>

          <button 
            onClick={handleCheckPlagiarism}
            disabled={checkingPlagiarism || !plagiarismFile}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {checkingPlagiarism ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Vectorizing & Scanning...</>
            ) : (
              "Check Originality Now"
            )}
          </button>
        </div>

        {/* Results Section */}
        <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col">
          <h2 className="text-xl font-semibold text-white mb-6">Scan Results</h2>
          
          {!plagiarismResult && !checkingPlagiarism && (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center">
              <ShieldAlert className="w-16 h-16 opacity-20 mb-4" />
              <p>Upload a file and run the checker to see similarity scores here.</p>
            </div>
          )}

          {checkingPlagiarism && (
             <div className="flex-1 flex flex-col items-center justify-center text-purple-400 text-center">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                Analyzing document...
             </div>
          )}

          {plagiarismResult && (
            <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4">
              <div className={`p-6 rounded-xl border flex items-center gap-4 ${getScoreBg(plagiarismResult.score)} mb-6`}>
                {getScoreIcon(plagiarismResult.score)}
                <div>
                  <div className={`text-3xl font-bold ${getScoreColor(plagiarismResult.score)}`}>
                    {plagiarismResult.score}% Similarity
                  </div>
                  <div className="text-sm text-slate-300 font-medium tracking-wide uppercase mt-1">
                    {plagiarismResult.label}
                  </div>
                </div>
              </div>

              {plagiarismResult.matches && plagiarismResult.matches.length > 0 ? (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Top Global Matches</h3>
                  <div className="space-y-2">
                    {plagiarismResult.matches.map((m: any, i: number) => (
                      <div key={i} className="flex justify-between items-center bg-navy-900/50 border border-white/5 p-3 rounded-lg">
                        <div className="truncate pr-4 flex-1">
                          <Link href={`/repositories/${m.repositoryId}`} className="text-teal-400 hover:underline font-medium text-sm block truncate">
                             {m.repositoryName}
                          </Link>
                          <p className="text-xs text-slate-500 mt-0.5">{m.fileName}</p>
                        </div>
                        <div className={`font-bold text-lg ${getScoreColor(m.similarity)}`}>
                          {m.similarity}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-emerald-400 text-center mt-4 bg-emerald-500/10 p-4 rounded-lg border border-emerald-500/20">
                   Excellent! No substantial matching content was found in the AcadRepo network.
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
