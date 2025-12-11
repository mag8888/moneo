"use client";

import { useEffect, useState } from 'react';
import { socket } from '../../socket';

interface BoardProps {
    roomId: string;
    initialState: any;
}

export default function GameBoard({ roomId, initialState }: BoardProps) {
    const [state, setState] = useState(initialState);
    const [lastRoll, setLastRoll] = useState<number | null>(null);

    const [showBank, setShowBank] = useState(false);

    useEffect(() => {
        socket.on('dice_rolled', (data) => {
            setLastRoll(data.roll);
            setState(data.state);
        });

        socket.on('state_updated', (data) => {
            setState(data.state);
        });

        socket.on('turn_ended', (data) => {
            setState(data.state);
        });

        return () => {
            socket.off('dice_rolled');
            socket.off('turn_ended');
            socket.off('state_updated');
        };
    }, []);

    const handleLoan = (amount: number) => {
        socket.emit('take_loan', { roomId, amount });
    }

    const handleRoll = () => {
        socket.emit('roll_dice', { roomId });
    };

    const handleEndTurn = () => {
        socket.emit('end_turn', { roomId });
    };

    const currentPlayer = state.players[state.currentPlayerIndex];
    const isMyTurn = currentPlayer.id === socket.id;

    return (
        <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
            {/* Left: Board Area */}
            <div className="flex-1 relative bg-slate-800 m-2 rounded-xl flex items-center justify-center border border-slate-700">
                <div className="absolute top-4 left-4 text-slate-400">
                    Room: {roomId} | Turn: {currentPlayer.name}
                </div>

                {/* Visual Board Mockup */}
                <div className="w-[600px] h-[600px] border-4 border-slate-600 rounded-full relative">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-slate-900 rounded-full border border-slate-700 flex items-center justify-center">
                        <span className="text-2xl font-bold text-yellow-500">Fast Track</span>
                    </div>

                    {/* Render Players */}
                    {state.players.map((p: any, i: number) => {
                        // Math for circular position
                        const angle = (p.position / 24) * 360;
                        const radius = 250; // Half of 500 (inner ring)
                        const rad = (angle - 90) * (Math.PI / 180);
                        const x = Math.cos(rad) * radius + 300 - 16;
                        const y = Math.sin(rad) * radius + 300 - 16;

                        return (
                            <div
                                key={p.id}
                                className="absolute w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold"
                                style={{
                                    left: x,
                                    top: y,
                                    backgroundColor: ['red', 'blue', 'green', 'purple'][i % 4]
                                }}
                            >
                                {p.name[0]}
                            </div>
                        );
                    })}
                </div>

                {lastRoll && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-32 bg-black/50 px-4 py-2 rounded text-xl animate-bounce">
                        🎲 {lastRoll}
                    </div>
                )}

                {/* Card Popup */}
                {state.currentCard && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
                        <div className="bg-slate-800 p-8 rounded-2xl border-2 border-yellow-500 max-w-md text-center shadow-2xl">
                            <h3 className="text-2xl font-bold text-yellow-400 mb-2">{state.currentCard.title}</h3>
                            <div className="text-slate-300 mb-6">{state.currentCard.description}</div>
                            {state.currentCard.cost && (
                                <div className="text-3xl text-red-500 font-mono mb-6">-${state.currentCard.cost}</div>
                            )}
                            <button
                                onClick={handleEndTurn} // Simplified: End turn accepts the card result
                                className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-xl font-bold text-lg"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Right: HUD */}
            <div className="w-96 bg-slate-900 border-l border-slate-700 p-6 flex flex-col">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">Статус</h2>
                    <div className="bg-slate-800 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                            <span>Наличные:</span>
                            <span className="text-green-400 font-mono">${currentPlayer.cash}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Денежный поток:</span>
                            <span className="text-blue-400 font-mono">+${currentPlayer.cashflow}</span>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-slate-400">
                            <span>Дети: {currentPlayer.childrenCount}/3</span>
                            <span>(Расход: -${currentPlayer.childrenCount * currentPlayer.childCost})</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <h3 className="font-bold mb-2">Лог игры</h3>
                    <ul className="text-sm space-y-1 text-slate-400">
                        {state.log.slice().reverse().map((msg: string, i: number) => (
                            <li key={i}>{msg}</li>
                        ))}
                    </ul>
                </div>

                <div className="mt-6 border-t border-slate-700 pt-6">
                    <button
                        onClick={() => setShowBank(!showBank)}
                        className="w-full mb-3 bg-blue-900/50 border border-blue-500 hover:bg-blue-900 py-2 rounded-lg"
                    >
                        🏦 Банк / Кредит
                    </button>

                    {showBank && (
                        <div className="bg-slate-800 p-4 rounded-lg mb-4 border border-slate-600">
                            <div className="flex gap-2">
                                <button onClick={() => handleLoan(1000)} className="flex-1 bg-green-700 py-2 rounded text-sm hover:bg-green-600">Взять $1k</button>
                                <button onClick={() => handleLoan(10000)} className="flex-1 bg-green-800 py-2 rounded text-sm hover:bg-green-700">Взять $10k</button>
                            </div>
                            <p className="text-xs text-slate-400 mt-2 text-center">Ставка: 10% в месяц</p>
                        </div>
                    )}

                    {isMyTurn ? (
                        <div className="space-y-3">
                            {state.phase === 'ROLL' && (
                                <button
                                    onClick={handleRoll}
                                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 rounded-xl text-xl transition-all"
                                >
                                    🎲 Бросить кубик
                                </button>
                            )}
                            {state.phase === 'ACTION' && (
                                <button
                                    onClick={handleEndTurn}
                                    className="w-full bg-slate-700 hover:bg-slate-600 font-bold py-4 rounded-xl text-xl"
                                >
                                    Завершить ход
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-slate-500 py-4">
                            Ожидание хода {currentPlayer.name}...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
