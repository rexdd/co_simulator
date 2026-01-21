
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  GameState, ResourceType, LogEntry, GameCard, 
  GameEvent, ResourceDelta 
} from './types';
import { 
  CARDS, NIGHT_ACTIONS, TALENTS, EVENTS, INITIAL_RENT 
} from './constants';
import ResourceCard from './components/ResourceCard';
import ActionCard from './components/ActionCard';

// Helper: Icons as components
const IconMoney = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const IconHealth = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>;
const IconSanity = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>;
const IconKpi = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>;
const IconEnergy = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    day: 1,
    money: 1000,
    health: 80,
    sanity: 75,
    kpi: 20,
    energy: 3,
    stress: 20,
    reputation: 50,
    talentPath: null,
    logs: [{ id: 'init', text: '欢迎来到都市牛马模拟器 2.0。在这座城市，存活下去就是唯一的 KPI。', tone: 'system', timestamp: Date.now() }],
    isDefeated: false,
    defeatReason: '',
    currentHand: [],
    nightActions: []
  });

  const [phase, setPhase] = useState<'morning' | 'work' | 'night' | 'settlement'>('morning');
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((text: string, tone: LogEntry['tone'] = 'neutral') => {
    setGameState(prev => ({
      ...prev,
      logs: [{ id: Math.random().toString(36), text, tone, timestamp: Date.now() }, ...prev.logs].slice(0, 50)
    }));
  }, []);

  const checkEndConditions = useCallback((state: GameState) => {
    if (state.money <= 0) return { dead: true, reason: "存款耗尽，你无力支付任何房租，在一个寒冷的夜晚被房东赶了出去。" };
    if (state.health <= 0) return { dead: true, reason: "长期的高压和加班摧毁了你的身体。你在办公位上永远地睡着了。" };
    if (state.sanity <= 0) return { dead: true, reason: "你无法再区分幻觉与现实。你开始在会议上对着饮水机狂笑。" };
    if (state.kpi <= 0) return { dead: true, reason: "连续三次绩效垫底。HR 递给了你一张离职通知单。" };
    return { dead: false, reason: "" };
  }, []);

  const updateResources = useCallback((delta: ResourceDelta) => {
    setGameState(prev => {
      const newState = { ...prev };
      const clamp = (val: number, min = 0, max = 120) => Math.max(min, Math.min(max, val));

      Object.entries(delta).forEach(([key, val]) => {
        const actualVal = typeof val === 'function' ? val(prev) : val;
        if (actualVal === undefined) return;
        
        const k = key as keyof GameState;
        if (typeof newState[k] === 'number') {
            const nextVal = (newState[k] as number) + actualVal;
            if (k === 'money') newState[k] = Math.max(-1000, nextVal) as any;
            else if (['health', 'sanity', 'kpi', 'stress', 'reputation'].includes(k)) {
                newState[k] = clamp(nextVal) as any;
            } else if (k === 'energy') {
                newState[k] = clamp(nextVal, 0, 8) as any;
            }
        }
      });

      const { dead, reason } = checkEndConditions(newState);
      if (dead) {
        newState.isDefeated = true;
        newState.defeatReason = reason;
      }

      return newState;
    });
  }, [checkEndConditions]);

  const drawCards = useCallback(() => {
    const shuffled = [...CARDS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, []);

  const startDay = () => {
    if (gameState.isDefeated) return;
    
    setPhase('morning');
    const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    addLog(`【第 ${gameState.day} 天】早上好。今日事件：${event.title}`, 'system');
    addLog(event.desc, event.tone);
    
    // Apply event effects in a slight delay for better feel
    setTimeout(() => {
        setGameState(prev => {
            const next = { ...prev };
            event.effect(next);
            next.energy = 3; // Reset daily energy
            next.currentHand = drawCards();
            next.nightActions = [...NIGHT_ACTIONS].sort(() => 0.5 - Math.random()).slice(0, 3);
            return next;
        });
        setPhase('work');
    }, 1000);
  };

  const playCard = (card: GameCard) => {
    if (phase !== 'work' && phase !== 'night') return;
    
    // Check cost
    const canAfford = Object.entries(card.cost).every(([res, val]) => {
      const current = gameState[res as keyof GameState] as number;
      return current >= val;
    });

    if (!canAfford) {
      addLog("资源不足，无法采取该行动。", "neg");
      return;
    }

    // Apply cost
    const costDelta: ResourceDelta = {};
    Object.entries(card.cost).forEach(([res, val]) => {
      costDelta[res] = -val;
    });
    
    addLog(`执行：${card.name}`, 'neutral');
    updateResources({ ...costDelta, ...card.gain });

    // If it was a work phase card, remove from hand
    if (phase === 'work') {
      setGameState(prev => ({
        ...prev,
        currentHand: prev.currentHand.filter(c => c.id !== card.id)
      }));
    } else if (phase === 'night') {
        setGameState(prev => ({
            ...prev,
            nightActions: prev.nightActions.filter(c => c.id !== card.id)
        }));
    }
  };

  const endWork = () => {
    setPhase('night');
    addLog("下班了。夜晚是属于自己的，虽然还是很累。", "system");
  };

  const goToSleep = () => {
    setPhase('settlement');
    addLog("这一天结束了，在梦里你也许不是个牛马。", "system");
    
    setTimeout(() => {
        setGameState(prev => {
            const newState = {
                ...prev,
                day: prev.day + 1,
                money: prev.money - INITIAL_RENT,
                stress: prev.stress + 2,
            };
            const { dead, reason } = checkEndConditions(newState);
            if (dead) {
                newState.isDefeated = true;
                newState.defeatReason = reason;
            }
            return newState;
        });
        addLog(`支付每日开销/房租：¥${INITIAL_RENT}`, 'neg');
        setPhase('morning');
    }, 1500);
  };

  const resetGame = () => {
      window.location.reload();
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900/80 to-slate-800/50 p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">都市牛马模拟器 2.0</h1>
          <p className="text-slate-400 text-sm mt-1">"We are not living, we are just functioning."</p>
        </div>
        <div className="flex gap-2">
          {gameState.day === 1 && phase === 'morning' ? (
            <button 
                onClick={startDay}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
            >
                开始第一天
            </button>
          ) : (
            <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current Progress</span>
                <span className="text-2xl font-black text-white font-mono-jb">DAY {gameState.day}</span>
            </div>
          )}
        </div>
      </header>

      {/* Resource Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <ResourceCard 
            label="存款 (Money)" 
            value={gameState.money} 
            max={5000} 
            type={ResourceType.MONEY} 
            icon={<IconMoney/>} 
            colorClass="text-emerald-400"
            subtitle="归零即破产流浪"
        />
        <ResourceCard 
            label="健康 (Health)" 
            value={gameState.health} 
            type={ResourceType.HEALTH} 
            icon={<IconHealth/>} 
            colorClass="text-rose-400"
            subtitle="归零即过劳猝死"
        />
        <ResourceCard 
            label="精神 (Sanity)" 
            value={gameState.sanity} 
            type={ResourceType.SANITY} 
            icon={<IconSanity/>} 
            colorClass="text-violet-400"
            subtitle="归零即精神崩溃"
        />
        <ResourceCard 
            label="绩效 (KPI)" 
            value={gameState.kpi} 
            type={ResourceType.KPI} 
            icon={<IconKpi/>} 
            colorClass="text-amber-400"
            subtitle="归零即直接辞退"
        />
        <ResourceCard 
            label="精力 (Energy)" 
            value={gameState.energy} 
            max={8}
            type={ResourceType.ENERGY} 
            icon={<IconEnergy/>} 
            colorClass="text-cyan-400"
            subtitle="今日可支配精力"
        />
      </div>

      {/* Main Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
        
        {/* Logs and Events */}
        <div className="lg:col-span-1 flex flex-col gap-4 order-2 lg:order-1">
          <div className="glass rounded-3xl p-6 flex flex-col h-[400px] lg:h-full overflow-hidden border-white/5 shadow-inner">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                都市生存日志
            </h2>
            <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {gameState.logs.map((log) => (
                <div key={log.id} className={`text-sm leading-relaxed p-3 rounded-xl border ${
                    log.tone === 'pos' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
                    log.tone === 'neg' ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' :
                    log.tone === 'system' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300 font-bold' :
                    'bg-slate-800/30 border-white/5 text-slate-300'
                }`}>
                  <span className="opacity-40 text-[10px] block mb-1 font-mono-jb">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  {log.text}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>

        {/* Action Center */}
        <div className="lg:col-span-2 flex flex-col gap-6 order-1 lg:order-2">
          
          {/* Work Phase Cards */}
          <div className={`glass p-6 rounded-3xl border-white/10 shadow-xl transition-all duration-500 ${phase !== 'work' ? 'opacity-30 pointer-events-none blur-[1px]' : ''}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                🏢 职场生存
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono-jb">WORK_PHASE</span>
              </h2>
              <button 
                onClick={endWork}
                disabled={phase !== 'work'}
                className="text-xs font-bold px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 transition-colors"
              >
                结束工作 &gt;
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {gameState.currentHand.length > 0 ? (
                    gameState.currentHand.map(card => (
                        <ActionCard 
                            key={card.id} 
                            card={card} 
                            onPlay={playCard} 
                            disabled={gameState.energy < (card.cost.energy || 0)}
                        />
                    ))
                ) : (
                    <div className="col-span-3 py-8 text-center text-slate-500 italic text-sm">
                        今日工作已清空。早点下班吧？
                    </div>
                )}
            </div>
          </div>

          {/* Night Market Cards */}
          <div className={`glass p-6 rounded-3xl border-white/10 shadow-xl transition-all duration-500 ${phase !== 'night' ? 'opacity-30 pointer-events-none blur-[1px]' : 'border-violet-500/30 shadow-violet-500/10'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                🌙 深夜回血
                <span className="text-xs px-2 py-0.5 rounded bg-violet-500/20 text-violet-400 font-mono-jb">NIGHT_PHASE</span>
              </h2>
              <button 
                onClick={goToSleep}
                disabled={phase !== 'night'}
                className="text-xs font-bold px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 transition-colors"
              >
                休息睡觉 &gt;
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {gameState.nightActions.map(card => (
                    <ActionCard 
                        key={card.id} 
                        card={card} 
                        onPlay={playCard} 
                        disabled={gameState.money < (card.cost.money || 0) || gameState.energy < (card.cost.energy || 0)}
                    />
                ))}
            </div>
          </div>
          
          {/* Bottom Bar for Morning phase */}
          {phase === 'morning' && gameState.day > 1 && !gameState.isDefeated && (
              <div className="flex-grow flex items-center justify-center">
                  <button 
                    onClick={startDay}
                    className="px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black rounded-2xl shadow-2xl shadow-cyan-500/30 transition-all active:scale-95 animate-gentle-pulse"
                  >
                    开启新的一天
                  </button>
              </div>
          )}
        </div>
      </div>

      {/* Defeat Modal */}
      {gameState.isDefeated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="glass max-w-lg w-full p-8 rounded-[40px] border-red-500/30 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl border border-red-500/30">
                ☠️
            </div>
            <h2 className="text-4xl font-black text-white mb-2 italic uppercase tracking-tighter">GAME OVER</h2>
            <p className="text-slate-400 text-sm mb-6 uppercase tracking-widest font-bold">都市生存挑战失败</p>
            
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 mb-8 text-left italic">
                <p className="text-slate-300 leading-relaxed">“{gameState.defeatReason}”</p>
            </div>

            <div className="flex flex-col gap-3">
                <button 
                    onClick={resetGame}
                    className="w-full py-4 bg-white text-slate-950 font-black rounded-2xl hover:bg-slate-200 transition-colors"
                >
                    重启周目
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Meta */}
      <footer className="mt-auto py-8 text-center">
        <div className="flex justify-center gap-4 mb-4 opacity-50">
            {TALENTS.map(t => (
                <div key={t.id} className="text-[10px] font-bold px-3 py-1 rounded-full border border-white/20 bg-white/5 text-slate-400">
                    {t.name}: {t.desc}
                </div>
            ))}
        </div>
        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Urban Wage Slave Simulator v2.0 - Built for the Burnout Generation</p>
      </footer>
    </div>
  );
};

export default App;
