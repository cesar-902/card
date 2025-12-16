
import React, { useRef, useState } from 'react';
import { Flashcard } from '../types';
import Button from './Button';
import { geminiService } from '../services/geminiService';

interface CSVUploaderProps {
  onUpload: (cards: Flashcard[]) => void;
}

const CSVUploader: React.FC<CSVUploaderProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const parseCSV = (text: string): Flashcard[] => {
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const frenteIdx = headers.findIndex(h => h.includes('frente') || h.includes('question'));
    const gabaritoIdx = headers.findIndex(h => h.includes('gabarito') || h.includes('answer') || h.includes('key'));
    const versoIdx = headers.findIndex(h => h.includes('verso') || h.includes('explanation'));

    if (frenteIdx === -1 && gabaritoIdx === -1) return [];

    const cards: Flashcard[] = [];
    const fIdx = frenteIdx !== -1 ? frenteIdx : 0;
    const gIdx = gabaritoIdx !== -1 ? gabaritoIdx : 1;
    const vIdx = versoIdx !== -1 ? versoIdx : 2;

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      if (!row) continue;

      const clean = (val: string) => val ? val.replace(/^"|"$/g, '').trim() : '';
      const gabaritoRaw = clean(row[gIdx]).toUpperCase();
      const gabarito = (['A','B','C','D','E'].includes(gabaritoRaw) ? gabaritoRaw : 'A') as 'A'|'B'|'C'|'D'|'E';

      cards.push({
        id: Math.random().toString(36).substr(2, 9),
        frente: clean(row[fIdx]),
        gabarito: gabarito,
        verso: clean(row[vIdx]) || 'No explanation provided.'
      });
    }

    return cards;
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const isPython = file.name.endsWith('.py');
      
      let cards: Flashcard[] = [];
      
      // If it's not python, try standard CSV parsing first for performance
      if (!isPython) {
        cards = parseCSV(text);
      }

      // If CSV fails or it's a Python/Text file, use AI to intelligently extract
      if (cards.length === 0) {
        console.log("Using AI to extract cards from file content...");
        const aiCards = await geminiService.extractCardsFromText(text);
        cards = aiCards.map(c => ({
          ...c,
          id: Math.random().toString(36).substr(2, 9)
        }));
      }

      if (cards.length > 0) {
        onUpload(cards);
      } else {
        alert("Não foi possível extrair flashcards deste arquivo. Certifique-se de que o conteúdo contém perguntas de múltipla escolha.");
      }
      setIsProcessing(false);
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (/\.(csv|py|txt)$/i.test(file.name))) {
      processFile(file);
    } else {
      alert("Por favor, envie um arquivo .csv, .py ou .txt.");
    }
  };

  return (
    <div 
      className={`relative w-full border-2 border-dashed rounded-2xl p-10 transition-all duration-300 flex flex-col items-center justify-center gap-4 ${
        isDragging ? 'border-blue-500 bg-blue-50 shadow-inner' : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".csv,.py,.txt" 
        className="hidden" 
      />
      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-colors ${isProcessing ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
        <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-file-code'}`}></i>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-bold text-slate-800">
          {isProcessing ? 'Processando Arquivo com IA...' : 'Upload your Flashcards'}
        </h3>
        <p className="text-slate-500 max-w-xs text-sm leading-relaxed">
          {isProcessing 
            ? 'Aguarde enquanto a IA analisa seu código ou texto.'
            : 'Drag and drop your .csv file here or click the button below. aceita tambem py'}
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => fileInputRef.current?.click()} disabled={isProcessing} variant={isProcessing ? 'outline' : 'primary'}>
          {isProcessing ? 'Analisando...' : <><i className="fas fa-upload"></i> Escolher Arquivo</>}
        </Button>
      </div>
      <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 font-medium uppercase tracking-wider">
        <i className="fas fa-magic text-purple-400"></i> Suporte inteligente para .py e .txt
      </div>
    </div>
  );
};

export default CSVUploader;
