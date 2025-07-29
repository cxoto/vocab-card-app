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
  const [word, setWord] = useState<Word | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const fetchWord = async () => {
    const res = await fetch("https://vocab.xoto.cc/random-words?n=1");
    const data = await res.json();
    setWord(data[0]);
    setShowDetail(false);
  };

  const handleMemory = async (status: "remembered" | "forgotten" | "idn") => {
    if (!word) return;
    await fetch("https://vocab.xoto.cc/word/memory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        word: word.word,
        status,
      }),
    });
    if (status === "forgotten") {
      setShowDetail(true);
    } else {
      fetchWord(); // 下一张卡片
    }
  };

  useEffect(() => {
    fetchWord();
  }, []);

  if (!word) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
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
      </div>
    </div>
  );
}
