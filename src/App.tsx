import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pbluecpzwgfapbxfeaas.supabase.co',
  'sb_publishable_gHjL8uMiBCtNWr1l9_UcnA_4IBzFS_e'
);

const CATS = [
  {n:'Comida y Café',i:'🍕',c:'#D4537E',bg:'#FBEAF0',tipo:'planeado'},
  {n:'Súper',i:'🛒',c:'#1D9E75',bg:'#E1F5EE',tipo:'esencial'},
  {n:'Transporte',i:'🚇',c:'#534AB7',bg:'#EEEDFE',tipo:'esencial'},
  {n:'Uber',i:'🚗',c:'#444444',bg:'#f0f0f0',tipo:'planeado'},
  {n:'Salud',i:'💊',c:'#BA7517',bg:'#FAEEDA',tipo:'esencial'},
  {n:'Belleza',i:'💅',c:'#D4537E',bg:'#FBEAF0',tipo:'planeado'},
  {n:'Compras',i:'🛍️',c:'#993556',bg:'#FBEAF0',tipo:'no_planeado'},
  {n:'Regalos',i:'🎁',c:'#534AB7',bg:'#EEEDFE',tipo:'no_planeado'},
  {n:'Deporte',i:'🏃‍♀️',c:'#1D9E75',bg:'#E1F5EE',tipo:'planeado'},
  {n:'Celebraciones',i:'🥂',c:'#BA7517',bg:'#FAEEDA',tipo:'no_planeado'},
  {n:'Pago deuda',i:'💳',c:'#E24B4A',bg:'#FCEBEB',tipo:'planeado'},
  {n:'Suscripciones',i:'📱',c:'#F0997B',bg:'#FAECE7',tipo:'planeado'},
  {n:'Salidas',i:'✨',c:'#AFA9EC',bg:'#EEEDFE',tipo:'no_planeado'},
  {n:'Hogar',i:'🏠',c:'#5DCAA5',bg:'#E1F5EE',tipo:'esencial'},
  {n:'Ahorro',i:'🌱',c:'#1D9E75',bg:'#E1F5EE',tipo:'ahorro'},
  {n:'Otros',i:'💸',c:'#888780',bg:'#F1EFE8',tipo:'no_planeado'},
]

function fmt(n: number) {
  return '$' + Math.abs(Math.round(n)).toLocaleString('es-CL');
}

