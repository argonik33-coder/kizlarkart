import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, User, Play, RotateCcw, ShieldCheck, Zap, AlertCircle, ChevronRight, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import { truthQuestions, dareQuestions } from './data/questions';

type GameState = 'SETUP' | 'PLAYING' | 'QUESTION';

interface Player {
  id: number;
  name: string;
  truthCount: number;
  totalTurns: number;
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('SETUP');
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<{ text: string; type: 'truth' | 'dare' } | null>(null);
  const [usedTruths, setUsedTruths] = useState<number[]>([]);
  const [usedDares, setUsedDares] = useState<number[]>([]);

  // Function to initialize players
  const initPlayers = (count: number) => {
    const newPlayers = Array.from({ length: count }, (_, i) => ({
      id: i,
      name: `Oyuncu ${i + 1}`,
      truthCount: 0,
      totalTurns: 0,
    }));
    setPlayers(newPlayers);
  };

  // Initialize on first load
  useEffect(() => {
    initPlayers(2);
  }, []);

  const handleNameChange = (id: number, name: string) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  };

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    initPlayers(count);
  };

  const startGame = () => {
    setGameState('PLAYING');
  };

  const selectOption = (type: 'truth' | 'dare') => {
    const currentPlayer = players[currentPlayerIndex];
    
    // Check rule: 2 truths in a row means 3rd must be dare
    if (type === 'truth' && currentPlayer.truthCount >= 2) {
      return; // Button is disabled anyway, but for safety
    }

    let questionText = "";
    let questionIndex = -1;

    if (type === 'truth') {
      const available = truthQuestions.map((_, i) => i).filter(i => !usedTruths.includes(i));
      if (available.length === 0) {
        setUsedTruths([]);
        questionIndex = Math.floor(Math.random() * truthQuestions.length);
      } else {
        questionIndex = available[Math.floor(Math.random() * available.length)];
      }
      questionText = truthQuestions[questionIndex];
      setUsedTruths(prev => [...prev, questionIndex]);
    } else {
      const available = dareQuestions.map((_, i) => i).filter(i => !usedDares.includes(i));
      if (available.length === 0) {
        setUsedDares([]);
        questionIndex = Math.floor(Math.random() * dareQuestions.length);
      } else {
        questionIndex = available[Math.floor(Math.random() * available.length)];
      }
      questionText = dareQuestions[questionIndex];
      setUsedDares(prev => [...prev, questionIndex]);
    }

    setCurrentQuestion({ text: questionText, type });
    
    // Update player stats
    const updatedPlayers = [...players];
    if (type === 'truth') {
      updatedPlayers[currentPlayerIndex].truthCount += 1;
    } else {
      updatedPlayers[currentPlayerIndex].truthCount = 0;
    }
    updatedPlayers[currentPlayerIndex].totalTurns += 1;
    setPlayers(updatedPlayers);
    
    setGameState('QUESTION');
  };

  const nextTurn = () => {
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    setGameState('PLAYING');
    setCurrentQuestion(null);
  };

  const resetGame = () => {
    setGameState('SETUP');
    setUsedTruths([]);
    setUsedDares([]);
    setCurrentPlayerIndex(0);
    initPlayers(playerCount);
  };

  const currentPlayer = players[currentPlayerIndex];

  return (
    <div className="min-h-screen bg-pink-50 text-slate-800 font-sans selection:bg-pink-200">
      <div className="max-w-md mx-auto min-h-screen flex flex-col p-6">
        
        {/* Header */}
        <header className="py-6 text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 rounded-full text-pink-600 font-bold mb-2"
          >
            <Heart size={18} fill="currentColor" />
            <span>Kızlar Gecesi</span>
          </motion.div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 italic">
            Doğruluk mu Cesaret mi?
          </h1>
          <p className="text-sm text-pink-400 mt-1 uppercase tracking-widest font-semibold">Üniversite Edisyonu</p>
        </header>

        <main className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {gameState === 'SETUP' && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-3xl p-6 shadow-xl shadow-pink-100 border border-pink-100">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-700">
                    <Users className="text-pink-500" /> Kaç Kişisiniz?
                  </h2>
                  <div className="grid grid-cols-3 gap-3 mb-8">
                    {[2, 3, 4].map((num) => (
                      <button
                        key={num}
                        onClick={() => handlePlayerCountChange(num)}
                        className={`py-3 rounded-2xl font-bold transition-all ${
                          playerCount === num 
                          ? 'bg-pink-500 text-white shadow-lg shadow-pink-200 ring-4 ring-pink-100' 
                          : 'bg-pink-50 text-pink-400 hover:bg-pink-100 hover:text-pink-500'
                        }`}
                      >
                        {num} Kişi
                      </button>
                    ))}
                  </div>

                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-700">
                    <User className="text-pink-500" /> İsimleriniz?
                  </h2>
                  <div className="space-y-3">
                    {players.map((player) => (
                      <div key={player.id} className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300 group-focus-within:text-pink-500 transition-colors">
                          <User size={18} />
                        </div>
                        <input
                          type="text"
                          value={player.name}
                          onChange={(e) => handleNameChange(player.id, e.target.value)}
                          className="w-full bg-pink-50 border-2 border-transparent focus:border-pink-300 focus:bg-white rounded-2xl py-3 pl-12 pr-4 outline-none transition-all font-medium placeholder:text-pink-200"
                          placeholder={`${player.id + 1}. Oyuncu İsmi`}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={startGame}
                    className="w-full mt-10 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-pink-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                  >
                    Oyunu Başlat 
                    <Play size={20} fill="currentColor" className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {gameState === 'PLAYING' && currentPlayer && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="text-center space-y-8"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-pink-200 blur-3xl opacity-30 rounded-full animate-pulse"></div>
                  <div className="relative bg-white rounded-full w-44 h-44 mx-auto flex items-center justify-center border-4 border-pink-50 shadow-2xl ring-8 ring-pink-100/50">
                    <div className="text-center">
                      <p className="text-pink-400 text-xs font-bold uppercase tracking-widest">Sıradaki</p>
                      <h3 className="text-2xl font-black text-slate-800 mt-1">{currentPlayer.name}</h3>
                      <div className="flex justify-center gap-1.5 mt-2">
                        {[...Array(3)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-3 h-1.5 rounded-full transition-all duration-500 ${
                              i < currentPlayer.truthCount ? 'bg-pink-500 w-6' : 'bg-pink-100'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <button
                    disabled={currentPlayer.truthCount >= 2}
                    onClick={() => selectOption('truth')}
                    className={`group relative overflow-hidden p-8 rounded-3xl border-2 transition-all text-left flex items-center justify-between ${
                      currentPlayer.truthCount >= 2 
                      ? 'opacity-50 grayscale cursor-not-allowed bg-slate-50 border-slate-200' 
                      : 'bg-white border-pink-100 hover:border-pink-300 hover:shadow-xl hover:shadow-pink-100'
                    }`}
                  >
                    <div>
                      <h4 className={`text-xl font-bold ${currentPlayer.truthCount >= 2 ? 'text-slate-400' : 'text-pink-600'}`}>Doğruluk</h4>
                      <p className="text-slate-400 text-sm mt-1">Sana dürüst bir soru soralım.</p>
                    </div>
                    <ShieldCheck size={36} className={currentPlayer.truthCount >= 2 ? 'text-slate-300' : 'text-pink-400 group-hover:scale-110 transition-transform'} />
                    {currentPlayer.truthCount >= 2 && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-100 text-red-500 text-[10px] px-2 py-1 rounded-full font-bold">
                        <AlertCircle size={10} /> KİLİTLİ
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => selectOption('dare')}
                    className="group p-8 rounded-3xl bg-white border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-100 transition-all text-left flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xl font-bold text-purple-600">Cesaret</h4>
                      <p className="text-slate-400 text-sm mt-1">Biraz eğlenmeye hazır mısın?</p>
                    </div>
                    <Zap size={36} className="text-purple-400 group-hover:scale-110 transition-transform" />
                  </button>
                </div>

                {currentPlayer.truthCount >= 2 && (
                  <motion.div 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3 text-amber-700"
                  >
                    <AlertCircle className="shrink-0 mt-0.5" size={18} />
                    <p className="text-xs font-semibold text-left">
                      Hey {currentPlayer.name}! Üst üste 2 kez <span className="text-pink-600">Doğruluk</span> seçtin. Oyunun kuralı gereği şimdi <span className="text-purple-600">Cesaret</span> demek zorundasın! 🔥
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {gameState === 'QUESTION' && currentQuestion && (
              <motion.div
                key="question"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="space-y-6"
              >
                <div className={`rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden min-h-[300px] flex flex-col justify-center ${
                  currentQuestion.type === 'truth' 
                  ? 'bg-gradient-to-br from-pink-500 to-rose-400 text-white shadow-pink-200' 
                  : 'bg-gradient-to-br from-purple-600 to-indigo-500 text-white shadow-purple-200'
                }`}>
                  <div className="absolute -top-10 -right-10 opacity-10">
                    {currentQuestion.type === 'truth' ? <ShieldCheck size={200} /> : <Zap size={200} />}
                  </div>

                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-[0.2em] mb-8">
                      {currentQuestion.type === 'truth' ? (
                        <> <ShieldCheck size={14} /> Doğruluk </>
                      ) : (
                        <> <Zap size={14} /> Cesaret </>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold leading-relaxed mb-4">
                      {currentQuestion.text}
                    </h2>
                    <div className="h-1 w-20 bg-white/30 rounded-full"></div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-pink-100 text-center shadow-lg">
                  <p className="text-slate-400 text-sm mb-4 font-medium italic">Görevi tamamladıysan butona bas!</p>
                  <button
                    onClick={() => {
                      confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#ec4899', '#8b5cf6', '#ffffff', '#fdf2f8']
                      });
                      nextTurn();
                    }}
                    className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-95 transition-all shadow-lg"
                  >
                    Görevi Tamamladım <ChevronRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="py-6 flex justify-between items-center text-pink-300">
          <button 
            onClick={resetGame}
            className="flex items-center gap-1.5 text-[10px] font-black hover:text-pink-500 transition-colors uppercase tracking-[0.2em]"
          >
            <RotateCcw size={14} /> Oyunu Sıfırla
          </button>
          <div className="flex gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-pink-200"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-pink-300"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-pink-400"></div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
