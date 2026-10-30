import React, { useEffect } from 'react';
import { Flag, Trophy, CheckCircle2, ArrowRight, Star } from 'lucide-react';
import { useTripStore } from '../../store/useTripStore';
import { triggerConfetti } from '../ui/Confetti';
import { Button } from '../ui/Button';

export const TripFinishOverlay: React.FC<{
  onClose: () => void;
  onViewDossier: () => void;
}> = ({ onClose, onViewDossier }) => {
  const { tripDetails, expenses, finishTrip, language } = useTripStore();

  useEffect(() => {
    finishTrip();
    triggerConfetti();
  }, []);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const saved = tripDetails.budget - totalSpent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071427]/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="max-w-lg w-full glass-card border border-teal-500/30 p-8 rounded-3xl shadow-2xl text-center space-y-6">
        {/* Trophy Header */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-[#FF7A1A] text-white flex items-center justify-center shadow-2xl shadow-[#FF7A1A]/40 animate-in zoom-in-75">
          <Trophy className="w-10 h-10" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-400 border border-teal-500/30">
            Journey Completed Safely
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-white mt-2">
            {language === 'ta' ? 'பயணம் வெற்றிகரமாக முடிந்தது!' : 'Trip Successfully Finished!'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Hope you enjoyed the misty heights, tea gardens, and toy train ride in {tripDetails.destination}!
          </p>
        </div>

        {/* Financial & Distance Summary */}
        <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block">Total Spent</span>
            <strong className="text-white">₹{totalSpent.toLocaleString('en-IN')}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">
              {saved >= 0 ? 'Under Budget' : 'Exceeded'}
            </span>
            <strong className={saved >= 0 ? 'text-teal-400' : 'text-red-400'}>
              {saved >= 0 ? `Saved ₹${saved}` : `₹${Math.abs(saved)}`}
            </strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Round Distance</span>
            <strong className="text-white">1,100 km</strong>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            size="md"
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            size="md"
            variant="primary"
            className="flex-1 shadow-lg shadow-[#FF7A1A]/35"
            icon={<ArrowRight className="w-4 h-4" />}
            onClick={() => {
              onClose();
              onViewDossier();
            }}
          >
            View Official Dossier
          </Button>
        </div>
      </div>
    </div>
  );
};
