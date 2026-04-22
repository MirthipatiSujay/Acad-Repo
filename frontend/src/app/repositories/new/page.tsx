"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../store/authStore";
import { api } from "../../../lib/api";
import { BookOpen, Loader2, ShieldAlert, XCircle, AlertTriangle } from "lucide-react";

export default function NewRepositoryPage() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tags: "",
    language: "",
    isPublic: true,
  });
  
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plagiarismReport, setPlagiarismReport] = useState<any>(null);

  if (!isLoading && !isAuthenticated) {
    router.push("/login");
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
      // Clear previous plagiarism report when new files are selected
      setPlagiarismReport(null);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPlagiarismReport(null);
    setLoading(true);

    try {
      const data = new FormData();
      data.append("name", formData.name.replace(/\s+/g, '-').toLowerCase());
      data.append("description", formData.description);
      data.append("tags", formData.tags);
      data.append("language", formData.language);
      data.append("isPublic", String(formData.isPublic));

      if (files) {
        for (let i = 0; i < files.length; i++) {
          data.append("files", files[i]);
        }
      }

      const res = await api.post("/repositories", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        router.push(`/repositories/${res.data.repository._id}`);
      }
    } catch (err: any) {
      const responseData = err.response?.data;
      if (responseData?.plagiarismReport) {
        setPlagiarismReport(responseData.plagiarismReport);
        setError(responseData.message);
      } else {
        setError(responseData?.message || "Failed to create repository");
      }
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return "text-emerald-400";
    if (score < 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
           <BookOpen className="w-8 h-8 text-purple-400" />
           Create a new repository
        </h1>
        <p className="text-slate-400">A repository contains all project files, including the revision history.</p>
      </div>

      <div className="glass-panel p-6 md:p-8 rounded-2xl border border-white/5">
        
        {error && !plagiarismReport && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Plagiarism Rejection Banner */}
        {plagiarismReport && (
          <div className="mb-6 rounded-xl border-2 border-red-500/30 bg-red-500/[0.05] overflow-hidden">
            <div className="bg-red-500/10 px-5 py-3 flex items-center gap-3 border-b border-red-500/20">
              <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="font-semibold text-red-400 text-sm">Upload Blocked — Plagiarism Detected</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <XCircle className="w-10 h-10 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">
                    <span className="font-mono text-red-300">{plagiarismReport.fileName}</span> was flagged
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    Similarity score of <span className={`font-bold ${getScoreColor(plagiarismReport.score)}`}>{plagiarismReport.score}%</span> exceeds 
                    the allowed threshold of <span className="text-white font-medium">{plagiarismReport.threshold}%</span>.
                  </p>
                </div>
              </div>

              {plagiarismReport.matches && plagiarismReport.matches.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Matched Against:</p>
                  <ul className="space-y-1.5">
                    {plagiarismReport.matches.map((m: any, i: number) => (
                      <li key={i} className="flex justify-between items-center bg-black/20 p-2.5 rounded-lg text-sm">
                        <span className="text-slate-300 truncate pr-3">
                          {m.repositoryName} / <span className="text-slate-400">{m.fileName}</span>
                        </span>
                        <span className={`font-bold ${getScoreColor(m.similarity)} flex-shrink-0`}>{m.similarity}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-300/80">
                  Please ensure your work is original. Modify your files to reduce similarity before uploading again.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Repository Name *</label>
            <input 
              type="text" 
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-navy-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent font-mono"
              placeholder="my-awesome-project"
            />
            <p className="text-xs text-slate-500">Great repository names are short and memorable.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Description (Optional)</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-navy-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent resize-none"
              placeholder="What is this project about?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Keywords / Tags</label>
              <input 
                type="text" 
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full bg-navy-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                placeholder="machine-learning, react, nlp"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Primary Language</label>
              <input 
                type="text" 
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full bg-navy-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                placeholder="Python, TypeScript, C++"
              />
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-white/10">
            <label className="text-sm font-medium text-slate-300 block mb-2">Visibility</label>
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors">
              <input 
                type="radio" 
                name="isPublic"
                checked={formData.isPublic === true}
                onChange={() => setFormData({ ...formData, isPublic: true })}
                className="mt-1 text-purple-500 bg-navy-900 border-white/20 focus:ring-purple-500"
              />
              <div>
                <div className="font-medium text-white flex items-center gap-2">Public</div>
                <div className="text-sm text-slate-400">Anyone on the internet can see this repository. You choose who can commit.</div>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors">
              <input 
                type="radio" 
                name="isPublic"
                checked={formData.isPublic === false}
                onChange={() => setFormData({ ...formData, isPublic: false })}
                className="mt-1 text-purple-500 bg-navy-900 border-white/20 focus:ring-purple-500"
              />
              <div>
                <div className="font-medium text-white flex items-center gap-2">Private</div>
                <div className="text-sm text-slate-400">You choose who can see and commit to this repository.</div>
              </div>
            </label>
          </div>

          <div className="space-y-2 pt-4 border-t border-white/10">
            <label className="text-sm font-medium text-slate-300 block mb-2">Initial Files (Optional)</label>
            <input 
              type="file" 
              multiple 
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
            />
            <p className="text-xs text-slate-500">Files are automatically scanned for plagiarism before upload.</p>
          </div>

          <div className="pt-6 border-t border-white/10">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Scanning & Creating...</> : "Create repository"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
