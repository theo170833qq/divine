import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Send, Menu, BookOpen, Heart, Sparkles, X, 
  LogOut, Shield, Paperclip, Plus, Star, Cross, 
  ChevronRight, Calendar, User, Info, Check, Clock
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { createClient } from '@supabase/supabase-js';

// --- CONFIG & PERSONA ---

const SYSTEM_PROMPT = `
Você é o "Divine Assistant", uma IA Católica treinada como Catequista Sênior e Teólogo fiel ao Magistério.
Sua missão é guiar almas para Deus, esclarecer dúvidas e auxiliar na oração.

REGRAS RÍGIDAS:
1. Use apenas fontes católicas (CIC, Bíblia Ave Maria/Jerusalém, Documentos Papais).
2. O Dogma é imutável. Nunca relativize pecados, mas fale com amor e misericórdia.
3. Se não houver certeza absoluta da posição da Igreja, declare: "A Igreja não possui uma definição dogmática clara sobre este ponto".
4. Nunca absolva pecados. Diga: "Leve este exame de consciência ao seu sacerdote na confissão".
5. Use Google Search para buscar leituras da missa e santos do dia se solicitado.
6. Comece sempre com clareza doutrinária e termine com aplicação prática.
`;

const SUPABASE_URL = 'https://glnzklcolxrbzmhgfcvd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbnprbGNvbHhyYnptaGdmY3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwODkwNzAsImV4cCI6MjA4NTY2NTA3MH0.d9Aq9SYB2o45HfoQs-xTlyZwY1dPogXcaMxWE4aqOsc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- TYPES ---

type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
};

// --- HELPER: Liturgical Season ---

