import React, { useState, useEffect, useRef } from 'react';
import { 
  PlayIcon, CloudRainIcon, ClockIcon, HeartCrackIcon, 
  CheckIcon, ShieldIcon, StarIcon, ChevronDownIcon,
  CrossIcon, OrnateDivider, ChiRhoIcon, BookIcon, SendIcon, HeartIcon, PrayingHandsIcon
} from './Icons';

interface LandingPageProps {
  onStart: () => void;
}

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

// --- HELPER COMPONENT FOR SCROLL ANIMATIONS ---
const RevealOnScroll: React.FC<RevealOnScrollProps> = ({ children, className = "", delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: "0px 0px -50px 0px" // Offset a bit so it doesn't trigger too early at the very bottom
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div 
      ref={ref} 
      // Changed animation physics: Added custom cubic-bezier for "pop" effect, plus subtle scale and blur transitions.
      className={`transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] transform ${isVisible ? 'opacity-100 translate-y-0 scale-100 blur-0' : 'opacity-0 translate-y-12 scale-[0.96] blur-[2px]'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-church-200">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left focus:outline-none group"
      >
        <span className="text-royal-900 font-serif font-bold text-lg md:text-xl group-hover:text-gold-600 transition-colors">{question}</span>
        <ChevronDownIcon className={`w-5 h-5 text-gold-500 transition-transform duration-300 flex-none ml-4 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
        <p className="text-church-800 font-sans leading-relaxed text-base md:text-lg">{answer}</p>
      </div>
    </div>
  );
};

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    // MAIN CONTAINER: Church Cream Background + Paper Texture
    <div className="h-full w-full bg-church-50 text-royal-900 font-sans overflow-y-auto overflow-x-hidden selection:bg-gold-500 selection:text-white relative z-50">
      <div className="fixed inset-0 bg-paper-texture opacity-30 pointer-events-none z-0"></div>
      
      {/* BRAND HEADER */}
      <nav className="absolute top-0 left-0 w-full z-50 px-4 py-4 lg:px-12 flex items-center justify-between">
        
        <div className="relative group">
            {/* Gradient Glow Effect around Title - INTENSIFIED */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-[200%] bg-gradient-to-r from-gold-400/40 via-gold-300/30 to-transparent blur-xl rounded-full -z-10 pointer-events-none"></div>

            <div className="flex items-center gap-3 animate-fade-in-up">
                <div className="p-2 md:p-3 bg-royal-900 rounded-sm shadow-xl border border-gold-500/50 flex items-center justify-center group hover:scale-105 transition-transform duration-300">
                    <CrossIcon className="w-5 h-5 md:w-6 md:h-6 text-gold-100 group-hover:text-gold-400 transition-colors" />
                </div>
                <div className="flex flex-col">
                    <span className="font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-600 via-gold-500 to-gold-700 tracking-[0.15em] text-lg md:text-2xl leading-none drop-shadow-sm filter">
                        DIVINE ASSISTANT
                    </span>
                    <span className="font-serif italic text-royal-800 text-[10px] md:text-xs tracking-widest mt-1 opacity-80">
                        Lumen Fidei • Inteligência Católica
                    </span>
                </div>
            </div>
        </div>

        {/* Optional: Login/Start Button for Desktop */}
        <button 
            onClick={onStart}
            className="hidden md:inline-flex items-center gap-2 text-xs font-bold font-display uppercase tracking-widest text-royal-900 hover:text-gold-600 transition-colors border border-transparent hover:border-gold-500/30 px-4 py-2 rounded-sm"
        >
            Acessar Plataforma
            <span className="text-gold-500">→</span>
        </button>
      </nav>

      {/* 1. HERO SECTION */}
      <header className="relative min-h-[90vh] flex items-center justify-center pt-28 pb-12 px-4 lg:px-12 overflow-hidden z-10">
        {/* Background Gradients */}
        <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-church-50 via-church-100 to-church-200 opacity-80 -z-10"></div>
        {/* Center Glow */}
        <div className="absolute top-1/2 left-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-gold-400/20 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>

        <div className="max-w-4xl mx-auto flex flex-col items-center relative text-center">
            {/* Text Content */}
            <div className="space-y-6 md:space-y-10 animate-fade-in-up relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-1.5 rounded-full bg-royal-900/5 border border-royal-900/10 text-royal-800 text-xs font-bold tracking-widest uppercase backdrop-blur-sm mx-auto">
                   <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse"></span>
                   Tecnologia Fiel ao Magistério
                </div>
                
                <div className="relative">
                    {/* Decorative Icon */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-[0.03] text-royal-900 pointer-events-none rotate-0">
                        <ChiRhoIcon className="w-64 h-64 md:w-96 md:h-96" />
                    </div>

                    <h1 className="relative text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-black text-royal-900 leading-[0.95] md:leading-[0.9] drop-shadow-sm tracking-tight">
                        DIVINE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 drop-shadow-[0_2px_10px_rgba(212,175,55,0.3)]">
                            ASSISTANT
                        </span>
                    </h1>
                </div>
                
                <div className="space-y-4 max-w-2xl mx-auto px-2">
                    <p className="text-xl md:text-2xl lg:text-3xl text-royal-800 font-serif leading-tight">
                        Sua Fé, guiada pela <span className="italic text-gold-600 font-bold bg-gold-50/50 px-2 rounded-sm decoration-gold-300 underline underline-offset-4">Sabedoria dos Séculos.</span>
                    </p>
                    <p className="text-base md:text-lg text-church-600 font-sans border-t border-b border-gold-400/30 py-4">
                        A <span className="font-bold text-royal-900">primeira IA</span> treinada exclusivamente no <span className="text-gold-600 font-bold">Catecismo</span>, nos <span className="text-gold-600 font-bold">Santos</span> e nas <span className="text-gold-600 font-bold">Escrituras</span>. Sem alucinações, apenas a <span className="text-royal-900 font-black border-b-2 border-gold-400">Verdade</span>.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 md:pt-8 w-full px-4">
                    <button 
                    onClick={onStart}
                    className="group relative inline-flex items-center justify-center gap-3 bg-royal-900 hover:bg-royal-800 text-gold-100 font-display font-bold text-lg px-8 py-5 md:py-5 rounded-sm shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(184,150,40,0.3)] active:scale-95 transition-all duration-300 w-full sm:w-auto"
                    >
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="relative z-10">Assinar Agora</span>
                        <CrossIcon className="w-5 h-5 text-gold-400 group-hover:text-white transition-colors duration-300" />
                    </button>
                    
                    <button 
                        onClick={onStart} 
                        className="inline-flex items-center justify-center gap-2 text-royal-900 font-bold hover:text-gold-600 transition-colors px-6 py-4 text-base"
                    >
                        <PlayIcon className="w-4 h-4" />
                        <span className="border-b border-royal-900/30 group-hover:border-gold-600">Ver como funciona</span>
                    </button>
                </div>
            </div>
        </div>
      </header>

      {/* 2. AUTHORITY STRIP */}
      <section className="py-8 md:py-10 bg-royal-900 border-y-4 border-double border-gold-700 relative z-10">
         <div className="absolute inset-0 bg-leather-texture opacity-50"></div>
         <RevealOnScroll className="max-w-7xl mx-auto px-4 text-center relative z-10">
            <p className="text-xs text-gold-400 font-display uppercase tracking-[0.2em] md:tracking-[0.3em] mb-6 md:mb-8 opacity-80">Confiado por fiéis em todo o Brasil</p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 md:gap-x-12 md:gap-y-6 opacity-70">
                {["Pastoral da Comunicação", "Grupos de Oração", "Catequistas", "Ministros da Palavra"].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <StarIcon className="w-3 h-3 text-gold-500" />
                        <span className="font-display font-bold text-base md:text-xl text-church-100">{item}</span>
                    </div>
                ))}
            </div>
         </RevealOnScroll>
      </section>

      {/* 3. PROBLEM AGITATION (The Pain) */}
      <section className="py-16 md:py-24 bg-royal-800 text-church-100 relative overflow-hidden z-10">
          <div className="absolute inset-0 bg-leather-texture opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-royal-900 via-transparent to-royal-900 opacity-80"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
              <RevealOnScroll className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                  <OrnateDivider className="w-24 h-4 mx-auto text-gold-500 mb-6" />
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-gold-100 mb-6">
                      Você sente que sua vida espiritual está <span className="text-gold-400 border-b-2 border-gold-400/30 italic">estagnada?</span>
                  </h2>
                  <p className="text-church-400 text-lg md:text-lg font-serif">
                      No mundo ruidoso de hoje, manter a <span className="text-gold-200 font-medium">chama da fé acesa</span> é um <span className="text-white font-bold">desafio solitário</span>.
                  </p>
              </RevealOnScroll>

              <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                  {/* Card 1 */}
                  <RevealOnScroll delay={100} className="bg-royal-900/60 backdrop-blur-md p-6 md:p-8 rounded-sm border border-gold-500/20 hover:border-gold-500/60 transition-colors group shadow-lg">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-royal-950 rounded-sm border border-gold-500/10 flex items-center justify-center mb-6 group-hover:border-gold-500 transition-colors">
                          <CloudRainIcon className="w-6 h-6 md:w-8 md:h-8 text-gold-500" />
                      </div>
                      <h3 className="text-xl md:text-xl font-bold font-display text-gold-200 mb-3">Dúvidas Constantes</h3>
                      <p className="text-church-400 leading-relaxed font-serif text-base">
                          Você quer seguir a Igreja, mas se perde em meio a tantas <span className="text-gold-300 font-medium">opiniões divergentes</span> na internet sobre o que é certo ou errado.
                      </p>
                  </RevealOnScroll>

                  {/* Card 2 */}
                  <RevealOnScroll delay={300} className="bg-royal-900/60 backdrop-blur-md p-6 md:p-8 rounded-sm border border-gold-500/20 hover:border-gold-500/60 transition-colors group shadow-lg">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-royal-950 rounded-sm border border-gold-500/10 flex items-center justify-center mb-6 group-hover:border-gold-500 transition-colors">
                          <ClockIcon className="w-6 h-6 md:w-8 md:h-8 text-gold-500" />
                      </div>
                      <h3 className="text-xl md:text-xl font-bold font-display text-gold-200 mb-3">Falta de Tempo</h3>
                      <p className="text-church-400 leading-relaxed font-serif text-base">
                          A rotina de trabalho e estudos consome seu dia. Quando sobra tempo, você está <span className="text-gold-300 font-medium">cansado demais</span> para pesquisar ou rezar profundamente.
                      </p>
                  </RevealOnScroll>

                  {/* Card 3 */}
                  <RevealOnScroll delay={500} className="bg-royal-900/60 backdrop-blur-md p-6 md:p-8 rounded-sm border border-gold-500/20 hover:border-gold-500/60 transition-colors group shadow-lg">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-royal-950 rounded-sm border border-gold-500/10 flex items-center justify-center mb-6 group-hover:border-gold-500 transition-colors">
                          <HeartCrackIcon className="w-6 h-6 md:w-8 md:h-8 text-gold-500" />
                      </div>
                      <h3 className="text-xl md:text-xl font-bold font-display text-gold-200 mb-3">Solidão na Fé</h3>
                      <p className="text-church-400 leading-relaxed font-serif text-base">
                          Sentir-se <span className="text-gold-300 font-medium border-b border-gold-500/30">sozinho na caminhada</span>, sem um diretor espiritual acessível para tirar dúvidas rápidas ou pedir conselho.
                      </p>
                  </RevealOnScroll>
              </div>
          </div>
      </section>

      {/* 4. SOLUTION & MECHANISM */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-church-50 relative z-10">
          <div className="max-w-7xl mx-auto space-y-16 md:space-y-24">
              
              {/* Feature 1 */}
              <RevealOnScroll className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                  <div className="order-2 md:order-1 space-y-4 md:space-y-6">
                      <div className="inline-block px-3 py-1.5 md:px-4 md:py-2 rounded-sm bg-gold-100 border border-gold-200 text-gold-800 font-bold text-xs uppercase tracking-widest">
                          Segurança Doutrinária
                      </div>
                      <h3 className="text-2xl md:text-4xl font-display font-bold text-royal-900">
                          Treinada no Catecismo e na Verdade.
                      </h3>
                      <p className="text-base md:text-lg text-church-800 leading-relaxed font-serif">
                          Diferente de IAs genéricas que inventam fatos, o Divine Assistant possui um protocolo de <span className="text-royal-900 font-bold bg-gold-200/50 px-1 rounded">"Zero Alucinação"</span>. Se a resposta não estiver no <span className="text-gold-700 font-bold">Magistério</span>, ele avisa. É um <span className="text-royal-900 font-bold italic">ambiente seguro</span> para sua alma.
                      </p>
                  </div>
                  <div className="order-1 md:order-2 bg-white p-2 rounded-sm shadow-xl border border-gold-200 rotate-2 hover:rotate-0 transition-transform duration-500">
                      <div className="bg-royal-900 rounded-sm h-48 md:h-80 flex items-center justify-center overflow-hidden relative">
                         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620216793664-9ac936990263?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-60"></div>
                         <div className="absolute inset-0 bg-royal-900/50"></div>
                         <ShieldIcon className="w-16 h-16 md:w-24 md:h-24 text-gold-400 drop-shadow-[0_0_15px_rgba(212,175,55,0.6)] relative z-10" />
                      </div>
                  </div>
              </RevealOnScroll>

              {/* Feature 2 */}
              <RevealOnScroll className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                  <div className="order-1 bg-white p-2 rounded-sm shadow-xl border border-gold-200 -rotate-2 hover:rotate-0 transition-transform duration-500">
                       <div className="bg-royal-900 rounded-sm h-48 md:h-80 flex items-center justify-center overflow-hidden relative">
                         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1491841573634-28140fc7ced7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-40"></div>
                         <div className="absolute inset-0 bg-royal-800/60"></div>
                         {/* ChiRho */}
                         <div className="text-gold-200 drop-shadow-lg relative z-10 font-display text-6xl md:text-8xl">☧</div>
                      </div>
                  </div>
                  <div className="order-2 space-y-4 md:space-y-6">
                      <div className="inline-block px-3 py-1.5 md:px-4 md:py-2 rounded-sm bg-gold-100 border border-gold-200 text-gold-800 font-bold text-xs uppercase tracking-widest">
                          Vida de Oração
                      </div>
                      <h3 className="text-2xl md:text-4xl font-display font-bold text-royal-900">
                          Roteiros de Oração Personalizados.
                      </h3>
                      <p className="text-base md:text-lg text-church-800 leading-relaxed font-serif">
                          Está ansioso? Triste? Precisa agradecer? Peça uma oração e receba preces da <span className="text-gold-700 font-bold">tradição da Igreja</span> ou meditações baseadas nos <span className="text-gold-700 font-bold">Salmos</span>, perfeitamente adaptadas ao seu momento.
                      </p>
                  </div>
              </RevealOnScroll>

          </div>
          
          <RevealOnScroll delay={200} className="mt-16 md:mt-20 text-center max-w-2xl mx-auto bg-church-100 border border-gold-200 p-6 md:p-8 rounded-sm shadow-inner">
              <p className="text-royal-900 font-serif italic text-base md:text-lg">
                  "O Divine Assistant não substitui um sacerdote ou os sacramentos, mas é um apoio poderoso para sua caminhada diária de santificação."
              </p>
          </RevealOnScroll>
      </section>

      {/* 4.5 NEW SECTION: HOW IT WORKS (Como Funciona) */}
      <section className="py-16 md:py-24 bg-white relative z-10">
          <div className="max-w-7xl mx-auto px-6">
              <RevealOnScroll className="text-center mb-12 md:mb-16">
                  <span className="text-gold-500 font-display font-bold tracking-widest uppercase text-xs">Simples e Profundo</span>
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-royal-900 mt-2">Como usar seu Assistente Divino</h2>
              </RevealOnScroll>

              {/* Steps Grid */}
              <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
                  {/* Connector Line (Desktop) */}
                  <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-gold-300 to-transparent border-t border-dashed border-gold-400 z-0"></div>

                  {/* Step 1 */}
                  <RevealOnScroll delay={100} className="relative z-10 flex flex-col items-center text-center group">
                      <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-full border-4 border-church-100 shadow-xl flex items-center justify-center mb-4 md:mb-6 group-hover:border-gold-400 group-hover:scale-110 transition-all duration-300">
                          <SendIcon className="w-8 h-8 md:w-10 md:h-10 text-royal-900 group-hover:text-gold-600 transition-colors" />
                          <div className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-gold-500 text-white font-bold rounded-full flex items-center justify-center border-2 border-white text-sm">1</div>
                      </div>
                      <h3 className="text-xl md:text-xl font-bold font-display text-royal-900 mb-2">Envie sua Dúvida</h3>
                      <p className="text-church-600 font-serif text-base leading-relaxed max-w-xs">
                          Pergunte sobre <span className="text-gold-600 font-bold">dogmas</span>, peça uma <span className="text-gold-600 font-bold">oração</span> ou anexe um documento da Igreja para ser resumido.
                      </p>
                  </RevealOnScroll>

                  {/* Step 2 */}
                  <RevealOnScroll delay={300} className="relative z-10 flex flex-col items-center text-center group">
                      <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-full border-4 border-church-100 shadow-xl flex items-center justify-center mb-4 md:mb-6 group-hover:border-gold-400 group-hover:scale-110 transition-all duration-300">
                          <BookIcon className="w-8 h-8 md:w-10 md:h-10 text-royal-900 group-hover:text-gold-600 transition-colors" />
                          <div className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-gold-500 text-white font-bold rounded-full flex items-center justify-center border-2 border-white text-sm">2</div>
                      </div>
                      <h3 className="text-xl md:text-xl font-bold font-display text-royal-900 mb-2">Análise Teológica</h3>
                      <p className="text-church-600 font-serif text-base leading-relaxed max-w-xs">
                          A IA consulta o <span className="text-royal-900 font-bold">Catecismo</span>, a <span className="text-royal-900 font-bold">Bíblia</span> e documentos oficiais em <span className="text-gold-600 font-bold italic">milésimos de segundo</span>.
                      </p>
                  </RevealOnScroll>

                  {/* Step 3 */}
                  <RevealOnScroll delay={500} className="relative z-10 flex flex-col items-center text-center group">
                      <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-full border-4 border-church-100 shadow-xl flex items-center justify-center mb-4 md:mb-6 group-hover:border-gold-400 group-hover:scale-110 transition-all duration-300">
                          <HeartIcon className="w-8 h-8 md:w-10 md:h-10 text-royal-900 group-hover:text-gold-600 transition-colors" />
                          <div className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-gold-500 text-white font-bold rounded-full flex items-center justify-center border-2 border-white text-sm">3</div>
                      </div>
                      <h3 className="text-xl md:text-xl font-bold font-display text-royal-900 mb-2">Resposta Pastoral</h3>
                      <p className="text-church-600 font-serif text-base leading-relaxed max-w-xs">
                          Receba uma orientação <span className="text-gold-600 font-medium">clara</span>, <span className="text-gold-600 font-medium">caridosa</span> e <span className="text-gold-600 font-medium">fundamentada</span> para aplicar na sua vida.
                      </p>
                  </RevealOnScroll>
              </div>

              {/* Benefits Grid */}
              <div className="mt-16 md:mt-24 grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {[
                      { icon: <ClockIcon/>, title: "Disponível 24h", text: "Tire dúvidas na madrugada ou no intervalo do trabalho." },
                      { icon: <ShieldIcon/>, title: "100% Seguro", text: "Conteúdo filtrado. Sem heresias ou relativismo." },
                      { icon: <PrayingHandsIcon/>, title: "Foco Espiritual", text: "Interface desenhada para a paz, sem anúncios." },
                      { icon: <BookIcon/>, title: "Estudo Profundo", text: "Acesse a sabedoria de 2000 anos em segundos." }
                  ].map((benefit, i) => (
                      <RevealOnScroll key={i} delay={i * 100} className="bg-church-50 p-4 md:p-6 rounded-lg border border-church-100 hover:border-gold-300 transition-all group">
                          <div className="text-gold-500 mb-3 group-hover:scale-110 transition-transform origin-left">
                             {React.cloneElement(benefit.icon as React.ReactElement<{ className?: string }>, { className: "w-6 h-6" })}
                          </div>
                          <h4 className="font-bold text-royal-900 mb-1 text-base">{benefit.title}</h4>
                          <p className="text-sm text-church-600 font-serif">{benefit.text}</p>
                      </RevealOnScroll>
                  ))}
              </div>
          </div>
      </section>

      {/* 5. SOCIAL PROOF */}
      <section className="py-16 md:py-24 bg-church-50 border-y border-church-200 relative z-10">
          <div className="max-w-7xl mx-auto px-6">
              <RevealOnScroll className="text-center text-3xl md:text-3xl font-display font-bold text-royal-900 mb-12 md:mb-16">
                 <h2>O que os fiéis estão dizendo</h2>
              </RevealOnScroll>
              <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                  {/* Testimonial 1 */}
                  <RevealOnScroll delay={100} className="bg-white p-6 md:p-8 rounded-sm border border-church-200 hover:shadow-lg hover:border-gold-300 transition-all">
                      <div className="flex gap-1 text-gold-500 mb-4">
                          <StarIcon className="w-4 h-4" /><StarIcon className="w-4 h-4" /><StarIcon className="w-4 h-4" /><StarIcon className="w-4 h-4" /><StarIcon className="w-4 h-4" />
                      </div>
                      <p className="text-church-900 font-serif italic mb-6 text-base leading-relaxed">"Finalmente entendi a doutrina sobre o Purgatório de forma simples. Mudou minha forma de rezar pelos falecidos!"</p>
                      <div className="border-t border-gold-200 pt-4">
                        <div className="font-bold font-display text-royal-900">Maria S.</div>
                        <div className="text-xs text-gold-600 uppercase tracking-wider">Catequista</div>
                      </div>
                  </RevealOnScroll>

                  {/* Testimonial 2 */}
                  <RevealOnScroll delay={300} className="bg-white p-6 md:p-8 rounded-sm border border-church-200 hover:shadow-lg hover:border-gold-300 transition-all">
                      <div className="flex gap-1 text-gold-500 mb-4">
                          <StarIcon className="w-4 h-4" /><StarIcon className="w-4 h-4" /><StarIcon className="w-4 h-4" /><StarIcon className="w-4 h-4" /><StarIcon className="w-4 h-4" />
                      </div>
                      <p className="text-church-900 font-serif italic mb-6 text-base leading-relaxed">"O guia de exame de consciência é profundo. Me ajudou a fazer a melhor confissão da minha vida."</p>
                      <div className="border-t border-gold-200 pt-4">
                        <div className="font-bold font-display text-royal-900">João Pedro</div>
                        <div className="text-xs text-gold-600 uppercase tracking-wider">Universitário</div>
                      </div>
                  </RevealOnScroll>

                  {/* Testimonial 3 */}
                  <RevealOnScroll delay={500} className="bg-white p-6 md:p-8 rounded-sm border border-church-200 hover:shadow-lg hover:border-gold-300 transition-all">
                      <div className="flex gap-1 text-gold-500 mb-4">
                          <StarIcon className="w-4 h-4" /><StarIcon className="w-4 h-4" /><StarIcon className="w-4 h-4" /><StarIcon className="w-4 h-4" /><StarIcon className="w-4 h-4" />
                      </div>
                      <p className="text-church-900 font-serif italic mb-6 text-base leading-relaxed">"Uso todos os dias para ler a liturgia e meditar o Evangelho. É como ter um diretor espiritual no bolso."</p>
                      <div className="border-t border-gold-200 pt-4">
                        <div className="font-bold font-display text-royal-900">Ana Clara</div>
                        <div className="text-xs text-gold-600 uppercase tracking-wider">Mãe de família</div>
                      </div>
                  </RevealOnScroll>
              </div>
          </div>
      </section>

      {/* 6. THE OFFER (High Impact) */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-royal-900 relative overflow-hidden z-10 border-t border-gold-600">
          <div className="absolute inset-0 bg-leather-texture opacity-60"></div>
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-gold-600/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="max-w-4xl mx-auto relative z-10">
              <RevealOnScroll className="bg-church-50 rounded-sm shadow-2xl overflow-hidden border-2 border-gold-500">
                  <div className="bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 p-4 text-center border-b border-white/20">
                      <span className="text-royal-900 font-bold tracking-[0.2em] uppercase text-xs md:text-sm font-display">Oferta por Tempo Limitado</span>
                  </div>
                  
                  <div className="p-6 md:p-16 grid md:grid-cols-2 gap-8 md:gap-12 items-center bg-paper-texture">
                      <div className="space-y-6 text-center md:text-left">
                          <h3 className="text-3xl md:text-3xl font-display font-bold text-royal-900">Acesso Premium Mensal</h3>
                          <div className="flex items-baseline justify-center md:justify-start gap-3">
                              <span className="text-church-400 line-through text-lg md:text-xl font-serif">R$ 29,90/mês</span>
                              <span className="text-4xl md:text-5xl font-bold text-gold-600 font-display">R$ 19,99</span>
                          </div>
                          <p className="text-royal-800 text-base font-serif">
                              Garanta seu <span className="bg-gold-100 text-gold-800 px-2 py-0.5 rounded-sm font-bold border border-gold-300">acesso completo</span> por um valor acessível e ajude a manter este projeto de evangelização.
                          </p>
                          <button 
                            onClick={onStart}
                            className="w-full bg-royal-900 hover:bg-royal-800 text-gold-100 font-display font-bold tracking-wide py-4 rounded-sm shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2 border border-gold-500/30"
                          >
                            Assinar Agora
                            <ChevronDownIcon className="w-5 h-5 -rotate-90 text-gold-500" />
                          </button>
                      </div>

                      <div className="bg-white p-6 rounded-sm border border-church-200 shadow-inner">
                          <h4 className="font-bold text-royal-900 mb-6 uppercase text-xs tracking-widest text-center border-b border-church-100 pb-2">O que você recebe:</h4>
                          <ul className="space-y-4">
                              {[
                                  "Acesso Ilimitado à IA",
                                  "Análise de Documentos (PDF)",
                                  "Bônus: Planner de Oração",
                                  "Bônus: Guia de Confissão",
                                  "Atualizações Prioritárias"
                              ].map((item, i) => (
                                  <li key={i} className="flex items-center gap-3 text-base text-church-800 font-serif">
                                      <div className="flex-none w-5 h-5 rounded-full bg-gold-100 text-gold-600 flex items-center justify-center border border-gold-200">
                                          <CheckIcon className="w-3 h-3" />
                                      </div>
                                      {item}
                                  </li>
                              ))}
                          </ul>
                      </div>
                  </div>
              </RevealOnScroll>
          </div>
      </section>

      {/* 7. GUARANTEE */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-church-50 relative z-10">
          <div className="max-w-4xl mx-auto">
              <RevealOnScroll className="relative bg-white p-6 md:p-12 rounded-sm border-2 border-gold-500/30 shadow-2xl overflow-hidden">
                  {/* Background Texture */}
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-50"></div>
                  <div className="absolute -right-10 -bottom-10 text-gold-500/5 rotate-12 pointer-events-none">
                      <ShieldIcon className="w-48 h-48 md:w-64 md:h-64" />
                  </div>

                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8 text-center md:text-left">
                      {/* The "Seal" */}
                      <div className="flex-none relative">
                          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg flex items-center justify-center p-1">
                              <div className="w-full h-full rounded-full border-2 border-white/30 flex items-center justify-center bg-gold-500">
                                   <ShieldIcon className="w-10 h-10 md:w-12 md:h-12 text-white" />
                              </div>
                          </div>
                      </div>

                      {/* The Copy */}
                      <div className="space-y-4">
                          <h3 className="font-display font-bold text-xl md:text-2xl text-royal-900">
                              Garantia de Fidelidade Magisterial
                          </h3>
                          <p className="text-church-800 leading-relaxed font-serif text-base md:text-base">
                              Nossa missão não é o lucro, mas a <span className="text-gold-600 font-bold italic">salvação das almas</span>. Desenvolvemos esta ferramenta com <span className="text-royal-900 font-medium">temor e tremor</span> diante da Verdade.
                          </p>
                          <p className="text-church-600 text-sm md:text-sm font-sans">
                              Se em qualquer momento você sentir que o <strong>Divine Assistant</strong> não está enriquecendo sua vida de oração ou estudo, você pode deixar de usar sem nenhum custo ou vínculo. Sem letras miúdas. Sua <span className="text-gold-600 font-bold border-b-2 border-gold-200">paz espiritual</span> é nossa prioridade absoluta.
                          </p>
                          
                          {/* Signature / Authority */}
                          <div className="pt-4 flex items-center justify-center md:justify-start gap-4 opacity-80">
                               <div className="h-px w-12 bg-gold-400"></div>
                               <span className="font-display text-[10px] md:text-xs font-bold text-gold-600 uppercase tracking-widest">Ad Maiorem Dei Gloriam</span>
                          </div>
                      </div>
                  </div>
              </RevealOnScroll>
          </div>
      </section>

      {/* 8. FAQ */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-white relative z-10">
          <div className="max-w-3xl mx-auto">
              <RevealOnScroll className="text-center text-3xl md:text-3xl font-display font-bold text-royal-900 mb-8 md:mb-12">
                  <h2>Perguntas Frequentes</h2>
              </RevealOnScroll>
              <RevealOnScroll className="space-y-2">
                  <FAQItem 
                    question="Isso substitui o padre na confissão?" 
                    answer="Absolutamente não. A IA ajuda no exame de consciência (preparação), mas somente um sacerdote ordenado pode absolver pecados no Sacramento da Reconciliação." 
                  />
                  <FAQItem 
                    question="É seguro para meus filhos usarem?" 
                    answer="Sim. O conteúdo é 100% filtrado com base na moral católica. Não há risco de receberem respostas relativistas ou impróprias comuns em outras IAs." 
                  />
                  <FAQItem 
                    question="Funciona no celular?" 
                    answer="Sim! O Divine Assistant é totalmente responsivo e funciona perfeitamente em qualquer smartphone, tablet ou computador." 
                  />
                  <FAQItem 
                    question="O que acontece se eu enviar um documento?" 
                    answer="O sistema lê o documento (ex: uma Encíclica ou texto de estudo) e permite que você converse com ele. Os dados não são usados para treinar modelos públicos." 
                  />
              </RevealOnScroll>
          </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="bg-royal-900 text-gold-100/60 py-8 md:py-12 px-6 border-t border-gold-600/30 relative z-10">
          <div className="absolute inset-0 bg-leather-texture opacity-50 pointer-events-none"></div>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
              <div className="flex items-center gap-2">
                  <CrossIcon className="text-gold-500 w-5 h-5" />
                  <span className="font-display font-bold text-gold-100 tracking-[0.2em] text-sm">DIVINE ASSISTANT</span>
              </div>
              <p className="text-xs font-serif italic text-center md:text-right">
                  © {new Date().getFullYear()} Ad Maiorem Dei Gloriam. Todos os direitos reservados.
              </p>
          </div>
      </footer>

    </div>
  );
};

export default LandingPage;