```react
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot, 
  orderBy 
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  User, 
  Key, 
  Loader2, 
  ChevronRight, 
  LogOut, 
  Clock, 
  Newspaper,
  LayoutGrid,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyDgXEl1AjtMnCrWKUFZ2Aeh9AeUwuwXUhs",
  authDomain: "appvip-77f6d.firebaseapp.com",
  projectId: "appvip-77f6d",
  storageBucket: "appvip-77f6d.firebasestorage.app",
  messagingSenderId: "897414209112",
  appId: "1:897414209112:web:0731b564e9e0b5a48bf42d",
  measurementId: "G-ZSQE61R8PC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const DimensionalLogo = () => (
  <div className="relative w-24 h-24 mb-6">
    <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full animate-pulse"></div>
    <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500 relative z-10 animate-[spin_15s_linear_infinite]">
      <path d="M50 5 L95 27.5 L95 72.5 L50 95 L5 72.5 L5 27.5 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M50 20 L76 33 L76 67 L50 80 L24 67 L24 33 Z" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <circle cx="50" cy="50" r="5" fill="currentColor">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  </div>
);

const CountdownTimer = ({ expiryDate, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(expiryDate).getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        onExpire();
        return;
      }

      setTimeLeft({
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryDate, onExpire]);

  return (
    <div className="flex gap-2 font-black text-amber-500 italic">
      <span>{timeLeft.d}d</span> :
      <span>{timeLeft.h.toString().padStart(2, '0')}h</span> :
      <span>{timeLeft.m.toString().padStart(2, '0')}m</span> :
      <span>{timeLeft.s.toString().padStart(2, '0')}s</span>
    </div>
  );
};

const PostItem = ({ post }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article 
      onClick={() => setIsExpanded(!isExpanded)}
      className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] overflow-hidden group cursor-pointer transition-all hover:border-amber-500/20"
    >
      {post.imagem && (
        <div className="aspect-video w-full overflow-hidden">
          <img src={post.imagem} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-black text-zinc-100 uppercase italic tracking-tighter mb-3">{post.titulo}</h3>
        <p className={`text-zinc-400 text-sm leading-relaxed mb-4 whitespace-pre-wrap ${!isExpanded ? 'line-clamp-3' : ''}`}>
          {post.conteudo}
        </p>
        
        <div className="flex items-center gap-1 text-amber-500 text-[10px] font-black uppercase mb-4">
          {isExpanded ? (
            <><ChevronUp size={14} /> Ver Menos</>
          ) : (
            <><ChevronDown size={14} /> Ler Completo</>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50 text-zinc-600">
          <span className="text-[8px] font-black uppercase tracking-widest">Cod: {post.id.substring(0,8)}</span>
          <ShieldCheck size={14} className="text-amber-500/50" />
        </div>
      </div>
    </article>
  );
};

export default function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [userVipData, setUserVipData] = useState(null);
  const [loginData, setLoginData] = useState({ usuario: '', senha: '' });

  useEffect(() => {
    const init = async () => {
      try {
        await signInAnonymously(auth);
      } catch (e) { console.error(e); }
    };
    init();
    const unsub = onAuthStateChanged(auth, () => setLoading(false));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isLogged) {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snap) => {
        setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => unsub();
    }
  }, [isLogged]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setError('');
    
    try {
      const q = query(collection(db, 'usuarios_vip'), where('usuario', '==', loginData.usuario));
      const snap = await getDocs(q);
      
      if (snap.empty) throw new Error("Acesso não identificado na dimensão.");

      const userData = snap.docs[0].data();
      if (userData.senha !== loginData.senha) throw new Error("Chave de acesso incorreta.");

      const expira = new Date(userData.expiracao);
      if (new Date() > expira) throw new Error("Seu tempo nesta dimensão expirou.");

      setUserVipData(userData);
      setIsLogged(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const openWhatsApp = () => {
    window.location.href = "https://wa.me/558494792723";
  };

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-amber-500">
      <Loader2 className="animate-spin mb-4" />
      <span className="text-[10px] font-black uppercase tracking-[0.3em]">Sincronizando Frequência...</span>
    </div>
  );

  if (!isLogged) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-left">
        <div className="w-full max-w-md flex flex-col items-center">
          <DimensionalLogo />
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black italic text-zinc-100 uppercase tracking-tighter">
              Conhecimento <span className="text-amber-500">Vip</span>
            </h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-2">
              Apenas os dimensionais têm acesso
            </p>
          </div>

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
              <input 
                required
                value={loginData.usuario}
                onChange={e => setLoginData({...loginData, usuario: e.target.value})}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-5 pl-14 pr-6 outline-none focus:border-amber-500/50 transition-all text-zinc-100 font-bold placeholder:text-zinc-700"
                placeholder="Usuário Dimensional"
              />
            </div>
            <div className="relative">
              <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
              <input 
                required
                type="password"
                value={loginData.senha}
                onChange={e => setLoginData({...loginData, senha: e.target.value})}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-5 pl-14 pr-6 outline-none focus:border-amber-500/50 transition-all text-zinc-100 font-bold placeholder:text-zinc-700"
                placeholder="Chave de Acesso"
              />
            </div>
            {error && <div className="text-red-500 text-[10px] font-black uppercase p-2 text-center">{error}</div>}
            <button disabled={authLoading} className="w-full bg-amber-500 text-black font-black uppercase py-5 rounded-2xl tracking-[0.2em] transition-all flex items-center justify-center gap-3">
              {authLoading ? <Loader2 className="animate-spin" size={20} /> : <>Aceder à Dimensão <ChevronRight size={18} /></>}
            </button>
          </form>

          <div className="mt-10 w-full text-center space-y-4 border-t border-zinc-900 pt-8">
            <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Contrate ou Renove seu acesso</p>
            <button 
              onClick={openWhatsApp}
              className="inline-flex items-center gap-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-8 py-4 rounded-2xl border border-zinc-800 transition-all group"
            >
              <MessageCircle size={20} className="text-green-500 group-hover:scale-110 transition-transform" />
              <span className="font-black text-xs uppercase tracking-tighter">Suporte Dimensional</span>
            </button>
          </div>

          <p className="mt-8 text-zinc-800 text-[7px] font-black uppercase tracking-[0.5em]">© Dimensional Intelligence</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col text-left">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 text-amber-500">
             <svg viewBox="0 0 100 100"><path d="M50 5 L95 27.5 L95 72.5 L50 95 L5 72.5 L5 27.5 Z" fill="none" stroke="currentColor" strokeWidth="10"/></svg>
          </div>
          <span className="font-black italic text-xs tracking-tighter uppercase">Painel Dimensional</span>
        </div>
        <button onClick={() => setIsLogged(false)} className="text-zinc-600 hover:text-red-500 transition-colors"><LogOut size={20} /></button>
      </header>

      <div className="bg-zinc-950 border-b border-zinc-900 px-6 py-4 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Tempo Restante:</span>
          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">User: {userVipData?.usuario}</span>
        </div>
        <div className="flex items-center gap-3">
           <Clock size={16} className="text-amber-500 animate-pulse" />
           <CountdownTimer 
             expiryDate={userVipData?.expiracao} 
             onExpire={() => {
               setError("Seu tempo expirou.");
               setIsLogged(false);
             }} 
           />
        </div>
      </div>

      <main className="flex-grow p-4 space-y-6 max-w-2xl mx-auto w-full pb-24">
        {posts.map(post => (
          <PostItem key={post.id} post={post} />
        ))}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-zinc-900 px-10 py-6 flex justify-around items-center">
        <button className="text-amber-500"><Newspaper size={24} /></button>
        <button className="text-zinc-700"><LayoutGrid size={24} /></button>
        <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-black">
           <Sparkles size={24} />
        </div>
        <button className="text-zinc-700"><ShieldCheck size={24} /></button>
        <button className="text-zinc-700"><Clock size={24} /></button>
      </nav>
    </div>
  );
}

```
