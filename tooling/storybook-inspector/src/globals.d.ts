// CSS imported as a text string (esbuild `.css: "text"` loader) so the manager
// entry can inject it as a single <style> tag.
declare module "*.css" {
  const styles: string;
  export default styles;
}
