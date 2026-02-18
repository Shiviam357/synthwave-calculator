
import React, { useState, useMemo } from 'react';

const LocalButton = ({ label, onClick, className }: { label: string, onClick: (l: string) => void, className: string }) => (
  <button onClick={() => onClick(label)} className={className}>
    {label}
  </button>
);


const App: React.FC = () => {
  const [currentValue, setCurrentValue] = useState<string>('0');
  const [operator, setOperator] = useState<string | null>(null);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [overwrite, setOverwrite] = useState<boolean>(true);
  const [history, setHistory] = useState<string[]>([]);

  const calculate = (prev: number, op: string, current: number): number => {
    switch (op) {
      case '+':
        return prev + current;
      case '-':
        return prev - current;
      case '*':
        return prev * current;
      case '/':
        if (current === 0) return Infinity;
        return prev / current;
      default:
        return current;
    }
  };

  const handleButtonClick = (label: string) => {
    if (!isNaN(Number(label))) { // Digit input
      if (overwrite) {
        setCurrentValue(label);
        setOverwrite(false);
      } else {
        if (currentValue.length >= 12) return;
        setCurrentValue(prev => (prev === '0' ? label : prev + label));
      }
    } else { // Operator or function input
      const current = parseFloat(currentValue);
      switch (label) {
        case 'AC':
          setCurrentValue('0');
          setOperator(null);
          setPreviousValue(null);
          setOverwrite(true);
          setHistory([]);
          break;
        case '+/-':
          if (currentValue !== '0') {
            setCurrentValue(prev => (prev.startsWith('-') ? prev.substring(1) : `-${prev}`));
          }
          break;
        case '⌫':
          if (overwrite) return;
          if (currentValue.length === 1 || (currentValue.length === 2 && currentValue.startsWith('-'))) {
            setCurrentValue('0');
          } else {
            setCurrentValue(prev => prev.slice(0, -1));
          }
          break;
        case '.':
          if (overwrite) {
            setCurrentValue('0.');
            setOverwrite(false);
          } else if (!currentValue.includes('.')) {
            setCurrentValue(prev => prev + '.');
          }
          break;
        case '+':
        case '-':
        case '*':
        case '/':
          if (operator && previousValue !== null && !overwrite) {
            const result = calculate(previousValue, operator, current);
            const displayResult = parseFloat(result.toPrecision(10)).toString();
            setCurrentValue(displayResult);
            setPreviousValue(result);
          } else {
            setPreviousValue(current);
          }
          setOperator(label);
          setOverwrite(true);
          break;
        case '=':
          if (operator && previousValue !== null) {
            const result = calculate(previousValue, operator, current);
            const displayResult = parseFloat(result.toPrecision(10)).toString();
            const prevFormatted = parseFloat(previousValue.toPrecision(10)).toString();
            const currentFormatted = parseFloat(current.toPrecision(10)).toString();
            setHistory(prev => [`${prevFormatted} ${operator} ${currentFormatted} = ${displayResult}`, ...prev].slice(0, 5));
            setCurrentValue(displayResult);
            setPreviousValue(null);
            setOperator(null);
            setOverwrite(true);
          }
          break;
      }
    }
  };

  const displayFontSize = useMemo(() => {
    const len = currentValue.length;
    if (len > 10) return 'text-4xl';
    if (len > 8) return 'text-5xl';
    return 'text-6xl';
  }, [currentValue]);

  const getButtonClassName = (label: string): string => {
    const baseClasses = "rounded-2xl flex items-center justify-center text-3xl font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 active:translate-y-px active:scale-95";
    
    if (["/", "*", "-", "+", "="].includes(label)) {
      return `${baseClasses} bg-fuchsia-600 hover:bg-fuchsia-500 text-white focus:ring-fuchsia-400 border-b-4 border-fuchsia-800 active:border-b-2`;
    }
    if (["AC", "+/-", "⌫"].includes(label)) {
      return `${baseClasses} bg-purple-800 hover:bg-purple-700 text-cyan-300 focus:ring-purple-500 border-b-4 border-purple-900 active:border-b-2`;
    }
    return `${baseClasses} bg-slate-800 hover:bg-slate-700 text-fuchsia-400 focus:ring-fuchsia-500 border-b-4 border-slate-900 active:border-b-2`;
  };

  const buttons = [
    'AC', '+/-', '⌫', '/',
    '7', '8', '9', '*',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '.', '='
  ];
  
  const displayPrevious = useMemo(() => {
    if (operator && previousValue !== null) {
      const formattedPrev = parseFloat(previousValue.toPrecision(10)).toString();
      return `${formattedPrev} ${operator}`;
    }
    return '';
  }, [operator, previousValue]);

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 min-h-screen flex items-center justify-center p-4 selection:bg-fuchsia-500 selection:text-white">
      <div 
        className="w-full max-w-xs sm:max-w-sm mx-auto rounded-3xl p-4 sm:p-6 space-y-4 shadow-2xl border border-purple-500/30 shadow-purple-500/20
                   bg-slate-900/50 backdrop-blur-xl"
      >
        {/* History */}
        <div className="h-20 text-right pr-4 space-y-1 overflow-y-auto text-slate-400 text-lg scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {history.map((item, index) => (
                <div key={index} className="truncate">{item}</div>
            ))}
        </div>
        
        {/* Display */}
        <div className="bg-black/30 text-right p-4 rounded-lg overflow-hidden border border-slate-700/50">
          <div className="text-2xl text-slate-400 font-light h-8 truncate">{displayPrevious}</div>
          <p 
            className={`font-light break-all transition-all duration-200 ${displayFontSize} min-h-16 flex items-end justify-end`} 
            style={{ 
              textShadow: '0 0 5px #22d3ee, 0 0 10px #22d3ee, 0 0 15px #0e7490'
            }}
          >
            <span className="text-cyan-300">
              {currentValue === 'Infinity' ? 'Error' : currentValue}
            </span>
          </p>
        </div>
        
        {/* Keypad */}
        <div className="grid grid-cols-4 gap-3">
          {buttons.map((btn) => (
             <LocalButton
                key={btn}
                label={btn}
                onClick={handleButtonClick}
                className={`${getButtonClassName(btn)} ${btn === '0' ? 'col-span-2' : ''} h-16 sm:h-20`}
             />
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