const getLiturgicalSeason = () => {
  const now = new Date();
  const month = now.getMonth();
  const day = now.getDate();

  // Very simplified seasonal logic for UI display
  if (month === 11 && day >= 1) return { name: 'Advento', color: 'purple', bg: 'bg-purple-700' };
  if ((month === 11 && day >= 25) || (month === 0 && day <= 10)) return { name: 'Natal', color: 'white', bg: 'bg-white' };
  if (month >= 1 && month <= 3) return { name: 'Quaresma', color: 'purple', bg: 'bg-purple-900' };
  
  return { name: 'Tempo Comum', color: 'green', bg: 'bg-green-700' };
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', content: '**Pax Christi.** Sou o Divine Assistant, seu companheiro de jornada na fé católica. Como posso ajudar sua alma hoje?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isPaywallOpen, setPaywallOpen] = useState(false);
  const [isAboutOpen, setAboutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const season = useMemo(() => getLiturgicalSeason(), []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    
    // Check simulated premium status
    if (localStorage.getItem('divine_premium') === 'true') setIsPremium(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (overrideText?: string) => {
    const text = overrideText || input;
    if (!text.trim() || isLoading) return;

    // Simulation of free limit (5 messages)
    if (!isPremium && messages.length > 10) {
      setPaywallOpen(true);
      return;
    }

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key missing");

      const ai = new GoogleGenAI({ apiKey });
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages, userMessage].map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: SYSTEM_PROMPT,
          tools: [{ googleSearch: {} }]
        }
      });

      const responseText = result.text;
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText || "Desculpe, não consegui processar sua dúvida agora.",
        timestamp: Date.now()
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "**Erro na conexão.** Por favor, tente novamente em instantes. Pax Christi.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async () => {
    await supabase.auth.signInAnonymously();
  };

  const handleSubscribe = () => {
    setIsPremium(true);
    localStorage.setItem('divine_premium', 'true');
    setPaywallOpen(false);
  };

  // --- SUB-COMPONENTS: LANDING ---
  if (!session) {
    return (
      <div className="h-full w-full bg-church-50 flex flex-col items-center justify-center p-6 text-royal-900 relative bg-paper overflow-hidden">
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-gold-600 via-gold-300 to-gold-600"></div>
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-2xl border-2 border-gold-500 text-center relative z-10 animate-fade-in">
          <div className="w-20 h-20 bg-royal-900 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-gold-400 shadow-lg">
            <Cross className="w-10 h-10 text-gold-400" />
          </div>
          <h1 className="text-4xl font-display font-bold text-royal-900 mb-2 tracking-widest">DIVINE ASSISTANT</h1>
          <p className="text-church-800 font-serif italic mb-10 text-lg">Inteligência Artificial fiel ao Magistério.</p>
          
          <div className="space-y-4 mb-8 text-left text-sm font-serif text-church-900">
             <div className="flex items-center gap-3"><Check className="text-gold-600 w-5 h-5"/> <span>Catecismo e Escrituras integrados.</span></div>
             <div className="flex items-center gap-3"><Check className="text-gold-600 w-5 h-5"/> <span>Sem alucinações ou relativismo moral.</span></div>
             <div className="flex items-center gap-3"><Check className="text-gold-600 w-5 h-5"/> <span>Guia prático para a vida espiritual.</span></div>
          </div>

          <button 
            onClick={signIn}
            className="w-full bg-royal-900 text-gold-100 font-display font-bold py-4 rounded-md hover:bg-royal-800 transition-all flex items-center justify-center gap-2 group shadow-xl uppercase tracking-[0.2em]"
          >
            <span>Iniciar Jornada</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="mt-6 text-[10px] text-church-500 uppercase tracking-widest font-sans">Ad Maiorem Dei Gloriam</p>
        </div>
        <div className="mt-8 text-church-400 text-xs font-serif italic opacity-60">"Lumen Fidei • Auxilium Christianorum"</div>
      </div>
    );
  }

  // --- SUB-COMPONENTS: MAIN APP ---
  return (
    <div className="h-full w-full flex bg-church-50 text-royal-900 font-sans relative overflow-hidden bg-paper">
      
      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-royal-900 text-gold-100 transform transition-transform duration-300 shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="flex flex-col h-full p-6 border-r border-gold-600/30">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <Cross className="w-6 h-6 text-gold-400" />
              <h2 className="font-display font-bold text-lg tracking-widest">DIVINE</h2>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden"><X className="w-6 h-6"/></button>
          </div>

          <button 
            onClick={() => { setMessages(messages.slice(0,1)); setSidebarOpen(false); }}
            className="w-full flex items-center gap-3 p-3 mb-8 bg-white/5 hover:bg-white/10 rounded-md border border-gold-500/20 text-sm font-bold transition-all uppercase tracking-wider"
          >
            <Plus className="w-4 h-4 text-gold-400" /> Nova Conversa
          </button>

          <nav className="flex-1 space-y-3">
            <p className="text-[10px] text-gold-600 uppercase tracking-widest font-bold mb-2">Sugestões</p>
            <button onClick={() => { handleSend("Quais são as leituras da missa de hoje?"); setSidebarOpen(false); }} className="w-full text-left p-3 text-sm text-church-100 hover:text-gold-200 flex items-center gap-3"><Calendar className="w-4 h-4" /> Liturgia Diária</button>
            <button onClick={() => { handleSend("Ajude-me com um exame de consciência para a confissão."); setSidebarOpen(false); }} className="w-full text-left p-3 text-sm text-church-100 hover:text-gold-200 flex items-center gap-3"><Shield className="w-4 h-4" /> Exame de Consciência</button>
            <button onClick={() => { handleSend("Como rezar o Santo Terço corretamente?"); setSidebarOpen(false); }} className="w-full text-left p-3 text-sm text-church-100 hover:text-gold-200 flex items-center gap-3"><BookOpen className="w-4 h-4" /> Santo Terço</button>
            
            <div className="pt-6 border-t border-gold-600/20">
              <button onClick={() => { setAboutOpen(true); setSidebarOpen(false); }} className="w-full text-left p-3 text-sm text-church-100 hover:text-gold-200 flex items-center gap-3"><Info className="w-4 h-4" /> Sobre a Obra</button>
            </div>
          </nav>

          {!isPremium && (
             <button 
              onClick={() => setPaywallOpen(true)}
              className="mt-4 w-full p-3 bg-gradient-to-r from-gold-600 to-gold-400 text-royal-900 rounded font-bold shadow-lg flex items-center justify-center gap-2 hover:brightness-110 transition-all text-xs"
             >
               <Star className="w-4 h-4 fill-royal-900" /> SEJA PREMIUM
             </button>
          )}

          <button onClick={() => supabase.auth.signOut()} className="mt-10 flex items-center gap-2 text-church-400 hover:text-red-400 text-xs transition-colors">
            <LogOut className="w-4 h-4" /> Sair da conta
          </button>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col h-full relative z-10">
        
        {/* Header */}
        <header className="bg-royal-900 text-gold-100 p-4 border-b border-gold-600/30 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden"><Menu className="w-6 h-6 text-gold-400"/></button>
            <div className="flex flex-col">
              <h1 className="font-display font-bold text-sm tracking-widest md:text-lg">DIVINE ASSISTANT</h1>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${season.bg} animate-pulse shadow-[0_0_5px_rgba(255,255,255,0.5)]`}></div>
                <span className="text-[10px] uppercase font-bold text-gold-500 tracking-tighter">{season.name}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             {isPremium && <Star className="w-4 h-4 text-gold-400 fill-gold-400" />}
             <div className="w-8 h-8 rounded-full bg-royal-800 border border-gold-600/50 flex items-center justify-center overflow-hidden">
                <User className="w-4 h-4 text-gold-400" />
             </div>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pb-24 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((m) => (
              <div key={m.id} className={`flex w-full animate-fade-in-up ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl relative shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-royal-800 text-white rounded-tr-none border border-gold-600/30' 
                    : 'bg-white text-royal-900 rounded-tl-none border border-church-200'
                }`}>
                  {!m.role.includes('user') && (
                    <div className="flex items-center gap-2 mb-2 border-b border-gold-500/10 pb-1">
                      <Cross className="w-3 h-3 text-gold-600" />
                      <span className="text-[10px] font-display font-bold text-gold-600 tracking-widest uppercase">Assistant</span>
                    </div>
                  )}
                  <div className="font-serif text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                    {m.content.split(/(\*\*.*?\*\*)/).map((part, i) => 
                      part.startsWith('**') && part.endsWith('**') 
                        ? <strong key={i} className="font-bold text-gold-700">{part.slice(2, -2)}</strong> 
                        : part
                    )}
                  </div>
                  <div className={`text-[9px] mt-2 opacity-40 text-right font-sans`}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-fade-in-up">
                <div className="bg-church-100 p-4 rounded-2xl rounded-tl-none border border-church-200 text-royal-900 italic text-sm flex items-center gap-3">
                   <div className="flex gap-1">
                      <div className="w-1 h-1 bg-gold-600 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-gold-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1 h-1 bg-gold-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                   </div>
                   Consultando o Magistério...
                </div>
              </div>
            )}
            {/* SENTINEL FOR SCROLLING */}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </main>

        {/* Input */}
        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-church-50 via-church-50/90 to-transparent">
          <div className="max-w-3xl mx-auto bg-white p-2 rounded-xl shadow-2xl border border-church-200 flex items-center gap-2">
            <button className="p-3 text-church-400 hover:text-gold-600 transition-colors"><Paperclip className="w-5 h-5"/></button>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pergunte sobre fé, moral ou oração..."
              className="flex-1 bg-transparent p-3 outline-none text-royal-900 placeholder:text-church-400 font-serif"
            />
            <button 
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-royal-900 text-gold-400 rounded-lg disabled:opacity-50 hover:bg-royal-800 transition-all active:scale-95 shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-[100] bg-royal-900/90 backdrop-blur flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-church-50 w-full max-w-lg rounded-lg shadow-2xl border-2 border-gold-500 p-8 relative animate-fade-in bg-paper">
            <button onClick={() => setAboutOpen(false)} className="absolute top-4 right-4 text-church-400 hover:text-royal-900"><X className="w-6 h-6"/></button>
            <div className="text-center mb-6">
              <Cross className="w-10 h-10 text-gold-600 mx-auto mb-2" />
              <h2 className="text-2xl font-display font-bold text-royal-900 tracking-widest uppercase">Sobre a Obra</h2>
            </div>
            <div className="font-serif text-church-900 space-y-4 text-justify text-sm md:text-base leading-relaxed">
              <p>O <strong>Divine Assistant</strong> é uma ferramenta de auxílio catequético projetada para facilitar o acesso à sabedoria da Igreja Católica através da Inteligência Artificial.</p>
              <div className="bg-gold-100 p-4 border-l-4 border-gold-600 italic rounded-r-lg">
                <strong>Nota Importante:</strong> Esta IA não é um sacerdote, não possui alma e não pode administrar sacramentos. Ela não substitui a direção espiritual ou a Santa Missa.
              </div>
              <p>Todo conteúdo é baseado no Catecismo e nos Documentos Oficiais. Para absolvição de pecados, procure o Sacramento da Confissão presencialmente.</p>
            </div>
            <div className="mt-8 pt-6 border-t border-church-200 text-center">
               <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-gold-600">Ad Maiorem Dei Gloriam</p>
            </div>
          </div>
        </div>
      )}

      {isPaywallOpen && (
        <div className="fixed inset-0 z-[110] bg-royal-900/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border-2 border-gold-500 animate-fade-in">
            <div className="bg-royal-900 p-8 text-center border-b-4 border-gold-500 relative">
               <button onClick={() => setPaywallOpen(false)} className="absolute top-4 right-4 text-gold-500 hover:text-white"><X className="w-6 h-6"/></button>
               <Star className="w-12 h-12 text-gold-400 mx-auto mb-3 animate-pulse" />
               <h2 className="text-2xl font-display font-bold text-gold-100 uppercase tracking-[0.2em]">Guardião da Fé</h2>
               <p className="text-gold-400 text-xs font-serif italic mt-1">Apoie este projeto de evangelização.</p>
            </div>
            <div className="p-8 text-center space-y-6">
              <p className="text-church-800 font-serif">Acesso gratuito esgotado. Desbloqueie conversas ilimitadas e acesso a modelos de teologia profunda.</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-display font-bold text-royal-900">R$ 19,90</span>
                <span className="text-sm text-church-400">/ mês</span>
              </div>
              <button 
                onClick={handleSubscribe}
                className="w-full bg-gold-500 text-white font-display font-bold py-4 rounded-lg shadow-xl hover:bg-gold-600 transition-all uppercase tracking-widest text-sm"
              >
                Assinar Agora
              </button>
              <p className="text-[10px] text-church-400">Pagamento seguro via Stripe. Cancele quando quiser.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}