import { IconProvider } from '@ui-organized/react';
import ColorPaletteGenerator from './ColorPaletteGenerator';

/**
 * Marketing-site entry for the Color Palette Generator tool.
 *
 * Fills the embedding panel (display:flex column with a definite height) and
 * lets the tool own its internal scrolling. Design tokens and DS component
 * stylesheets are loaded globally by the app entry, so nothing extra is
 * imported here.
 */
export default function ColorPaletteTool() {
  return (
    <div style={{ display: 'flex', flex: '1 1 auto', minHeight: 0, height: '100%', width: '100%' }}>
      <IconProvider library="lucide" style="outline" strokeAdjustment>
        <ColorPaletteGenerator collectionsView />
      </IconProvider>
    </div>
  );
}
