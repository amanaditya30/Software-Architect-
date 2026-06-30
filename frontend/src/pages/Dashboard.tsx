import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import Navbar from '../components/Layout/Navbar';
import {
  Folder, Plus, ArrowRight, Trash2, Calendar, ShieldCheck,
  Zap, Code2, AlertTriangle, Play, HelpCircle, Loader2
} from 'lucide-react';

interface Question {
  id: number;
  question_text: string;
  answer_text: string | null;
}

interface Blueprint {
  id: number;
  version: number;
  scores: {
    architecture: number;
    maintainability: number;
    scalability: number;
    security: number;
  };
  created_at: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  questions: Question[];
  latest_blueprint: Blueprint | null;
}

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch projects workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to permanently delete this project and all its blueprints?')) {
      try {
        await api.delete(`/projects/${id}`);
        setProjects(projects.filter((p) => p.id !== id));
      } catch (err) {
        console.error(err);
        alert('Failed to delete project.');
      }
    }
  };

  // Aggregated Metrics
  const completedProjects = projects.filter((p) => p.status === 'completed');
  const avgArch = completedProjects.length
    ? Math.round(completedProjects.reduce((acc, p) => acc + (p.latest_blueprint?.scores.architecture || 0), 0) / completedProjects.length)
    : 0;
  const avgMaint = completedProjects.length
    ? Math.round(completedProjects.reduce((acc, p) => acc + (p.latest_blueprint?.scores.maintainability || 0), 0) / completedProjects.length)
    : 0;
  const avgSec = completedProjects.length
    ? Math.round(completedProjects.reduce((acc, p) => acc + (p.latest_blueprint?.scores.security || 0), 0) / completedProjects.length)
    : 0;

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8 z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white glow-text">
              Architecture Control Panel
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Analyze, architect, and schedule your software engineering blueprints.
            </p>
          </div>

          <Link
            to="/project/new"
            className="flex items-center justify-center py-2.5 px-5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5 mr-2" />
            Create Project
          </Link>
        </div>

        {/* Analytics Section */}
        {completedProjects.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Active Projects</span>
              <div className="flex items-baseline mt-4">
                <span className="text-3xl font-bold text-white">{projects.length}</span>
                <span className="text-xs font-medium text-slate-500 ml-2">Total</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between border-l-2 border-l-accent">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold tracking-wider uppercase">Avg Architecture</span>
                <Code2 className="h-4 w-4 text-accent" />
              </div>
              <div className="flex items-baseline mt-4">
                <span className="text-3xl font-bold text-white glow-text">{avgArch}%</span>
                <span className="text-xs font-medium text-slate-500 ml-2">Score</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between border-l-2 border-l-primary">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold tracking-wider uppercase">Avg Maintainability</span>
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-baseline mt-4">
                <span className="text-3xl font-bold text-white glow-text">{avgMaint}%</span>
                <span className="text-xs font-medium text-slate-500 ml-2">Score</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between border-l-2 border-l-emerald-500">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold tracking-wider uppercase">Avg Security</span>
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline mt-4">
                <span className="text-3xl font-bold text-white glow-text">{avgSec}%</span>
                <span className="text-xs font-medium text-slate-500 ml-2">Score</span>
              </div>
            </div>
          </div>
        )}

        {/* Workspace List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm">Loading blueprints workspace...</p>
          </div>
        ) : error ? (
          <div className="glass-panel p-6 rounded-2xl border border-accent-danger/20 text-center max-w-md mx-auto">
            <AlertTriangle className="h-10 w-10 text-accent-danger mx-auto mb-3 animate-pulse" />
            <p className="text-sm font-medium text-white">{error}</p>
            <button
              onClick={fetchProjects}
              className="mt-4 py-2 px-4 rounded-xl text-xs bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors"
            >
              Retry
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center max-w-2xl mx-auto space-y-5">
            <Folder className="h-16 w-16 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Empty Architect Studio</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Start by describing your software idea. Blueprint AI will generate a complete engineering architecture breakdown.
              </p>
            </div>
            <Link
              to="/project/new"
              className="inline-flex items-center py-2.5 px-5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const dateStr = new Date(project.updated_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              let statusColor = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
              let statusLabel = 'Draft';

              if (project.status === 'interviewing') {
                statusColor = 'bg-accent/10 text-accent border-accent/20';
                statusLabel = 'Interviewing';
              } else if (project.status === 'generating') {
                statusColor = 'bg-primary/20 text-primary border-primary/30 animate-pulse';
                statusLabel = 'Generating...';
              } else if (project.status === 'completed') {
                statusColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                statusLabel = 'Ready';
              }

              return (
                <div
                  key={project.id}
                  onClick={() => {
                    if (project.status === 'interviewing') {
                      navigate(`/project/${project.id}`);
                    } else {
                      navigate(`/project/${project.id}`);
                    }
                  }}
                  className="glass-panel p-6 rounded-3xl flex flex-col justify-between glass-panel-hover cursor-pointer relative"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusColor}`}>
                        {statusLabel}
                      </span>
                      <button
                        onClick={(e) => handleDelete(project.id, e)}
                        className="text-slate-500 hover:text-accent-danger transition-colors p-1 rounded-lg hover:bg-white/5"
                        title="Delete Blueprint"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-white truncate">{project.name}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px]">{project.description}</p>
                    </div>
                  </div>

                  {project.status === 'completed' && project.latest_blueprint ? (
                    <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                      {/* Score metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>Architecture</span>
                            <span className="font-semibold text-white">{project.latest_blueprint.scores.architecture}%</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent"
                              style={{ width: `${project.latest_blueprint.scores.architecture}%` }}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>Maintainability</span>
                            <span className="font-semibold text-white">{project.latest_blueprint.scores.maintainability}%</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${project.latest_blueprint.scores.maintainability}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                        <span className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {dateStr}
                        </span>
                        <span className="flex items-center text-primary font-semibold hover:underline">
                          View Blueprint
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                      <span className="flex items-center text-xs text-slate-400">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {dateStr}
                      </span>
                      
                      {project.status === 'interviewing' ? (
                        <span className="flex items-center text-xs text-accent font-semibold hover:underline">
                          <HelpCircle className="h-3.5 w-3.5 mr-1 animate-bounce" />
                          Answer Questions
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </span>
                      ) : project.status === 'generating' ? (
                        <span className="flex items-center text-xs text-primary font-semibold">
                          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                          Compiling...
                        </span>
                      ) : (
                        <span className="flex items-center text-xs text-slate-400 font-semibold hover:underline">
                          <Play className="h-3.5 w-3.5 mr-1" />
                          Start Build
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
