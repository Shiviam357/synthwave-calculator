
import React, { useState } from 'react';
import Button from './components/Button';

const App: React.FC = () => {
  const [currentValue, setCurrentValue] = useState<string>('0');
  const [operator, setOperator] = useState<string | null>(null);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [overwrite, setOverwrite] = useState<boolean>(true);

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
            setCurrentValue(displayResult);
            setPreviousValue(null);
            setOperator(null);
            setOverwrite(true);
          }
          break;
      }
    }
  };

  const getButtonClassName = (label: string): string => {
    const baseClasses = "rounded-2xl flex items-center justify-center text-3xl font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 active:translate-y-1";
    
    if (["/", "*", "-", "+", "="].includes(label)) {
      return `${baseClasses} bg-fuchsia-600 hover:bg-fuchsia-500 text-white focus:ring-fuchsia-400 border-b-4 border-fuchsia-800 active:border-b-0`;
    }
    if (["AC"].includes(label)) {
      return `${baseClasses} bg-purple-800 hover:bg-purple-700 text-cyan-300 focus:ring-purple-500 border-b-4 border-purple-900 active:border-b-0`;
    }
    return `${baseClasses} bg-slate-800 hover:bg-slate-700 text-fuchsia-400 focus:ring-fuchsia-500 border-b-4 border-slate-900 active:border-b-0`;
  };

  const buttons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '0', '.', '=', '+',
    'AC'
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xs sm:max-w-sm mx-auto bg-slate-900 rounded-3xl p-4 sm:p-6 space-y-4 shadow-2xl border-2 border-purple-500/50 shadow-purple-500/20">
        {/* Display */}
        <div className="bg-slate-900 text-cyan-300 text-right p-4 rounded-lg overflow-hidden">
          <p className="text-5xl sm:text-6xl font-light break-all" style={{ minHeight: '64px' }}>
            {currentValue === 'Infinity' ? 'Error' : currentValue}
          </p>
        </div>
        
        {/* Keypad */}
        <div className="grid grid-cols-4 gap-3">
          {buttons.map((btn) => (
             <Button
                key={btn}
                label={btn}
                onClick={handleButtonClick}
                className={`${getButtonClassName(btn)} ${btn === 'AC' ? 'col-span-4' : ''} h-16 sm:h-20`}
             />
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
