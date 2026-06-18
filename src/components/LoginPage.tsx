import React, { useState } from 'react';
import { motion } from 'motion/react';
import { KeyRound, ShieldAlert, CheckCircle, Mail, Lock, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import CompanyLogo from './CompanyLogo';

interface LoginPageProps {
  onSuccess: () => void;
  onSignUpClick: () => void;
  onBackToLanding: () => void;
}

export default function SeaflowsLoginPage({
  onSuccess,
  onSignUpClick,
  onBackToLanding
}: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Loading & error statuses
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Forgot password states
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please supply both your email address and password credentials.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        throw error;
      }

      setSuccessMsg('Signature verified! Redirecting to secure home dashboard...');
      setTimeout(() => {
        onSuccess();
      }, 1200);

    } catch (error: any) {
      console.error('Supabase Sign In Error:', error);
      setErrorMsg(error.message || 'Signature failure: verify email and password and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setErrorMsg('Please specify your registered email address first.');
      return;
    }

    setForgotLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: window.location.origin
      });

      if (error) throw error;

      setSuccessMsg('Password recovery key has been dispatched to your email dashboard.');
      setShowForgot(false);
      setForgotEmail('');

    } catch (error: any) {
      console.error('Password Reset Error:', error);
      setErrorMsg(error.message || 'Unable to start recovery process. Verify email settings.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full py-8 text-left selection:bg-[#FDB813] selection:text-[#0A2342]" id="login-module">
      
      {/* Small Back Button */}
      <button 
        onClick={onBackToLanding}
        className="text-[11px] text-gray-400 hover:text-white mb-6 uppercase tracking-wider font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        ← Back to Landing Showcase
      </button>

      <div className="bg-[#060c18] border border-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col gap-6 text-white relative overflow-hidden">
        
        {/* Glow Top Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-[#FDB813] to-emerald-500" />
        
        <div className="text-center">
          <div className="mx-auto flex justify-center mb-4">
            <CompanyLogo />
          </div>
          <h3 className="font-heading font-extrabold text-white text-base">
            {showForgot ? 'Retrieve Account Password' : 'Secure Customer Sign In'}
          </h3>
          <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
            {showForgot 
              ? 'Specify your email below. We underwrite secure diagnostic dispatchers instantly.' 
              : 'Enter your credentials to browse certified equipment rates, trace invoices, and lodge support tickets.'
            }
          </p>
        </div>

        {/* Action errors/successes feedback */}
        {errorMsg && (
          <div className="flex flex-col gap-3">
            <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-300 rounded-xl text-[11px] flex items-center gap-2 font-sans">
              <ShieldAlert size={16} className="shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
            {errorMsg.toLowerCase().includes('failed to fetch') && (
              <div className="p-3.5 bg-amber-950/30 border border-amber-500/20 rounded-xl text-xs flex flex-col gap-2 font-sans text-amber-200">
                <p className="font-bold text-[11px] text-amber-300 flex items-center gap-1">
                  ⚠️ AdBlocker or Brave Shields is Active
                </p>
                <p className="text-[10px] leading-relaxed text-gray-300">
                  Your browser's privacy extensions (like uBlock Origin, AdBlock, or Brave Shields) are blocking requests to the Supabase endpoint.
                </p>
                <div className="text-[10px] space-y-1 text-gray-400">
                  <div>1. Click on your AdBlocker shield/icon in the browser toolbar.</div>
                  <div>2. Toggle it <strong className="text-white">OFF</strong> for this preview page & refresh.</div>
                  <div>3. Alternatively, open the preview application in a new external tab.</div>
                </div>
              </div>
            )}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 text-emerald-300 rounded-xl text-[11px] flex items-center gap-2 font-sans">
            <CheckCircle size={16} className="shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {!showForgot ? (
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 text-xs">
            <div>
              <label className="block text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-1.5 flex items-center gap-1">
                <Mail size={11} className="text-[#FDB813]" /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full bg-[#030913] border border-gray-850 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#FDB813] transition-colors"
                disabled={isLoading}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-gray-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <Lock size={11} className="text-[#FDB813]" /> Password Credentials
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-[10px] text-gray-450 hover:text-[#FDB813] transition-colors"
                  disabled={isLoading}
                >
                  Forgot your password?
                </button>
              </div>
              
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#030913] border border-gray-850 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#FDB813] transition-colors"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FDB813] hover:bg-amber-400 text-[#0A2342] py-3 rounded-lg text-xs font-heading font-extrabold tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={13} className="animate-spin text-[#0A2342]" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                'SECURE SIGN IN'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPasswordSubmit} className="flex flex-col gap-4 text-xs">
            <div>
              <label className="block text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-1.5">
                Registered Email Address
              </label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full bg-[#030913] border border-gray-850 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#FDB813]"
                disabled={forgotLoading}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <button
                type="submit"
                disabled={forgotLoading}
                className="flex-1 bg-[#FDB813] hover:bg-amber-400 text-[#0A2342] py-2.5 rounded-lg text-xs font-heading font-bold uppercase transition-colors"
              >
                {forgotLoading ? 'Processing...' : 'Send Recovery Key'}
              </button>
              <button
                type="button"
                onClick={() => setShowForgot(false)}
                className="flex-1 bg-transparent border border-gray-800 hover:border-gray-600 text-white py-2.5 rounded-lg text-xs font-semibold hover:bg-gray-950/20"
                disabled={forgotLoading}
              >
                Cancel Recovery
              </button>
            </div>
          </form>
        )}

        <div className="text-center text-xs border-t border-gray-850 pt-5 flex flex-col gap-2">
          <span className="text-gray-400">
            Don't have an active account yet?{' '}
            <button 
              onClick={onSignUpClick} 
              className="text-[#FDB813] font-bold hover:underline cursor-pointer"
              disabled={isLoading}
            >
              Sign Up Now
            </button>
          </span>
        </div>

      </div>
    </div>
  );
}
