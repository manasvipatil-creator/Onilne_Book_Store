import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, ShoppingBag, Lock, Sparkles } from 'lucide-react';
import { Modal } from './common/Modal';
import { Button } from './common/Button';

export interface CheckoutAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string;
}

export const CheckoutAuthModal: React.FC<CheckoutAuthModalProps> = ({
  isOpen,
  onClose,
  redirectUrl = '/checkout',
}) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose();
    navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`, {
      state: { from: { pathname: redirectUrl } },
    });
  };

  const handleRegister = () => {
    onClose();
    navigate(`/register?redirect=${encodeURIComponent(redirectUrl)}`, {
      state: { from: { pathname: redirectUrl } },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="space-y-6 text-center">
        {/* Brand Icon Badge */}
        <div className="mx-auto w-16 h-16 rounded-3xl bg-navy/5 border border-navy/10 flex items-center justify-center text-navy shadow-inner">
          <Lock className="w-8 h-8 text-golden" />
        </div>

        {/* Heading & Subtext */}
        <div className="space-y-2">
          <span className="inline-flex items-center space-x-1 text-[11px] font-black uppercase tracking-widest text-golden bg-golden/10 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Reader Account Required</span>
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-navy tracking-tight">
            Sign In to Continue
          </h2>
          <p className="text-xs sm:text-sm text-textSecondary max-w-sm mx-auto leading-relaxed">
            Please sign in or create an account to proceed to checkout and secure your reading collection. Your cart items will be saved!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            type="button"
            variant="gold"
            size="lg"
            className="w-full font-black shadow-md flex items-center justify-center space-x-2"
            onClick={handleLogin}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Continue</span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full font-bold flex items-center justify-center space-x-2"
            onClick={handleRegister}
          >
            <UserPlus className="w-4 h-4 text-navy" />
            <span>Create Free Account</span>
          </Button>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-textSecondary hover:text-navy transition-colors pt-2 block w-full"
          >
            Cancel & Return to Cart
          </button>
        </div>
      </div>
    </Modal>
  );
};
