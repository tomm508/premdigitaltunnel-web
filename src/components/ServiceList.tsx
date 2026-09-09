import React from 'react';
import { 
  Shield, 
  Share2, 
  Zap, 
  Lock, 
  Key, 
  Activity, 
  Check, 
  ChevronRight 
} from 'lucide-react';
import { ProtocolType } from '../types';
import { PROTOCOL_SERVICES } from '../data/mockData';

interface ServiceListProps {
  isDark: boolean;
  onChooseService: (protocol: ProtocolType) => void;
}

export const ServiceList: React.FC<ServiceListProps> = ({ isDark, onChooseService }) => {
  const getIcon = (id: ProtocolType) => {
    switch (id) {
      case 'ssh':
        return <Share2 className="w-8 h-8 text-white" />;
      case 'vmess':
        return <Zap className="w-8 h-8 text-white" />;
      case 'vless':
        return <Shield className="w-8 h-8 text-white" />;
      case 'trojan':
        return <Lock className="w-8 h-8 text-white" />;
    }
  };

  const getGradient = (id: ProtocolType) => {
    switch (id) {
      case 'ssh':
        return 'bg-gradient-to-tr from-blue-600 to-indigo-500';
      case 'vmess':
        return 'bg-gradient-to-tr from-emerald-500 to-teal-400';
      case 'vless':
        return 'bg-gradient-to-tr from-purple-600 to-pink-500';
      case 'trojan':
        return 'bg-gradient-to-tr from-red-600 to-orange-500';
    }
  };

  const getBtnGradient = (id: ProtocolType) => {
    switch (id) {
      case 'ssh':
        return 'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500';
      case 'vmess':
        return 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500';
      case 'vless':
        return 'from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500';
      case 'trojan':
        return 'from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500';
    }
  };

  return (
    <section id="services" className="py-12 md:py-20 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold mb-3 ${
            isDark 
              ? 'bg-purple-950/70 border border-purple-500/30 text-purple-300 shadow-inner' 
              : 'bg-purple-100 border border-purple-300 text-purple-800 shadow-sm'
          }`}>
            <Shield className="w-3.5 h-3.5 text-purple-500" />
            <span>Choose Your Protocol</span>
          </div>
          <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight mb-3 transition-colors ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Choose Tunneling Service
          </h2>
          <p className={`text-sm sm:text-base max-w-xl mx-auto transition-colors ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            All tunneling services are free. Select the protocol service you want to use.
          </p>
        </div>

        {/* Protocols Grid */}
        <div className="space-y-6">
          {PROTOCOL_SERVICES.map((service) => (
            <div
              key={service.id}
              id={`service-card-${service.id}`}
              className={`p-6 rounded-3xl transition-all shadow-xl backdrop-blur-sm ${
                isDark 
                  ? 'bg-[#171239]/90 border border-purple-500/20 hover:border-purple-400/40 hover:bg-[#1f194c]' 
                  : 'bg-white border border-purple-200 hover:border-purple-400 hover:bg-purple-50/30 shadow-purple-900/5'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                {/* Icon Badge */}
                <div className={`w-16 h-16 rounded-2xl ${getGradient(service.id)} flex items-center justify-center shadow-lg mb-4`}>
                  {getIcon(service.id)}
                </div>

                {/* Title */}
                <h3 className={`text-xl sm:text-2xl font-bold mb-2 transition-colors ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {service.name}
                </h3>

                {/* Tagline */}
                <p className={`text-xs sm:text-sm max-w-md mx-auto mb-6 transition-colors ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {service.tagline}
                </p>

                {/* Features List */}
                <div className="w-full max-w-sm space-y-2.5 mb-6 text-left">
                  {service.features.map((feat, idx) => (
                    <div key={idx} className={`flex items-center gap-2.5 text-xs sm:text-sm ${
                      isDark ? 'text-slate-200' : 'text-slate-700'
                    }`}>
                      <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                        isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Choose Service Button */}
                <button
                  id={`btn-choose-${service.id}`}
                  onClick={() => onChooseService(service.id)}
                  className={`w-full max-w-sm py-3.5 px-6 rounded-2xl font-bold text-sm text-white bg-gradient-to-r ${getBtnGradient(service.id)} shadow-lg shadow-purple-900/30 hover:shadow-purple-700/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2`}
                >
                  <span>Choose Service</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
