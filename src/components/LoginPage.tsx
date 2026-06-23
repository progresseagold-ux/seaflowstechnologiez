import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KeyRound, ShieldAlert, CheckCircle, Mail, Lock, RefreshCw, Eye, EyeOff, X, Smartphone, Hash } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);

  // OTP standard auth state
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [otpCode, setOtpCode] = useState('');
  const [otpSentEmail, setOtpSentEmail] = useState('');
  const [generatedMockCode, setGeneratedMockCode] = useState('');
  
  // Loading & error statuses
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Forgot password states
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotErrorMsg, setForgotErrorMsg] = useState<string | null>(null);
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState<string | null>(null);

  const openForgotModal = () => {
    setForgotEmail('');
    setForgotErrorMsg(null);
    setForgotSuccessMsg(null);
    setShowForgot(true);
  };

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
      setForgotErrorMsg('Please specify your registered email address first.');
      return;
    }

    setForgotLoading(true);
    setForgotErrorMsg(null);
    setForgotSuccessMsg(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: window.location.origin
      });

      if (error) throw error;

      setForgotSuccessMsg('Password recovery link has been safely dispatched to your email.');
      setForgotEmail('');

    } catch (error: any) {
      console.error('Password Reset Error:', error);
      setForgotErrorMsg(error.message || 'Unable to start recovery process. Verify email settings.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSendOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your email address to request a secure OTP.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const targetEmail = email.trim();
      const { data, error } = await supabase.auth.signInWithOtp({
        email: targetEmail,
        options: {
          shouldCreateUser: true
        }
      });

      if (error) throw error;

      // Extract generated mock code if returned (available from mock helper)
      if (data && (data as any).code) {
        setGeneratedMockCode((data as any).code);
      } else {
        setGeneratedMockCode('123456'); // Fallback master code
      }

      setOtpSentEmail(targetEmail);
      setOtpStep('verify');
      setSuccessMsg('One-Time Password has been dispatched. Check your email inbox!');

    } catch (error: any) {
      console.error('Supabase signInWithOtp Error:', error);
      setErrorMsg(error.message || 'Failed to dispatch secure OTP. Verify configuration and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setErrorMsg('Please specify the One-Time verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: otpSentEmail,
        token: otpCode.trim(),
        type: 'email'
      });

      if (error) throw error;

      setSuccessMsg('Verification successful! Authenticating deep connections session...');
      setTimeout(() => {
        onSuccess();
      }, 1200);

    } catch (error: any) {
      console.error('Supabase verifyOtp Error:', error);
      setErrorMsg(error.message || 'Verification failure. Please verify the code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setIsLoading(true);
        setErrorMsg(null);
        setSuccessMsg(null);
        try {
          const targetEmail = event.data.email || 'seaflowstechautomation@gmail.com';
          const { error } = await supabase.auth.signInWithGoogleMock(targetEmail);
          if (error) throw error;
          
          setSuccessMsg(`Google Authentication successful! Welcome, ${targetEmail}`);
          setTimeout(() => {
            onSuccess();
          }, 1500);
        } catch (e: any) {
          setErrorMsg(e.message || 'Verification failure connecting with Google.');
        } finally {
          setIsLoading(false);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccess]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            email: 'seaflowstechautomation@gmail.com'
          }
        }
      });
      if (error) throw error;
      if (data?.url) {
        const popupWidth = 500;
        const popupHeight = 620;
        const left = window.screen.width / 2 - popupWidth / 2;
        const top = window.screen.height / 2 - popupHeight / 2;
        const oWindow = window.open(
          data.url,
          'google_oauth_popup',
          `width=${popupWidth},height=${popupHeight},left=${left},top=${top},status=0,resizable=1`
        );
        if (!oWindow) {
          setErrorMsg('Popup window blocked. Please authorize pop-ups on Seaflows Technologies to sign in with Google.');
          setIsLoading(false);
        }
      } else {
        throw new Error('Could not request secure Google Single Sign-on redirect URL.');
      }
    } catch (err: any) {
      console.error('Google Auth Init Error:', err);
      setErrorMsg(err.message || 'Failed to initialize Google authentication panel.');
      setIsLoading(false);
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
            Secure Customer Sign In
          </h3>
          <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
            Enter your credentials to browse certified equipment rates, trace invoices, and lodge support tickets.
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

        {/* Auth Mode Tabs Switcher */}
        <div className="grid grid-cols-2 p-1 bg-[#030913] border border-gray-850 rounded-xl" id="login-auth-tabs">
          <button
            type="button"
            className={`py-2.5 px-3 text-[11px] font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              authMode === 'password'
                ? 'active-auth-tab shadow-sm'
                : 'inactive-auth-tab text-gray-400 hover:text-white bg-transparent'
            }`}
            onClick={() => {
              setAuthMode('password');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Lock size={12} />
              <span>Password Entry</span>
            </div>
          </button>
          <button
            type="button"
            className={`py-2.5 px-3 text-[11px] font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              authMode === 'otp'
                ? 'active-auth-tab shadow-sm'
                : 'inactive-auth-tab text-gray-400 hover:text-white bg-transparent'
            }`}
            onClick={() => {
              setAuthMode('otp');
              setOtpStep('request');
              setOtpCode('');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Smartphone size={12} />
              <span>OTP / Magic Code</span>
            </div>
          </button>
        </div>

        {authMode === 'password' ? (
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
                  id="forgot-password-btn"
                  onClick={openForgotModal}
                  className="text-[10px] text-[#FDB813] hover:underline cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                  disabled={isLoading}
                >
                  Forgot your password?
                </button>
              </div>
              
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#030913] border border-gray-850 rounded-lg p-3 pr-10 text-xs text-white focus:outline-none focus:border-[#FDB813] transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  id="toggle-password-btn"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  disabled={isLoading}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full auth-button flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={13} className="animate-spin text-white" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                'SECURE SIGN IN'
              )}
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-4 text-xs">
            {otpStep === 'request' ? (
              <form onSubmit={handleSendOtpSubmit} className="flex flex-col gap-4">
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
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    We will dispatch a secure 6-digit verification code to this address for instant login.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full auth-button flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={13} className="animate-spin text-white" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    'SEND SECURE CODE'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtpSubmit} className="flex flex-col gap-4">
                <div className="p-3 bg-[#030913] border border-gray-850 rounded-xl space-y-1">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">Sending Code to:</span>
                  <span className="text-xs text-[#FDB813] font-mono break-all">{otpSentEmail}</span>
                </div>

                <div>
                  <label className="block text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-1.5 flex items-center gap-1">
                    <Hash size={11} className="text-[#FDB813]" /> 6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    placeholder="e.g. 123456"
                    className="w-full bg-[#030913] border border-gray-850 rounded-lg p-3 text-xs text-white text-center font-mono tracking-widest text-[#FDB813] placeholder-gray-700 focus:outline-none focus:border-[#FDB813] transition-colors"
                    disabled={isLoading}
                  />
                </div>

                {/* Developer / Testing environment helper */}
                <div className="p-3.5 bg-blue-950/20 border border-blue-900/30 rounded-xl text-[11px] leading-normal text-blue-300 font-sans space-y-1">
                  <div className="font-bold text-white flex items-center gap-1 mb-0.5">
                    💡 Testing Environment Instructions
                  </div>
                  <div>If checking with connected SMTP, locate the code in your email inbox.</div>
                  <div className="text-gray-300 pt-1 border-t border-blue-900/40 mt-1 flex flex-wrap gap-1 items-center">
                    <span>Generated offline code:</span>
                    <strong className="bg-[#FDB813]/15 text-[#FDB813] px-1.5 py-0.5 rounded font-mono text-[12px]">{generatedMockCode || '123456'}</strong>
                    <span className="text-gray-400 text-[10px]">(or type "123456" to bypass)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full auth-button flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={13} className="animate-spin text-white" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    'VERIFY & SIGN IN'
                  )}
                </button>

                <div className="flex justify-between items-center text-[10px] text-gray-400 pt-1 px-1">
                  <button
                    type="button"
                    className="hover:text-white transition-colors hover:underline cursor-pointer"
                    onClick={() => {
                      setOtpStep('request');
                      setOtpCode('');
                      setErrorMsg(null);
                    }}
                    disabled={isLoading}
                  >
                    ← Change email / go back
                  </button>
                  <button
                    type="button"
                    className="text-[#FDB813] hover:underline transition-colors font-bold cursor-pointer"
                    disabled={isLoading}
                    onClick={async () => {
                      setIsLoading(true);
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      try {
                        const { data, error } = await supabase.auth.signInWithOtp({
                          email: otpSentEmail,
                          options: { shouldCreateUser: true }
                        });
                        if (error) throw error;
                        if (data && (data as any).code) {
                          setGeneratedMockCode((data as any).code);
                        }
                        setSuccessMsg('A new login code has been successfully sent to ' + otpSentEmail);
                      } catch (error: any) {
                        setErrorMsg(error.message || 'Failed to resend. Please try again.');
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Beautiful Custom Visual Separator */}
        <div className="relative my-3 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800"></div>
          </div>
          <span className="relative px-3 bg-[#060c18] text-[9px] uppercase font-bold tracking-widest text-gray-500">
            Or continue with
          </span>
        </div>

        {/* Google Authentication Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-white hover:bg-gray-100 text-[#0A2342] py-2.5 rounded-lg text-xs font-bold font-sans transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          id="google-sso-login-btn"
        >
          <svg className="w-4 h-4 mr-0.5" viewBox="0 0 24 24" id="google-logo-vector">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span className="tracking-wide">Sign in with Google</span>
        </button>

        <div className="text-center text-xs border-t border-gray-850 pt-5 flex flex-col gap-2">
          <span className="text-gray-400">
            Don't have an active account yet?{' '}
            <button 
              onClick={onSignUpClick} 
              className="text-gold-login font-bold hover:underline cursor-pointer"
              disabled={isLoading}
              style={{ color: '#D4AF37' }}
            >
              Sign Up Now
            </button>
          </span>
        </div>

      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!forgotLoading) setShowForgot(false);
              }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              id="forgot-password-backdrop"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-md bg-[#060c18] border border-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl text-white overflow-hidden z-10"
              id="forgot-password-modal"
            >
              {/* Glow Accent */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-[#FDB813] to-emerald-500" />

              {/* Close Button */}
              <button
                type="button"
                id="close-forgot-modal"
                onClick={() => setShowForgot(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
                disabled={forgotLoading}
              >
                <X size={18} />
              </button>

              <div className="text-center mb-6">
                <div className="mx-auto flex justify-center mb-3">
                  <div className="p-3 bg-[#FDB813]/10 rounded-full text-[#FDB813]">
                    <KeyRound size={24} />
                  </div>
                </div>
                <h3 className="font-heading font-extrabold text-white text-base">
                  Retrieve Account Password
                </h3>
                <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
                  Specify your email address below. We underwrite secure diagnostic dispatchers instantly.
                </p>
              </div>

              {/* Status Feedbacks */}
              {forgotErrorMsg && (
                <div className="mb-4">
                  <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-300 rounded-xl text-[11px] flex items-center gap-2 font-sans text-left">
                    <ShieldAlert size={16} className="shrink-0 text-red-400" />
                    <span>{forgotErrorMsg}</span>
                  </div>
                </div>
              )}

              {forgotSuccessMsg && (
                <div className="mb-4">
                  <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 text-emerald-300 rounded-xl text-[11px] flex items-center gap-2 font-sans text-left">
                    <CheckCircle size={16} className="shrink-0 text-emerald-400" />
                    <span>{forgotSuccessMsg}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleForgotPasswordSubmit} className="flex flex-col gap-4 text-xs">
                <div className="text-left">
                  <label className="block text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-1.5 flex items-center gap-1">
                    <Mail size={11} className="text-[#FDB813]" /> Registered Email Address
                  </label>
                  <input
                    type="email"
                    required
                    id="forgot-email-input"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full bg-[#030913] border border-gray-850 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#FDB813] transition-colors"
                    disabled={forgotLoading}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <button
                    type="submit"
                    id="submit-forgot-btn"
                    disabled={forgotLoading}
                    className="flex-1 auth-button py-2.5 rounded-lg text-xs font-heading font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <>
                        <RefreshCw size={12} className="animate-spin text-white" />
                        <span>Sending Link...</span>
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                  <button
                    type="button"
                    id="cancel-forgot-btn"
                    onClick={() => setShowForgot(false)}
                    className="flex-1 bg-transparent border border-gray-800 hover:border-gray-600 text-white py-2.5 rounded-lg text-xs font-semibold hover:bg-gray-950/20 cursor-pointer transition-all disabled:opacity-50"
                    disabled={forgotLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
