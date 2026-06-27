'use client';
import { texts, unwanted } from '@/utils/constants';
import { cleanStr } from '@/utils/utils';
import React, { useEffect, useMemo, useState } from 'react'
import { FcApprove } from 'react-icons/fc';
import { RxCross2 } from 'react-icons/rx';
import { TiTick, TiTickOutline } from 'react-icons/ti';

type Props = {}

const Hero = (props: Props) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [text, setText] = useState('');


    const words = text.split(' ');
    const wordCount = useMemo(() => words.length, [text]);
    const finished = useMemo(() => currentIndex >= wordCount - 1, [wordCount, currentIndex]);

    if (finished) { console.log(finished) }

    const checkIsUnwanted = (index: number) => {
        const current = cleanStr(words[index]);
        const next = cleanStr(words[index + 1]);
        const prev = cleanStr(words[index - 1]);

        // 1. Check if single word matches
        if (unwanted.includes(current)) { return true };

        // 2. Check if current + next word matches (e.g., "gecikme" + "zammı")
        if (unwanted.includes(`${current} ${next}`)) return true;

        // 3. Check if prev + current word matches (so the second word stays highlighted too)
        if (unwanted.includes(`${prev} ${current}`)) return true;

        return false;
    };

    const includesUnwanted = useMemo(() => {
        const words = text.split(' ');
        return words.some((_, i) => checkIsUnwanted(i));
    }, [text]);

    useEffect(() => {
        // Hâlâ yazılıyor: bir sonraki karaktere/kelimeye geç
        if (currentIndex < wordCount) {
            const timeout = setTimeout(() => {
                setCurrentIndex((prev) => prev + 1);
            }, 50);
            return () => clearTimeout(timeout);
        }

        // Yazı bitti: kısa bir bekleme sonrası FARKLI bir rastgele yazıya geç
        const timeout = setTimeout(() => {
            setText((prev) => {
                if (texts.length <= 1) return prev;
                let next = prev;
                do {
                    next = texts[Math.floor(Math.random() * texts.length)];
                } while (next === prev); // aynı yazıyı tekrar seçme
                return next;
            });
            setCurrentIndex(0);
        }, 5000); // yazı bitince bir sonrakine geçmeden önceki bekleme (ms)

        return () => clearTimeout(timeout);
    }, [currentIndex, wordCount]);

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * texts.length);
        setText(texts[randomIndex]);
    }, []);

    return (
        <>
            <div className='flex flex-1 flex-col max-lg:text-4xl text-6xl font-bold mt-[20vh]'>
                Katılım Bankacılığı'nda
                <span className='max-lg:text-2xl text-3xl text-neutral-300 pt-4 font-light italic'>kişisel yol göstericiniz.</span>
            </div>
            <div className='flex-1 flex items-center justify-center mt-[10vh]'>
                <div className="document relative h-180 justify-between w-120 rounded-sm px-10 py-8
                bg-[#fdfcf7] text-neutral-900
                shadow-[0_10px_40px_rgba(0,0,0,0.25)]
                ring-1 ring-black/5
                rotate-[-0.4deg] flex flex-col">
                    <p className='text-black font-normal text-lg font-serif leading-relaxed'>
                        {text.split(' ').map((text, key) =>
                            <span
                                key={key}
                                className={`inline-block mr-1 
                                ${key > currentIndex ? 'text-gray-400'
                                        : checkIsUnwanted(key)
                                            ? 'text-red-800 font-bold text-2xl'
                                            : 'text-black'}`}
                            >
                                {text}
                            </span>)}
                    </p>
                    <div className='inline-flex items-center justify-center gap-2 animate-pulse'>
                        <div className={`span approval inline-block rounded-full text-4xl border-2 ${finished && (!includesUnwanted ? 'border-green-500' : 'border-red-500')}`}>
                            {finished && (!includesUnwanted ?
                                <TiTick color='green' />
                                : <RxCross2 color='red' />)}
                        </div>
                        <span className={`${!includesUnwanted ? 'text-green-500' : 'text-red-500'}`}>{finished && (!includesUnwanted ? 'UYGUN' : 'UYGUN DEĞİL')}</span>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Hero