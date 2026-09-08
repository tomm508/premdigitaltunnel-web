import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { FAQ_ITEMS } from '../data/mockData';

interface FaqProps {
  isDark: boolean;
}

export const Faq: React.FC<FaqProps> = ({ isDark }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-12 md:py-20 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold mb-3 ${
            isDark 
              ? 'bg-purple-950/70 border border-purple-500/30 text-purple-300 shadow-inner' 
              : 'bg-purple-100 border border-purple-300 text-purple-800 shadow-sm'
          }`}>
            <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
            <span>#1 Support Center</span>
          </div>
          <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight mb-3 transition-colors ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Frequently Asked Questions
          </h2>
          <p className={`text-sm sm:text-base max-w-xl mx-auto transition-colors ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Find answers to the most common questions about our free tunneling services
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                id={`faq-item-${index}`}
                className={`rounded-2xl overflow-hidden transition-all shadow-md ${
                  isDark 
                    ? 'bg-[#171239] border border-purple-500/20' 
                    : 'bg-white border border-purple-200 shadow-purple-900/5'
                }`}
              >
                <button
                  id={`faq-btn-${index}`}
                  onClick={() => toggleAccordion(index)}
                  className={`w-full p-4 sm:p-5 flex items-center justify-between text-left font-bold text-sm sm:text-base transition-colors gap-4 ${
                    isDark 
                      ? 'text-white hover:text-purple-300' 
                      : 'text-slate-900 hover:text-purple-700'
                  }`}
                >
                  <span>{item.question}</span>
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                    isOpen 
                      ? 'bg-purple-600 text-white' 
                      : isDark
                        ? 'bg-purple-600/20 text-purple-300'
                        : 'bg-purple-100 text-purple-700'
                  }`}>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>
                {isOpen && (
                  <div className={`px-5 pb-5 pt-1 text-xs sm:text-sm leading-relaxed border-t transition-colors ${
                    isDark 
                      ? 'text-slate-300 border-purple-500/10' 
                      : 'text-slate-600 border-purple-100'
                  }`}>
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
