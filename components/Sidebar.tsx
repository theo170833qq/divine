import React, { useState } from 'react';
import { CrossIcon, PlusIcon, BookIcon, PrayingHandsIcon, InfoIcon, CalendarIcon, SunIcon, QuoteIcon, ChurchIcon, LayoutListIcon, HistoryIcon, StarIcon } from './Icons';
import { LiturgicalInfo, Message } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onQuickPrompt: (text: string) => void;
  onOpenAbout: () => void;
  onOpenSubscription: () => void;
  liturgicalInfo: LiturgicalInfo | null;
  messages: Message[];
  onNavigateHistory: (id: string) => void;
}

type SidebarTab = 'menu' | 'history';

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNewChat, onQuickPrompt, onOpenAbout, onOpenSubscription, liturgicalInfo, messages, onNavigateHistory }) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('menu');

  const getSeasonalPrompt = () => {
    if (!liturgicalInfo) return null;

    switch (liturgicalInfo.season) {
        case 'Advent':
            return {
                prompt: "Guie-me em uma reflexão sobre o tempo do Advento.",
                label: "Reflexão do Advento"
            };
        case 'Lent':
            return {
                prompt: "Ofereça-me uma meditação para a Quaresma, focando em oração, jejum e caridade.",
                label: "Meditação Quaresmal"
            };
        case 'Easter':
            return {
                prompt: "Ajude-me a meditar sobre o mistério da Ressurreição de Cristo durante este tempo Pascal.",
                label: "Meditação Pascal"
            };
        default:
            return null;
    }
  }
  const seasonalPrompt = getSeasonalPrompt();

  // Group user messages by date for history
  const getHistoryGroups = () => {
    const userMessages = messages.filter(m => m.role === 'user').reverse(); // Newest first
    const groups: Record<string, Message[]> = {};

    userMessages.forEach(msg => {
        const date = msg.timestamp.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        let label = date;
        if (date === today) label = 'Hoje';
        
        if (!groups[label]) groups[label] = [];
        groups[label].push(msg);
    });

    return groups;
  };

  const historyGroups = getHistoryGroups();

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-royal-900/80 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-[85vw] max-w-xs bg-royal-900 border-r border-gold-600/30 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Decorative Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-50 pointer-events-none"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col h-full pt-safe">
          
          {/* Header & Tabs */}
          <div className="p-0 bg-royal-900/50">
             <div className="flex items-center justify-between p-5 pb-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-gold-100 font-display font-bold tracking-widest text-lg">
                        {activeTab === 'menu' ? 'Menu' : 'Diário'}
                    </h2>
                </div>
                <button onClick={onClose} className="text-gold-500 hover:text-white transition-colors p-3 -mr-3 active:scale-95">
                    <CrossIcon />
                </button>
             </div>

             {/* Custom Tabs */}
             <div className="flex border-b border-gold-600/20 px-5 gap-4">
                 <button 
                    onClick={() => setActiveTab('menu')}
                    className={`flex items-center gap-2 pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex-1 justify-center ${
                        activeTab === 'menu' 
                        ? 'text-gold-400 border-gold-400' 
                        : 'text-church-400 border-transparent hover:text-gold-200'
                    }`}
                 >
                    <LayoutListIcon className="w-4 h-4" />
                    Ações
                 </button>
                 <button 
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-2 pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex-1 justify-center ${
                        activeTab === 'history' 
                        ? 'text-gold-400 border-gold-400' 
                        : 'text-church-400 border-transparent hover:text-gold-200'
                    }`}
                 >
                    <HistoryIcon className="w-4 h-4" />
                    Histórico
                 </button>
             </div>
          </div>

          {/* TAB CONTENT: MENU */}
          {activeTab === 'menu' && (
            <>
                <div className="p-5 pb-2">
                    <button 
                    onClick={() => {
                        onNewChat();
                        onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-transparent border border-gold-500/50 hover:bg-gold-600/10 text-gold-400 hover:text-gold-300 py-4 rounded-lg transition-all uppercase tracking-wider font-display text-sm group active:bg-gold-600/20"
                    >
                    <PlusIcon />
                    <span>Nova Conversa</span>
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-6 pb-safe scrollbar-hide">
                    {/* PREMIUM CTA */}
                    <div className="mx-2 mb-4">
                        <button
                            onClick={() => { onOpenSubscription(); onClose(); }}
                            className="w-full relative overflow-hidden group rounded-lg p-0.5"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-gold-400 via-yellow-200 to-gold-400 animate-shine opacity-80"></div>
                            <div className="relative bg-royal-900 rounded-md p-3 flex items-center gap-3">
                                <div className="p-1.5 bg-gold-500/20 rounded-full text-gold-400">
                                    <StarIcon className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                    <p className="text-gold-100 font-bold font-display text-xs uppercase tracking-wide">Seja Premium</p>
                                    <p className="text-[10px] text-gold-400/80 font-serif italic">Desbloqueie todo o poder</p>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* SECTION: LITURGIA */}
                    <div className="space-y-1">
                        <div className="px-2 py-1 text-[10px] font-serif text-gold-600/80 uppercase tracking-widest border-b border-gold-600/10 mb-2 mx-2">Liturgia & Santos</div>
                        
                        {seasonalPrompt && (
                        <button 
                            onClick={() => { onQuickPrompt(seasonalPrompt.prompt); onClose(); }}
                            className="w-full flex items-center gap-3 px-4 py-4 text-church-200 hover:bg-white/5 hover:text-gold-300 rounded-lg transition-colors text-left font-serif group active:bg-white/10"
                        >
                            <ChurchIcon />
                            <span>{seasonalPrompt.label}</span>
                        </button>
                        )}
                        
                        <button 
                            onClick={() => { onQuickPrompt("Quem é o santo celebrado hoje pela Igreja e o que podemos aprender com ele?"); onClose(); }}
                            className="w-full flex items-center gap-3 px-4 py-4 text-church-200 hover:bg-white/5 hover:text-gold-300 rounded-lg transition-colors text-left font-serif group active:bg-white/10"
                        >
                            <CalendarIcon />
                            <span>Santo do Dia</span>
                        </button>

                        <button 
                            onClick={() => { onQuickPrompt("Guie-me em uma Lectio Divina (Leitura Orante) baseada no Evangelho de hoje. Comece com a leitura."); onClose(); }}
                            className="w-full flex items-center gap-3 px-4 py-4 text-church-200 hover:bg-white/5 hover:text-gold-300 rounded-lg transition-colors text-left font-serif active:bg-white/10"
                        >
                            <BookIcon />
                            <span>Lectio Divina</span>
                        </button>
                    </div>

                    {/* SECTION: DEVOCIONÁRIO */}
                    <div className="space-y-1">
                        <div className="px-2 py-1 text-[10px] font-serif text-gold-600/80 uppercase tracking-widest border-b border-gold-600/10 mb-2 mx-2">Devocionário</div>
                        
                        <button 
                            onClick={() => { onQuickPrompt("Quais são as principais orações da manhã para um católico?"); onClose(); }}
                            className="w-full flex items-center gap-3 px-4 py-4 text-church-200 hover:bg-white/5 hover:text-gold-300 rounded-lg transition-colors text-left font-serif active:bg-white/10"
                        >
                            <SunIcon />
                            <span>Orações da Manhã</span>
                        </button>

                        <button 
                            onClick={() => { onQuickPrompt("Ajude-me a rezar o Santo Terço. Mistérios de hoje."); onClose(); }}
                            className="w-full flex items-center gap-3 px-4 py-4 text-church-200 hover:bg-white/5 hover:text-gold-300 rounded-lg transition-colors text-left font-serif active:bg-white/10"
                        >
                            <div className="opacity-70 text-lg leading-none">❋</div>
                            <span>Santo Terço</span>
                        </button>

                        <button 
                            onClick={() => { onQuickPrompt("Gostaria de fazer um exame de consciência profundo baseado nos 10 Mandamentos."); onClose(); }}
                            className="w-full flex items-center gap-3 px-4 py-4 text-church-200 hover:bg-white/5 hover:text-gold-300 rounded-lg transition-colors text-left font-serif active:bg-white/10"
                        >
                            <PrayingHandsIcon />
                            <span>Exame de Consciência</span>
                        </button>
                    </div>

                    {/* SECTION: TRADIÇÃO (LATIM) */}
                    <div className="space-y-1">
                        <div className="px-2 py-1 text-[10px] font-serif text-gold-600/80 uppercase tracking-widest border-b border-gold-600/10 mb-2 mx-2">Latim & Tradição</div>
                        
                        <button 
                            onClick={() => { onQuickPrompt("Ensina-me o 'Pater Noster' em Latim com a tradução."); onClose(); }}
                            className="w-full flex items-center gap-3 px-4 py-4 text-church-200 hover:bg-white/5 hover:text-gold-300 rounded-lg transition-colors text-left font-serif active:bg-white/10"
                        >
                            <QuoteIcon />
                            <span>Pater Noster</span>
                        </button>
                    </div>

                    <div className="my-2 border-t border-gold-600/20 mx-4"></div>

                    <button 
                        onClick={() => { onOpenAbout(); onClose(); }}
                        className="w-full flex items-center gap-3 px-4 py-4 text-gold-500/80 hover:bg-white/5 hover:text-gold-300 rounded-lg transition-colors text-left font-serif text-sm active:bg-white/10"
                    >
                        <InfoIcon />
                        <span>Sobre esta Obra</span>
                    </button>
                </nav>
            </>
          )}

          {/* TAB CONTENT: HISTORY */}
          {activeTab === 'history' && (
             <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 pb-safe scrollbar-hide">
                 {Object.keys(historyGroups).length === 0 ? (
                     <div className="text-center py-10 opacity-50">
                         <HistoryIcon className="w-8 h-8 mx-auto text-church-400 mb-2" />
                         <p className="text-church-400 font-serif text-sm">Nenhuma conversa registrada ainda.</p>
                     </div>
                 ) : (
                    Object.entries(historyGroups).map(([date, msgs]) => (
                        <div key={date} className="animate-fade-in-up">
                            <div className="sticky top-0 bg-royal-900/95 backdrop-blur py-1 z-10 mb-2 border-b border-gold-600/10">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gold-500">{date}</span>
                            </div>
                            <div className="space-y-2">
                                {msgs.map((msg) => (
                                    <button 
                                        key={msg.id}
                                        onClick={() => { onNavigateHistory(msg.id); onClose(); }}
                                        className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/5 hover:border-gold-500/30 rounded p-4 transition-all group"
                                    >
                                        <p className="text-church-200 font-serif text-sm line-clamp-2 group-hover:text-gold-100 transition-colors">
                                            {msg.attachment ? `[Arquivo] ${msg.attachment.name}` : msg.content}
                                        </p>
                                        <div className="text-[10px] text-church-500 mt-2 flex items-center gap-1">
                                            <span className="w-1 h-1 rounded-full bg-gold-600"></span>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))
                 )}
             </div>
          )}

          {/* Footer */}
          <div className="p-5 border-t border-gold-600/20 text-center bg-royal-900/50 pb-safe">
             <p className="text-[10px] text-gold-600/60 font-serif italic">
                "Laus Deo Semper"
             </p>
          </div>

        </div>
      </div>
    </>
  );
};

export default Sidebar;