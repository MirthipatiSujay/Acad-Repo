"use client";

import { useAuthStore } from "../../store/authStore";
import { Copy, Edit2, Save, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, login } = useAuthStore();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    university: "",
    skills: ""
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        name: user.name || "",
        university: user.university || "",
        skills: user.skills ? user.skills.join(", ") : ""
      });
    }
  }, [user, isEditing]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const skillsArray = formData.skills.split(",").map(s => s.trim()).filter(s => s.length > 0);
      const res = await api.put("/users/profile", {
        name: formData.name,
        university: formData.university,
        skills: skillsArray
      });
      
      login(res.data.user, useAuthStore.getState().token || "");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-8">Your Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="md:col-span-1">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center">
             <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-purple-600 to-teal-400 flex items-center justify-center text-5xl font-bold text-white shadow-xl mb-4">
               {user.name ? user.name[0].toUpperCase() : user.username[0].toUpperCase()}
             </div>
             
             {!isEditing ? (
               <>
                 <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                 <p className="text-slate-400 font-medium mb-4">@{user.username}</p>
                 <button 
                   onClick={() => setIsEditing(true)}
                   className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-sm font-medium transition-colors text-white flex justify-center items-center gap-2"
                 >
                    <Edit2 className="w-4 h-4" /> Edit Profile
                 </button>
               </>
             ) : (
               <div className="w-full space-y-3 mt-2">
                 <div className="text-left">
                   <label className="text-[10px] uppercase tracking-wider text-slate-500 ml-1">Display Name</label>
                   <input 
                     type="text" 
                     value={formData.name}
                     onChange={e => setFormData({...formData, name: e.target.value})}
                     className="w-full bg-navy-900 border border-white/10 text-white rounded px-3 py-2 text-sm" 
                     placeholder="Your Full Name"
                   />
                 </div>
                 <div className="text-left">
                   <p className="text-slate-400 font-medium text-sm ml-1">@{user.username}</p>
                 </div>
                 
                 <div className="flex gap-2">
                   <button 
                     onClick={() => setIsEditing(false)}
                     className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-md text-sm font-medium text-white flex justify-center items-center gap-1"
                   >
                      <X className="w-4 h-4" /> Cancel
                   </button>
                   <button 
                     onClick={handleSave}
                     disabled={isSaving}
                     className="flex-1 py-2 bg-teal-500 hover:bg-teal-600 rounded-md text-sm font-medium text-navy-900 flex justify-center items-center gap-1 disabled:opacity-50"
                   >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <><Save className="w-4 h-4" /> Save</>}
                   </button>
                 </div>
               </div>
             )}
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
           <div className="glass-panel p-6 rounded-2xl border border-white/5">
             <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
             
             <div className="space-y-4">
               <div>
                 <label className="text-xs text-slate-500 font-medium uppercase tracking-wider">Email</label>
                 <div className="text-slate-300 mt-1 flex justify-between items-center bg-navy-900 px-3 py-2 rounded-md">
                   {user.email} <Copy className="w-4 h-4 text-slate-500 cursor-pointer hover:text-white" />
                 </div>
               </div>
               
               <div>
                  <label className="text-xs text-slate-500 font-medium uppercase tracking-wider">University</label>
                  {isEditing ? (
                    <div className="mt-1">
                      <input 
                        type="text" 
                        value={formData.university}
                        onChange={e => setFormData({...formData, university: e.target.value})}
                        className="w-full bg-navy-900 border border-white/10 text-white rounded px-3 py-2 text-sm" 
                        placeholder="e.g. Lovely Professional University"
                      />
                    </div>
                  ) : (
                    <div className="text-slate-300 mt-1 bg-navy-900 px-3 py-2 rounded-md">
                      {user.university || <span className="text-slate-500 italic">No university added yet.</span>}
                    </div>
                  )}
               </div>
               
               <div>
                  <label className="text-xs text-slate-500 font-medium uppercase tracking-wider">Skills</label>
                  
                  {isEditing ? (
                    <div className="mt-1">
                      <input 
                        type="text" 
                        value={formData.skills}
                        onChange={e => setFormData({...formData, skills: e.target.value})}
                        className="w-full bg-navy-900 border border-white/10 text-white rounded px-3 py-2 text-sm mb-1" 
                        placeholder="React, Machine Learning, Python (comma separated)"
                      />
                      <p className="text-xs text-slate-500 lowercase">Separate skills using commas</p>
                    </div>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {user.skills && user.skills.length > 0 ? user.skills.map((skill: string) => (
                        <span key={skill} className="px-3 py-1 bg-white/5 rounded-full text-sm text-slate-300">
                          {skill}
                        </span>
                      )) : (
                        <span className="text-slate-500 text-sm italic">No skills added yet.</span>
                      )}
                    </div>
                  )}
               </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
