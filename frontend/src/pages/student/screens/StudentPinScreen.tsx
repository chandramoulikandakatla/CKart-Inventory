import React from 'react';
import {
  ArrowLeft, CheckCircle2, Eye, EyeOff
} from 'lucide-react';
import { useCampusKart } from '../../../context/CampusKartContext';

export const StudentPinScreen: React.FC = () => {
  const {
    setStudentScreen,
    pendingStudent,
    pinInput,
    setPinInput,
    pinError,
    setPinError,
    pinMasked,
    setPinMasked,
    currentStudent,
    handleVerifyStudentPin,
  } = useCampusKart();

  return (
            <div className="max-w-md mx-auto my-8 bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] backdrop-blur-2xl border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <button
                onClick={() => setStudentScreen('credentials')}
                className="text-xs text-stone-500 hover:text-[#2C1A12] flex items-center gap-1 mb-4"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Change Student ID
              </button>

              {(() => {
                const stu = pendingStudent || currentStudent;
                return (
                  <>
                    <div className="p-4 rounded-2xl bg-orange-50/90 border border-orange-300/70 mb-5 flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-orange-600 flex items-center justify-center font-bold text-white text-base">
                        {stu.firstName[0]}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Identity Confirmed
                        </span>
                        <h3 className="text-base font-bold text-[#2C1A12]">{stu.name}</h3>
                        <p className="text-xs text-stone-600">{stu.id} · {stu.academicYear}</p>
                      </div>
                    </div>

                    <h2 className="text-lg font-bold text-[#2C1A12] mb-1">Enter CampusKart Session PIN</h2>
                    <p className="text-xs text-stone-500 mb-4">
                      This 4-digit PIN authenticates your kiosk/web session. It is not a bank or UPI credential.
                    </p>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-stone-600 font-medium">4-Digit Numeric PIN</span>
                        <button
                          type="button"
                          onClick={() => setPinMasked(!pinMasked)}
                          className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1"
                        >
                          {pinMasked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span>{pinMasked ? 'Show Digits' : 'Mask Digits'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-3 my-3">
                        {[0, 1, 2, 3].map(idx => {
                          const char = pinInput[idx] || '';
                          return (
                            <div
                              key={idx}
                              className={`h-14 rounded-2xl border flex items-center justify-center text-xl font-mono font-bold ${
                                char
                                  ? 'bg-orange-500/15 border-orange-500 text-white'
                                  : 'bg-[#F4EFEA] border-stone-200/90 text-slate-600'
                              }`}
                            >
                              {char ? (pinMasked ? '●' : char) : '–'}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Numeric Keypad */}
                    <div className="grid grid-cols-3 gap-2.5 mb-4">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
                        <button
                          key={digit}
                          type="button"
                          onClick={() => {
                            if (pinInput.length < 4) {
                              setPinInput(prev => prev + digit);
                              setPinError('');
                            }
                          }}
                          className="py-3 rounded-xl bg-[#F5F0EB]/90 hover:bg-stone-200/80 border border-stone-200/80 text-[#2C1A12] font-bold text-base transition-all active:scale-95"
                        >
                          {digit}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => { setPinInput(''); setPinError(''); }}
                        className="py-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-700 font-semibold text-xs"
                      >
                        Clear / Retry
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (pinInput.length < 4) {
                            setPinInput(prev => prev + '0');
                            setPinError('');
                          }
                        }}
                        className="py-3 rounded-xl bg-[#F5F0EB]/90 hover:bg-stone-200/80 border border-stone-200/80 text-[#2C1A12] font-bold text-base"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={() => setPinInput(stu.pin)}
                        className="py-3 rounded-xl bg-orange-500/15 hover:bg-orange-500/30 border border-orange-300/80 text-orange-700 font-semibold text-xs"
                      >
                        Auto-Fill ({stu.pin})
                      </button>
                    </div>

                    {pinError && (
                      <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 text-xs mb-4 flex items-center justify-between">
                        <span>{pinError}</span>
                        <button
                          type="button"
                          onClick={() => { setPinInput(''); setPinError(''); }}
                          className="underline font-semibold ml-2 shrink-0"
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleVerifyStudentPin}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25"
                    >
                      Verify PIN & Enter Dashboard
                    </button>
                  </>
                );
              })()}
            </div>

  );
};

export default StudentPinScreen;
