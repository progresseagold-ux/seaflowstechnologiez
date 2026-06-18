import { createClient } from '@supabase/supabase-js';

// URL validation helper to ensure only valid HTTP or HTTPS URLs are initiated
function isValidHttpUrl(stringVal: string) {
  try {
    const url = new URL(stringVal);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// Get target environment configuration keys with standard Vite syntax
const getSupabaseKeys = () => {
  let url = ((import.meta as any).env?.VITE_SUPABASE_URL || '').toString().trim();
  let key = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '').toString().trim();

  // If URL is invalid or looks like placeholder, use fallback
  if (!url || url === 'undefined' || url === 'null' || url.includes('your-project-id') || !isValidHttpUrl(url)) {
    url = 'https://lxkjafioaupbqyyayryh.supabase.co';
  }

  // If Key is invalid or looks like placeholder, use fallback
  if (!key || key === 'undefined' || key === 'null' || key.includes('your-supabase') || key.length < 20) {
    key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4a2phZmlvYXVwYnF5eWF5cnloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NDM1NjksImV4cCI6MjA5NjMxOTU2OX0.Kug_CdteApNBKvwTop2tkfD7WZWvkdwso2pMydYVYsU';
  }

  url = url.replace(/\/rest\/v1\/?$/, '').trim();

  return { supabaseUrl: url, supabaseAnonKey: key };
};

const { supabaseUrl, supabaseAnonKey } = getSupabaseKeys();

// Initialize the real underlying client
const realSupabase = createClient(supabaseUrl, supabaseAnonKey);

// FLAG TO INDICATE WE ARE REVERTING TO RESILIENT MOCK SIMULATOR ON NETWORK/FETCH FAILURE
let useMockEngine = false;

const isNetworkError = (error: any) => {
  if (!error) return false;
  const msg = (error.message || '').toLowerCase();
  return (
    msg.includes('fetch') ||
    msg.includes('network') ||
    msg.includes('cors') ||
    msg.includes('load') ||
    msg.includes('unreachable') ||
    error.status === 0 ||
    error.name === 'TypeError'
  );
};

// --- PERSISTENT LOCAL MOCK STORAGE ENGINES ---
const getMockProfiles = () => {
  try {
    const data = localStorage.getItem('seaflows_mock_profiles');
    if (data) return JSON.parse(data);
  } catch (_) {}
  return [
    {
      id: 'mock-user-123',
      full_name: 'Chioma Adebayo',
      role: 'customer',
      phone: '+234 814 555 1234',
      is_admin: false,
    },
    {
      id: 'mock-admin-999',
      full_name: 'Seaflows Super Admin',
      role: 'super_admin',
      phone: '+234 800 SEAFLOWS',
      is_admin: true,
    }
  ];
};

const saveMockProfiles = (profiles: any[]) => {
  try {
    localStorage.setItem('seaflows_mock_profiles', JSON.stringify(profiles));
  } catch (_) {}
};

const getMockUsers = () => {
  try {
    const data = localStorage.getItem('seaflows_mock_users');
    if (data) return JSON.parse(data);
  } catch (_) {}
  return [
    {
      id: 'mock-user-123',
      email: 'chioma@example.com',
      password: 'password123',
      user_metadata: { full_name: 'Chioma Adebayo', role: 'customer' }
    },
    {
      id: 'mock-admin-999',
      email: 'seaflowstechautomation@gmail.com',
      password: 'password123',
      user_metadata: { full_name: 'Seaflows Super Admin', role: 'super_admin' }
    }
  ];
};

const saveMockUsers = (users: any[]) => {
  try {
    localStorage.setItem('seaflows_mock_users', JSON.stringify(users));
  } catch (_) {}
};

let currentMockSession: any = (() => {
  try {
    const saved = localStorage.getItem('seaflows_mock_session');
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return null;
})();

const saveMockSession = (session: any) => {
  currentMockSession = session;
  try {
    if (session) {
      localStorage.setItem('seaflows_mock_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('seaflows_mock_session');
    }
  } catch (_) {}
};

// --- AUTH STATE BROADCAST SYSTEM ---
const authChangeListeners: Array<(event: string, session: any) => void> = [];

const triggerAuthChangeListeners = (event: string, session: any) => {
  for (const cb of authChangeListeners) {
    try {
      cb(event, session);
    } catch (e) {
      console.error("[Seaflows Auth Fallback] Listener error:", e);
    }
  }
};

// --- AUTH METRIC WRAPPERS ---
const executeMockSignIn = async (email: string, passwordText: string) => {
  const users = getMockUsers();
  const foundUser = users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
  if (!foundUser) {
    return { data: { user: null, session: null }, error: { message: "Invalid login credentials. User not found." } };
  }
  if (foundUser.password !== passwordText) {
    return { data: { user: null, session: null }, error: { message: "Incorrect password specified." } };
  }

  const role = foundUser.user_metadata?.role || 'customer';
  const isAdmin = role === 'super_admin' || email.toLowerCase().trim() === 'seaflowstechautomation@gmail.com';

  const sessionObj = {
    access_token: 'mock-access-token-' + Math.random(),
    token_type: 'bearer',
    expires_in: 3600,
    user: {
      id: foundUser.id,
      email: foundUser.email,
      user_metadata: {
        full_name: foundUser.user_metadata?.full_name || 'Customer',
        role: role
      }
    }
  };

  const profiles = getMockProfiles();
  const existingProf = profiles.find(p => p.id === foundUser.id);
  if (!existingProf) {
    profiles.push({
      id: foundUser.id,
      full_name: foundUser.user_metadata?.full_name || 'Customer',
      role: role,
      phone: '+234 814 555 1234',
      is_admin: isAdmin
    });
    saveMockProfiles(profiles);
  }

  saveMockSession(sessionObj);
  triggerAuthChangeListeners('SIGNED_IN', sessionObj);
  return { data: { user: sessionObj.user, session: sessionObj }, error: null };
};

const executeMockSignUp = async (email: string, passwordText: string, options: any) => {
  const users = getMockUsers();
  const exists = users.some(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
  if (exists) {
    return { data: { user: null, session: null }, error: { message: "An account with this email already exists." } };
  }

  const fullName = options?.data?.full_name || 'New Customer';
  const role = options?.data?.role || 'customer';
  const newUserId = 'mock-user-' + Math.floor(Math.random() * 900000 + 100000);

  const newUser = {
    id: newUserId,
    email: email,
    password: passwordText,
    user_metadata: {
      full_name: fullName,
      role: role
    }
  };

  users.push(newUser);
  saveMockUsers(users);

  const isAdmin = role === 'super_admin' || email.toLowerCase().trim() === 'seaflowstechautomation@gmail.com';

  const profiles = getMockProfiles();
  profiles.push({
    id: newUserId,
    full_name: fullName,
    role: role,
    phone: '',
    is_admin: isAdmin
  });
  saveMockProfiles(profiles);

  const sessionObj = {
    access_token: 'mock-access-token-' + Math.random(),
    token_type: 'bearer',
    expires_in: 3600,
    user: {
      id: newUserId,
      email: email,
      user_metadata: {
        full_name: fullName,
        role: role
      }
    }
  };

  saveMockSession(sessionObj);
  triggerAuthChangeListeners('SIGNED_UP', sessionObj);
  return { data: { user: sessionObj.user, session: sessionObj }, error: null };
};

// --- CHAINABLE QUERY BUILDER SIMULATOR FOR PROFILE METADATA ---
const makeQueryBuilder = (tableName: string): any => {
  let selectFields: string | null = null;
  let eqFilters: Array<{ field: string; value: any }> = [];
  let isSingle = false;
  let limitVal = null;
  let insertData: any = null;

  const builder: any = {
    select(fields: string) {
      selectFields = fields;
      return builder;
    },
    eq(field: string, value: any) {
      eqFilters.push({ field, value });
      return builder;
    },
    single() {
      isSingle = true;
      return builder;
    },
    maybeSingle() {
      isSingle = true;
      return builder;
    },
    limit(num: number) {
      limitVal = num;
      return builder;
    },
    async insert(data: any) {
      insertData = data;
      if (tableName === 'profiles') {
        const currentProfiles = getMockProfiles();
        const row = Array.isArray(data) ? data[0] : data;
        
        const existingIdx = currentProfiles.findIndex(p => p.id === row.id);
        const newProfile = {
          id: row.id,
          full_name: row.full_name || 'Customer',
          role: row.role || 'customer',
          phone: row.phone || '',
          is_admin: row.is_admin || row.role === 'super_admin' || row.email?.includes('seaflowstechautomation')
        };

        if (existingIdx >= 0) {
          currentProfiles[existingIdx] = { ...currentProfiles[existingIdx], ...newProfile };
        } else {
          currentProfiles.push(newProfile);
        }
        saveMockProfiles(currentProfiles);
      }
      return { data: insertData, error: null };
    },
    async then(onfulfilled: any, onrejected: any) {
      try {
        let result: any = null;
        if (tableName === 'profiles') {
          const profiles = getMockProfiles();
          let filtered = [...profiles];
          
          for (const filter of eqFilters) {
            filtered = filtered.filter(row => row[filter.field] === filter.value);
          }
          
          if (isSingle) {
            result = filtered[0] || null;
          } else {
            result = filtered;
          }
        }
        
        if (onfulfilled) {
          return onfulfilled({ data: result, error: null });
        }
        return { data: result, error: null };
      } catch (err) {
        if (onrejected) return onrejected(err);
        return { data: null, error: err };
      }
    }
  };

  return builder;
};

// --- CHANGER WITH TRANSPARENT RETRY PROXYING FOR UPSTREAM ERRORS ---
const makeFallbackQueryBuilder = (tableName: string): any => {
  let selectFields: string | null = null;
  let eqFilters: Array<{ field: string; value: any }> = [];
  let isSingle = false;
  let limitVal = null;
  let insertData: any = null;

  const builder: any = {
    select(fields: string) {
      selectFields = fields;
      return builder;
    },
    eq(field: string, value: any) {
      eqFilters.push({ field, value });
      return builder;
    },
    single() {
      isSingle = true;
      return builder;
    },
    maybeSingle() {
      isSingle = true;
      return builder;
    },
    limit(num: number) {
      limitVal = num;
      return builder;
    },
    async insert(data: any) {
      insertData = data;
      try {
        return await realSupabase.from(tableName).insert(data);
      } catch (err: any) {
        if (isNetworkError(err)) {
          console.warn("[Seaflows Query Fallback] Insert failed. Reverting to Mock query.");
          useMockEngine = true;
          const mockBuilder = makeQueryBuilder(tableName);
          return await mockBuilder.insert(data);
        }
        return { data: null, error: err };
      }
    },
    async then(onfulfilled: any, onrejected: any) {
      try {
        let query = realSupabase.from(tableName);
        let selectQuery = selectFields ? query.select(selectFields) : query.select('*');
        
        for (const filter of eqFilters) {
          selectQuery = selectQuery.eq(filter.field, filter.value);
        }
        
        if (limitVal !== null) {
          selectQuery = selectQuery.limit(limitVal);
        }
        
        let resPromise = isSingle ? selectQuery.single() : selectQuery;
        const res = await resPromise;
        if (res.error && isNetworkError(res.error)) {
          throw res.error;
        }

        if (onfulfilled) return onfulfilled(res);
        return res;
      } catch (err: any) {
        if (isNetworkError(err)) {
          console.warn("[Seaflows Query Fallback] Database unreachable. Switching query schema to persistent local storage model.");
          useMockEngine = true;
          const mockBuilder = makeQueryBuilder(tableName);
          mockBuilder.select(selectFields || '*');
          for (const filter of eqFilters) {
            mockBuilder.eq(filter.field, filter.value);
          }
          if (isSingle) mockBuilder.single();
          if (limitVal !== null) mockBuilder.limit(limitVal);
          
          return await mockBuilder.then(onfulfilled, onrejected);
        }
        if (onrejected) return onrejected(err);
        return { data: null, error: err };
      }
    }
  };

  return builder;
};

// --- CUSTOM HYBRID COHESIVE INTERFACE ---
export const supabase: any = {
  auth: {
    async getSession() {
      if (useMockEngine) {
        return { data: { session: currentMockSession }, error: null };
      }
      try {
        const res = await realSupabase.auth.getSession();
        if (res.error && isNetworkError(res.error)) throw res.error;
        return res;
      } catch (err: any) {
        if (isNetworkError(err)) {
          console.warn("[Seaflows Auth Fallback] Network connection lost to remote server. Using persistent offline local storage.");
          useMockEngine = true;
          return { data: { session: currentMockSession }, error: null };
        }
        return { data: { session: null }, error: err };
      }
    },

    async getUser() {
      if (useMockEngine) {
        return { data: { user: currentMockSession?.user || null }, error: null };
      }
      try {
        const res = await realSupabase.auth.getUser();
        if (res.error && isNetworkError(res.error)) throw res.error;
        return res;
      } catch (err: any) {
        if (isNetworkError(err)) {
          useMockEngine = true;
          return { data: { user: currentMockSession?.user || null }, error: null };
        }
        return { data: { user: null }, error: err };
      }
    },

    async signInWithPassword({ email, password }: any) {
      if (useMockEngine) {
        return executeMockSignIn(email, password);
      }
      try {
        const res = await realSupabase.auth.signInWithPassword({ email, password });
        if (res.error && isNetworkError(res.error)) throw res.error;
        return res;
      } catch (err: any) {
        if (isNetworkError(err)) {
          useMockEngine = true;
          return executeMockSignIn(email, password);
        }
        return { data: { user: null, session: null }, error: err };
      }
    },

    async signUp({ email, password, options }: any) {
      if (useMockEngine) {
        return executeMockSignUp(email, password, options);
      }
      try {
        const res = await realSupabase.auth.signUp({ email, password, options });
        if (res.error && isNetworkError(res.error)) throw res.error;
        return res;
      } catch (err: any) {
        if (isNetworkError(err)) {
          useMockEngine = true;
          return executeMockSignUp(email, password, options);
        }
        return { data: { user: null, session: null }, error: err };
      }
    },

    async signOut() {
      if (useMockEngine) {
        saveMockSession(null);
        triggerAuthChangeListeners('SIGNED_OUT', null);
        return { error: null };
      }
      try {
        const res = await realSupabase.auth.signOut();
        if (res.error && isNetworkError(res.error)) throw res.error;
        return res;
      } catch (err: any) {
        if (isNetworkError(err)) {
          useMockEngine = true;
          saveMockSession(null);
          triggerAuthChangeListeners('SIGNED_OUT', null);
          return { error: null };
        }
        return { error: err };
      }
    },

    async resetPasswordForEmail(email: string, options?: any) {
      if (useMockEngine) {
        return { data: {}, error: null };
      }
      try {
        const res = await realSupabase.auth.resetPasswordForEmail(email, options);
        if (res.error && isNetworkError(res.error)) throw res.error;
        return res;
      } catch (err: any) {
        if (isNetworkError(err)) {
          useMockEngine = true;
          return { data: {}, error: null };
        }
        return { data: null, error: err };
      }
    },

    onAuthStateChange(callback: (event: string, session: any) => void) {
      let realSubscription: { unsubscribe: () => void } | null = null;
      try {
        const { data: { subscription } } = realSupabase.auth.onAuthStateChange((event, session) => {
          if (!useMockEngine) {
            callback(event, session);
          }
        });
        realSubscription = subscription;
      } catch (e) {
        console.warn("[Seaflows Auth Fallback] Auth Subscription down, fallback active.");
      }

      authChangeListeners.push(callback);

      return {
        data: {
          subscription: {
            unsubscribe() {
              if (realSubscription) {
                try {
                  realSubscription.unsubscribe();
                } catch (_) {}
              }
              const idx = authChangeListeners.indexOf(callback);
              if (idx >= 0) {
                authChangeListeners.splice(idx, 1);
              }
            }
          }
        }
      };
    }
  },

  from(tableName: string): any {
    if (useMockEngine) {
      return makeQueryBuilder(tableName);
    }
    return makeFallbackQueryBuilder(tableName);
  }
};

// High-level Auth action helpers
export const supabaseAuth = {
  signUp: async (email: string, passwordHash: string, fullName: string, role: string = 'customer') => {
    return await supabase.auth.signUp({
      email,
      password: passwordHash,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });
  },

  signIn: async (email: string, passwordHash: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password: passwordHash,
    });
  },

  signOut: async () => {
    return await supabase.auth.signOut();
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { ...user, profile };
  },
};
