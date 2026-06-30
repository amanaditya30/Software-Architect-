import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import Navbar from '../components/Layout/Navbar';
import { ArrowRight, Loader2, Cpu, Lightbulb } from 'lucide-react';

const NewProject: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/projects', {
        name,
        description
      });
      const project = response.data;
      // Redirect straight to project detail page which will handle questionnaire
      navigate(`/project/${project.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to submit idea. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (sName: string, sDesc: string) => {
    setName(sName);
    setDescription(sDesc);
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 z-10 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-2">
            <Cpu className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white glow-text">
            Consult the Architect Firm
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Input your software idea. The multi-agent workspace will audit specifications and generate an engineering blueprint.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl shadow-xl">
          {error && (
            <div className="mb-6 rounded-xl bg-accent-danger/10 border border-accent-danger/25 p-3 text-xs text-accent-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">
                Project Name
              </label>
              <input
                type="text"
                required
                disabled={loading}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., FlashDelivery"
                className="block w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">
                Describe the Software Idea
              </label>
              <textarea
                required
                rows={5}
                disabled={loading}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you want to build, core users, payment setups, etc. Example: 'I want to build a real-time food delivery app connecting local restaurants, drivers, and hungry users...'"
                className="block w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim() || !description.trim()}
              className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Consulting Product Lead...
                </>
              ) : (
                <>
                  Analyze Software Idea
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Suggestion templates */}
        {!loading && (
          <div className="space-y-3">
            <div className="flex items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Lightbulb className="h-4 w-4 text-primary mr-1.5" />
              Need inspiration? Choose a template:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => handleSuggestion(
                  'DelishDrive',
                  'I want to build a local food delivery application connecting local restaurants, delivery drivers, and customers, with real-time map location updates and Stripe payments.'
                )}
                className="glass-panel p-4 rounded-2xl text-left hover:border-primary/40 transition-colors text-xs space-y-1 bg-white/2"
              >
                <p className="font-bold text-white">Food Delivery App</p>
                <p className="text-slate-400 line-clamp-1">Restaurants, drivers, live tracking, Stripe integrations.</p>
              </button>

              <button
                onClick={() => handleSuggestion(
                  'TaskFlow',
                  'I want to build a real-time collaborative task manager SaaS similar to Trello, with workspaces, kanban boards, live chat threads using WebSockets, and OAuth login.'
                )}
                className="glass-panel p-4 rounded-2xl text-left hover:border-primary/40 transition-colors text-xs space-y-1 bg-white/2"
              >
                <p className="font-bold text-white">Collaborative Task SaaS</p>
                <p className="text-slate-400 line-clamp-1">Trello clone, Websocket sync, OAuth login, boards.</p>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default NewProject;