export default function App() {
  const [tab, setTab] = useState('inicio');
  const [moves, setMoves] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [selCat, setSelCat] = useState(0);
  const [tipoGasto, setTipoGasto] = useState('')
  const [mtype, setMtype] = useState('gasto');
  const [saved, setSaved] = useState(false);
  const [startDay, setStartDay] = useState(24);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    if (user) loadMoves();
  }, [user]);
  async function deleteMove(id: string) {
    if(!confirm('¿Eliminar este movimiento?')) return
    await supabase.from('transactions').delete().eq('id', id)
    loadMoves()
  }
  
  function editMove(m: any) {
    setAmount(String(Math.abs(m.amount)))
    setDesc(m.description)
    setMtype(m.amount > 0 ? 'ingreso' : 'gasto')
    const catIdx = CATS.findIndex(c => c.n === m.description)
    if(catIdx >= 0) setSelCat(catIdx)
    setTipoGasto(m.tipo_gasto || '')
    deleteMove(m.id)
    setTab('agregar')
  }
  async function loadMoves() {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .limit(50);
    if (data) setMoves(data);
  }

  async function saveMove() {
    if (!amount) return;
    const val = parseFloat(amount);
    await supabase.from('transactions').insert({
      user_id: user.id,
      amount: mtype === 'gasto' ? -val : val,
      type: mtype,
      description: desc || CATS[selCat].n,
      category_id: null,
      date: new Date().toISOString().split('T')[0],
      tipo_gasto: tipoGasto || CATS[selCat].tipo,
    });
    setAmount('');
    setDesc('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    loadMoves();
  }

  async function handleAuth() {
    setAuthError('');
    if (authMode === 'register') {
      const { error } = await supabase.auth.signUp({ email, password: pass });
      if (error) setAuthError(error.message);
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) setAuthError(error.message);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setMoves([]);
  }

  const income = moves
    .filter((m) => m.amount > 0)
    .reduce((s, m) => s + m.amount, 0);
  const spent = moves
    .filter((m) => m.amount < 0)
    .reduce((s, m) => s + Math.abs(m.amount), 0);
  const balance = income - spent;

  const s = {
    app: {
      maxWidth: '100%',
      width: '100%',
      margin: 0,
      fontFamily: 'system-ui',
      background: '#fff',
      minHeight: '100vh',
    } as any,
    hero: { background: '#FBEAF0', padding: '16px 20px 20px' } as any,
    heroTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    } as any,
    heroName: { fontSize: 13, fontWeight: 500, color: '#D4537E' } as any,
    heroSub: { fontSize: 11, color: '#D4537E', opacity: 0.65 } as any,
    ava: {
      width: 34,
      height: 34,
      borderRadius: '50%',
      background: '#F4C0D1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 13,
      fontWeight: 500,
      color: '#72243E',
      cursor: 'pointer',
    } as any,
    heroAmt: {
      fontSize: 30,
      fontWeight: 500,
      color: '#72243E',
      letterSpacing: -0.5,
      marginBottom: 12,
    } as any,
    pills: { display: 'flex', gap: 7 } as any,
    pill: {
      background: '#fff',
      borderRadius: 18,
      padding: '7px 12px',
      flex: 1,
      border: '0.5px solid #F4C0D1',
    } as any,
    pillL: {
      fontSize: 10,
      color: '#D4537E',
      marginBottom: 1,
      fontWeight: 500,
    } as any,
    pillV: { fontSize: 13, fontWeight: 500, color: '#72243E' } as any,
    nav: {
      display: 'flex',
      background: '#fff',
      borderBottom: '0.5px solid #eee',
      padding: '0 2px',
    } as any,
    nb: (on: boolean) => ({
      flex: 1,
      padding: '11px 2px',
      textAlign: 'center' as any,
      fontSize: 10,
      color: on ? '#D4537E' : '#888',
      cursor: 'pointer',
      borderBottom: on ? '2px solid #D4537E' : '2px solid transparent',
      fontWeight: 500,
    }),
    sc: { padding: '14px 14px 80px', background: '#fff', minHeight: '100vh' } as any,
    sl: {
      fontSize: 10,
      fontWeight: 500,
      color: '#888',
      letterSpacing: '.07em',
      textTransform: 'uppercase' as any,
      marginBottom: 8,
      marginTop: 16,
    } as any,
    card: {
      background: '#fff',
      border: '0.5px solid #eee',
      borderRadius: 14,
      padding: 13,
      marginBottom: 8,
    } as any,
    addWrap: {
      background: '#FBEAF0',
      borderRadius: 18,
      padding: 18,
      border: '0.5px solid #F4C0D1',
    } as any,
    amtBig: {
      fontSize: 34,
      fontWeight: 500,
      color: '#72243E',
      textAlign: 'center' as any,
      padding: '14px 0 6px',
      background: '#fff',
      borderRadius: 12,
      marginBottom: 12,
      border: '0.5px solid #F4C0D1',
      letterSpacing: -1,
    } as any,
    ttype: { display: 'flex', gap: 6, marginBottom: 12 } as any,
    tbtn: (on: boolean) => ({
      flex: 1,
      padding: 9,
      borderRadius: 10,
      border: '0.5px solid #F4C0D1',
      background: on ? '#D4537E' : '#fff',
      fontSize: 13,
      fontWeight: 500,
      color: on ? '#fff' : '#D4537E',
      cursor: 'pointer',
      textAlign: 'center' as any,
    }),
    fi: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: 10,
      border: '0.5px solid #F4C0D1',
      background: '#fff',
      fontSize: 14,
      color: '#333',
      fontFamily: 'system-ui',
      marginBottom: 10,
      boxSizing: 'border-box' as any,
    } as any,
    fin: {
      fontSize: 10,
      fontWeight: 500,
      color: '#D4537E',
      textTransform: 'uppercase' as any,
      letterSpacing: '.06em',
      marginBottom: 5,
    } as any,
    cpick: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 5,
      marginBottom: 12,
    } as any,
    cp: (sel: boolean) => ({
      padding: '7px 4px',
      borderRadius: 9,
      border: sel ? '0.5px solid #F4C0D1' : '0.5px solid #eee',
      background: sel ? '#FBEAF0' : '#fff',
      textAlign: 'center' as any,
      cursor: 'pointer',
    }),
    savebtn: {
      width: '100%',
      padding: 13,
      borderRadius: 12,
      background: '#D4537E',
      color: '#fff',
      border: 'none',
      fontSize: 14,
      fontWeight: 500,
      cursor: 'pointer',
      fontFamily: 'system-ui',
    } as any,
    txnRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      padding: '9px 0',
      borderBottom: '0.5px solid #f0f0f0',
    } as any,
    loginWrap: {
      maxWidth: 340,
      margin: '60px auto',
      padding: 24,
      background: '#FBEAF0',
      borderRadius: 20,
      border: '0.5px solid #F4C0D1',
    } as any,
  };

  if (!user)
    return (
      <div style={s.app}>
        <div
          style={{
            background: '#FBEAF0',
            padding: '40px 20px 20px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 6 }}>🌸</div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 500,
              color: '#72243E',
              marginBottom: 4,
            }}
          >
            Florette
          </div>
          <div style={{ fontSize: 13, color: '#D4537E' }}>
            Tu app de finanzas personales
          </div>
        </div>
        <div style={s.loginWrap}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#72243E',
              marginBottom: 16,
              textAlign: 'center',
            }}
          >
            {authMode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </div>
          <div style={s.fin}>correo</div>
          <input
            style={s.fi}
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div style={s.fin}>contraseña</div>
          <input
            style={s.fi}
            type="password"
            placeholder="••••••••"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
          {authError && (
            <div style={{ fontSize: 12, color: '#E24B4A', marginBottom: 10 }}>
              {authError}
            </div>
          )}
          <button style={s.savebtn} onClick={handleAuth}>
            {authMode === 'login' ? 'Entrar' : 'Registrarme'}
          </button>
          <div
            style={{
              textAlign: 'center',
              marginTop: 12,
              fontSize: 12,
              color: '#D4537E',
              cursor: 'pointer',
            }}
            onClick={() =>
              setAuthMode(authMode === 'login' ? 'register' : 'login')
            }
          >
            {authMode === 'login'
              ? '¿No tienes cuenta? Regístrate'
              : '¿Ya tienes cuenta? Inicia sesión'}
          </div>
        </div>
      </div>
    );

  return (
    <div style={s.app}>
      <div style={s.hero}>
        <div style={s.heroTop}>
          <div>
            <div style={s.heroName}>Hola, Feña ✨</div>
            <div style={s.heroSub}>Período financiero · día {startDay}</div>
          </div>
          <div style={s.ava} onClick={handleLogout} title="Cerrar sesión">
            F
          </div>
        </div>
        <div
          style={{
            fontSize: 11,
            color: '#D4537E',
            opacity: 0.7,
            marginBottom: 2,
          }}
        >
          balance del período
        </div>
        <div style={s.heroAmt}>{fmt(balance)}</div>
        <div style={s.pills}>
          <div style={s.pill}>
            <div style={s.pillL}>gastado</div>
            <div style={{ ...s.pillV, color: '#D4537E' }}>{fmt(spent)}</div>
          </div>
          <div style={s.pill}>
            <div style={s.pillL}>ingresos</div>
            <div style={{ ...s.pillV, color: '#1D9E75' }}>{fmt(income)}</div>
          </div>
          <div style={s.pill}>
            <div style={s.pillL}>movimientos</div>
            <div style={{ ...s.pillV, color: '#534AB7' }}>{moves.length}</div>
          </div>
        </div>
      </div>

      <div style={s.nav}>
        {['inicio', 'agregar', 'gastos', 'config'].map((t) => (
          <div key={t} style={s.nb(tab === t)} onClick={() => setTab(t)}>
            {t === 'inicio'
              ? 'Inicio'
              : t === 'agregar'
              ? 'Agregar'
              : t === 'gastos'
              ? 'Gastos'
              : 'Config'}
          </div>
        ))}
      </div>

      {tab === 'inicio' && (
  <div style={s.sc}>
    <div style={s.sl}>resumen del período</div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
      {[
        {l:'Total gastado',v:fmt(spent),c:'#D4537E'},
        {l:'Total ingresos',v:fmt(income),c:'#1D9E75'},
        {l:'Balance',v:fmt(balance),c:'#534AB7'},
        {l:'Movimientos',v:moves.length.toString(),c:'#BA7517'},
      ].map(k=>(
        <div key={k.l} style={{background:'#f9f9f9',borderRadius:12,padding:14}}>
          <div style={{fontSize:11,color:'#888',marginBottom:3}}>{k.l}</div>
          <div style={{fontSize:20,fontWeight:500,color:k.c}}>{k.v}</div>
        </div>
      ))}
    </div>

    <div style={s.sl}>proyección fin de mes</div>
    <div style={{background:'#FBEAF0',borderRadius:14,padding:14,marginBottom:16,border:'0.5px solid #F4C0D1'}}>
      {(() => {
        const today = new Date()
        const diaHoy = today.getDate()
        const diasEnMes = new Date(today.getFullYear(), today.getMonth()+1, 0).getDate()
        const diasTranscurridos = diaHoy >= startDay
          ? diaHoy - startDay + 1
          : diasEnMes - startDay + diaHoy + 1
        const diasTotales = diasEnMes
        const proyeccion = diasTranscurridos > 0
          ? Math.round((spent / diasTranscurridos) * diasTotales)
          : 0
        const pct = Math.min(100, Math.round((spent / Math.max(proyeccion,1)) * 100))
        const alerta = proyeccion > income * 0.9
        return (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <div>
                <div style={{fontSize:11,color:'#D4537E',marginBottom:1}}>Gasto actual</div>
                <div style={{fontSize:18,fontWeight:500,color:'#72243E'}}>{fmt(spent)}</div>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:11,color:'#D4537E',marginBottom:1}}>Día del período</div>
                <div style={{fontSize:18,fontWeight:500,color:'#72243E'}}>{diasTranscurridos}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:11,color:'#D4537E',marginBottom:1}}>Proyección</div>
                <div style={{fontSize:18,fontWeight:500,color:alerta?'#E24B4A':'#72243E'}}>{fmt(proyeccion)}</div>
              </div>
            </div>
            <div style={{height:8,borderRadius:4,background:'#F4C0D1',overflow:'hidden',marginBottom:6}}>
              <div style={{height:'100%',borderRadius:4,background:alerta?'#E24B4A':'#D4537E',width:`${pct}%`,transition:'width 0.8s'}}/>
            </div>
            <div style={{fontSize:11,color:alerta?'#E24B4A':'#888'}}>
              {alerta
                ? `⚠️ Al ritmo actual superarás tus ingresos — cuidado con los gastos`
                : `Vas bien — llevas ${pct}% del gasto proyectado`}
            </div>
          </div>
        )
      })()}
    </div>

    <div style={s.sl}>gasto por clasificación</div>
    <div style={{display:'flex',flexDirection:'column' as any,gap:8,marginBottom:16}}>
      {[
        {tipo:'esencial',label:'🏠 Esencial',c:'#534AB7',bg:'#EEEDFE'},
        {tipo:'planeado',label:'📋 Gusto planeado',c:'#1D9E75',bg:'#E1F5EE'},
        {tipo:'no_planeado',label:'⚡ Gusto no planeado',c:'#D4537E',bg:'#FBEAF0'},
        {tipo:'ahorro',label:'🌱 Ahorro',c:'#1D9E75',bg:'#E1F5EE'},
      ].map(t=>{
        const total=moves.filter(m=>m.tipo_gasto===t.tipo&&m.amount<0).reduce((s,m)=>s+Math.abs(m.amount),0)
        if(total===0) return null
        const pct=Math.round(total/Math.max(spent,1)*100)
        return (
          <div key={t.tipo} style={{background:t.bg,borderRadius:12,padding:'10px 14px',border:`0.5px solid ${t.c}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
              <div style={{fontSize:12,fontWeight:500,color:t.c}}>{t.label}</div>
              <div style={{fontSize:13,fontWeight:500,color:t.c}}>{fmt(total)} · {pct}%</div>
            </div>
            <div style={{height:5,borderRadius:3,background:'rgba(0,0,0,0.1)',overflow:'hidden'}}>
              <div style={{height:'100%',borderRadius:3,background:t.c,width:`${pct}%`}}/>
            </div>
          </div>
        )
      })}
    </div>

    <div style={s.sl}>gasto semanal</div>
    <div style={{background:'#f9f9f9',borderRadius:14,padding:14,marginBottom:16}}>
      {(() => {
        const semanas: Record<string,number> = {'Sem 1':0,'Sem 2':0,'Sem 3':0,'Sem 4':0}
        moves.filter(m=>m.amount<0).forEach(m=>{
          const d = new Date(m.date).getDate()
          if(d<=7) semanas['Sem 1']+=Math.abs(m.amount)
          else if(d<=14) semanas['Sem 2']+=Math.abs(m.amount)
          else if(d<=21) semanas['Sem 3']+=Math.abs(m.amount)
          else semanas['Sem 4']+=Math.abs(m.amount)
        })
        const max = Math.max(...Object.values(semanas),1)
        return (
          <div style={{display:'flex',alignItems:'flex-end',gap:8,height:80}}>
            {Object.entries(semanas).map(([sem,val])=>(
              <div key={sem} style={{flex:1,display:'flex',flexDirection:'column' as any,alignItems:'center',gap:4}}>
                <div style={{fontSize:10,color:'#D4537E',fontWeight:500}}>{val>0?fmt(val):''}</div>
                <div style={{
                  width:'100%',
                  height:`${Math.max(4,Math.round((val/max)*56))}px`,
                  background: val===max?'#D4537E':'#F4C0D1',
                  borderRadius:'6px 6px 0 0'
                }}/>
                <div style={{fontSize:10,color:'#888'}}>{sem}</div>
              </div>
            ))}
          </div>
        )
      })()}
    </div>

    <div style={s.sl}>últimos movimientos</div>
    <div style={s.card}>
      {moves.length===0&&<div style={{padding:20,textAlign:'center',fontSize:13,color:'#888'}}>¡Agrega tu primer gasto!</div>}
      {moves.slice(0,8).map((m,i)=>(
        <div key={i} style={{...s.txnRow,borderBottom:i<Math.min(moves.length,8)-1?'0.5px solid #f0f0f0':'none'}}>
          <div style={{width:36,height:36,borderRadius:'50%',background:'#FBEAF0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>
            {CATS.find(c=>c.n===m.description)?.i??'💳'}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:500,color:'#333'}}>{m.description}</div>
            <div style={{fontSize:11,color:'#888',marginTop:1}}>{m.date}</div>
          </div>
          <div style={{fontSize:13,fontWeight:500,color:m.amount>0?'#1D9E75':'#D4537E'}}>
            {m.amount>0?'+':'−'}{fmt(m.amount)}
          </div>
        </div>
      ))}
    </div>
  </div>
)}

      {tab === 'agregar' && (
        <div style={s.sc}>
          <div style={s.addWrap}>
            <div style={s.amtBig}>
              ${parseInt(amount || '0').toLocaleString('es-CL')}
            </div>
            <div style={s.ttype}>
              <div
                style={s.tbtn(mtype === 'gasto')}
                onClick={() => setMtype('gasto')}
              >
                Gasto
              </div>
              <div
                style={s.tbtn(mtype === 'ingreso')}
                onClick={() => setMtype('ingreso')}
              >
                Ingreso
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {[1000, 5000, 10000, 50000].map((v) => (
                <div
                  key={v}
                  onClick={() => setAmount(v.toString())}
                  style={{
                    flex: 1,
                    background: '#fff',
                    border: '0.5px solid #F4C0D1',
                    borderRadius: 10,
                    padding: '8px 4px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontSize: 12,
                    color: '#D4537E',
                    fontWeight: 500,
                  }}
                >
                  ${(v / 1000).toFixed(0)}K
                </div>
              ))}
            </div>
            <div style={s.fin}>monto exacto</div>
            <input
              style={s.fi}
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div style={s.fin}>descripción</div>
            <input
              style={s.fi}
              type="text"
              placeholder="Ej: Uber, Jumbo..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            <div style={s.fin}>categoría</div>
            <div style={s.cpick}>
              {CATS.map((c, i) => (
                <div
                  key={i}
                  style={s.cp(selCat === i)}
                  onClick={() => setSelCat(i)}
                >
                  <div style={{ fontSize: 18 }}>{c.i}</div>
                  <div style={{ fontSize: 10, color: '#888' }}>{c.n}</div>
                </div>
              ))}
            </div>
            {mtype === 'gasto' && (() => {
  const tipoAuto = CATS[selCat].tipo
  const esEditable = tipoAuto === 'planeado' || tipoAuto === 'no_planeado'
  const tipoFinal = tipoGasto || tipoAuto
  const LABELS: Record<string,string> = {
    esencial: '🏠 Esencial',
    planeado: '📋 Gusto planeado',
    no_planeado: '⚡ Gusto no planeado',
    ahorro: '🌱 Ahorro',
  }
  const COLORS: Record<string,string> = {
    esencial: '#534AB7',
    planeado: '#1D9E75',
    no_planeado: '#D4537E',
    ahorro: '#1D9E75',
  }
  const BCOLORS: Record<string,string> = {
    esencial: '#EEEDFE',
    planeado: '#E1F5EE',
    no_planeado: '#FBEAF0',
    ahorro: '#E1F5EE',
  }
  return (
    <div style={{marginBottom:12}}>
      <div style={s.fin}>clasificación</div>
      <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap' as any}}>
        <div style={{
          padding:'7px 14px',borderRadius:20,
          background:BCOLORS[tipoFinal],
          border:`0.5px solid ${COLORS[tipoFinal]}`,
          fontSize:13,fontWeight:500,
          color:COLORS[tipoFinal]
        }}>
          {LABELS[tipoFinal]}
        </div>
        {esEditable && (
          <div
            onClick={() => setTipoGasto(tipoFinal === 'planeado' ? 'no_planeado' : 'planeado')}
            style={{fontSize:12,color:'#888',cursor:'pointer',textDecoration:'underline'}}>
            cambiar a {tipoFinal === 'planeado' ? 'no planeado' : 'planeado'}
          </div>
        )}
      </div>
    </div>
  )
})()}
            <button style={s.savebtn} onClick={saveMove}>
              Guardar movimiento
            </button>
            {saved && (
              <div
                style={{
                  textAlign: 'center',
                  marginTop: 10,
                  fontSize: 12,
                  color: '#1D9E75',
                }}
              >
                Guardado correctamente ✓
              </div>
            )}
          </div>
        </div>
      )}

{tab === 'gastos' && (
  <div style={s.sc}>
    <div style={s.sl}>todos los movimientos</div>
    <div style={s.card}>
      {moves.length===0&&<div style={{padding:20,textAlign:'center',fontSize:13,color:'#888'}}>Sin movimientos aún.</div>}
      {moves.map((m,i)=>(
        <div key={i} style={{...s.txnRow,borderBottom:i<moves.length-1?'0.5px solid #f0f0f0':'none'}}>
          <div style={{width:36,height:36,borderRadius:'50%',background:'#FBEAF0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>
            {CATS.find(c=>c.n===m.description)?.i??'💳'}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:500,color:'#333'}}>{m.description}</div>
            <div style={{fontSize:11,color:'#888',marginTop:1}}>{m.date} · {m.tipo_gasto??'sin clasificar'}</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{fontSize:13,fontWeight:500,color:m.amount>0?'#1D9E75':'#D4537E'}}>
              {m.amount>0?'+':'−'}{fmt(m.amount)}
            </div>
            <div style={{display:'flex',flexDirection:'column' as any,gap:3}}>
              <div
                onClick={()=>editMove(m)}
                style={{fontSize:10,color:'#534AB7',cursor:'pointer',background:'#EEEDFE',padding:'2px 7px',borderRadius:8,fontWeight:500}}>
                editar
              </div>
              <div
                onClick={()=>deleteMove(m.id)}
                style={{fontSize:10,color:'#E24B4A',cursor:'pointer',background:'#FCEBEB',padding:'2px 7px',borderRadius:8,fontWeight:500}}>
                borrar
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

      {tab === 'config' && (
        <div style={s.sc}>
          <div style={s.sl}>inicio de mes financiero</div>
          <div style={s.card}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: '#333',
                marginBottom: 4,
              }}
            >
              ¿Qué día te depositan?
            </div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 14 }}>
              Tu período va de este día al mismo del mes siguiente.
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7,1fr)',
                gap: 5,
              }}
            >
              {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                <div
                  key={d}
                  onClick={() => setStartDay(d)}
                  style={{
                    padding: '7px 2px',
                    borderRadius: 8,
                    border: '0.5px solid #eee',
                    background: startDay === d ? '#D4537E' : '#fff',
                    textAlign: 'center',
                    fontSize: 12,
                    cursor: 'pointer',
                    color: startDay === d ? '#fff' : '#888',
                    fontWeight: startDay === d ? 500 : 400,
                  }}
                >
                  {d}
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 12,
                color: '#D4537E',
                textAlign: 'center',
              }}
            >
              Período activo: día {startDay} de cada mes
            </div>
          </div>
          <div style={s.sl}>cuenta</div>
          <div style={s.card}>
            <div style={{ fontSize: 13, color: '#333', marginBottom: 4 }}>
              {user?.email}
            </div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
              Sesión activa · datos sincronizados con Supabase
            </div>
            <button
              onClick={handleLogout}
              style={{
                ...s.savebtn,
                background: '#f5f5f5',
                color: '#888',
                border: '0.5px solid #eee',
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
