import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, ChatState, SuggestionType, LiturgicalInfo, LiturgicalColor, Attachment } from './types';
import { initializeChat, sendMessageStream } from './services/geminiService';
import { supabase } from './services/supabaseClient';
import { getLiturgicalInfo } from './utils/liturgicalYear';
import MessageBubble from './components/MessageBubble';
import Sidebar from './components/Sidebar';
import AboutModal from './components/AboutModal';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import SubscriptionModal from './components/SubscriptionModal';
import { SendIcon, BookIcon, HeartIcon, SparklesIcon, MenuIcon, CornerFlourish, OrnateDivider, ChiRhoIcon, PaperclipIcon, CrossIcon, CandleIcon, ScrollIcon, QuoteIcon, CalendarIcon, SpinnerIcon, LogOutIcon } from './components/Icons';

const liturgicalColorMap: Record<LiturgicalColor, string> = {
  purple: '#6B46C1',
  white: '#F7FAFC',
  green: '#38A169',
  red: '#E53E3E',
  rose: '#ED64A6',
};

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false); // Estado de assinatura
  
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<Attachment | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [liturgicalInfo, setLiturgicalInfo] = useState<LiturgicalInfo | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState<SuggestionType | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const initialMessage: Message = {
    id: 'welcome',
    role: 'model',
    content: '**Pax Christi.** \n\nEu sou o Divine Assistant, seu companheiro digital na jornada da fé. \n\nComo posso auxiliar sua caminhada espiritual hoje?',
    timestamp: new Date(),
  };

  // Check for existing session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) setShowLanding(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- LOGICA DO PAYWALL (VERIFICAÇÃO DE ASSINATURA) ---
  useEffect(() => {
    if (session) {
        // 1. Verifica se retornou do Stripe com sucesso (URL param: ?success=true)
        const params = new URLSearchParams(window.location.search);
        if (params.get('success') === 'true') {
            setIsPremium(true);
            // Salva no localStorage para persistir nesta sessão/navegador
            localStorage.setItem(`divine_premium_${session.user.id}`, 'true');
            // Limpa a URL para ficar bonita
            window.history.replaceState({}, '', window.location.pathname);
        } else {
            // 2. Verifica se já estava salvo localmente como premium
            const localPremium = localStorage.getItem(`divine_premium_${session.user.id}`);
            if (localPremium === 'true') {
                setIsPremium(true);
            } else {
                setIsPremium(false);
            }
        }
    } else {
        setIsPremium(false);
    }
  }, [session]);

  // Se o usuário está logado mas NÃO é premium, forçamos o modal
  const showPaywall = session && !isPremium;

  // Initialize Chat & Liturgical Season & Load History
  useEffect(() => {
    if (!showLanding && isPremium) {
        try {
            initializeChat();
        } catch (e) {
            console.error("Failed to initialize chat (likely missing API KEY):", e);
            // We do NOT block the UI. The chat will just fail gracefully later if used.
        }

        setLiturgicalInfo(getLiturgicalInfo(new Date()));
        
        // Load history if user is logged in
        if (session) {
            loadChatHistory();
        } else {
             setChatState((prev) => ({
                ...prev,
                messages: [initialMessage],
            }));
        }
    }
  }, [showLanding, session, isPremium]);

  const loadChatHistory = async () => {
      setChatState(prev => ({ ...prev, isLoading: true }));
      try {
          const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: true });

          if (error) throw error;

          if (data && data.length > 0) {
              const formattedMessages: Message[] = data.map((msg: any) => ({
                  id: msg.id.toString(),
                  role: msg.role,
                  content: msg.content,
                  timestamp: new Date(msg.created_at)
              }));
              setChatState(prev => ({ ...prev, messages: formattedMessages, isLoading: false }));
          } else {
               setChatState(prev => ({ ...prev, messages: [initialMessage], isLoading: false }));
          }
      } catch (error) {
          console.error("Error loading history:", error);
          setChatState(prev => ({ ...prev, messages: [initialMessage], isLoading: false }));
      }
  };

  const saveMessageToDb = async (role: 'user' | 'model', content: string) => {
      if (!session) return;
      try {
          await supabase.from('messages').insert([
              {
                  user_id: session.user.id,
                  role: role,
                  content: content,
                  created_at: new Date().toISOString()
              }
          ]);
      } catch (error) {
          console.error("Error saving message:", error);
      }
  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, chatState.isLoading]);

  // Adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputText]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'text/plain', 'text/markdown'];
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isText = file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt') || file.name.toLowerCase().endsWith('.md');

      if (!isPdf && !isText) {
        setChatState(prev => ({...prev, error: "Por favor, envie arquivos PDF ou Texto (.txt, .md)."}));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        
        setSelectedFile({
          name: file.name,
          mimeType: file.type || (file.name.endsWith('.md') ? 'text/markdown' : 'text/plain'),
          data: base64Data
        });
        setChatState(prev => ({...prev, error: null}));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = useCallback(async (text: string) => {
    if ((!text.trim() && !selectedFile) || chatState.isLoading) return;

    const isFileOnly = !text.trim() && !!selectedFile;
    const apiPrompt = isFileOnly 
        ? "Por favor, leia atentamente este documento anexado, armazene-o em sua memória de contexto para esta sessão e faça um brevíssimo resumo do tema principal. Confirme que está pronto para responder perguntas sobre ele." 
        : text;
    const displayContent = isFileOnly 
        ? "*[Arquivo enviado para leitura e análise]*" 
        : text;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: displayContent,
      timestamp: new Date(),
      attachment: selectedFile || undefined
    };

    // Creates the bot placeholder immediately to ensure the loading bubble appears instantly
    const botMessageId = (Date.now() + 1).toString();
    const botMessagePlaceholder: Message = {
      id: botMessageId,
      role: 'model',
      content: '', // Empty content triggers the loading animation in MessageBubble
      timestamp: new Date(),
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage, botMessagePlaceholder],
      isLoading: true,
      error: null,
    }));
    
    // Save User Message DB
    saveMessageToDb('user', displayContent);

    setInputText('');
    
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }

    const currentFile = selectedFile;
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    try {
      let accumulatedText = '';
      const stream = sendMessageStream(apiPrompt, currentFile || undefined);

      for await (const chunk of stream) {
        accumulatedText += chunk;
        setChatState((prev) => ({
          ...prev,
          messages: prev.messages.map((msg) => 
            msg.id === botMessageId ? { ...msg, content: accumulatedText } : msg
          ),
        }));
      }

      // Save Bot Message DB
      saveMessageToDb('model', accumulatedText);

      setChatState((prev) => ({
        ...prev,
        isLoading: false,
      }));

    } catch (error) {
      // Remove the placeholder if there was an error
      setChatState((prev) => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== botMessageId),
        isLoading: false,
        error: 'Perdoe-me. Houve um erro de conexão com o sistema (Verifique a API KEY). Tente recarregar.',
      }));
    }
  }, [chatState.isLoading, selectedFile, session]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputText);
    }
  };

  const handleSuggestionClick = async (type: SuggestionType) => {
    setLoadingSuggestion(type);
    let prompt = "";
    switch (type) {
      case SuggestionType.EXAM:
        prompt = "Gostaria de fazer um exame de consciência para me preparar para a confissão.";
        break;
      case SuggestionType.PRAYER:
        prompt = "Estou precisando de uma oração para acalmar meu coração.";
        break;
      case SuggestionType.CATECHESIS:
        prompt = "Tenho uma dúvida sobre a doutrina da Igreja.";
        break;
    }
    await handleSendMessage(prompt);
    setLoadingSuggestion(null);
  };

  const handleNavigateHistory = (messageId: string) => {
    const element = document.getElementById(`msg-${messageId}`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Optional: Flash highlight
        element.classList.add('bg-gold-50/30');
        setTimeout(() => element.classList.remove('bg-gold-50/30'), 2000);
    }
  };

  const handleNewChat = () => {
    setChatState({
        messages: [{...initialMessage, timestamp: new Date()}],
        isLoading: false,
        error: null
    });
    try {
        initializeChat();
    } catch(e) {
        console.error(e);
    }
  };

  const handleSignOut = async () => {
      await supabase.auth.signOut();
      setSession(null);
      setIsPremium(false); // Reset premium on logout
      setShowLanding(true);
      setChatState({
          messages: [],
          isLoading: false,
          error: null
      });
  };

  const isWelcomeState = chatState.messages.length <= 1;

  if (showLanding) {
    return (
        <>
            <LandingPage onStart={() => setShowAuth(true)} />
            <AuthModal 
                isOpen={showAuth} 
                onClose={() => setShowAuth(false)} 
                onSuccess={() => setShowLanding(false)} 
            />
        </>
    );
  }

  return (
    // Main Container
    <div className="flex flex-col h-[100dvh] bg-royal-900 font-sans text-gray-900 overflow-hidden relative selection:bg-gold-500 selection:text-white">
      
      <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
      
      {/* PAYWALL LOGIC:
          - Se showPaywall é true, o modal abre em modo "Blocking" (sem botão de fechar).
          - Caso contrário, abre normalmente se o usuário clicar no botão "Premium" da Sidebar.
      */}
      <SubscriptionModal 
        isOpen={showPaywall || isSubscriptionModalOpen} 
        onClose={() => setIsSubscriptionModalOpen(false)} 
        isBlocking={showPaywall} // Ativa o modo bloqueio se necessário
      />

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNewChat={handleNewChat}
        onQuickPrompt={handleSendMessage}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
        liturgicalInfo={liturgicalInfo}
        messages={chatState.messages}
        onNavigateHistory={handleNavigateHistory}
      />

      {/* Header - ENHANCED & TALLER */}
      <header className="flex-none flex items-center justify-between px-5 py-6 md:px-8 md:py-8 bg-royal-900/90 backdrop-blur-xl border-b-2 border-double border-gold-500/30 shadow-2xl z-20 relative pt-safe transition-all duration-300">
        
        {/* Left: Menu Button */}
        <button 
            onClick={() => setIsSidebarOpen(true)}
            className="relative z-10 text-gold-400 hover:text-gold-200 transition-colors p-3 rounded-full hover:bg-white/5 active:scale-95 shadow-sm border border-transparent hover:border-gold-500/30 group"
            aria-label="Abrir Menu"
        >
            <MenuIcon className="w-7 h-7" />
        </button>

        {/* Center: Title & Badge */}
        <div className="flex flex-col items-center justify-center relative z-10 gap-2">
          
          {/* Main Title */}
          <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-gold-100 via-gold-300 to-gold-500 tracking-[0.15em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] text-center leading-none">
                  Divine Assistant
              </h1>
          </div>

          {/* Liturgical Badge */}
          {liturgicalInfo && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-gold-500/20 shadow-inner backdrop-blur-sm mt-1">
                  <div 
                      style={{ backgroundColor: liturgicalColorMap[liturgicalInfo.color], boxShadow: `0 0 8px ${liturgicalColorMap[liturgicalInfo.color]}` }} 
                      className="w-2 h-2 rounded-full animate-pulse-slow"
                  ></div>
                  <span className="text-[10px] md:text-xs text-gold-200/90 font-serif italic tracking-wider uppercase">
                      {liturgicalInfo.season === 'Ordinary Time' ? 'Tempo Comum' : 
                       liturgicalInfo.season === 'Advent' ? 'Advento' : 
                       liturgicalInfo.season === 'Lent' ? 'Quaresma' : 
                       liturgicalInfo.season === 'Easter' ? 'Páscoa' : 'Natal'}
                  </span>
              </div>
          )}
        </div>

        {/* Right: Sign Out Icon */}
        <div className="relative z-10">
            <button 
                onClick={handleSignOut}
                className="group flex items-center gap-2 text-church-400 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
                title="Sair"
            >
                <span className="text-[10px] font-bold uppercase tracking-widest hidden md:inline-block group-hover:text-red-400/80 transition-colors">Sair</span>
                <LogOutIcon className="w-6 h-6" />
            </button>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex justify-center w-full overflow-hidden bg-church-50 relative perspective-1000">
         {/* Backgrounds */}
         <div className="absolute inset-0 bg-paper-texture opacity-90 pointer-events-none"></div>
         <div className="absolute inset-0 bg-subtle-glow pointer-events-none"></div>

         <div className="w-full max-w-4xl flex flex-col h-full relative">
            
            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 md:px-8 md:py-6 space-y-6 scrollbar-hide relative z-10 pb-36 md:pb-32">
                
                {/* Background Watermark */}
                <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] z-0">
                    <ChiRhoIcon className="w-96 h-96 text-royal-900" />
                </div>

                {isWelcomeState && liturgicalInfo && (
                   <div className="animate-fade-in-up space-y-6 md:space-y-8 mt-4 md:mt-8 mb-8">
                       
                       {/* Liturgical Season Banner */}
                       <div className="relative overflow-hidden rounded-2xl border border-gold-500/20 shadow-glow bg-royal-900 group cursor-pointer transition-transform hover:scale-[1.01]" onClick={() => handleSendMessage(`Fale-me sobre o tempo litúrgico atual: ${liturgicalInfo.season}`)}>
                           <div className="absolute inset-0 bg-leather-texture opacity-60"></div>
                           <div className="absolute inset-0 bg-gradient-to-r from-royal-900 to-transparent z-10"></div>
                           {/* Liturgical Color Accent */}
                           <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 blur-3xl" style={{ backgroundColor: liturgicalColorMap[liturgicalInfo.color] }}></div>
                           
                           <div className="relative z-20 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                               <div>
                                   <div className="flex items-center gap-2 text-gold-400 mb-1">
                                       <CalendarIcon className="w-4 h-4" />
                                       <span className="text-[10px] uppercase tracking-widest font-display">Liturgia Diária</span>
                                   </div>
                                   <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
                                       {liturgicalInfo.season === 'Ordinary Time' ? 'Tempo Comum' : 
                                        liturgicalInfo.season === 'Advent' ? 'Tempo do Advento' : 
                                        liturgicalInfo.season === 'Lent' ? 'Quaresma' : 
                                        liturgicalInfo.season === 'Easter' ? 'Tempo Pascal' : 'Natal'}
                                   </h2>
                                   <p className="text-church-200 font-serif text-base max-w-md italic opacity-90 line-clamp-2 md:line-clamp-none">
                                       "{liturgicalInfo.description}"
                                   </p>
                               </div>
                               <button className="px-4 py-2 rounded-full border border-gold-500/30 text-gold-300 text-xs font-bold uppercase tracking-wider hover:bg-gold-500/10 transition-colors whitespace-nowrap hidden md:block">
                                   Ver Reflexão
                               </button>
                           </div>
                       </div>

                       {/* Welcome Text */}
                       <div className="text-center space-y-2 py-4">
                           <OrnateDivider className="w-12 h-2 mx-auto text-gold-400 mb-2 opacity-60" />
                           <p className="text-xl text-church-800 font-serif italic px-4">
                               "Pedi e se vos dará. Buscai e achareis."
                           </p>
                           <p className="text-xs text-church-500 font-display tracking-widest uppercase">Mateus 7,7</p>
                       </div>

                       {/* Action Cards Grid */}
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                            <button 
                                onClick={() => handleSendMessage("Quais são as condições para um pecado ser mortal segundo o Catecismo?")}
                                className="card-premium p-5 md:p-6 flex flex-row md:flex-col items-center text-left md:text-center rounded-xl group gap-4 md:gap-0"
                            >
                                <div className="w-12 h-12 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-gold-50 to-church-100 border border-gold-200 flex-none flex items-center justify-center text-gold-600 md:mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                    <ScrollIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-royal-900 text-sm mb-1 md:mb-2 uppercase tracking-wide">Dúvida de Fé</h3>
                                    <p className="text-sm text-church-600 font-serif leading-relaxed line-clamp-2">Esclareça questões doutrinárias com o Catecismo.</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => handleSuggestionClick(SuggestionType.PRAYER)}
                                className="card-premium p-5 md:p-6 flex flex-row md:flex-col items-center text-left md:text-center rounded-xl group relative overflow-hidden gap-4 md:gap-0"
                            >
                                <div className="absolute inset-0 bg-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-12 h-12 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-gold-50 to-church-100 border border-gold-200 flex-none flex items-center justify-center text-gold-600 md:mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                    <HeartIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-royal-900 text-sm mb-1 md:mb-2 uppercase tracking-wide">Vida de Oração</h3>
                                    <p className="text-sm text-church-600 font-serif leading-relaxed line-clamp-2">Encontre conforto e orações para seu momento.</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => handleSendMessage("Como fazer um bom exame de consciência?")}
                                className="card-premium p-5 md:p-6 flex flex-row md:flex-col items-center text-left md:text-center rounded-xl group gap-4 md:gap-0"
                            >
                                <div className="w-12 h-12 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-gold-50 to-church-100 border border-gold-200 flex-none flex items-center justify-center text-gold-600 md:mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                    <CandleIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-royal-900 text-sm mb-1 md:mb-2 uppercase tracking-wide">Sacramentos</h3>
                                    <p className="text-sm text-church-600 font-serif leading-relaxed line-clamp-2">Prepare-se para a Confissão ou Eucaristia.</p>
                                </div>
                            </button>
                       </div>
                   </div>
                )}

                {/* Messages */}
                {(!isWelcomeState || chatState.messages.length > 1) && chatState.messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}

                {chatState.error && (
                <div className="flex justify-center">
                    <div className="bg-red-50 text-red-800 px-4 py-3 rounded-lg text-sm border border-red-200 font-serif italic shadow-sm text-center">
                    {chatState.error}
                    </div>
                </div>
                )}

                <div ref={messagesEndRef} className="h-4" />
            </main>

            {/* Floating Input Dock - Disabled/Hidden visually via Modal backdrop if locked, but logic kept intact */}
            <footer className="absolute bottom-4 left-2 right-2 md:bottom-6 md:left-6 md:right-6 z-30 pointer-events-none flex flex-col items-center gap-3">
                
                {/* Suggestions Row */}
                {!isWelcomeState && (!chatState.isLoading || loadingSuggestion !== null) && !selectedFile && (
                <div className="pointer-events-auto flex gap-2 overflow-x-auto max-w-full pb-2 scrollbar-hide px-2 w-full md:w-auto justify-start md:justify-center">
                    {[
                        { type: SuggestionType.EXAM, icon: <SparklesIcon />, label: "Exame de Consciência" },
                        { type: SuggestionType.PRAYER, icon: <HeartIcon />, label: "Pedir Oração" },
                        { type: SuggestionType.CATECHESIS, icon: <QuoteIcon />, label: "Dúvida Doutrinária" }
                    ].map((item) => {
                        const isLoadingThis = loadingSuggestion === item.type;
                        const isDisabled = loadingSuggestion !== null && !isLoadingThis;
                        
                        return (
                            <button 
                                key={item.type}
                                onClick={() => !loadingSuggestion && handleSuggestionClick(item.type)}
                                disabled={!!loadingSuggestion || showPaywall}
                                className={`flex-none flex items-center gap-2 px-4 py-2.5 md:px-4 md:py-2 bg-white/90 backdrop-blur border border-white/50 text-church-800 text-sm font-bold rounded-full shadow-lg transition-all
                                    ${isLoadingThis ? 'bg-gold-50 border-gold-300 pr-5' : ''}
                                    ${isDisabled || showPaywall ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:scale-105 active:scale-95 hover:text-gold-600'}
                                `}
                            >
                                <span className="text-gold-500">
                                    {isLoadingThis ? <SpinnerIcon className="w-4 h-4 text-gold-600" /> : item.icon}
                                </span>
                                <span className="whitespace-nowrap">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
                )}

                {/* Input Capsule */}
                <div className="pointer-events-auto w-full max-w-3xl bg-white/95 backdrop-blur-xl border border-white/60 shadow-glass rounded-2xl p-1.5 md:p-2 flex items-end gap-2 relative transition-all duration-300 focus-within:shadow-glow focus-within:bg-white pb-safe">
                    
                     {selectedFile && (
                        <div className="absolute -top-12 left-0 right-0 flex justify-center animate-fade-in-up">
                            <div className="bg-royal-900 text-gold-100 px-4 py-2 rounded-full text-xs shadow-xl border border-gold-500/30 flex items-center gap-2 max-w-[90%]">
                                <PaperclipIcon className="w-3 h-3 flex-none" />
                                <span className="font-serif italic truncate">{selectedFile.name}</span>
                                <button onClick={clearFile} className="ml-2 hover:text-red-400 p-1"><CrossIcon className="w-3 h-3" /></button>
                            </div>
                        </div>
                    )}

                    {/* Left Actions */}
                    <div className="flex-none pb-1 pl-1">
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf,.txt,.md" className="hidden" />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 md:p-3 text-church-400 hover:text-gold-600 hover:bg-church-50 rounded-xl transition-colors"
                            title="Anexar documento"
                            disabled={chatState.isLoading || showPaywall}
                        >
                            <PaperclipIcon className="w-6 h-6 md:w-5 md:h-5" />
                        </button>
                    </div>

                    {/* Text Area */}
                    <div className="flex-1 py-1">
                        <textarea
                            ref={textareaRef}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={selectedFile ? "Enviar para leitura..." : "Escreva sua dúvida..."}
                            rows={1}
                            className="w-full bg-transparent text-church-900 text-base font-serif placeholder:text-church-400/60 placeholder:italic focus:outline-none resize-none max-h-32 py-2.5 px-1"
                            disabled={chatState.isLoading || showPaywall}
                        />
                    </div>

                    {/* Send Button */}
                    <button
                        onClick={() => handleSendMessage(inputText)}
                        disabled={chatState.isLoading || (!inputText.trim() && !selectedFile) || showPaywall}
                        className="btn-3d-gold h-11 w-11 md:h-11 md:w-11 rounded-xl flex-none flex items-center justify-center disabled:opacity-50 disabled:shadow-none transition-transform active:scale-95 mb-0.5 mr-0.5"
                    >
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
            </footer>
         </div>
      </div>
    </div>
  );
};

export default App;