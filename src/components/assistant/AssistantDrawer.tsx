import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, X, Send, Mic, MicOff, Volume2, VolumeX, Trash2, ArrowRight, ShieldAlert, HeartHandshake } from 'lucide-react';
import { useTripStore } from '../../store/useTripStore';
import { sendAssistantMessage } from '../../services/gemini';
import { DemoBadge } from '../ui/Badge';

export const AssistantDrawer: React.FC<{
  onNavigateSlide?: (slide: number) => void;
}> = ({ onNavigateSlide }) => {
  const {
    assistant,
    setAssistantOpen,
    addAssistantMessage,
    setAssistantLoading,
    toggleVoiceOutput,
    clearAssistantChat,
    tripDetails,
    expenses,
    selectedTripMode,
    tripStatus,
    currentStep,
    language,
    sharingStatus,
    activeDisruption,
  } = useTripStore();

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (assistant.isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [assistant.messages, assistant.isOpen, assistant.isLoading]);

  // Speech Recognition setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'ta' ? 'ta-IN' : 'en-IN';

      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        if (transcript) {
          handleSend(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Text to Speech
  const speakText = (text: string) => {
    if (!assistant.voiceOutputEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (messageText?: string) => {
    const query = (messageText || input).trim();
    if (!query || assistant.isLoading) return;

    setInput('');
    addAssistantMessage({ sender: 'user', text: query });
    setAssistantLoading(true);

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    const context = {
      destination: tripDetails.destination,
      budget: tripDetails.budget,
      spent: totalSpent,
      tripMode: selectedTripMode,
      tripStatus,
      currentStep,
      sharingStatus,
      activeDisruption,
    };

    try {
      const res = await sendAssistantMessage(query, context, language);
      addAssistantMessage({
        sender: 'assistant',
        text: res.reply,
        quickReplies: res.quickReplies,
        isDemoFallback: res.isDemoFallback,
      });

      // Handle assistant navigation actions
      if (res.actions && res.actions.length > 0) {
        res.actions.forEach((act) => {
          if (act.type === 'navigate' && onNavigateSlide) {
            if (act.payload?.step === 'Companion') onNavigateSlide(4);
            if (act.payload?.step === 'Planner') onNavigateSlide(1);
            if (act.payload?.step === 'Replanning') onNavigateSlide(5);
            if (act.payload?.step === 'Dossier') onNavigateSlide(6);
          }
        });
      }

      speakText(res.reply);
    } catch {
      addAssistantMessage({
        sender: 'assistant',
        text: 'I am currently operating in offline mode. For urgent safety, use the **SOS** button or dial 112 / 108.',
        isDemoFallback: true,
      });
    } finally {
      setAssistantLoading(false);
    }
  };

  const quickActions = [
    { label: language === 'ta' ? 'பயணம் திட்டமிடு' : 'Plan a trip', query: 'Plan a 3-day trip to Ooty' },
    { label: language === 'ta' ? 'என் பட்ஜெட்' : 'My budget status', query: 'What is my budget status?' },
    { label: language === 'ta' ? 'பாதை பாதுகாப்பு' : 'Check route safety', query: 'Is the road to Ooty safe right now?' },
    { label: language === 'ta' ? 'அருகிலுள்ள மருத்துவமனை' : 'Nearby hospital', query: 'Where is the nearest hospital?' },
    { label: language === 'ta' ? 'மறுதிட்டமிடு' : 'Replan for rain', query: 'It is raining in Ooty, please replan my trip' },
  ];

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const isBudgetExceeded = totalSpent > tripDetails.budget;

  return (
    <>
      {/* Persistent Floating Orange Action Button */}
      <div className="fixed bottom-20 lg:bottom-6 right-5 z-40">
        <button
          onClick={() => setAssistantOpen(true)}
          aria-label="Ask TripPilot AI Assistant"
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#FF7A1A] to-[#ff9138] text-white shadow-xl shadow-[#FF7A1A]/35 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <Sparkles className="w-3 h-3 text-amber-200 absolute -top-1.5 -right-1.5 animate-spin duration-[6000ms]" />
          </div>
          <span className="text-xs font-bold font-heading tracking-wide hidden sm:inline">
            TripPilot AI
          </span>
          {/* Subtle pulse aura */}
          <span className="absolute -inset-1 rounded-full bg-[#FF7A1A] opacity-25 animate-ping -z-10 duration-[3000ms]" />
        </button>
      </div>

      {/* Assistant Drawer / Bottom Sheet */}
      {assistant.isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setAssistantOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative w-full sm:w-[420px] h-full glass-card border-l border-white/20 dark:border-white/10 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 border-b border-slate-200/50 dark:border-slate-800 flex items-center justify-between bg-white/40 dark:bg-[#071427]/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0B1F3A] to-[#FF7A1A] flex items-center justify-center text-white shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                    TripPilot AI
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-teal-500 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                    <span>Live Travel Co-Pilot</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={toggleVoiceOutput}
                  title={assistant.voiceOutputEnabled ? 'Mute Voice' : 'Enable Voice'}
                  className={`p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors ${
                    assistant.voiceOutputEnabled ? 'text-[#FF7A1A]' : ''
                  }`}
                >
                  {assistant.voiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={clearAssistantChat}
                  title="Clear Chat"
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAssistantOpen(false)}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Proactive Banner if Disruption or Budget Alert */}
            {isBudgetExceeded && (
              <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 flex items-center justify-between text-xs text-red-600 dark:text-red-400">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Budget exceeded by ₹{(totalSpent - tripDetails.budget).toLocaleString('en-IN')}.</span>
                </div>
                <button
                  onClick={() => handleSend('How can I optimize and save budget?')}
                  className="underline font-bold"
                >
                  Suggest Stays
                </button>
              </div>
            )}

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {assistant.messages.map((m) => {
                const isUser = m.sender === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                        isUser
                          ? 'bg-gradient-to-r from-[#FF7A1A] to-[#ff9138] text-white rounded-tr-xs'
                          : 'glass-card border border-white/20 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-tl-xs'
                      }`}
                    >
                      {/* Render line breaks or simple markdown */}
                      <div className="whitespace-pre-wrap">{m.text}</div>

                      {m.isDemoFallback && (
                        <div className="mt-1.5 flex justify-end">
                          <DemoBadge label="Offline Knowledge" />
                        </div>
                      )}
                    </div>

                    {/* Quick Replies chips */}
                    {!isUser && m.quickReplies && m.quickReplies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {m.quickReplies.map((qr, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(qr)}
                            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-200/70 dark:bg-slate-800/70 hover:bg-[#FF7A1A]/15 hover:text-[#FF7A1A] border border-slate-300/50 dark:border-slate-700/50 transition-colors cursor-pointer text-slate-700 dark:text-slate-300"
                          >
                            {qr}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {assistant.isLoading && (
                <div className="flex items-center gap-2 p-3 rounded-xl glass-card max-w-[120px] text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-[#FF7A1A] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#FF7A1A] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-[#FF7A1A] animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions Scroll Bar */}
            <div className="px-3 py-2 border-t border-slate-200/50 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 overflow-x-auto flex gap-1.5 no-scrollbar">
              {quickActions.map((act, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(act.query)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-[#FF7A1A] border border-slate-200 dark:border-slate-700 shrink-0 transition-colors cursor-pointer"
                >
                  {act.label}
                </button>
              ))}
            </div>

            {/* Input Bar with Mic & Send */}
            <div className="p-3 border-t border-slate-200/50 dark:border-slate-800 bg-white/60 dark:bg-[#0B1F3A]/70">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      isListening
                        ? 'Listening to speech...'
                        : language === 'ta'
                        ? 'பாதைகள், வானிலை, பட்ஜெட் பற்றி கேளுங்கள்...'
                        : 'Ask about routes, stays, safety...'
                    }
                    className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]"
                  />
                  {isListening && (
                    <span className="absolute right-3 top-3 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={toggleMic}
                  aria-label="Voice input"
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer min-h-[42px] min-w-[42px] flex items-center justify-center ${
                    isListening
                      ? 'bg-red-500 text-white border-red-500 animate-pulse'
                      : 'bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:text-[#FF7A1A]'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  type="submit"
                  disabled={!input.trim() || assistant.isLoading}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-[#FF7A1A] to-[#ff9138] text-white disabled:opacity-40 transition-all cursor-pointer min-h-[42px] min-w-[42px] flex items-center justify-center shadow-md shadow-[#FF7A1A]/30"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="mt-1 text-[10px] text-slate-400 text-center">
                Powered by Gemini AI • Real-time Safety Companion
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
