import { useEffect, useState } from 'react';

interface USSDScreenProps {
  /** 0-based step index to display */
  step: number;
}

const USSD_STEPS = [
  {
    title: 'OGBENJUWA USSD',
    lines: [
      '1. Ufele (Attack)',
      '2. Ole (Fire)',
      '3. Ochere (Medical)',
      '4. Ofa (Abduction)',
      '5. Obu Ofu (Other)',
      '',
      'Send 1-5 or type:',
    ],
  },
  {
    title: 'Select Alert Type',
    lines: [
      'Selected: Ufele (Attack)',
      '',
      '1. Confirm',
      '2. Cancel',
      '3. Change type',
      '',
      'Send 1-3 or type:',
    ],
  },
  {
    title: 'Confirm Location',
    lines: [
      'Village: Otukpo',
      'LGA: Otukpo',
      '',
      '1. Confirm & Send',
      '2. Change location',
      '3. Cancel alert',
      '',
      'Send 1-3 or type:',
    ],
  },
  {
    title: 'ALERT SENT',
    lines: [
      '✓ Warriors notified',
      '✓ SMS broadcast active',
      '✓ Patrols dispatched',
      '',
      'Stay safe. Ogbenjuwa.',
      '',
      'End of session.',
    ],
  },
];

export function USSDScreen({ step }: USSDScreenProps) {
  const [displayStep, setDisplayStep] = useState(0);

  useEffect(() => {
    setDisplayStep(step % USSD_STEPS.length);
  }, [step]);

  const current = USSD_STEPS[displayStep];

  return (
    <div className="phone-shell">
      <div className="phone-notch" />
      <div className="phone-screen">
        <div className="ussd-screen">
          <div className="ussd-title">{current.title}</div>
          {current.lines.map((line, i) => (
            <div key={i} className="ussd-option">
              {line || '\u00A0'}
            </div>
          ))}
          <div className="ussd-input">
            &gt; <span className="ussd-cursor">▌</span>
          </div>
        </div>
      </div>
    </div>
  );
}
