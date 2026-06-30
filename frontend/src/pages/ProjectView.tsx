import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import Navbar from '../components/Layout/Navbar';
import AgentControlRoom from '../components/Agents/AgentControlRoom';
import MermaidDiagram from '../components/Diagrams/MermaidDiagram';
import DbErdDiagram from '../components/Diagrams/DbErdDiagram';
import {
  Settings, Loader2, Play, CheckCircle2, ChevronRight,
  ClipboardCopy, Download, Share2, Compass, Database,
  Code, FolderTree, KanbanSquare, DollarSign, ShieldAlert,
  Flame, HelpCircle, ArrowLeft, BookOpen
} from 'lucide-react';

interface Question {
  id: number;
  question_text: string;
  answer_text: string | null;
}

interface Blueprint {
  id: number;
  version: number;
  outputs: Record<string, string>;
  scores: {
    architecture: number;
    maintainability: number;
    scalability: number;
    security: number;
  };
  diagrams: {
    db_nodes: any[];
    db_edges: any[];
    architecture_mermaid: string;
  };
  created_at: string;
}

interface AgentLog {
  id: number;
  sender: string;
  receiver: string;
  message: string;
  status: string;
  created_at: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  created_at: string;
  questions: Question[];
  latest_blueprint: Blueprint | null;
  agent_logs: AgentLog[];
}

