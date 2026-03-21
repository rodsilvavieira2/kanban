import { useSettingsStore } from "../stores/settingsStore";
import { themes } from "../../shared/themes";

export const getThemeColor = (colorKey: string) => {
  const { themeName, isDarkMode } = useSettingsStore();
  const theme = themes.find((t) => t.name === themeName);
  
  if (!theme) return "#888888"; // Fallback
  
  const colors = isDarkMode ? theme.dark : theme.light;
  
  // Mapeia as chaves de cor para as propriedades do tema
  const colorMap: Record<string, string> = {
    "todo": colors.black,
    "in-progress": colors.blue,
    "completed": colors.green,
    "gray": colors.black,
    "blue": colors.blue,
    "green": colors.green,
    "red": colors.red,
    "yellow": colors.yellow,
  };
  
  return colorMap[colorKey] || colors.foreground;
};
