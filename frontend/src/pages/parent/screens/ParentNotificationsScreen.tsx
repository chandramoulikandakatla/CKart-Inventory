import React from 'react';
import { useCampusKart } from '../../../context/CampusKartContext';

export const ParentNotificationsScreen: React.FC = () => {
  const {
    ecosystem,
    parentLinkedStudent,
  } = useCampusKart();

  return (
            <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-6px_rgba(44,26,18,0.07)] border border-stone-200/90 rounded-3xl p-6 space-y-4">
              <h2 className="text-xl font-extrabold text-[#2C1A12]">Parent Real-Time Notifications</h2>
              <div className="space-y-2.5">
                {ecosystem.notifications
                  .filter(n => n.studentId === parentLinkedStudent.id)
                  .map(n => (
                    <div key={n.id} className="p-4 rounded-2xl bg-[#F5F0EB] border border-stone-200/80 text-xs flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-sky-800 text-sm">{n.title}</p>
                        <p className="text-stone-600 mt-1">{n.message}</p>
                      </div>
                      <span className="text-[11px] text-stone-500 shrink-0">{n.time}</span>
                    </div>
                  ))}
              </div>
            </div>

  );
};

export default ParentNotificationsScreen;
