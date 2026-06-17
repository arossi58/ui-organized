import iconLists from "./icon-lists.json";

export const PRESET_SIZES = [12, 16, 20, 24, 32, 40, 48, 64];

export const ICON_LIBRARIES = {
  lucide: {
    name: "Lucide",
    desc: `${iconLists.lucide.length} icons`,
    fetchList: async () => iconLists.lucide,
    fetchSvg: async (n) => (await fetch(`https://cdn.jsdelivr.net/npm/lucide-static@1.7.0/icons/${n}.svg`)).text(),
  },
  tabler: {
    name: "Tabler",
    desc: `${iconLists.tabler.length} icons`,
    fetchList: async () => iconLists.tabler,
    fetchSvg: async (n) => (await fetch(`https://cdn.jsdelivr.net/npm/@tabler/icons@3.40.0/icons/outline/${n}.svg`)).text(),
  },
  heroicons: {
    name: "Heroicons",
    desc: `${iconLists.heroicons.length} icons`,
    fetchList: async () => iconLists.heroicons,
    fetchSvg: async (n) => (await fetch(`https://cdn.jsdelivr.net/npm/heroicons@2.2.0/24/outline/${n}.svg`)).text(),
  },
};
