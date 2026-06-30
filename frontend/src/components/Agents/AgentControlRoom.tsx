import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Shield, Cpu, Database, Users, Code, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AgentLog {
  id: number;
  sender: string;
  receiver: string;
  message: string;
  status: string;
  created_at: string;
}

interface AgentControlRoomProps {
  logs: AgentLog[];
  status: string;
}

interface AgentInfo {
  name: string;
  role: string;
  icon: any;
  color: string;
}

const AGENTS: Record<string, AgentInfo> = {
  'Product Manager': { name: 'Product Manager', role: 'Requirements & Roadmap', icon: Users, color: 'text-violet-400 bg-violet-500/10 border-violet-500/25' },
  'Business Analyst': { name: 'Business Analyst', role: 'Workflows & Personas', icon: Activity, color: 'text-sky-400 bg-sky-500/10 border-sky-500/25' },
  'Software Architect': { name: 'Software Architect', role: 'System & Scalability', icon: Cpu, color: 'text-blue-400 bg-blue-500/10 border-blue-500/25' },
  'Database Architect': { name: 'Database Architect', role: 'Schemas & ERD', icon: Database, color: 'text-amber-400 bg-amber-500/10 border-amber-500/25' },
  'Backend Engineer': { name: 'Backend Engineer', role: 'APIs & Logic', icon: Code, color: 'text-teal-400 bg-teal-500/10 border-teal-500/25' },
  'Security Architect': { name: 'Security Architect', role: 'JWT, RBAC & Audit', icon: Shield, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' },
  'DevOps Engineer': { name: 'DevOps Engineer', role: 'Docker & CI/CD', icon: Terminal, color: 'text-pink-400 bg-pink-500/10 border-pink-500/25' },
  'QA Engineer': { name: 'QA Engineer', role: 'Testing & Coverage', icon: CheckCircle2, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25' },
  'System': { name: 'System Core', role: 'Orchestrator', icon: Cpu, color: 'text-slate-400 bg-slate-500/10 border-slate-500/25' }
};

export const AgentControlRoom: React.FC<AgentControlRoomProps> = ({ logs, status }) => {
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll log terminal
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Track currently active agent based on last log
  useEffect(() => {
    if (logs.length > 0) {
      const lastLog = logs[logs.length - 1];
      setActiveAgent(lastLog.sender);
    } else {
      setActiveAgent(null);
    }
  }, [logs]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[680px]">
      {/* Visual Agents Grid */}
      <div className="lg:col-span-2 glass-panel p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden h-full">
        <div className="absolute top-0 right-0 p-4 flex items-center space-x-2">
          <span className="h-2.5 w-2.5 bg-primary animate-ping rounded-full" />
          <span className="text-[10px] uppercase font-semibold text-primary tracking-wider">
            {status === 'generating' ? 'Live AI Collaboration Room' : 'Simulation Closed'}
          </span>
        </div>

        <div className="space-y-1 z-10">
          <h3 className="text-lg font-bold text-white">Agent Collaboration Mesh</h3>
          <p className="text-xs text-slate-400">Observe AI consultants communicating, debating, and approving constraints.</p>
        </div>

        {/* Visual Map Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8 z-10">
          {Object.entries(AGENTS).map(([key, agent]) => {
            if (key === 'System') return null;
            const Icon = agent.icon;
            const isActive = activeAgent === key;
            const hasActivity = logs.some(l => l.sender === key);
            
            // Determine active borders
            let cardBorders = 'border-white/5';
            let shadowClass = '';
            if (isActive) {
              cardBorders = 'border-primary shadow-lg shadow-primary/10 scale-102';
              shadowClass = 'animate-pulse';
            } else if (hasActivity) {
              cardBorders = 'border-white/10';
            }

            return (
              <div
                key={key}
                className={`glass-panel p-4 rounded-2xl flex flex-col items-center text-center justify-between transition-all duration-300 border ${cardBorders} ${shadowClass} relative h-28`}
              >
                {isActive && (
                  <span className="absolute -top-1.5 -right-1.5 h-3 w-3 bg-primary rounded-full border border-background" />
                )}
                
                <div className={`p-2 rounded-xl ${agent.color.split(' ')[1]} ${agent.color.split(' ')[0]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                
                <div className="space-y-0.5">
                  <p className="text-[11px] font-bold text-white truncate max-w-[120px]">{agent.name}</p>
                  <p className="text-[8px] text-slate-400 truncate max-w-[120px]">{agent.role}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Node Display */}
        <div className="border-t border-white/5 pt-4 flex items-center space-x-3 z-10">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400">
            <Activity className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Active Node</p>
            <p className="text-xs text-white font-medium">
              {status === 'generating' && activeAgent 
                ? `${activeAgent} processing node workflows...`
                : status === 'completed'
                ? 'All nodes approved. Blueprint generated.'
                : 'Awaiting generation kick-off.'}
            </p>
          </div>
        </div>
      </div>

      {/* Terminal Dialogue Logs */}
      <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between bg-black/40 h-full border border-white/5 relative">
        <div className="border-b border-white/5 pb-3 flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center">
            <Terminal className="h-4 w-4 mr-1.5 text-primary" />
            Dialogue Console
          </span>
          <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded">
            {logs.length} events
          </span>
        </div>

        {/* Scrollable logs */}
        <div className="flex-1 overflow-y-auto my-4 pr-2 space-y-4 text-xs font-mono">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 text-[11px] space-y-1">
              <Terminal className="h-8 w-8 text-slate-700" />
              <p>Awaiting generation console feed...</p>
            </div>
          ) : (
            logs.map((log) => {
              const isRequestChange = log.status === 'request_change';
              const isApproved = log.status === 'approved';

              let logBorder = 'border-white/5';
              let tag = null;

              if (isRequestChange) {
                logBorder = 'border-red-500/20 bg-red-500/5';
                tag = (
                  <span className="inline-flex items-center text-[8px] font-bold bg-red-500/10 text-red-400 border border-red-500/25 px-1.5 rounded uppercase mt-1">
                    <ShieldAlert className="h-2 w-2 mr-0.5" />
                    Objection
                  </span>
                );
              } else if (isApproved) {
                logBorder = 'border-emerald-500/20 bg-emerald-500/5';
                tag = (
                  <span className="inline-flex items-center text-[8px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 rounded uppercase mt-1">
                    <CheckCircle2 className="h-2 w-2 mr-0.5" />
                    Resolved
                  </span>
                );
              }

              return (
                <div key={log.id} className={`p-3 rounded-xl border ${logBorder} space-y-1`}>
                  <div className="flex justify-between items-start text-[10px]">
                    <span className="font-bold text-white">{log.sender}</span>
                    <span className="text-slate-500">→ {log.receiver}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed mt-1 break-words">{log.message}</p>
                  {tag}
                </div>
              );
            })
          )}
          {status === 'generating' && (
            <div className="flex items-center space-x-2 text-slate-500 py-1 border-t border-white/5">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span className="text-[10px] animate-pulse">Waiting for next agent feedback...</span>
            </div>
          )}
          <div ref={consoleEndRef} />
        </div>
      </div>
    </div>
  );
};

const Loader2: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
export default AgentControlRoom;
