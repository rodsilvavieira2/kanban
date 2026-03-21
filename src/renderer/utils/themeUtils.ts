import { ThemeColors } from "../../shared/themes";

export const getThemeColor = (colorKey: string, colors: ThemeColors) => {
  // Mapeia as chaves de cor para as propriedades do tema
  const colorMap: Record<string, string> = {
    "todo":        colors.yellow,
    "in-progress": colors.blue,
    "completed":   colors.green,
    "gray":        colors.foreground,
    "blue":        colors.blue,
    "green":       colors.green,
    "red":         colors.red,
    "yellow":      colors.yellow,
    "magenta":     colors.magenta,
    "cyan":        colors.cyan,
  };
  
  return colorMap[colorKey] || colors.foreground;
};
