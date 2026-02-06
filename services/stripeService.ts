import { loadStripe } from '@stripe/stripe-js';

// Substitua pela sua Chave Pública do Stripe (encontrada no Dashboard > Developers > API Keys)
// Se não tiver uma agora, pode deixar como está para testes visuais.
const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_PUBLISHABLE_KEY_HERE';

// ==============================================================================
// 🟢 LINK DE PAGAMENTO CONFIGURADO (Exportado para uso direto)
// ==============================================================================
export const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_5kQ4gBeAHfdg1pg9zP3AY00'; 
// ==============================================================================

let stripePromise: Promise<any> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

export const redirectToCheckout = async () => {
  if (STRIPE_PAYMENT_LINK) {
      window.location.href = STRIPE_PAYMENT_LINK;
  } else {
      console.error("Link de pagamento não configurado.");
      alert("Erro de configuração: Link de pagamento ausente.");
  }
};