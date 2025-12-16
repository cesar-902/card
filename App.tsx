
import React, { useState, useCallback, useEffect } from 'react';
import { Flashcard, AppView, StudySession, HistoryEntry } from './types';
import CSVUploader from './components/CSVUploader';
import FlashcardView from './components/FlashcardView';
import Button from './components/Button';

const DEFAULT_CARDS: Flashcard[] = [
  {
    id: '1',
    frente: 'Qual é a capital da França?',
    gabarito: 'B',
    verso: 'A capital da França é Paris. Lyon e Marselha são outras grandes cidades francesas.'
  },
  {
    id: '2',
    frente: 'Qual destes planetas é conhecido como o Planeta Vermelho?',
    gabarito: 'C',
    verso: 'Marte é conhecido como o Planeta Vermelho devido ao óxido de ferro em sua superfície.'
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('home');
  const [session, setSession] = useState<StudySession | null>(null);
  const [cards, setCards] = useState<Flashcard[]>(DEFAULT_CARDS);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Load history and cards from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('checkcard_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    const savedCards = localStorage.getItem('checkcard_custom_cards');
    if (savedCards) setCards(JSON.parse(savedCards));
  }, []);

  const saveHistory = (score: number, total: number) => {
    const newEntry: HistoryEntry = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleString('pt-BR'),
      score,
      total
    };
    const updatedHistory = [newEntry, ...history].slice(0, 50); // Keep last 50
    setHistory(updatedHistory);
    localStorage.setItem('checkcard_history', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('checkcard_history');
  };

  const startStudy = useCallback((customCards?: Flashcard[]) => {
    const studyCards = customCards || cards;
    if (customCards) {
        localStorage.setItem('checkcard_custom_cards', JSON.stringify(customCards));
    }
    setSession({
      cards: [...studyCards].sort(() => Math.random() - 0.5),
      currentIndex: 0,
      score: 0,
      answers: {}
    });
    setView('study');
  }, [cards]);

  const handleUpload = (newCards: Flashcard[]) => {
    setCards(newCards);
    startStudy(newCards);
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (!session) return;
    setSession(prev => prev ? ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score
    }) : null);
  };

  const nextCard = () => {
    if (!session) return;
    if (session.currentIndex + 1 >= session.cards.length) {
      saveHistory(session.score, session.cards.length);
      setView('results');
    } else {
      setSession(prev => prev ? ({
        ...prev,
        currentIndex: prev.currentIndex + 1
      }) : null);
    }
  };

  const createGoogleCalendarEvent = () => {
    if (!session) return;
    const title = encodeURIComponent("Revisar Flashcards: CheckCard Pro");
    const details = encodeURIComponent(`Hora de revisar! Na última sessão você acertou ${session.score} de ${session.cards.length} cards.`);
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&sf=true&output=xml`;
    window.open(calendarUrl, '_blank');
  };

  const renderHome = () => (
    <div className="max-w-4xl mx-auto py-12 px-6 flex flex-col items-center gap-12 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
          CheckCard <span className="text-blue-600">Pro</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
          O sistema definitivo de flashcards MCQ. Suba seu arquivo CSV e domine qualquer assunto.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 w-full">
        <div className="glass-card rounded-2xl p-8 shadow-xl flex flex-col justify-between border-t-4 border-blue-600">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Iniciar Sessão</h2>
            <p className="text-slate-500 mb-6 leading-relaxed">
              Pronto para o desafio? Comece a estudar com seu deck atual de {cards.length} cards.
            </p>
            <div className="flex gap-3 mb-8">
                <Button onClick={() => startStudy()} className="flex-1 h-14 text-lg">
                    <i className="fas fa-play"></i> Iniciar Agora
                </Button>
            </div>
          </div>
        </div>

        <CSVUploader onUpload={handleUpload} />
      </div>

      <div className="w-full mt-8">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-[0.2em] mb-6 text-center">Painel de Recursos</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard icon="fa-robot text-purple-500" title="IA Explicadora" desc="Insights profundos." />
          
          <button 
            onClick={() => setView('history')}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-2 hover:border-blue-300 hover:bg-blue-50 transition-all group active:scale-95"
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-xl mb-2 group-hover:bg-blue-100">
              <i className="fas fa-history"></i>
            </div>
            <h4 className="font-bold text-slate-800">Ver Histórico</h4>
            <p className="text-xs text-slate-400">Progresso salvo.</p>
          </button>

          <FeatureCard icon="fa-file-csv text-emerald-500" title="Importar CSV" desc="Suba seus decks." />
          <FeatureCard icon="fa-calendar-check text-orange-500" title="Google Agenda" desc="Crie lembretes." />
        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <Button variant="outline" onClick={() => setView('home')}>
          <i className="fas fa-arrow-left"></i> Voltar
        </Button>
        <h2 className="text-3xl font-black text-slate-800">Meu Histórico</h2>
        <Button variant="danger" onClick={clearHistory} disabled={history.length === 0}>
          <i className="fas fa-trash"></i> Limpar Tudo
        </Button>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <i className="fas fa-clock-rotate-left text-5xl text-slate-200 mb-4"></i>
          <p className="text-slate-500">Nenhuma sessão registrada ainda.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((entry) => {
            const percent = (entry.score / entry.total) * 100;
            const colorClass = percent >= 70 ? 'text-emerald-600 bg-emerald-50' : percent >= 40 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';
            
            return (
              <div key={entry.id} className="glass-card p-6 rounded-xl border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{entry.date}</span>
                  <span className="text-lg font-bold text-slate-700">{entry.total} Questões</span>
                </div>
                <div className={`px-4 py-2 rounded-lg font-black text-xl ${colorClass}`}>
                  {entry.score} / {entry.total}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderStudy = () => {
    if (!session) return null;
    const currentCard = session.cards[session.currentIndex];
    const progress = ((session.currentIndex) / session.cards.length) * 100;

    return (
      <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <Button variant="outline" onClick={() => setView('home')} className="order-2 sm:order-1">
            <i className="fas fa-times"></i> Sair
          </Button>
          <div className="flex flex-col items-center gap-2 order-1 sm:order-2">
            <span className="text-slate-400 font-medium text-sm">Card {session.currentIndex + 1} de {session.cards.length}</span>
            <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          <div className="text-slate-700 font-bold order-3 flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg border border-emerald-100">
            <i className="fas fa-check-circle"></i> {session.score} Acertos
          </div>
        </div>

        <FlashcardView 
          card={currentCard} 
          onAnswer={handleAnswer} 
          onNext={nextCard} 
        />
      </div>
    );
  };

  const renderResults = () => {
    if (!session) return null;
    const percentage = Math.round((session.score / session.cards.length) * 100);
    
    return (
      <div className="max-w-2xl mx-auto py-20 px-6 text-center animate-in zoom-in-95 duration-500">
        <div className="glass-card rounded-3xl p-12 shadow-2xl border-b-8 border-blue-600">
          <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            <i className="fas fa-trophy"></i>
          </div>
          <h2 className="text-4xl font-black text-slate-800 mb-2">Sessão Finalizada!</h2>
          <p className="text-slate-500 text-xl mb-10">Você concluiu seu estudo.</p>
          
          <div className="flex justify-center gap-12 mb-10">
            <StatItem value={`${session.score}/${session.cards.length}`} label="Precisão" />
            <StatItem value={`${percentage}%`} label="Score" />
          </div>

          <div className="space-y-4">
            <Button onClick={() => startStudy()} className="w-full h-14 text-lg">
              <i className="fas fa-redo"></i> Refazer Estudo
            </Button>
            <Button variant="success" onClick={createGoogleCalendarEvent} className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700">
              <i className="fab fa-google"></i> Lembrete no Agenda
            </Button>
            <Button variant="outline" onClick={() => setView('home')} className="w-full h-14 text-lg">
               Ir para Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {view === 'home' && renderHome()}
      {view === 'study' && renderStudy()}
      {view === 'results' && renderResults()}
      {view === 'history' && renderHistory()}
    </div>
  );
};

const FeatureCard: React.FC<{ icon: string; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-2">
    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-xl mb-2">
      <i className={`fas ${icon}`}></i>
    </div>
    <h4 className="font-bold text-slate-800">{title}</h4>
    <p className="text-xs text-slate-400">{desc}</p>
  </div>
);

const StatItem: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="flex flex-col">
    <span className="text-4xl font-black text-slate-900">{value}</span>
    <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">{label}</span>
  </div>
);

export default App;
