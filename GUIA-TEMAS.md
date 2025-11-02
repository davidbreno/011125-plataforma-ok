# 🎨 Guia de Personalização de Temas

## 📍 Localização dos Arquivos

### Arquivo Principal de Temas
```
src/contexts/ThemeContext.jsx
```
Este arquivo contém **TODOS** os temas e suas cores.

---

## 🛠️ Como Modificar as Cores

### 1️⃣ Abra o arquivo ThemeContext.jsx

Navegue até: `src/contexts/ThemeContext.jsx`

### 2️⃣ Localize o objeto `themes`

Procure por esta seção (linha ~7):

```javascript
const themes = {
  'bege-classico': { ... },
  'verde-menta': { ... },
  'azul-profissional': { ... },
  'dark-elegante': { ... }
}
```

---

## 🎨 Estrutura de Cada Tema

Cada tema tem **13 cores** que controlam toda a interface:

```javascript
'nome-do-tema': {
  name: 'Nome Exibido',  // Nome que aparece na UI
  colors: {
    primary: '#hex',           // Cor principal (botões, links)
    'primary-hover': '#hex',   // Cor ao passar mouse nos botões
    secondary: '#hex',         // Cor secundária (badges, cards)
    accent: '#hex',            // Cor de destaque (ícones, detalhes)
    bg: '#hex',                // Fundo principal da página
    'bg-secondary': '#hex',    // Fundo alternativo (seções)
    surface: '#hex',           // Fundo dos cards/painéis
    text: '#hex',              // Cor do texto principal
    'text-light': '#hex',      // Cor do texto secundário/legendas
    border: '#hex',            // Cor das bordas
    success: '#hex',           // Cor de sucesso (verde)
    warning: '#hex',           // Cor de aviso (amarelo)
    error: '#hex'              // Cor de erro (vermelho)
  }
}
```

---

## 📋 Temas Disponíveis

### 🟤 Bege Clássico (Padrão)
```javascript
'bege-classico': {
  name: 'Bege Clássico',
  colors: {
    primary: '#c88654',        // Laranja/marrom quente
    'primary-hover': '#b57544',
    secondary: '#e8d5c4',      // Bege rosado
    accent: '#8b6f47',         // Marrom médio
    bg: '#3f3525ff',             // Bege muito claro
    'bg-secondary': '#f5f2ef', // Bege claro
    surface: '#ffffff',        // Branco
    text: '#4a4a4a',           // Cinza escuro
    'text-light': '#8b8680',   // Cinza médio
    border: '#e8d5c4',         // Bege rosado
    success: '#4ade80',        // Verde
    warning: '#fbbf24',        // Amarelo
    error: '#ef4444'           // Vermelho
  }
}
```

### 🟢 Verde Menta
```javascript
'verde-menta': {
  name: 'Verde Menta',
  colors: {
    primary: '#10b981',        // Verde esmeralda
    'primary-hover': '#059669',
    secondary: '#d1fae5',      // Verde claro
    accent: '#047857',         // Verde escuro
    bg: '#f0fdf4',             // Verde muito claro
    'bg-secondary': '#dcfce7', // Verde claro
    surface: '#ffffff',        // Branco
    text: '#064e3b',           // Verde muito escuro
    'text-light': '#6b7280',   // Cinza
    border: '#a7f3d0',         // Verde pastel
    success: '#22c55e',        // Verde vivo
    warning: '#f59e0b',        // Laranja
    error: '#ef4444'           // Vermelho
  }
}
```

### 🔵 Azul Profissional
```javascript
'azul-profissional': {
  name: 'Azul Profissional',
  colors: {
    primary: '#3b82f6',        // Azul vivo
    'primary-hover': '#2563eb',
    secondary: '#dbeafe',      // Azul claro
    accent: '#1e40af',         // Azul escuro
    bg: '#f8fafc',             // Cinza muito claro
    'bg-secondary': '#f1f5f9', // Cinza claro
    surface: '#ffffff',        // Branco
    text: '#1e293b',           // Cinza muito escuro
    'text-light': '#64748b',   // Cinza médio
    border: '#cbd5e1',         // Cinza claro
    success: '#10b981',        // Verde
    warning: '#f59e0b',        // Laranja
    error: '#ef4444'           // Vermelho
  }
}
```

