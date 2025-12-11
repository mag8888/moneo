import React from 'react';

export const BoardVisualizer = ({ board, players, animatingPos, currentPlayerId }: any) => {
    // 14x14 Grid Layout (Total 52 squares on perimeter)
    // Rat Race (Inner): 24 squares (Indices 0-23). 7x7 Grid (Perimeter 24). Placed at offset (4,4) -> Rows 4-10, Cols 4-10.
    // Fast Track (Outer): 52 squares (Indices 24-75). 14x14 Grid (Perimeter 52). Rows 1-14, Cols 1-14.

    const getPos = (index: number, isFastTrack: boolean) => {
        if (!isFastTrack) {
            // RAT RACE (Indices 0-23)
            // 7x7 Square. Top-Left: (4,4). Bottom-Right: (10,10).

            // Bottom Row: 0-6 -> (10, 10) to (10, 4)
            if (index <= 6) return { r: 10, c: 10 - index };

            // Left Column: 7-11 -> (9, 4) to (5, 4)
            if (index <= 11) return { r: 10 - (index - 6), c: 4 };

            // Top Row: 12-18 -> (4, 4) to (4, 10)
            if (index <= 18) return { r: 4, c: 4 + (index - 12) };

            // Right Column: 19-23 -> (5, 10) to (9, 10)
            return { r: 4 + (index - 18), c: 10 };
        } else {
            // FAST TRACK (Indices 24-75)
            // Normalized 0-51
            const ftIndex = index >= 24 ? index - 24 : index;

            // 14x14 Square. 
            // Bottom Row: 14 squares (0-13) -> (14, 14) to (14, 1)
            if (ftIndex <= 13) return { r: 14, c: 14 - ftIndex };

            // Left Column: 12 squares (14-25) -> (13, 1) to (2, 1)
            if (ftIndex <= 25) return { r: 14 - (ftIndex - 13), c: 1 };

            // Top Row: 14 squares (26-39) -> (1, 1) to (1, 14)
            if (ftIndex <= 39) return { r: 1, c: 1 + (ftIndex - 26) };

            // Right Column: 12 squares (40-51) -> (2, 14) to (13, 14)
            return { r: 1 + (ftIndex - 40), c: 14 };
        }
    };

    const isFastTrackSquare = (index: number) => index >= 24;

    return (
        <div className="w-full h-full grid grid-cols-14 grid-rows-14 gap-1 p-4">
            {/* Draw Path Squares */}
            {board.map((sq: any) => {
                const isFT = isFastTrackSquare(sq.index);
                const { r, c } = getPos(sq.index, isFT);

                // Color Logic
                let bgColor = 'bg-slate-800/80';
                let borderColor = 'border-slate-700';
                let glow = '';

                if (isFT) {
                    bgColor = 'bg-slate-900/90';
                    borderColor = 'border-blue-900/30';
                    if (sq.type === 'CASHFLOW') { bgColor = 'bg-emerald-900/60'; borderColor = 'border-emerald-500/50'; glow = 'shadow-[0_0_15px_rgba(16,185,129,0.2)]'; }
                    if (sq.type === 'DREAM') { bgColor = 'bg-pink-900/60'; borderColor = 'border-pink-500/50'; glow = 'shadow-[0_0_15px_rgba(236,72,153,0.3)]'; }
                    if (sq.type === 'Opportunity') { bgColor = 'bg-[#0B0E14]'; borderColor = 'border-slate-800'; }
                } else {
                    // Rat Race Colors
                    if (sq.type === 'PAYDAY') { bgColor = 'bg-yellow-600/20'; borderColor = 'border-yellow-500'; }
                    if (sq.type === 'OOW') { bgColor = 'bg-red-600/20'; borderColor = 'border-red-500'; }
                    if (sq.type === 'BABY') { bgColor = 'bg-purple-600/20'; borderColor = 'border-purple-500'; }
                    if (sq.type === 'OPPORTUNITY' || sq.type === 'DEAL') { bgColor = 'bg-green-600/10'; borderColor = 'border-green-800'; }
                    if (sq.type === 'MARKET') { bgColor = 'bg-blue-600/10'; borderColor = 'border-blue-800'; }
                }

                return (
                    <div
                        key={sq.index}
                        className={`
                            relative border rounded-sm flex items-center justify-center text-center transition-all duration-500
                            ${bgColor} ${borderColor} ${glow}
                            ${isFT ? 'text-[9px]' : 'text-[10px]'}
                            hover:scale-110 hover:z-20 hover:border-white/50 cursor-pointer
                        `}
                        style={{
                            gridRow: r,
                            gridColumn: c,
                        }}
                        title={`${sq.name} (${sq.index})`}
                    >
                        {/* Content */}
                        <div className="z-10 px-0.5 overflow-hidden flex flex-col items-center justify-center h-full w-full leading-none">
                             {sq.type === 'PAYDAY' && <span className="text-xl">💰</span>}
                             {sq.type === 'CASHFLOW' && <span className="text-xl">💵</span>}
                             {sq.type === 'BABY' && <span className="text-lg">👶</span>}
                             {sq.type === 'DREAM' && <span className="text-lg">✨</span>}
                             {sq.type === 'OOW' && <span className="text-lg">📉</span>}
                             
                             {!['PAYDAY', 'CASHFLOW', 'BABY', 'DREAM', 'OOW'].includes(sq.type) && (
                                 <span className={`font-bold uppercase tracking-wider ${isFT ? 'text-slate-600 text-[8px]' : 'text-slate-500 text-[9px]'}`}>
                                     {sq.name.replace('FT-', '')}
                                 </span>
                             )}
                             
                             <div className="absolute top-0.5 left-0.5 text-[6px] text-slate-700 font-mono opacity-50">{sq.index}</div>
                        </div>
                            <span className="truncate w-full opacity-80 scale-90">{sq.name}</span>
                        </div>
                        <span className="absolute top-0 right-0.5 text-[6px] text-slate-600 font-mono">{sq.index}</span>
                    </div>
    );
})}

{/* Players Tokens */ }
{
    players.map((p: any, idx: number) => {
        const posIndex = animatingPos[p.id] ?? p.position;
        const { r, c } = getPos(posIndex, p.isFastTrack);

        return (
            <div
                key={p.id}
                className="absolute w-6 h-6 flex items-center justify-center text-lg z-50 drop-shadow-md transition-all duration-300 pointer-events-none"
                style={{
                    gridRow: r,
                    gridColumn: c,
                    justifySelf: 'center',
                    alignSelf: 'center',
                    transform: `translate(${(idx % 2 === 0 ? -2 : 2) * (players.length > 1 ? 1 : 0)}px, ${(idx > 1 ? 2 : -2) * (players.length > 2 ? 1 : 0)}px)`
                }}
            >
                {p.token || '🔴'}
            </div>
        );
    })
}

{/* Center Logo Area */ }
<div className="row-start-5 row-end-10 col-start-5 col-end-10 flex items-center justify-center p-4">
    <div className="w-full h-full rounded-full border-4 border-slate-800/50 flex flex-col items-center justify-center bg-radial-gradient from-slate-900 to-black shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent z-10 animate-pulse">MONEO</h1>
        <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mt-2 z-10 font-bold">Energy of Money</p>
    </div>
</div>
        </div >
    );
};
