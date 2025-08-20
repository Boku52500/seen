import React, { useState } from 'react';
import { Slider } from './ui/slider';

export function TestSlider() {
  const [value, setValue] = useState([50, 80]);

  return (
    <div className="p-8 bg-white">
      <h2 className="text-xl font-bold mb-4">Slider Test</h2>
      <div className="space-y-4">
        <Slider
          value={value}
          onValueChange={setValue}
          max={100}
          min={0}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between">
          <span>Min: {value[0]}</span>
          <span>Max: {value[1]}</span>
        </div>
      </div>
    </div>
  );
}
