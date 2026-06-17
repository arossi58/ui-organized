// IBM Carbon Design System color palette (v11).
// Faithful published values — loaded verbatim as customStops.
//
// Carbon steps run 10, 20, …, 100 — represented here with namingSystem 'custom'
// and customIncrement 10 so the stop labels read 10…100.
//
// INVARIANT: every `stops` array MUST have exactly `numStops` (10) entries,
// ordered lightest -> darkest (10 -> 100). The generator only renders customStops
// as-is when stops.length === the collection's numStops.
export default {
  id: 'carbon',
  label: 'IBM Carbon',
  numStops: 10,
  mainStopIndex: 5, // step 60 — Carbon's core interactive shade
  namingSystem: 'custom',
  customIncrement: 10,
  colors: [
    { name: 'Blue',      stops: ['#edf5ff','#d0e2ff','#a6c8ff','#78a9ff','#4589ff','#0f62fe','#0043ce','#002d9c','#001d6c','#001141'] },
    { name: 'Cyan',      stops: ['#e5f6ff','#bae6ff','#82cfff','#33b1ff','#1192e8','#0072c3','#00539a','#003a6d','#012749','#061727'] },
    { name: 'Teal',      stops: ['#d9fbfb','#9ef0f0','#3ddbd9','#08bdba','#009d9a','#007d79','#005d5d','#004144','#022b30','#081a1c'] },
    { name: 'Green',     stops: ['#defbe6','#a7f0ba','#6fdc8c','#42be65','#24a148','#198038','#0e6027','#044317','#022d0d','#071908'] },
    { name: 'Cool Gray', stops: ['#f2f4f8','#dde1e6','#c1c7cd','#a2a9b0','#878d96','#697077','#4d5358','#343a3f','#21272a','#121619'] },
    { name: 'Gray',      stops: ['#f4f4f4','#e0e0e0','#c6c6c6','#a8a8a8','#8d8d8d','#6f6f6f','#525252','#393939','#262626','#161616'] },
    { name: 'Warm Gray', stops: ['#f7f3f2','#e5e0df','#cac5c4','#ada8a8','#8f8b8b','#726e6e','#565151','#3c3838','#272525','#171414'] },
    { name: 'Red',       stops: ['#fff1f1','#ffd7d9','#ffb3b8','#ff8389','#fa4d56','#da1e28','#a2191f','#750e13','#520408','#2d0709'] },
    { name: 'Magenta',   stops: ['#fff0f7','#ffd6e8','#ffafd2','#ff7eb6','#ee5396','#d02670','#9f1853','#740937','#510224','#2a0a18'] },
    { name: 'Purple',    stops: ['#f6f2ff','#e8daff','#d4bbff','#be95ff','#a56eff','#8a3ffc','#6929c4','#491d8b','#31135e','#1c0f30'] },
    { name: 'Orange',    stops: ['#fff2e8','#ffd9be','#ffb784','#ff832b','#eb6200','#ba4e00','#8a3800','#5e2900','#3e1a00','#231000'] },
    { name: 'Yellow',    stops: ['#fcf4d6','#fddc69','#f1c21b','#d2a106','#b28600','#8e6a00','#684e00','#483700','#302400','#1c1500'] },
  ],
};
