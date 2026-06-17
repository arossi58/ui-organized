import { useState, useEffect } from 'react';
import { generatePaletteForColor } from '../utils/paletteGeneration';

export const usePaletteGeneration = (
  baseColors,
  numStops,
  mainStopIndex,
  colorMode,
  easingType,
  lightest,
  darkest,
  preservePerceptualBrightness
) => {
  const [palettes, setPalettes] = useState({});

  useEffect(() => {
    const newPalettes = {};
    baseColors.forEach(baseColorObj => {
      newPalettes[baseColorObj.id] = generatePaletteForColor(
        baseColorObj, numStops, mainStopIndex, colorMode, easingType, lightest, darkest, preservePerceptualBrightness
      );
    });
    setPalettes(newPalettes);
  }, [baseColors, numStops, mainStopIndex, colorMode, easingType, lightest, darkest, preservePerceptualBrightness]);

  return palettes;
};
