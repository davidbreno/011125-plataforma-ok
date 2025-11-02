import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

const themes = {
  'bege-classico': {
    name: 'Bege Clássico',
    colors: {
      primary: '#4fd8d5',
      'primary-hover': '#3bc4c1',
      secondary: '#92b1c5',
      accent: '#8b6f47',
      bg: '#faf8f6',
      'bg-secondary': '#f5f2ef',
      surface: '#ffffff',
      text: '#ffffff',
      'text-light': '#b0b0b0',
      border: '#92b1c5',
      success: '#4ade80',
      warning: '#fbbf24',
      error: '#ef4444'
    }
  },
  'verde-menta': {
    name: 'Verde Menta',
    colors: {
      primary: '#10b981',
      'primary-hover': '#059669',
      secondary: '#d1fae5',
      accent: '#047857',
      bg: '#f0fdf4',
      'bg-secondary': '#dcfce7',
      surface: '#ffffff',
      text: '#064e3b',
      'text-light': '#6b7280',
      border: '#a7f3d0',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444'
    }
  },
  'azul-profissional': {
    name: 'Azul Profissional',
    colors: {
      primary: '#3b82f6',
      'primary-hover': '#2563eb',
      secondary: '#dbeafe',
      accent: '#1e40af',
      bg: '#f8fafc',
      'bg-secondary': '#f1f5f9',
      surface: '#ffffff',
      text: '#1e293b',
      'text-light': '#64748b',
      border: '#cbd5e1',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    }
  },
  'dark-elegante': {
    name: 'Dark Elegante',
    colors: {
      primary: '#0f498fff',
      'primary-hover': '#3b82f6',
      secondary: '#42587dff',
      accent: '#053771ff',
      bg: '#111827',
      'bg-secondary': '#1f2937',
      surface: '#1f2937',
      text: '#001f3dff',
      'text-light': '#00378aff',
      border: '#374151',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171'
    }
  }
}

const fonts = {
  'sans-serif': {
    name: 'Sans Serif (Padrão)',
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  'serif': {
    name: 'Serif (Elegante)',
    family: 'Georgia, Cambria, "Times New Roman", Times, serif'
  }
}

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('theme') || 'bege-classico'
  })
  
  const [currentFont, setCurrentFont] = useState(() => {
    return localStorage.getItem('font') || 'sans-serif'
  })
  
  const [sidebarFixed, setSidebarFixed] = useState(() => {
    const saved = localStorage.getItem('sidebarFixed')
    return saved !== null ? saved === 'true' : true
  })

  useEffect(() => {
    const theme = themes[currentTheme]
    const font = fonts[currentFont]
    
    if (theme) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--color-${key}`, value)
      })
    }
    
    if (font) {
      document.documentElement.style.setProperty('--font-family', font.family)
    }
    
    localStorage.setItem('theme', currentTheme)
    localStorage.setItem('font', currentFont)
    localStorage.setItem('sidebarFixed', sidebarFixed.toString())
  }, [currentTheme, currentFont, sidebarFixed])

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName)
    }
  }

  const changeFont = (fontName) => {
    if (fonts[fontName]) {
      setCurrentFont(fontName)
    }
  }

  const toggleSidebar = () => {
    setSidebarFixed(prev => !prev)
  }

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      currentFont,
      sidebarFixed,
      themes,
      fonts,
      changeTheme,
      changeFont,
      toggleSidebar
    }}>
      {children}
    </ThemeContext.Provider>
  )
}
