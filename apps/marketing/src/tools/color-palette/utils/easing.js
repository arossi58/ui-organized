export const easeLinear = (t) => t;

export const easeInQuad = (t) => t * t;

export const easeOutQuad = (t) => t * (2 - t);

export const easeInOutQuad = (t) => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

export const easeInCubic = (t) => t * t * t;

export const easeOutCubic = (t) => {
  const t1 = t - 1;
  return t1 * t1 * t1 + 1;
};

export const easeInOutCubic = (t) => {
  return t < 0.5
    ? 4 * t * t * t
    : 1 + (t - 1) * (2 * (t - 1)) * (2 * (t - 1));
};

export const applyEasing = (progress, easingType) => {
  switch (easingType) {
    case 'linear': return easeLinear(progress);
    case 'ease-in': return easeInQuad(progress);
    case 'ease-out': return easeOutQuad(progress);
    case 'ease-in-out': return easeInOutQuad(progress);
    case 'ease-in-cubic': return easeInCubic(progress);
    case 'ease-out-cubic': return easeOutCubic(progress);
    case 'ease-in-out-cubic': return easeInOutCubic(progress);
    default: return easeInOutQuad(progress);
  }
};
