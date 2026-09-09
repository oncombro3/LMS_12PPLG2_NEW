import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Play,
  RotateCcw,
  Copy,
  Check,
  Download,
  Sparkles,
  Maximize2,
  Minimize2,
  Code,
  Layout,
  Layers,
  ChevronDown
} from 'lucide-react';
import { CODE_PLAYGROUND_TEMPLATES } from '../data/initialData';

interface CodePlaygroundViewProps {
  initialCode?: string;
  initialLanguage?: string;
}

export const CodePlaygroundView: React.FC<CodePlaygroundViewProps> = ({
  initialCode,
  initialLanguage,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState('tpl-react');
  const [code, setCode] = useState(
    initialCode || CODE_PLAYGROUND_TEMPLATES[0].code
  );
  const [language, setLanguage] = useState(
    initialLanguage || CODE_PLAYGROUND_TEMPLATES[0].language
  );
  const [logs, setLogs] = useState<string[]>([]);
  const [iframeSrcDoc, setIframeSrcDoc] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeMode, setActiveMode] = useState<'preview' | 'console'>('preview');

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // When initialCode changes from outside props
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      if (initialLanguage) setLanguage(initialLanguage);
      runCode(initialCode, initialLanguage || 'javascript');
    }
  }, [initialCode, initialLanguage]);

  useEffect(() => {
    runCode(code, language);
  }, []);

  const runCode = (codeToRun: string, lang: string) => {
    setLogs([]);

    if (lang === 'html') {
      setActiveMode('preview');
      setIframeSrcDoc(codeToRun);
    } else {
      // JavaScript Sandbox with console capture
      setActiveMode('console');
      const capturedLogs: string[] = [];
      const customConsole = {
        log: (...args: any[]) => {
          capturedLogs.push(
            args
              .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)))
              .join(' ')
          );
        },
        error: (...args: any[]) => {
          capturedLogs.push(`[ERROR] ${args.join(' ')}`);
        },
        warn: (...args: any[]) => {
          capturedLogs.push(`[WARN] ${args.join(' ')}`);
        },
      };

      try {
        const runFn = new Function('console', codeToRun);
        runFn(customConsole);
        setLogs(capturedLogs.length ? capturedLogs : ['// Kode dieksekusi dengan sukses tanpa output console.']);
      } catch (err: any) {
        setLogs([...capturedLogs, `❌ Runtime Error: ${err.message}`]);
      }
    }
  };

  const handleSelectTemplate = (tplId: string) => {
    const tpl = CODE_PLAYGROUND_TEMPLATES.find((t) => t.id === tplId);
    if (!tpl) return;
    setSelectedTemplateId(tplId);
    setCode(tpl.code);
    setLanguage(tpl.language);
    runCode(tpl.code, tpl.language);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pplg2_code_${Date.now()}.${language === 'html' ? 'html' : 'js'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Title & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Terminal className="w-6 h-6 text-emerald-500" />
            Lab Koding & Playground 12 PPLG 2
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Lingkungan eksekusi kode instan dalam browser untuk HTML5, React, Tailwind, dan algoritma JavaScript.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Template Picker */}
          <div className="relative">
            <select
              value={selectedTemplateId}
              onChange={(e) => handleSelectTemplate(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm pr-8 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {CODE_PLAYGROUND_TEMPLATES.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  Template: {tpl.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => runCode(code, language)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-200"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            Jalankan Kode (Run)
          </button>
        </div>
      </div>

      {/* Editor & Output Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Side: Code Editor */}
        <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[560px]">
          {/* Editor Header */}
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono text-slate-400 ml-2 font-semibold">
                sandbox.{language === 'html' ? 'html' : 'js'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs transition"
                title="Salin Kode"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={handleDownload}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs transition"
                title="Download Berkas"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const tpl = CODE_PLAYGROUND_TEMPLATES.find((t) => t.id === selectedTemplateId);
                  if (tpl) {
                    setCode(tpl.code);
                    runCode(tpl.code, tpl.language);
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs transition"
                title="Reset Kode ke Template Awal"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Editor Textarea */}
          <div className="flex-1 relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full h-full p-4 bg-slate-950 text-slate-100 font-mono text-xs sm:text-sm leading-relaxed resize-none focus:outline-none focus:ring-0 selection:bg-indigo-600 selection:text-white"
              placeholder="// Tulis kode HTML atau JavaScript di sini..."
            />
          </div>

          {/* Editor Footer */}
          <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Baris: {code.split('\n').length} • Karakter: {code.length}</span>
            <span className="text-emerald-400 font-semibold">Ready to compile</span>
          </div>
        </div>

        {/* Right Side: Output (Live Iframe Preview / Terminal Console) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[560px]">
          {/* Output Header with Mode Switcher */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveMode('preview')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeMode === 'preview'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                Live UI Preview
              </button>
              <button
                onClick={() => setActiveMode('console')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeMode === 'console'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                Console Logs ({logs.length})
              </button>
            </div>

            <span className="text-[11px] text-slate-400 font-medium">
              Output Container
            </span>
          </div>

          {/* Output Screen */}
          <div className="flex-1 bg-white relative overflow-hidden">
            {activeMode === 'preview' ? (
              iframeSrcDoc ? (
                <iframe
                  ref={iframeRef}
                  srcDoc={iframeSrcDoc}
                  title="Sandbox Live Preview"
                  sandbox="allow-scripts allow-modals"
                  className="w-full h-full border-0 bg-white"
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs p-6 text-center">
                  <Sparkles className="w-8 h-8 text-indigo-300 mb-2" />
                  <p>Klik tombol <strong>Jalankan Kode</strong> untuk melihat hasil render UI interaktif.</p>
                </div>
              )
            ) : (
              <div className="h-full bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-y-auto space-y-1.5">
                <div className="text-slate-500 pb-2 border-b border-slate-800 text-[11px]">
                  [XII PPLG 2 JavaScript V8 Sandbox Terminal]
                </div>
                {logs.length > 0 ? (
                  logs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`leading-relaxed ${
                        log.startsWith('❌') || log.startsWith('[ERROR]')
                          ? 'text-rose-400'
                          : log.startsWith('[WARN]')
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      &gt; {log}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 italic">
                    Belum ada log output. Jalankan script algoritma untuk melihat hasil console.log().
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
