import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Languages, 
  ExternalLink, 
  ShieldCheck, 
  HelpCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { AIChatResponse, SourceCitation } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  language: string;
  citations?: SourceCitation[];
  missing_information?: string[];
  timestamp: string;
}

export const ChatAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Namaskaram! I am SchemeConnect AI Assistant. I can help you discover government welfare schemes, understand eligibility conditions, and locate official government portal links. All my answers are grounded strictly in authentic database records. How can I assist you today?",
      language: 'en',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedLang, setSelectedLang] = useState<'en' | 'ml'>('en');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text,
      language: selectedLang,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      const response = await api.chatWithAI(text, selectedLang);
      const assistantMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: response.reply,
        language: response.language,
        citations: response.citations,
        missing_information: response.missing_information,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: "Sorry, I could not query the scheme records at this moment. Please ensure the backend is running and try again.",
        language: selectedLang,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    { label: "Scholarships for Kerala Undergraduates", text: "What scholarship opportunities are available for undergraduate students in Kerala?" },
    { label: "Explain in Malayalam (മലയാളത്തിൽ)", text: "കേരളത്തിലെ വിദ്യാർത്ഥികൾക്കുള്ള പ്രധാന സ്കോളർഷിപ്പുകൾ ഏതൊക്കെ?", lang: "ml" as const },
    { label: "Why are some criteria unverified?", text: "Why does SchemeConnect mark some eligibility requirements as unverified potential matches?" },
    { label: "Documents required for applications", text: "What certificates and documents are typically required to apply for national schemes?" }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-140px)] flex flex-col">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 shadow-xs flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900">SchemeConnect AI Assistant</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Grounded in Database
              </span>
            </div>
            <p className="text-xs text-slate-500">Cites official sources • English & Malayalam</p>
          </div>
        </div>

        {/* Language selector toggle */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setSelectedLang('en')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedLang === 'en' 
                ? 'bg-white text-blue-700 shadow-xs font-bold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setSelectedLang('ml')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedLang === 'ml' 
                ? 'bg-white text-blue-700 shadow-xs font-bold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            മലയാളം
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 overflow-y-auto space-y-6">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[11px] font-bold text-slate-400">
                {msg.sender === 'user' ? 'You' : 'SchemeConnect AI'}
              </span>
              <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
            </div>

            <div
              className={`max-w-[88%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
              }`}
            >
              {msg.text}

              {/* Citations block for assistant messages */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Verified Citations & Sources:
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {msg.citations.map((cite, i) => (
                      <div key={i} className="text-xs bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                        <div className="truncate mr-2">
                          <strong className="text-blue-700 font-mono text-[11px] mr-1">{cite.scheme_id}</strong>
                          <span className="text-slate-700">{cite.scheme_name}</span>
                        </div>
                        {cite.official_application_url || cite.source_url ? (
                          <a
                            href={cite.official_application_url || cite.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:text-blue-800 shrink-0 font-bold flex items-center"
                          >
                            <span>Link</span>
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Information / Unverified Warnings */}
              {msg.missing_information && msg.missing_information.length > 0 && (
                <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 space-y-1">
                  <div className="font-bold flex items-center">
                    <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-600 shrink-0" />
                    <span>Official Verification Notice:</span>
                  </div>
                  <ul className="pl-4 list-disc space-y-0.5">
                    {msg.missing_information.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl max-w-xs">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Consulting database records & verifying sources...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="py-2 flex items-center space-x-2 overflow-x-auto shrink-0 text-xs">
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (p.lang) setSelectedLang(p.lang);
              handleSend(p.text);
            }}
            className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 shrink-0 transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="mt-2 flex items-center space-x-2 shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder={selectedLang === 'ml' ? "സർക്കാർ പദ്ധതികളെ കുറിച്ച് ചോദിക്കൂ..." : "Ask about schemes, eligibility, documents, or portal links..."}
          className="flex-1 text-xs sm:text-sm rounded-xl border border-slate-300 p-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-xs"
        />
        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="px-5 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center shrink-0 shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
