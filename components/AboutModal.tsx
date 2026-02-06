import React from 'react';
import { CrossIcon } from './Icons';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-royal-900/90 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-church-50 rounded-lg shadow-2xl border-2 border-gold-600 overflow-hidden transform transition-all animate-fade-in-up">
        {/* Paper Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-80 pointer-events-none"></div>
        
        {/* Decorative Header */}
        <div className="relative bg-royal-900 p-6 text-center border-b-4 border-gold-500">
           <div className="flex justify-center mb-3 text-gold-400">
             <CrossIcon />
           </div>
           <h2 className="text-2xl font-display font-bold text-gold-100 uppercase tracking-widest">Divine Assistant</h2>
           <p className="text-xs text-gold-300 font-serif italic mt-1">Lumen Fidei • Auxilium Christianorum</p>
           
           <button 
             onClick={onClose}
             className="absolute top-4 right-4 text-gold-500 hover:text-white transition-colors"
           >
             ✕
           </button>
        </div>

        {/* Body */}
        <div className="relative p-8 space-y-6 text-church-900">
           
           <div className="text-center space-y-2">
             <h3 className="font-display font-bold text-royal-900 uppercase tracking-wide border-b border-gold-600/30 pb-2 inline-block">Sobre esta Obra</h3>
           </div>

           <div className="font-serif text-sm leading-relaxed space-y-4 text-justify">
             <p>
               O <strong>Divine Assistant</strong> é uma ferramenta de inteligência artificial desenvolvida para auxiliar católicos na jornada de fé, oferecendo suporte catequético, sugestões de oração e preparação para os sacramentos.
             </p>
             
             <div className="bg-gold-50 border-l-4 border-gold-500 p-4 rounded-r-lg my-4">
               <p className="text-xs italic text-church-800">
                 <strong>Nota Importante:</strong> Esta IA não é um sacerdote, não possui alma e não pode administrar sacramentos. Ela não substitui a direção espiritual de um padre, a Santa Missa ou a leitura direta das Sagradas Escrituras.
               </p>
             </div>

             <p>
               Todo o conteúdo gerado busca fidelidade ao <strong>Magistério da Igreja Católica</strong>, baseando-se no Catecismo (CIC), na Bíblia Sagrada e nos Doutores da Igreja. No entanto, como toda tecnologia, está sujeita a imprecisões.
             </p>
           </div>

           {/* Footer "Nihil Obstat" style */}
           <div className="mt-8 pt-6 border-t border-church-200 text-center">
              <p className="font-display text-xs text-church-600 uppercase tracking-widest mb-1">Ad Maiorem Dei Gloriam</p>
              <p className="font-serif text-[10px] text-church-400 italic">Para a maior glória de Deus</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;