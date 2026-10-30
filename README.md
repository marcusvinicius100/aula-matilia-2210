# ⚡ OrçaZap Pro — Gerador de Orçamentos Comerciais & WhatsApp

> Micro-SaaS completo para autônomos, MEIs e prestadores de serviços criarem orçamentos profissionais em segundos, com envio direto para o WhatsApp do cliente, Chave PIX, QR Code automático e impressão em PDF padrão A4.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/marcusvinicius100/aula-matilia-2210)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/marcusvinicius100/aula-matilia-2210)

---

## 🎯 Por que este nicho é viável?
- **Público Gigantesco:** Eletricistas, encanadores, pintores, pedreiros, mecânicos, técnicos de TI, fotógrafos, designers e mais de 15 milhões de MEIs no Brasil.
- **Dor Real:** Perdem clientes por demorar para responder ou enviar orçamentos amadores em texto simples no WhatsApp ou sofrer no Excel.
- **Monetização Fácil:**
  - Modelo Freemium (grátis com marca d'água ou limite mensal; R$ 19,90/mês para uso ilimitado e logo própria).
  - Venda de templates personalizados ou serviços de cobrança integrada.

---

## ✨ Funcionalidades Principais

- ⚡ **Editor em Tempo Real:** Conforme você digita à esquerda, a folha comercial profissional (padrão A4) é gerada à direita instantaneamente.
- 💬 **Envio com 1 Clique no WhatsApp:** Gera uma mensagem comercial formatada com emojis, resumo de itens, prazos e chave PIX, abrindo o WhatsApp do cliente automaticamente.
- 📄 **Impressão e PDF Impecável:** Layout formatado com `@media print` para exportar em PDF de alta qualidade ou imprimir sem poluição visual.
- 📱 **QR Code PIX Automático:** O cliente escaneia o QR Code na folha ou copia a chave para pagar na hora.
- 💾 **Salvamento Local (LocalStorage):** Seus dados profissionais (nome, telefone, cidade e PIX) ficam salvos no navegador, sem precisar digitar tudo a cada novo orçamento.
- 🕒 **Histórico de Orçamentos:** Consulte orçamentos recentes emitidos para reutilizar ou verificar status.

---

## 🚀 Como Executar

### 1. Abrir Diretamente no Navegador
Basta abrir o arquivo [`index.html`](index.html) no seu navegador.

### 2. Rodar via Servidor Python Flask
```bash
pip install -r requirements.txt
python app.py
```
Acesse em: `http://localhost:5000`

---

## ☁️ Deploy na Vercel
O repositório já possui o `vercel.json` configurado. Basta conectar seu repositório do GitHub na Vercel para publicação automática.