### ⚫ Dark Elegante
```javascript
'dark-elegante': {
  name: 'Dark Elegante',
  colors: {
    primary: '#60a5fa',        // Azul claro
    'primary-hover': '#3b82f6',
    secondary: '#374151',      // Cinza escuro
    accent: '#93c5fd',         // Azul pastel
    bg: '#111827',             // Preto azulado
    'bg-secondary': '#1f2937', // Cinza muito escuro
    surface: '#1f2937',        // Cinza muito escuro
    text: '#f9fafb',           // Branco
    'text-light': '#d1d5db',   // Cinza claro
    border: '#374151',         // Cinza escuro
    success: '#34d399',        // Verde claro
    warning: '#fbbf24',        // Amarelo
    error: '#f87171'           // Vermelho claro
  }
}
```

---

## ➕ Como Adicionar um Novo Tema

### Passo 1: Adicione no objeto `themes`

```javascript
const themes = {
  'bege-classico': { ... },
  'verde-menta': { ... },
  'azul-profissional': { ... },
  'dark-elegante': { ... },
  
  // 🆕 SEU NOVO TEMA AQUI
  'meu-tema-personalizado': {
    name: 'Meu Tema',
    colors: {
      primary: '#ff6b6b',
      'primary-hover': '#ee5a5a',
      secondary: '#ffe66d',
      accent: '#4ecdc4',
      bg: '#f7fff7',
      'bg-secondary': '#e8f5e8',
      surface: '#ffffff',
      text: '#2d3436',
      'text-light': '#636e72',
      border: '#dfe6e9',
      success: '#55efc4',
      warning: '#fdcb6e',
      error: '#d63031'
    }
  }
}
```

### Passo 2: Pronto! ✅

O tema aparecerá automaticamente na página de Configurações.

---

## 🔄 Alterar o Tema Padrão

No arquivo `ThemeContext.jsx`, procure por (linha ~75):

```javascript
const [currentTheme, setCurrentTheme] = useState(() => {
  return localStorage.getItem('theme') || 'bege-classico'  // ← Altere aqui
})
```

Troque `'bege-classico'` por qualquer chave de tema:
- `'verde-menta'`
- `'azul-profissional'`
- `'dark-elegante'`
- `'meu-tema-personalizado'`

---

## 🎨 Dicas de Cores

### Para Temas Claros:
- **bg**: #f0f0f0 até #ffffff (cinza/branco claro)
- **text**: #000000 até #4a4a4a (preto/cinza escuro)
- **surface**: #ffffff (branco para cards)

### Para Temas Escuros:
- **bg**: #000000 até #2a2a2a (preto/cinza escuro)
- **text**: #e0e0e0 até #ffffff (cinza claro/branco)
- **surface**: #1a1a1a até #333333 (cinza médio para cards)

### Contraste Recomendado:
- **Texto principal**: Contraste mínimo de 7:1 com o fundo
- **Texto secundário**: Contraste mínimo de 4.5:1 com o fundo
- **Botões**: Cores vibrantes que se destacam

---

## 🔧 Onde as Cores São Usadas

### CSS Variables (Variáveis CSS)
As cores são aplicadas como variáveis CSS no documento:

```css
--color-primary
--color-primary-hover
--color-secondary
--color-accent
--color-bg
--color-bg-secondary
--color-surface
--color-text
--color-text-light
--color-border
--color-success
--color-warning
--color-error
```

### Uso nos Componentes
Os componentes usam estas variáveis:

```jsx
<div style={{ backgroundColor: 'var(--color-bg)' }}>
  <h1 style={{ color: 'var(--color-text)' }}>Título</h1>
  <button style={{ backgroundColor: 'var(--color-primary)' }}>Botão</button>
</div>
```

---

## 📱 Testando seu Tema

1. Salve as alterações em `ThemeContext.jsx`
2. Acesse: http://localhost:5174
3. Vá em **Configurações** (menu lateral)
4. Clique no seu tema na seção **Aparência**
5. O tema é aplicado instantaneamente! ✨

---

## 🎓 Recursos Úteis

### Ferramentas de Cores:
- **Coolors.co** - Gerador de paletas
- **Adobe Color** - Roda de cores
- **Contrast Checker** - Verificar contraste WCAG

### Conversão de Cores:
- RGB para HEX: https://www.rapidtables.com/convert/color/rgb-to-hex.html
- HSL para HEX: https://www.rapidtables.com/convert/color/hsl-to-hex.html

---

## ❓ Dúvidas Comuns

**P: Posso ter mais de 4 temas?**
R: Sim! Adicione quantos quiser no objeto `themes`.

**P: Como mudar a fonte também?**
R: Edite o objeto `fonts` no mesmo arquivo (linha ~65).

**P: As mudanças não aparecem?**
R: Limpe o cache do navegador (Ctrl+Shift+R) ou localStorage.

**P: Posso ter temas por usuário?**
R: Sim! O tema é salvo no localStorage de cada navegador.

---

**Feito com 💜 para facilitar a personalização do sistema!**
