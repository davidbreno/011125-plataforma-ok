# 📤 Como Subir para o GitHub

## ✅ Passos já Concluídos

- ✅ Repositório Git inicializado
- ✅ Todos os arquivos adicionados
- ✅ Commit inicial criado
- ✅ .gitignore configurado (node_modules, .env, etc)

---

## 🚀 Próximos Passos

### 1️⃣ Crie um Repositório no GitHub

1. Acesse: https://github.com/new
2. Preencha:
   - **Repository name**: `clinic-management-system`
   - **Description**: Sistema de Gestão de Clínicas com Supabase e React
   - **Public** ou **Private** (sua escolha)
   - ❌ **NÃO** marque "Add a README file"
   - ❌ **NÃO** adicione .gitignore
   - ❌ **NÃO** adicione license
3. Clique em **Create repository**

---

### 2️⃣ Conecte ao Repositório Remoto

Copie e execute estes comandos no terminal (substitua `SEU-USUARIO` pelo seu usuário do GitHub):

```bash
cd "c:\Users\Dr. David Breno\Desktop\clinic-management-system-main\clinic-management-system-main"

git remote add origin https://github.com/SEU-USUARIO/clinic-management-system.git

git branch -M main

git push -u origin main
```

---

### 3️⃣ Autenticação

Quando pedir credenciais:

**Opção 1: Personal Access Token (Recomendado)**
1. Vá em: https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Dê um nome: `Clinic Management System`
4. Marque: `repo` (acesso total aos repositórios)
5. Clique em "Generate token"
6. **COPIE O TOKEN** (não vai aparecer de novo!)
7. Use o token como senha quando o Git pedir

**Opção 2: GitHub CLI**
```bash
gh auth login
```

---

## 📝 Comandos Futuros

### Adicionar Mudanças
```bash
git add .
git commit -m "Sua mensagem aqui"
git push
```

### Ver Status
```bash
git status
```

### Ver Histórico
```bash
git log --oneline
```

---

## 🎯 Estrutura do Projeto

```
clinic-management-system/
├── src/                    # Código fonte
│   ├── components/         # Componentes reutilizáveis
│   ├── contexts/           # Context API (Auth, Theme)
│   ├── pages/              # Páginas da aplicação
│   ├── supabase/           # Configuração Supabase
│   └── utils/              # Funções auxiliares
├── public/                 # Arquivos estáticos
├── GUIA-TEMAS.md          # Guia de personalização de temas
├── supabase-tables.sql    # Schema do banco de dados
└── package.json           # Dependências
```

---

## 🔒 Segurança

### ⚠️ IMPORTANTE: Nunca commite estes arquivos:

- ✅ `.env.local` (já no .gitignore)
- ✅ `.env` (já no .gitignore)
- ✅ `node_modules/` (já no .gitignore)

### 🔐 Suas credenciais Supabase estão em:
- `src/supabase/config.js` - **COMMIT SEM PROBLEMAS** (usa variáveis de ambiente)
- `.env.local` - **NÃO SERÁ COMMITADO** (tem as chaves reais)

---

## 📦 Recursos do Sistema

### ✨ Features Implementadas:
- ✅ Autenticação com Supabase (Login/Signup)
- ✅ Sistema de temas (4 temas personalizáveis)
- ✅ Gestão de pacientes
- ✅ Prescrições médicas
- ✅ Faturamento
- ✅ Tokens de atendimento
- ✅ Dashboard para médicos e recepcionistas

### 🎨 Temas Disponíveis:
1. **Bege Clássico** - Tema padrão quente
2. **Verde Menta** - Tema fresco e natural
3. **Azul Profissional** - Tema corporativo
4. **Dark Elegante** - Tema escuro moderno

---

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 + Vite
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS
- **Icons**: React Icons
- **Routing**: React Router v7

---

## 📱 Como Executar

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Renomeie env.example.txt para .env.local e preencha

# Executar servidor de desenvolvimento
npm run dev

# Acessar
http://localhost:5173
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 👨‍⚕️ Autor

**Dr. David Breno**
- Sistema desenvolvido para gestão de clínicas odontológicas
- Com migração de Firebase para Supabase para melhor performance

---

**🎉 Projeto pronto para deploy!**
