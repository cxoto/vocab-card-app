"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [direction, setDirection] = useState(0); // -1: left, 1: right

  let touchStartX = 0;
  let touchEndX = 0;

  const speakWord = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US"; // 可根据需要改为 "en-GB" 等
    window.speechSynthesis.speak(utterance);
  };

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
    setShowDetail(true);
    await fetch("https://vocab.xoto.cc/word/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word: word.word, status }),
    });
  };

  const nextWord = () => {
    if (currentIndex < words.length - 1) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
      setShowDetail(false);
    }
  };

  const prevWord = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
      setShowDetail(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchEndX < touchStartX - 50) nextWord();
    if (touchEndX > touchStartX + 50) prevWord();
  };

  useEffect(() => {
    fetchAllWords();
  }, []);

  const word = words[currentIndex];
  if (!word) return <div className="p-4">Loading...</div>;

  const progressPercent = ((currentIndex + 1) / words.length) * 100;

  return (
    <div
      className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="h-2 w-full max-w-md bg-gray-300 rounded-full mb-4">
        <div
          className="h-2 bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div className="relative w-full max-w-md min-h-[420px] overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={word.word + currentIndex}
            custom={direction}
            initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction < 0 ? 300 : -300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full absolute top-0 left-0"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="flex justify-center items-center space-x-2">
                <h1 className="text-3xl font-bold">{word.word}</h1>
                <button
                  onClick={() => speakWord(word.word)}
                  className="text-blue-500 hover:text-blue-700"
                  aria-label="Play pronunciation"
                  title="朗读单词"
                >
                  🔊
                </button>
              </div>

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
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}