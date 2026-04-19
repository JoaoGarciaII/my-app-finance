import { createContext, useContext, useState } from 'react'
import { dark, light } from '../utils/theme'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true)
  const theme = isDark ? dark : light
  const toggleTheme = () => setIsDark(p => !p)
  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
