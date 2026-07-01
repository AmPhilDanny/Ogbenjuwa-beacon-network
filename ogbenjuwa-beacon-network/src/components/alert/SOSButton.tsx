import type { ButtonHTMLAttributes } from 'react';

interface SOSButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Called when the SOS is triggered */
  onActivate?: () => void;
  /** Disable further presses during/after alert */
  disabled?: boolean;
}

export function SOSButton({ onActivate, disabled = false, ...rest }: SOSButtonProps) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
      {/* 3 concentric expanding rings — staggered delays */}
      <div className="ring-anim" style={{ animationDelay: '0s' }} />
      <div className="ring-anim" style={{ animationDelay: '0.7s' }} />
      <div className="ring-anim" style={{ animationDelay: '1.4s' }} />

      <button
        className="sos-button z-10"
        onClick={() => {
          if (!disabled && onActivate) onActivate();
        }}
        disabled={disabled}
        aria-label="Activate SOS alert"
        {...rest}
      >
        <span className="text-sm font-mono font-normal tracking-widest">SOS</span>
        <span className="text-[11px] font-normal mt-0.5 opacity-80">PANIC</span>
      </button>
    </div>
  );
}
