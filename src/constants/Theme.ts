import { MD3LightTheme } from 'react-native-paper';
import Colors from './Colors';

export const CustomTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.button,
    background: Colors.background,
    surface: Colors.inputBackground,
    text: Colors.textDark,
    onPrimary: Colors.buttonText,
  },
};
