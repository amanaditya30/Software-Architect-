import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid with custom dark theme configurations
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  themeVariables: {
    background: '#0a0a0c',
    primaryColor: '#8b5cf6',
    primaryTextColor: '#f8fafc',
    lineColor: '#3b82f6',
    secondaryColor: '#1e293b',
  }
});

interface MermaidProps {
  chart: string;
}

export const MermaidDiagram: React.FC<MermaidProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderId = useRef(`mermaid-${Math.floor(Math.random() * 100000)}`);

  useEffect(() => {
    const renderChart = async () => {
      if (containerRef.current && chart) {
        try {
          containerRef.current.innerHTML = '';
          const { svg } = await mermaid.render(renderId.current, chart);
          containerRef.current.innerHTML = svg;
        } catch (err) {
          console.error("Mermaid parsing error", err);
          containerRef.current.innerHTML = `
            <div class="text-xs text-red-400 p-4 border border-red-500/20 bg-red-500/5 rounded-xl font-mono">
              [Mermaid Syntax Parsing Failed]
            </div>
          `;
        }
      }
    };

    renderChart();
  }, [chart]);

  return (
    <div 
      ref={containerRef} 
      className="w-full flex justify-center p-6 bg-black/40 rounded-3xl border border-white/5 overflow-x-auto min-h-[250px] items-center" 
    />
  );
};

export default MermaidDiagram;
