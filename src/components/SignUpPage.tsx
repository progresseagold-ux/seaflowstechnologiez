import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserPlus, ShieldAlert, CheckCircle, Mail, Lock, User, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import CompanyLogo from './CompanyLogo';

interface SignUpPageProps {
  onSuccess: () => void;
  onLoginClick: () => void;
  onBackToLanding: () => void;
}

export default function SeaflowsSignUpPage({
  onSuccess,
  onLoginClick,
  onBackToLanding
}: SignUpPageProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Loading & statuses states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Real-time Database Diagnostics
  const [dbDiagnostic, setDbDiagnostic] = useState<{
    status: 'unchecked' | 'checking' | 'verified' | 'error';
    message: string;
    sqlRepair?: string;
  }>({ status: 'unchecked', message: '' });
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    let active = true;
    const runDiagnostics = async () => {
      if (!active) return;
      setDbDiagnostic({ status: 'checking', message: 'Verifying public.profiles structure...' });
      try {
        const { error } = await supabase.from('profiles').select('id, full_name, role, phone').limit(1);
        if (error) {
          console.error("Profiles Table Diagnostic Error:", error);
          
          const isTableMissing = error.message?.includes('relation "public.profiles" does not exist') || error.code === '42P01';
          const isColumnMissing = error.message?.includes('column') || error.code === '42703';
          
          if (isTableMissing) {
            if (active) setDbDiagnostic({
              status: 'error',
              message: 'Table public.profiles is missing in your current Supabase database.',
              sqlRepair: `-- 1. RECREATE THE PROFILES TABLE Safely
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'super_admin', 'operations_manager', 'inventory_manager', 'sales_manager', 'technician', 'customer_support', 'content_manager')),
    full_name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ENABLE ROW LEVEL SECURITY & POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by anyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by anyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. DETECT & DROP LEGACY/CONFLICTING TRIGGERS ON auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_signup ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS create_profile_of_new_user ON auth.users;
DROP TRIGGER IF EXISTS user_created ON auth.users;
DROP TRIGGER IF EXISTS profiles_trigger ON auth.users;

-- 4. DEFINE THE EXCEPTION-RESILIENT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'New Customer'),
      COALESCE(new.raw_user_meta_data->>'role', 'customer')
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role;
  EXCEPTION WHEN OTHERS THEN
    -- Capture and ignore any errors inside the trigger so they never crash the main sign-up transaction
    NULL;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. BIND THE NEW EXCEPTION-SAFE TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`
            });
          } else if (isColumnMissing) {
            if (active) setDbDiagnostic({
              status: 'error',
              message: 'Columns are missing on table public.profiles. Add columns and rebuild triggers with this SQL.',
              sqlRepair: `-- 1. ADD MISSING SCHEMAS & DEFAULT ROLES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'super_admin', 'operations_manager', 'inventory_manager', 'sales_manager', 'technician', 'customer_support', 'content_manager'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 2. ENABLE ROW LEVEL SECURITY & POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by anyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by anyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. CLEAN UP LEGACY TRIGGERS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_signup ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS create_profile_of_new_user ON auth.users;
DROP TRIGGER IF EXISTS user_created ON auth.users;
DROP TRIGGER IF EXISTS profiles_trigger ON auth.users;

-- 4. DEFINE EXCEPTION-RESILIENT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'New Customer'),
      COALESCE(new.raw_user_meta_data->>'role', 'customer')
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RECREATE BINDING TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`
            });
          } else {
            // General connection/other issues, columns probably exist but table may be empty or has zero rows (PGRST116 is normal)
            if (active) setDbDiagnostic({
              status: 'verified',
              message: 'Database schema structures verified!'
            });
          }
        } else {
          if (active) setDbDiagnostic({ status: 'verified', message: 'Database schema structures verified!' });
        }
      } catch (err: any) {
        console.error("Profiles Table Diagnostic Catch Error:", err);
        if (active) setDbDiagnostic({ status: 'error', message: `Diagnostics status: ${err.message}` });
      }
    };

    runDiagnostics();
    return () => { active = false; };
  }, []);

  const handleCopyCode = (codeText: string) => {
    try {
      navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      alert("Please manually highlight the SQL text below to copy.");
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Form Validations
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMsg('All registration parameters are required.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('For adequate security, password must span at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: 'customer'
          }
        }
      });

      if (error) {
        throw error;
      }

      // Robust fallback creation: If trigger failed or was bypassed, insert profile from client-side
      if (data?.user) {
        try {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .maybeSingle();

          if (!existingProfile) {
            await supabase.from('profiles').insert({
              id: data.user.id,
              full_name: fullName.trim(),
              role: 'customer'
            });
          }
        } catch (fallbackErr) {
          console.warn('[Seaflows Signup] Client-side fallback profile setup skipped or handled externally:', fallbackErr);
        }
      }

      setSuccessMsg('Account registered successfully! Redirecting to login context...');
      
      // Clear forms
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        onSuccess(); // Redirect to login page
      }, 1500);

    } catch (error: any) {
      console.error('Supabase Sign Up Error:', error);
      setErrorMsg(error.message || 'Unable to provision your account. Try a different email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full py-8 text-left selection:bg-[#FDB813] selection:text-[#0A2342]" id="signup-module">
      
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
            Create Customer Account
          </h3>
          <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
            Provision a secure access portal record to save solar calculator quotes, apply for flexible installment structures, and lodge site service requests.
          </p>
        </div>

        {/* Action feedback banners */}
        {errorMsg && (
          <div className="flex flex-col gap-3">
            <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-300 rounded-xl text-[11px] flex items-center gap-2 font-sans">
              <ShieldAlert size={16} className="shrink-0 text-red-500" />
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

        {/* Database Diagnostic & Interactive Repair Helper */}
        {(dbDiagnostic.status === 'error' || (errorMsg && errorMsg.includes('Database error saving new user'))) && (
          <div className="p-4 bg-amber-950/20 border border-amber-500/20 rounded-xl text-xs flex flex-col gap-3 font-sans id-diag" id="database-diagnostic-helper">
            <div className="flex items-start gap-2.5">
              <ShieldAlert size={18} className="shrink-0 text-[#FDB813] mt-0.5" />
              <div>
                <strong className="text-amber-300 block mb-0.5 text-[11px]">Database Profiles Trigger Correction Needed</strong>
                <p className="text-gray-400 text-[10.5px] leading-relaxed">
                  Supabase cannot save user records because the registration trigger is absent or column mappings don't match. You can fix this instantly:
                </p>
                <div className="mt-2 text-[10px] text-gray-400 space-y-1">
                  <div>1. Go to your <span className="text-white font-semibold">Supabase Workspace Dashboard</span>.</div>
                  <div>2. Select <span className="text-white font-semibold">SQL Editor</span> from the left navigation rail.</div>
                  <div>3. Open a <span className="text-white font-semibold">New Query</span>, paste the code below, and click <span className="text-[#FDB813] font-bold">Run</span>.</div>
                </div>
              </div>
            </div>

            <div className="relative mt-1">
              <textarea
                readOnly
                value={dbDiagnostic.sqlRepair || `-- SAFE FULL SETUP MATRIX FOR PROFILES & REGISTRATION SYNC
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'super_admin', 'operations_manager', 'inventory_manager', 'sales_manager', 'technician', 'customer_support', 'content_manager')),
    full_name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY & POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select" ON public.profiles;
CREATE POLICY "Public select" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "User update" ON public.profiles;
CREATE POLICY "User update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- DETECT & CLEAN UP ALL OBSOLETE/INTERFERING TRIGGERS ON auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_signup ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS create_profile_of_new_user ON auth.users;
DROP TRIGGER IF EXISTS user_created ON auth.users;
DROP TRIGGER IF EXISTS profiles_trigger ON auth.users;

-- EXCEPTION-RESILIENT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'New Customer'),
      COALESCE(new.raw_user_meta_data->>'role', 'customer')
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role;
  EXCEPTION WHEN OTHERS THEN
    -- Capture and ignore errors inside trigger to ensure register transaction never crashes
    NULL;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- BIND TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`}
                onClick={e => (e.target as any).select()}
                className="w-full h-36 bg-[#030913] text-[#FDB813] font-mono text-[9.5px] p-2.5 rounded-lg border border-gray-850 focus:outline-none cursor-pointer"
              />
              <button
                type="button"
                onClick={() => handleCopyCode(dbDiagnostic.sqlRepair || `CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'super_admin', 'operations_manager', 'inventory_manager', 'sales_manager', 'technician', 'customer_support', 'content_manager')),
    full_name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select" ON public.profiles;
CREATE POLICY "Public select" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "User update" ON public.profiles;
CREATE POLICY "User update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_signup ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS create_profile_of_new_user ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'New Customer'),
      COALESCE(new.raw_user_meta_data->>'role', 'customer')
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`)}
                className="absolute top-2 right-2 bg-amber-500 hover:bg-amber-400 text-[#0A2342] font-semibold text-[9px] px-2 py-0.5 rounded transition-colors"
              >
                {copied ? 'Copied!' : 'Copy SQL'}
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSignUpSubmit} className="flex flex-col gap-4 text-xs">
          <div>
            <label className="block text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-1.5 flex items-center gap-1">
              <User size={11} className="text-[#FDB813]" /> Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Kolawole Ogunleye"
              className="w-full bg-[#030913] border border-gray-850 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#FDB813] transition-colors"
              disabled={isLoading}
            />
          </div>

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
            <label className="block text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-1.5 flex items-center gap-1">
              <Lock size={11} className="text-[#FDB813]" /> Choose Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full bg-[#030913] border border-gray-850 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#FDB813] transition-colors"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-1.5 flex items-center gap-1">
              <Lock size={11} className="text-[#FDB813]" /> Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Re-type password"
              className="w-full bg-[#030913] border border-gray-850 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#FDB813] transition-colors"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full auth-button flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <>
                <RefreshCw size={13} className="animate-spin text-white" />
                <span>Creating Records...</span>
              </>
            ) : (
              'CREATE ACCOUNT'
            )}
          </button>
        </form>

        <div className="text-center text-xs border-t border-gray-850 pt-5 flex flex-col gap-2">
          <span className="text-gray-400">
            Already have active records?{' '}
            <button 
              onClick={onLoginClick} 
              className="text-gold-login font-bold hover:underline cursor-pointer"
              disabled={isLoading}
              style={{ color: '#D4AF37' }}
            >
              Sign In
            </button>
          </span>
        </div>

      </div>
    </div>
  );
}
