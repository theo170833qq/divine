import React from 'react';
import { CrossIcon, ShieldIcon, CheckIcon, StarIcon } from './Icons';
import { STRIPE_PAYMENT_LINK } from '../services/stripeService';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isBlocking?: boolean; // Nova propriedade para forçar o pagamento
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, isBlocking = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop - Se for bloqueante, não fecha ao clicar fora */}
      <div 
        className="absolute inset-0 bg-royal-900/95 backdrop-blur-md transition-opacity"
        onClick={!isBlocking ? onClose : undefined}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-royal-900 rounded-lg shadow-2xl border-2 border-gold-500 overflow-hidden transform transition-all animate-fade-in-up">
        {/* Golden Gradient Border Effect */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-600 via-gold-300 to-gold-600"></div>
        
        {/* Background Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-60 pointer-events-none"></div>

        <div className="relative p-8 text-center">
            
            {/* Header Icon */}
            <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 p-1 shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                    <div className="w-full h-full rounded-full bg-royal-900 flex items-center justify-center border border-gold-300/30">
                        <ShieldIcon className="w-10 h-10 text-gold-400" />
                    </div>
                </div>
            </div>

            <div className="mb-2 inline-block px-3 py-1 rounded-full bg-gold-500/20 border border-gold-500/50">
                <span className="text-[10px] font-bold text-gold-300 uppercase tracking-widest">
                    {isBlocking ? 'Acesso Restrito' : 'Assinatura Mensal'}
                </span>
            </div>

            <h2 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-gold-100 via-gold-300 to-gold-500 mb-2 uppercase tracking-wide">
                Guardião da Fé
            </h2>
            <p className="text-church-400 font-serif text-sm italic mb-8 max-w-xs mx-auto">
                {isBlocking 
                    ? "Para acessar o Divine Assistant, é necessário ter uma assinatura ativa." 
                    : "Apoie esta obra de evangelização e desbloqueie o acesso completo à inteligência católica."}
            </p>

            {/* Benefits List */}
            <div className="bg-white/5 rounded-lg p-6 mb-8 border border-white/10 text-left">
                <ul className="space-y-4">
                    {[
                        "Acesso Liberado ao Chat",
                        "Análise de Documentos PDF",
                        "Respostas Profundas (Modelos Pro)",
                        "Acesso prioritário a novas funções",
                        "Suporte dedicado"
                    ].map((benefit, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <div className="flex-none mt-0.5 text-gold-500">
                                <CheckIcon className="w-5 h-5" />
                            </div>
                            <span className="text-church-100 font-sans text-sm">{benefit}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Pricing */}
            <div className="mb-8 flex flex-col items-center">
                <div className="flex items-baseline gap-2">
                    <span className="text-church-500 line-through text-lg decoration-red-500/50">R$ 29,90</span>
                    <span className="text-4xl font-display font-bold text-white">R$ 19,99</span>
                    <span className="text-church-400 text-sm">/mês</span>
                </div>
                <p className="text-[10px] text-gold-500/80 mt-1 uppercase tracking-wider">Cancele quando quiser</p>
            </div>

            {/* CTA Button as Direct Link */}
            <a 
                href={STRIPE_PAYMENT_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-3d-gold py-4 rounded-sm font-display font-bold uppercase tracking-[0.15em] text-royal-900 text-lg shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-shadow flex items-center justify-center no-underline"
            >
                Assinar Agora
            </a>
            
            <p className="mt-4 text-[10px] text-church-500">
                Pagamento seguro via Stripe. Abre em nova aba.
            </p>

            {/* Close Button - Only show if NOT blocking */}
            {!isBlocking && (
                <button onClick={onClose} className="absolute top-4 right-4 text-church-500 hover:text-white transition-colors">
                    <CrossIcon className="w-6 h-6" />
                </button>
            )}
            
            {/* If blocking, add a sign out option in case they logged in with wrong account */}
            {isBlocking && (
                <div className="mt-6 border-t border-white/5 pt-4">
                    <p className="text-[10px] text-church-500 mb-2">Já é assinante mas está vendo isso? Tente recarregar a página.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;