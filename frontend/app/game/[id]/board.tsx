"use client";

import { useEffect, useState } from 'react';
import { socket } from '../../socket';
import { BoardVisualizer } from './BoardVisualizer';

interface BoardProps {
    roomId: string;
    initialState: any;
}

interface PlayerState {
    id: string;
    name: string;
    cash: number;
    cashflow: number;
    income: number;
    expenses: number;
    loanDebt: number;
    position: number;
    isFastTrack: boolean;
    childrenCount: number;
    childCost: number;
    salary: number;
    passiveIncome: number;
}

export default function GameBoard({ roomId, initialState }: BoardProps) {
    const [state, setState] = useState(initialState);
    const [showBank, setShowBank] = useState(false);

    useEffect(() => {
        socket.on('dice_rolled', (data) => {
            setState(data.state);
        });

        socket.on('state_updated', (data) => {
            setState(data.state);
        });

        socket.on('turn_ended', (data) => {
            setState(data.state);
        });

        socket.on('game_started', (data) => {
            setState(data.state);
        });

        return () => {
            socket.off('dice_rolled');
            socket.off('turn_ended');
            socket.off('state_updated');
            socket.off('game_started');
        };
    }, []);

    const handleLoan = (amount: number) => {
        socket.emit('take_loan', { roomId, amount });
    }

    const handleRepay = (amount: number) => {
        socket.emit('repay_loan', { roomId, amount });
    }

    const handleRoll = () => {
        socket.emit('roll_dice', { roomId });
    };

    const handleEndTurn = () => {
        socket.emit('end_turn', { roomId });
    };

    const currentPlayer = state.players[state.currentPlayerIndex];
    const isMyTurn = currentPlayer.id === socket.id;
    const me = state.players.find((p: any) => p.id === socket.id) || {};

    // Board Configuration
    // Rat Race: 24 Squares (Inner Loop)
    const RAT_RACE_LAYOUT = [
        // Bottom Row (Right to Left)
        { x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }, { x: 2, y: 5 }, { x: 1, y: 5 }, { x: 0, y: 5 },
        // Left Column (Bottom to Top)
        { x: 0, y: 4 }, { x: 0, y: 3 }, { x: 0, y: 2 }, { x: 0, y: 1 }, { x: 0, y: 0 },
        // Top Row (Left to Right)
        { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 },
        // Right Column (Top to Bottom)
        { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 6, y: 4 }, { x: 6, y: 5 }
    ];
    // This is just a rough shape, need to map exactly to 24 indices for logic. 
    // Actually, let's use a function to generate coords on a relative 100x100 grid or similar.

    // Animation State
    const [animatingPos, setAnimatingPos] = useState<Record<string, number>>({});

    useEffect(() => {
        if (!state.players) return;
        // Sync animatingPos with real pos if not animating
        const newPosMap: Record<string, number> = {};
        state.players.forEach((p: any) => {
            // If we don't have a record, set it. If we do, keep it (animation hook handles updates)
            if (animatingPos[p.id] === undefined) {
                newPosMap[p.id] = p.position;
            } else {
                newPosMap[p.id] = animatingPos[p.id];
            }
        });
        setAnimatingPos(prev => ({ ...prev, ...newPosMap }));
    }, [state.players]);

    // Handle Dice Roll Animation
    useEffect(() => {
        // This effect will trigger whenever state.players changes.
        // We need to compare the current player's position in `state` with their `animatingPos`.
        state.players.forEach((p: PlayerState) => {
            const currentDisplayPos = animatingPos[p.id] ?? p.position;
            if (currentDisplayPos !== p.position) {
                // Animate
                let nextPos = currentDisplayPos;
                const interval = setInterval(() => {
                    if (nextPos === p.position) {
                        clearInterval(interval);
                        return;
                    }
                    // Handle Wrap (24 squares for Rat Race)
                    const max = p.isFastTrack ? 48 : 24;
                    nextPos = (nextPos + 1) % max;

                    setAnimatingPos(prev => ({
                        ...prev,
                        [p.id]: nextPos
                    }));
                }, 300); // Speed of movement
                return () => clearInterval(interval); // Cleanup on unmount or re-render
            }
        });
    }, [state.players, animatingPos]); // Depend on animatingPos to re-evaluate if animation is needed

    const getBoardCoordinates = (index: number, isFastTrack: boolean) => {
        // Custom coordinates to match the image style (Square loops)
        if (!isFastTrack) {
            // Inner Loop (24 squares)
            // Let's define a 7x7 grid logic (indices 0..23)
            // 0..6 (Bottom), 7..11 (Left), 12..17 (Top), 18..23 (Right)
            const width = 600;
            const height = 600;
            const padding = 100;
            const innerSize = 400; // 400x400 box

            // Simple Box Path
            // 0-6: Bottom Edge (Right to Left)
            if (index <= 6) return { x: 500 - (index * 66), y: 500 };
            // 7-11: Left Edge (Bottom to Top)
            if (index <= 12) return { x: 100, y: 500 - ((index - 6) * 66) };
            // ... This is tedious. Let's use CSS grid or pre-calc.
        }
        return { x: 0, y: 0 };
    }

    // New 3-Column Render Logic
    return (
        <div className="h-screen bg-[#0B0E14] flex text-white overflow-hidden font-sans selection:bg-blue-500/30">
            {/* LEFT COLUMN: Bank & Economy */}
            <div className="w-[350px] flex flex-col border-r border-slate-800 bg-slate-900/50 backdrop-blur-md z-20">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-xl font-black bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent flex items-center gap-2">
                        <span className="text-2xl">🏦</span> БАНК
                    </h2>
                    <div className="mt-6 space-y-4">
                        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50">
                            <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Ваш Баланс</div>
                            <div className="text-3xl font-mono text-emerald-400 font-bold">${me.cash?.toLocaleString()}</div>
                        </div>
                        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50">
                            <div className="text-xs text-slate-400 uppercase tracking-widest mb-1 flex justify-between">
                                <span>Кредит (10%)</span>
                                <span className="text-red-400 font-bold">-${Math.ceil((me.loanDebt || 0) * 0.1).toLocaleString()}/мес</span>
                            </div>
                            <div className="text-2xl font-mono text-red-400 font-bold mb-4">${me.loanDebt?.toLocaleString() || 0}</div>

                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => handleLoan(1000)} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-2 rounded-lg text-xs font-bold transition-all">Взять $1k</button>
                                <button onClick={() => handleLoan(10000)} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-2 rounded-lg text-xs font-bold transition-all">Взять $10k</button>
                                <button onClick={() => handleRepay(1000)} className="col-span-2 bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50" disabled={!me.loanDebt}>Погасить $1k</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Card / Market Actions (Left Side) */}
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                    {state.currentCard && isMyTurn ? (
                        <div className="bg-slate-800 rounded-2xl p-5 border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                            <div className="text-4xl mb-4">{state.currentCard.type === 'MARKET' ? '🏠' : '📜'}</div>
                            <h3 className="text-lg font-bold text-yellow-50 mb-2">{state.currentCard.title}</h3>
                            <p className="text-sm text-slate-300 mb-6 leading-relaxed">{state.currentCard.description}</p>

                            {state.currentCard.cost > 0 && (
                                <div className="bg-slate-900/50 p-3 rounded-xl mb-4 text-center">
                                    <div className="text-[10px] uppercase text-slate-500">Стоимость</div>
                                    <div className="text-xl font-mono font-bold text-white">${state.currentCard.cost.toLocaleString()}</div>
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                {(state.currentCard.type === 'MARKET' || state.currentCard.type === 'DEAL') ? (
                                    <>
                                        <button onClick={() => socket.emit('buy_asset', { roomId })} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95">Купить</button>
                                        <button onClick={handleEndTurn} className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-3 rounded-xl">Пропустить</button>
                                    </>
                                ) : (
                                    <button onClick={handleEndTurn} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl">OK</button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50 border-2 border-dashed border-slate-800 rounded-2xl">
                            <span className="text-4xl mb-2">🃏</span>
                            <span className="text-sm font-medium">Нет активных карт</span>
                        </div>
                    )}
                </div>
            </div>

            {/* CENTER COLUMN: Board */}
            <div className="flex-1 relative flex items-center justify-center bg-[#05070a]">
                {/* Background Decor */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-[#05070a] to-[#05070a]"></div>

                <div className="relative z-10 scale-95 transform transition-transform duration-700">
                    <BoardVisualizer
                        board={state.board}
                        players={state.players}
                        animatingPos={animatingPos}
                        currentPlayerId={currentPlayer.id}
                    />

                    {/* Central Dice/Status (Floating in middle of board loop) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-64 h-64 bg-slate-900/90 backdrop-blur-xl rounded-full border border-slate-700/50 flex flex-col items-center justify-center shadow-2xl pointer-events-auto">

                            {/* Phase Indicator */}
                            <div className="text-center mb-4">
                                <div className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold mb-1">ХОД ИГРОКА</div>
                                <div className="text-xl font-black text-white">{currentPlayer.name}</div>
                            </div>

                            {isMyTurn && state.phase === 'ROLL' ? (
                                <button
                                    onClick={handleRoll}
                                    className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.4)] transition-all transform hover:scale-110 active:scale-95 group"
                                >
                                    <span className="text-4xl group-hover:rotate-12 transition-transform">🎲</span>
                                </button>
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                    <span className="text-3xl animate-pulse text-slate-600">{state.lastRoll || '?'}</span>
                                </div>
                            )}

                            <div className="mt-4 text-[10px] text-slate-500 font-mono">
                                {state.phase} PHASE
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Players & Status */}
            <div className="w-[350px] bg-slate-900/80 backdrop-blur-md border-l border-slate-800 flex flex-col z-20">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Игроки ({state.players.length})</h2>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${socket.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-xs text-slate-500">{socket.connected ? 'ONLINE' : 'OFFLINE'}</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {state.players.map((p: any) => (
                        <div key={p.id} className={`relative p-4 rounded-2xl border transition-all ${p.id === currentPlayer.id ? 'bg-indigo-900/20 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800'}`}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="text-2xl w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">{p.token}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <div className="font-bold text-sm text-slate-200 truncate">{p.name}</div>
                                        {p.isFastTrack && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-500/30">FAST TRACK</span>}
                                    </div>
                                    <div className="text-xs text-slate-500 truncate">{p.dream}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-black/20 rounded p-2">
                                    <div className="text-slate-500 mb-0.5">Кэш</div>
                                    <div className="font-mono text-emerald-400 font-bold">${p.cash.toLocaleString()}</div>
                                </div>
                                <div className="bg-black/20 rounded p-2">
                                    <div className="text-slate-500 mb-0.5">Поток</div>
                                    <div className="font-mono text-blue-400 font-bold">+${p.cashflow.toLocaleString()}</div>
                                </div>
                            </div>

                            {p.id === currentPlayer.id && (
                                <div className="absolute -left-[1px] top-4 bottom-4 w-1 bg-indigo-500 rounded-r"></div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-slate-800 bg-black/20">
                    <div className="text-center text-xs text-slate-600 font-mono">
                        Room ID: {roomId}
                    </div>
                </div>
            </div>

            {/* Winner Overlay */}
            {state.winner && (
                <div className="absolute inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center animate-in fade-in duration-1000 backdrop-blur-md">
                    <div className="text-8xl mb-8 animate-bounce">🏆</div>
                    <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-6 tracking-tighter shadow-2xl">ПОБЕДА!</h2>
                    <div className="text-3xl text-white mb-12 font-light"><span className="font-bold text-yellow-400">{state.winner}</span> вышел на Фаст-Трек!</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-12 rounded-full text-xl shadow-[0_0_50px_rgba(22,163,74,0.6)] transition-all transform hover:scale-105"
                    >
                        Играть снова
                    </button>
                </div>
            )}
        </div>
    );
}
