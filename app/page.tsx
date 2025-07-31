"use client";
import { useEffect, useState } from "react";

type Word = {
  word: string;
  meaning: string;
  status: string;
  score: number;
  add_time: string;
  phonetic: string;
  word_example: string;
};

export default function Home() {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetail, setShowDetail] = useState(false);

  // 触摸滑动事件变量
  let touchStartX = 0;
  let touchEndX = 0;

  const fetchAllWords = async () => {
    const res = await fetch("https://vocab.xoto.cc/random-words?n=100");
    const data = await res.json();
    setWords(data);
    setCurrentIndex(0);
    setShowDetail(false);
  };

  const handleMemory = async (status: "remembered" | "forgotten" | "idn") => {
    const word = words[currentIndex];
    if (!word) return;
    await fetch("https://vocab.xoto.cc/word/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word: word.word, status }),
    });
    setShowDetail(true); // 只展示释义，不切换单词
  };

  const nextWord = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowDetail(false);
    }
  };

  const prevWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowDetail(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchEndX < touchStartX - 50) nextWord(); // 左滑
    if (touchEndX > touchStartX + 50) prevWord(); // 右滑
  };

  useEffect(() => {
    fetchAllWords();
  }, []);

  const word = words[currentIndex];
  if (!word) return <div className="p-4">Loading...</div>;

  return (
    <div
      className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold">{word.word}</h1>
        <p className="text-gray-500 text-xl mb-4">{word.phonetic}</p>

        {showDetail && (
          <div className="text-left mt-4">
            <p className="text-lg font-medium mb-2">🌱 {word.meaning}</p>
            <p className="text-sm text-gray-700">{word.word_example}</p>
          </div>
        )}

        <div className="flex justify-between mt-6 space-x-4">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-lg w-1/3"
            onClick={() => handleMemory("forgotten")}
          >
            不记得
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-lg w-1/3"
            onClick={() => handleMemory("remembered")}
          >
            记得
          </button>
          <button
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg w-1/3"
            onClick={() => handleMemory("idn")}
          >
            模糊
          </button>
        </div>

        <div className="flex justify-between mt-6">
          <button
            className="text-blue-600 underline"
            onClick={prevWord}
            disabled={currentIndex === 0}
          >
            上一个
          </button>
          <button
            className="text-blue-600 underline"
            onClick={nextWord}
            disabled={currentIndex === words.length - 1}
          >
            下一个
          </button>
        </div>
      </div>
    </div>
  );
}