const ProjectView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submittingAnswers, setSubmittingAnswers] = useState(false);

  // Live generation websocket state
  const [wsLogs, setWsLogs] = useState<AgentLog[]>([]);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);

  // Tab views
  const [activeTab, setActiveTab] = useState<'blueprint' | 'diagrams' | 'api' | 'folders' | 'sprint' | 'costs' | 'risks' | 'logs'>('blueprint');
  const [activeBlueprintSection, setActiveBlueprintSection] = useState<string>('Executive Summary');

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data);
      setGenerationStatus(response.data.status);
      setWsLogs(response.data.agent_logs);
      
      // Initialize answer fields
      const initAnswers: Record<number, string> = {};
      response.data.questions.forEach((q: Question) => {
        initAnswers[q.id] = q.answer_text || '';
      });
      setAnswers(initAnswers);
      
      if (response.data.status === 'generating') {
        connectWebSocket();
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch project detail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [id]);

  // Connect WebSocket to stream agent logs
  const connectWebSocket = () => {
    if (wsRef.current) wsRef.current.close();

    const token = localStorage.getItem('blueprint_token');
    // Map HTTP protocol to WS protocol
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//localhost:8000/api/projects/${id}/stream?token=${token}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WS Connection established');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'log') {
        setWsLogs(prev => {
          // Avoid duplicate logs
          if (prev.some(l => l.id === data.data.id)) return prev;
          return [...prev, data.data];
        });
      } else if (data.type === 'status') {
        setGenerationStatus(data.status);
        setProject(prev => prev ? { ...prev, status: data.status } : null);
      } else if (data.type === 'finished') {
        // Re-fetch project to load blueprints
        fetchProject();
        ws.close();
      } else if (data.error) {
        setError(data.error);
        ws.close();
      }
    };

    ws.onclose = () => {
      console.log('WS Connection closed');
    };
  };

  const handleStartGeneration = async () => {
    try {
      setWsLogs([]);
      setGenerationStatus('generating');
      setProject(prev => prev ? { ...prev, status: 'generating' } : null);
      
      // Request backend to start generation
      await api.post(`/projects/${id}/generate`);
      
      // Connect WebSocket to receive log feed
      connectWebSocket();
    } catch (err) {
      console.error(err);
      alert('Failed to kick-off agent generation.');
      setGenerationStatus('draft');
      setProject(prev => prev ? { ...prev, status: 'draft' } : null);
    }
  };

  const handleSubmitAnswers = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAnswers(true);
    try {
      const response = await api.post(`/projects/${id}/answers`, {
        answers
      });
      setProject(response.data);
      setGenerationStatus(response.data.status);
    } catch (err) {
      console.error(err);
      alert('Failed to submit questionnaire.');
    } finally {
      setSubmittingAnswers(false);
    }
  };

  // Copy Markdown Export
  const copyMarkdown = () => {
    if (!project?.latest_blueprint) return;
    const content = Object.entries(project.latest_blueprint.outputs)
      .map(([title, body]) => `## ${title}\n\n${body}`)
      .join('\n\n');
      
    navigator.clipboard.writeText(`# ${project.name} Engineering Blueprint\n\n${content}`);
    alert('Blueprint exported as Markdown. Copied to clipboard!');
  };

  // Download PDF simulation (triggers browser print)
  const downloadPDF = () => {
    window.print();
  };

  // Share link
  const shareProject = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Project shareable link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center text-slate-400 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm">Consulting blueprint archives...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4 px-4 text-center">
        <p className="text-red-400 font-medium">{error || 'Project not found.'}</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center text-primary font-semibold hover:underline text-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  // --- Step 4 view: AI follow up questions ---
  if (generationStatus === 'interviewing') {
    return (
      <div className="min-h-screen bg-background text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 z-10 space-y-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </button>
            <span className="text-[10px] bg-accent/15 border border-accent/20 text-accent font-semibold px-3 py-1 rounded-full uppercase">
              Step 4: AI Interview
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-white glow-text">Requirement Gathering</h1>
            <p className="text-xs text-slate-400">
              The AI Product Manager wants to clarify some details before building the architecture.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl shadow-xl">
            <form onSubmit={handleSubmitAnswers} className="space-y-6">
              {project.questions.map((q, idx) => (
                <div key={q.id} className="space-y-2">
                  <label className="block text-sm font-semibold text-white leading-normal">
                    {idx + 1}. {q.question_text}
                  </label>
                  <input
                    type="text"
                    required
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    placeholder="Provide your input..."
                    className="block w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all"
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={submittingAnswers}
                className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-primary/20"
              >
                {submittingAnswers ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving answers...
                  </>
                ) : (
                  <>
                    Submit Specifications
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // --- Ready to generate view ---
  if (generationStatus === 'draft') {
    return (
      <div className="min-h-screen bg-background text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-20 z-10 text-center space-y-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-white glow-text">Specifications Approved</h1>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Requirements gathered. We are ready to execute the LangGraph multi-agent architecture debate.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl max-w-md mx-auto border border-white/5 space-y-4">
            <h4 className="text-sm font-bold text-white">Agent Team Assembled:</h4>
            <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400">
              <span className="bg-white/5 p-2 rounded-xl">Product Mgr</span>
              <span className="bg-white/5 p-2 rounded-xl">Business Analyst</span>
              <span className="bg-white/5 p-2 rounded-xl">Software Arch</span>
              <span className="bg-white/5 p-2 rounded-xl">Database Arch</span>
              <span className="bg-white/5 p-2 rounded-xl">Backend Eng</span>
              <span className="bg-white/5 p-2 rounded-xl">Security Arch</span>
              <span className="bg-white/5 p-2 rounded-xl">DevOps Eng</span>
              <span className="bg-white/5 p-2 rounded-xl">QA Engineer</span>
              <span className="bg-white/5 p-2 rounded-xl">System Node</span>
            </div>
          </div>

          <button
            onClick={handleStartGeneration}
            className="inline-flex justify-center items-center py-3 px-8 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all cursor-pointer"
          >
            <Play className="mr-2 h-4 w-4 fill-white" />
            Build Architecture Blueprint
          </button>
        </main>
      </div>
    );
  }

  // --- Actively generating view (Agent Debate live panel) ---
  if (generationStatus === 'generating') {
    return (
      <div className="min-h-screen bg-background text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 z-10 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-extrabold text-white glow-text">{project.name}</h1>
              <p className="text-xs text-slate-400 mt-1">Multi-Agent State Machine running cyclic audits...</p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30 animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
              Generating Architecture
            </span>
          </div>

          <AgentControlRoom logs={wsLogs} status={generationStatus} />
        </main>
      </div>
    );
  }

  // --- Completed blueprint view ---
  const blueprint = project.latest_blueprint;
  if (!blueprint) return null;

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col print:bg-white print:text-black">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
        {/* Toolbar Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6 print:border-none">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-extrabold text-white glow-text print:text-black">{project.name}</h1>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-semibold uppercase">
                v{blueprint.version}
              </span>
            </div>
            <p className="text-xs text-slate-400 print:hidden">{project.description}</p>
          </div>

          <div className="flex items-center space-x-3 print:hidden">
            <button
              onClick={shareProject}
              className="flex items-center justify-center p-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-slate-300 hover:text-white cursor-pointer text-xs"
              title="Copy Link"
            >
              <Share2 className="h-4 w-4 mr-1.5" />
              Share
            </button>
            <button
              onClick={copyMarkdown}
              className="flex items-center justify-center p-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-slate-300 hover:text-white cursor-pointer text-xs"
              title="Copy Markdown"
            >
              <ClipboardCopy className="h-4 w-4 mr-1.5" />
              Markdown
            </button>
            <button
              onClick={downloadPDF}
              className="flex items-center justify-center p-2.5 rounded-xl bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all text-white font-semibold cursor-pointer text-xs"
              title="Download PDF / Print"
            >
              <Download className="h-4 w-4 mr-1.5" />
              PDF Exporter
            </button>
          </div>
        </div>

        {/* Global Architecture Scores Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4">
          <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-accent flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Architecture</p>
              <p className="text-2xl font-bold text-white print:text-black">{blueprint.scores.architecture}%</p>
            </div>
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-accent/10 text-accent">
              <Compass className="h-5 w-5" />
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-primary flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Maintainability</p>
              <p className="text-2xl font-bold text-white print:text-black">{blueprint.scores.maintainability}%</p>
            </div>
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
              <Settings className="h-5 w-5" />
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-emerald-500 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Security</p>
              <p className="text-2xl font-bold text-white print:text-black">{blueprint.scores.security}%</p>
            </div>
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-amber-500 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Scalability</p>
              <p className="text-2xl font-bold text-white print:text-black">{blueprint.scores.scalability}%</p>
            </div>
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
              <Flame className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Tab view navigation */}
        <div className="flex space-x-2 border-b border-white/5 pb-px print:hidden overflow-x-auto">
          {[
            { id: 'blueprint', label: 'Documentation (20 Chapters)', icon: BookOpen },
            { id: 'diagrams', label: 'Architecture & DB ERD', icon: Database },
            { id: 'api', label: 'API Explorer', icon: Code },
            { id: 'folders', label: 'Folder structures', icon: FolderTree },
            { id: 'sprint', label: 'Sprint Planner', icon: KanbanSquare },
            { id: 'costs', label: 'Cost Analyst', icon: DollarSign },
            { id: 'logs', label: 'Consultant Debate Log', icon: HelpCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-4 py-3 text-xs font-semibold border-b-2 cursor-pointer transition-all whitespace-nowrap ${
                  isActive 
                    ? 'border-primary text-white bg-primary/5' 
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Content Body */}
        <div className="grid grid-cols-1 gap-6">
          {/* TAB 1: BLUEPRINT 20 CHAPTERS VIEW */}
          {activeTab === 'blueprint' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Sidebar directory for chapters */}
              <div className="md:col-span-1 glass-panel p-4 rounded-3xl space-y-1 print:hidden h-[550px] overflow-y-auto">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Chapters</p>
                {Object.keys(blueprint.outputs).map((title) => (
                  <button
                    key={title}
                    onClick={() => setActiveBlueprintSection(title)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                      activeBlueprintSection === title
                        ? 'bg-primary text-white'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {title}
                  </button>
                ))}
              </div>

              {/* Main Chapter Viewer */}
              <div className="md:col-span-3 glass-panel p-8 rounded-3xl min-h-[550px] print:border-none print:shadow-none print:p-0">
                <div className="prose prose-invert prose-xs max-w-none prose-pre:bg-slate-900 prose-pre:border prose-pre:border-white/5 prose-pre:rounded-2xl">
                  {/* Standard basic custom markdown renderer */}
                  <div className="markdown-content">
                    {blueprint.outputs[activeBlueprintSection] ? (
                      blueprint.outputs[activeBlueprintSection]
                        .split('\n')
                        .map((line, idx) => {
                          if (line.startsWith('# ')) {
                            return <h1 key={idx} className="text-2xl font-bold text-white mt-6 mb-4">{line.replace('# ', '')}</h1>;
                          }
                          if (line.startsWith('## ')) {
                            return <h2 key={idx} className="text-xl font-bold text-white mt-5 mb-3">{line.replace('## ', '')}</h2>;
                          }
                          if (line.startsWith('### ')) {
                            return <h3 key={idx} className="text-lg font-bold text-slate-200 mt-4 mb-2">{line.replace('### ', '')}</h3>;
                          }
                          if (line.startsWith('- ') || line.startsWith('* ')) {
                            return <li key={idx} className="text-slate-300 ml-4 list-disc my-1">{line.substring(2)}</li>;
                          }
                          if (line.includes('|')) {
                            // Render clean tables
                            return <p key={idx} className="font-mono text-[11px] text-slate-400 bg-slate-950/20 p-1.5 rounded">{line}</p>;
                          }
                          return <p key={idx} className="text-slate-300 text-sm leading-relaxed my-2">{line}</p>;
                        })
                    ) : (
                      <p className="text-slate-500">No blueprint data compiled for this chapter.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE DIAGRAMS (SYSTEM FLOW & DB ERD) */}
          {activeTab === 'diagrams' && (
            <div className="space-y-6">
              {/* Architecture diagram */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white">System Integration Diagram</h3>
                <p className="text-xs text-slate-400">Cyclic network relationships of stateless servers, workers, and databases.</p>
                <MermaidDiagram chart={blueprint.diagrams.architecture_mermaid} />
              </div>

              {/* Database ERD */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white">Database Schema ERD</h3>
                <p className="text-xs text-slate-400">Interactive schema design showing primary/foreign key connections.</p>
                <DbErdDiagram nodes={blueprint.diagrams.db_nodes} edges={blueprint.diagrams.db_edges} />
              </div>
            </div>
          )}

          {/* TAB 3: API EXPLORER */}
          {activeTab === 'api' && (
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">REST API Design Specs</h3>
                <p className="text-xs text-slate-400">Documented swagger interfaces for auth and data actions.</p>
              </div>

              <div className="border border-white/5 rounded-2xl overflow-hidden text-xs">
                {/* Visual Endpoints list */}
                {[
                  { method: 'POST', path: '/api/auth/register', desc: 'Creates a new user profile.', body: '{"email": "str", "fullname": "str", "password": "str"}' },
                  { method: 'POST', path: '/api/auth/login', desc: 'Validates credentials and returns JWT bearer token.', body: '{"email": "str", "password": "str"}' },
                  { method: 'GET', path: '/api/projects', desc: 'List projects associated with authenticated user.', auth: true },
                  { method: 'POST', path: '/api/projects', desc: 'Create skeleton and initiate interview questions.', body: '{"name": "str", "description": "str"}', auth: true },
                  { method: 'POST', path: '/api/projects/{id}/answers', desc: 'Submit questions checklist.', body: '{"answers": "Dict[int, str]"}', auth: true },
                  { method: 'POST', path: '/api/projects/{id}/generate', desc: 'Triggers background worker to run agent debate.', auth: true }
                ].map((route, idx) => (
                  <div key={idx} className="border-b border-white/5 p-4 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-white/2">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                          route.method === 'POST' ? 'bg-primary' : 'bg-accent'
                        }`}>
                          {route.method}
                        </span>
                        <span className="font-mono font-semibold text-white">{route.path}</span>
                        {route.auth && (
                          <span className="text-[8px] bg-slate-500/10 border border-slate-500/25 text-slate-400 px-1 py-0.25 rounded">
                            JWT Required
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400">{route.desc}</p>
                    </div>

                    {route.body && (
                      <div className="w-full md:w-64">
                        <p className="text-[9px] uppercase font-bold text-slate-500 mb-1">Payload Schema</p>
                        <pre className="p-2 bg-black/40 border border-white/5 rounded-xl font-mono text-[9px] text-slate-300 overflow-x-auto">
                          {route.body}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: FOLDER STRUCTURE TREE */}
          {activeTab === 'folders' && (
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Engineering Workspace Folders</h3>
                <p className="text-xs text-slate-400">Strictly follows Clean Architecture on backend and Modular components on React frontend.</p>
              </div>

              <div className="p-6 bg-black/40 border border-white/5 rounded-3xl font-mono text-xs text-slate-300 space-y-1">
                {[
                  { name: 'blueprint-workspace/', depth: 0, desc: 'Root SaaS workspace' },
                  { name: 'backend/', depth: 1, desc: 'FastAPI python directory' },
                  { name: 'app/', depth: 2, desc: 'Main API logic' },
                  { name: 'domain/', depth: 3, desc: 'Core Clean Architecture models & Repository contracts' },
                  { name: 'use_cases/', depth: 3, desc: 'LangGraph multi-agent and auth workflows' },
                  { name: 'infrastructure/', depth: 3, desc: 'SQLite DB repos, Groq LLM client, JWT secure tokens' },
                  { name: 'interfaces/', depth: 3, desc: 'FastAPI validation schemas and controllers' },
                  { name: 'tests/', depth: 2, desc: 'Pytest endpoints test cases' },
                  { name: 'Dockerfile', depth: 2, desc: 'Multi-stage python environment' },
                  { name: 'frontend/', depth: 1, desc: 'Vite React + TypeScript workspace' },
                  { name: 'src/', depth: 2, desc: 'Frontend source' },
                  { name: 'components/', depth: 3, desc: 'Diagram adapters and agent console panels' },
                  { name: 'pages/', depth: 3, desc: 'Clean dashboards and wizards views' },
                  { name: 'context/', depth: 3, desc: 'LocalStorage Auth tokens' },
                  { name: 'docker-compose.yml', depth: 1, desc: 'Stack orchestration configuration' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center hover:text-white py-0.5">
                    <span style={{ marginLeft: `${item.depth * 20}px` }} className="text-slate-500 mr-2">
                      {item.depth > 0 ? '└── ' : ''}
                    </span>
                    <span className={`font-semibold ${item.name.endsWith('/') ? 'text-primary' : 'text-slate-200'}`}>
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-4 font-normal hidden sm:inline">— {item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SPRINT BOARD (KANBAN KANBAN) */}
          {activeTab === 'sprint' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Scrum Sprint Board</h3>
                <p className="text-xs text-slate-400">Task breakdown prioritized by our Business Analyst agent.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sprint 1 */}
                <div className="glass-panel p-5 rounded-3xl space-y-4 border-t-4 border-t-primary">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="font-bold text-sm text-white">Sprint 1: Base Foundations</span>
                    <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-semibold">Weeks 1-2</span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-black/20 border border-white/5 rounded-xl space-y-1 text-xs">
                      <p className="font-bold text-white">SP-101: Repository Scaffold</p>
                      <p className="text-slate-400 text-[10px]">Create backend clean modules & react layout views.</p>
                    </div>
                    <div className="p-3 bg-black/20 border border-white/5 rounded-xl space-y-1 text-xs">
                      <p className="font-bold text-white">SP-102: JWT API Safety</p>
                      <p className="text-slate-400 text-[10px]">Integrate bcrypt hash and validation handlers.</p>
                    </div>
                  </div>
                </div>

                {/* Sprint 2 */}
                <div className="glass-panel p-5 rounded-3xl space-y-4 border-t-4 border-t-accent">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="font-bold text-sm text-white">Sprint 2: AI & Diagrams</span>
                    <span className="text-[9px] bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded font-semibold">Weeks 3-4</span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-black/20 border border-white/5 rounded-xl space-y-1 text-xs">
                      <p className="font-bold text-white">SP-201: LangGraph Debates</p>
                      <p className="text-slate-400 text-[10px]">Hook up Groq templates and streaming logs.</p>
                    </div>
                    <div className="p-3 bg-black/20 border border-white/5 rounded-xl space-y-1 text-xs">
                      <p className="font-bold text-white">SP-202: React Flow ERD</p>
                      <p className="text-slate-400 text-[10px]">Render schema databases with connector lines.</p>
                    </div>
                  </div>
                </div>

                {/* Sprint 3 */}
                <div className="glass-panel p-5 rounded-3xl space-y-4 border-t-4 border-t-emerald-500">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="font-bold text-sm text-white">Sprint 3: Dashboards & QA</span>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold">Weeks 5-6</span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-black/20 border border-white/5 rounded-xl space-y-1 text-xs">
                      <p className="font-bold text-white">SP-301: DevOps Containers</p>
                      <p className="text-slate-400 text-[10px]">Configure Dockerfiles, compose stacks, and deploy.</p>
                    </div>
                    <div className="p-3 bg-black/20 border border-white/5 rounded-xl space-y-1 text-xs">
                      <p className="font-bold text-white">SP-302: PDF / Markdown Export</p>
                      <p className="text-slate-400 text-[10px]">Add print handlers and download tools.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: COST ANALYST */}
          {activeTab === 'costs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel p-6 rounded-3xl space-y-4 flex flex-col justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Infrastructure Cost Projections</h3>
                  <p className="text-xs text-slate-400">Monthly breakdown for scaling to 100k active users.</p>
                </div>

                {/* Visual canvas simulator */}
                <div className="space-y-3 font-mono text-xs">
                  {[
                    { label: 'Compute (ECS Fargate)', cost: 120, pct: '35%' },
                    { label: 'Primary DB (RDS PostgreSQL)', cost: 75, pct: '22%' },
                    { label: 'Caching & Queue (Redis)', cost: 18, pct: '5%' },
                    { label: 'Hosting (S3 & CloudFront CDN)', cost: 45, pct: '13%' },
                    { label: 'Groq LLM Tokens API', cost: 50, pct: '15%' },
                    { label: 'Observability & Logs', cost: 30, pct: '10%' }
                  ].map((cost, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-slate-300">
                        <span>{cost.label}</span>
                        <span>${cost.cost}.00 / mo</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: cost.pct }} />
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-white/10 pt-4 flex justify-between text-sm font-bold text-white">
                    <span>Total Projections</span>
                    <span className="text-primary">$338.00 / month</span>
                  </div>
                </div>
              </div>

              {/* DevOps cost reduction rules */}
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <h4 className="text-sm font-bold text-white">AWS Budget Optimizations</h4>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-start">
                    <span className="h-2 w-2 bg-primary rounded-full mt-1.5 mr-2 shrink-0" />
                    <span><strong>Fargate Spot</strong>: Run worker services (Celery/LangGraph cycles) on Spot clusters to trim CPU billing by 70%.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-2 w-2 bg-primary rounded-full mt-1.5 mr-2 shrink-0" />
                    <span><strong>Caching CDN</strong>: Cache dashboard metrics on Edge servers using AWS CloudFront rules to decrease S3 ingress.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-2 w-2 bg-primary rounded-full mt-1.5 mr-2 shrink-0" />
                    <span><strong>Postgres Scaling</strong>: Leverage connection pools (e.g. pgBouncer) to restrict RDS concurrency locks under peak hours.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 7: CONSULTANT DEBATE LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white">Multi-Agent Transcript History</h3>
              <p className="text-xs text-slate-400">Review historical debates between Security, Database, and Software Architect agents.</p>
              <AgentControlRoom logs={wsLogs} status="completed" />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProjectView;
