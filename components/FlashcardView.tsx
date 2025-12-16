
import React, { useState, useEffect } from 'react';
import { Flashcard } from '../types';
import Button from './Button';
import { geminiService } from '../services/geminiService';

interface FlashcardViewProps {
  card: Flashcard;
  onAnswer: (correct: boolean) => void;
  onNext: () => void;
}

const FlashcardView: React.FC<FlashcardViewProps> = ({ card, onAnswer, onNext }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAskingAi, setIsAskingAi] = useState(false);

  useEffect(() => {
    setSelectedOption(null);
    setIsLocked(false);
    setAiExplanation(null);
    setIsAskingAi(false);
  }, [card.id]);

  const handleCheck = (option: string) => {
    if (isLocked) return;
    
    setSelectedOption(option);
    setIsLocked(true);
    const isCorrect = option === card.gabarito;
    onAnswer(isCorrect);
  };

  const askAi = async () => {
    if (!selectedOption) return;
    setIsAskingAi(true);
    const explanation = await geminiService.explainAnswer(
      card.frente,
      card.gabarito,
      card.verso,
      selectedOption
    );
    setAiExplanation(explanation || "No explanation available.");
    setIsAskingAi(false);
  };

  const options = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-card rounded-2xl p-8 shadow-xl border border-slate-100">
        <div className="text-sm font-semibold text-blue-600 mb-4 tracking-wider uppercase">Question</div>
        <div className="text-xl md:text-2xl text-slate-800 leading-relaxed whitespace-pre-wrap mb-8">
          {card.frente}
        </div>

        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8">
          {options.map((option) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === card.gabarito;
            
            let btnClass = "w-14 h-14 rounded-xl text-lg font-bold border-2 transition-all flex items-center justify-center ";
            
            if (!isLocked) {
              btnClass += "border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-500 bg-white";
            } else {
              if (isSelected) {
                btnClass += isCorrect 
                  ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200" 
                  : "bg-red-500 border-red-500 text-white shadow-lg shadow-red-200";
              } else if (isCorrect) {
                btnClass += "bg-emerald-100 border-emerald-500 text-emerald-700";
              } else {
                btnClass += "bg-slate-50 border-slate-100 text-slate-400 opacity-60";
              }
            }

            return (
              <button
                key={option}
                onClick={() => handleCheck(option)}
                disabled={isLocked}
                className={btnClass}
              >
                {option}
              </button>
            );
          })}
        </div>

        {isLocked && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <hr className="border-slate-100 my-6" />
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 mb-2 tracking-wider uppercase">
              <i className="fas fa-info-circle"></i> Explanation
            </div>
            <div className="text-slate-600 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              {card.verso}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <Button 
                variant="outline" 
                onClick={askAi} 
                disabled={isAskingAi}
                className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                {isAskingAi ? (
                  <><i className="fas fa-spinner fa-spin"></i> Consulting AI...</>
                ) : (
                  <><i className="fas fa-robot"></i> Ask AI for Clarity</>
                )}
              </Button>
              <Button 
                variant="secondary" 
                onClick={onNext}
                className="w-full sm:w-auto"
              >
                Next Card <i className="fas fa-arrow-right"></i>
              </Button>
            </div>

            {aiExplanation && (
              <div className="mt-4 p-4 rounded-xl bg-purple-50 border border-purple-100 text-purple-900 animate-in zoom-in-95 duration-200">
                <div className="font-bold flex items-center gap-2 mb-1">
                  <i className="fas fa-magic"></i> AI Insight
                </div>
                {aiExplanation}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardView;
