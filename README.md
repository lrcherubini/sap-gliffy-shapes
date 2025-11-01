# SAP Gliffy Shapes

Extrator e organizador de ícones SAP BTP para uso em bibliotecas customizadas do Gliffy.

## 📋 Sobre o Projeto

Este projeto automatiza a extração e organização dos ícones SVG do [SAP BTP Solution Diagrams](https://github.com/SAP/btp-solution-diagrams) para criar bibliotecas de shapes customizadas compatíveis com o Gliffy. Como o Gliffy tem uma limitação de 30 shapes por biblioteca customizada, o projeto organiza automaticamente os ícones em múltiplas bibliotecas categorizadas.

### Origem dos Assets

Os ícones e shapes utilizados neste projeto são provenientes do repositório oficial [SAP/btp-solution-diagrams](https://github.com/SAP/btp-solution-diagrams), mantido pela SAP para diagramas de soluções da SAP Business Technology Platform.

## 🚀 Funcionalidades

- **Extração Automatizada**: Extrai SVGs de arquivos XML da biblioteca Draw.io
- **Categorização Inteligente**: Organiza ícones por categoria temática (foundational, integration, AI, etc.)
- **Priorização de Tamanhos**: Seleciona automaticamente o melhor tamanho (M > L > S)
- **Divisão Automática**: Divide bibliotecas com mais de 30 ícones em múltiplas partes
- **Índice Completo**: Gera índices em JSON e CSV para fácil localização dos ícones
- **Catálogo Visual**: Gera catálogo visual em Markdown (`ICON_CATALOG.md` e `ICON_GALLERY.md`)
- **Extração SVG Avançada**: Suporte a múltiplos formatos de SVG embedados
- **Validação de Qualidade**: Verifica integridade dos SVGs extraídos

## 📁 Estrutura do Projeto

```
sap-gliffy-shapes/
├── assets/                              # Assets do SAP BTP Solution Diagrams
│   └── shape-libraries-and-editable-presets/
│       └── draw.io/                     # Bibliotecas XML do Draw.io
├── gliffy_libraries/                    # Saída organizada (gerada)
│   ├── foundational-01/                 # Primeira parte dos ícones fundamentais
│   ├── foundational-02/                 # Segunda parte (se necessário)
│   ├── integration-suite/               # Ícones de integração
│   ├── app-dev-automation/              # Build, Work Zone, etc.
│   ├── data-analytics/                  # Analytics, HANA, Datasphere
│   ├── ai/                             # Serviços de IA
│   ├── generic-icons/                  # Ícones genéricos
│   ├── index.json                      # Índice completo em JSON
│   └── index.csv                        # Índice em CSV (Excel)
├── extrair_e_organizar.js              # Script principal
├── package.json
└── README.md
```

## 🛠️ Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/lrcherubini/sap-gliffy-shapes.git
cd sap-gliffy-shapes
```

2. Instale as dependências (se houver):
```bash
npm install
```

3. Certifique-se de que a pasta `assets` contém os arquivos do SAP BTP Solution Diagrams

## 🔧 Uso

### Scripts Disponíveis

1. **Extração e Organização** (`extrair_e_organizar.js`):
```bash
node extrair_e_organizar.js
```
- Processa arquivos XML em `assets/shape-libraries-and-editable-presets/draw.io/`
- Extrai e categoriza os ícones SVG
- Organiza em bibliotecas de até 30 ícones
- Gera índices JSON e CSV

2. **Extração SVG Bruta** (`extrair_svgs.js`):
```bash
node extrair_svgs.js
```
- Extrai todos os SVGs em sua forma original
- Salva em `icones_para_gliffy_extraidos/`
- Útil para debug ou análise manual

3. **Geração de Catálogo** (`gerar_catalogo.js`):
```bash
node gerar_catalogo.js
```
- Gera `ICON_CATALOG.md` com listagem categorizada
- Cria `ICON_GALLERY.md` com preview visual dos ícones
- Inclui estatísticas e metadados

### Arquivos de Saída

O processo gera os seguintes arquivos:

1. **Bibliotecas Gliffy** (`gliffy_libraries/`):
   - Pastas categorizadas (máx. 30 ícones)
   - SVGs otimizados para Gliffy

2. **Índices**:
   - `index.json`: Metadados completos em JSON
   - `index.csv`: Planilha para Excel/visualização

3. **Catálogos**:
   - `ICON_CATALOG.md`: Lista categorizada
   - `ICON_GALLERY.md`: Galeria visual

## 📊 Categorias de Ícones

O script organiza automaticamente os ícones nas seguintes categorias:

- 🔧 **foundational**: Serviços fundamentais do SAP BTP
- 🔗 **integration-suite**: API Management, Cloud Integration, Event Mesh
- ⚙️ **app-dev-automation**: SAP Build, Work Zone, Business Application Studio
- 📊 **data-analytics**: Analytics Cloud, HANA Cloud, Datasphere
- 🤖 **ai**: AI Core, AI Launchpad, Document Information Extraction
- ☁️ **btp-saas**: Aplicações SaaS no BTP
- 📦 **generic-icons**: Ícones genéricos (user, web, cloud, etc.)
- 💙 **sap-brands**: Logos SAP (Ariba, Concur, SuccessFactors, etc.)
- ✨ **essentials**: Elementos essenciais de diagramação
- 🔐 **security-identity**: Serviços de segurança e identidade
- 🌐 **connectivity**: Conectividade e integração
- 👁️ **observability**: Monitoramento e observabilidade
- 🚀 **devops**: Ferramentas e serviços DevOps
- 📌 **misc**: Outros ícones não categorizados

### Exemplos de Diagramas

A pasta `assets/editable-diagram-examples/` contém exemplos práticos de diagramas utilizando os ícones:

- SAP Build Process Automation
- SAP Build Work Zone
- SAP Cloud Identity Services
- SAP Private Link Service
- SAP Task Center
- E muito mais

## 🎨 Importação no Gliffy

Para usar as bibliotecas no Gliffy:

1. Acesse seu diagrama no Gliffy
2. No menu lateral, clique em "More Shapes"
3. Selecione "Custom Library" > "Import Custom Library"
4. Faça upload de uma pasta de biblioteca (máx. 30 arquivos SVG)
5. Repita para cada biblioteca gerada
6. Os ícones estarão disponíveis na seção "Custom" do menu de shapes

## 📝 Configurações

### Configurações Principais

Ajuste as configurações nos scripts conforme necessário:

1. **extrair_e_organizar.js**:
```javascript
const MAX_ICONS_PER_LIBRARY = 30;  // Máximo de ícones por biblioteca
const OUTPUT_BASE_DIR = path.join(__dirname, 'gliffy_libraries');  // Diretório de saída
```

2. **extrair_svgs.js**:
```javascript
const outputDir = path.join(__dirname, 'icones_para_gliffy_extraidos');  // Diretório SVGs brutos
```

3. **gerar_catalogo.js**:
```javascript
const LIBRARIES_DIR = path.join(__dirname, 'gliffy_libraries');  // Diretório das bibliotecas
const OUTPUT_FILE = path.join(__dirname, 'ICON_CATALOG.md');  // Arquivo de catálogo
```

### Considerações de Uso

- **Tamanho das Bibliotecas**: O limite de 30 ícones é uma restrição do Gliffy
- **Formatos Suportados**: SVG embedado em XML ou base64
- **Prioridade de Tamanhos**: M > L > S para melhor visualização
- **Nomes de Arquivos**: Automaticamente sanitizados para compatibilidade

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto utiliza assets do [SAP BTP Solution Diagrams](https://github.com/SAP/btp-solution-diagrams), que está licenciado sob Apache License 2.0.

O código de extração e organização deste projeto também está disponível sob a mesma licença Apache 2.0.

## 🙏 Agradecimentos

- [SAP](https://github.com/SAP) pelos ícones e shapes do BTP Solution Diagrams
- Comunidade SAP BTP pela documentação e guidelines de diagramação

## 🔄 Status do Projeto

![Status](https://img.shields.io/badge/status-active-success.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0-brightgreen)
![License](https://img.shields.io/badge/license-Apache%202.0-blue)
![Last Update](https://img.shields.io/badge/última%20atualização-Novembro%202025-blue)

### Recursos Adicionais

- 📚 [ICON_CATALOG.md](ICON_CATALOG.md): Catálogo detalhado de ícones
- 🖼️ [ICON_GALLERY.md](ICON_GALLERY.md): Galeria visual de ícones
- 📋 [assets/README.md](assets/README.md): Documentação dos assets originais
- 🎨 [shape-libraries-and-editable-presets/README.md](assets/shape-libraries-and-editable-presets/README.md): Guia das bibliotecas
- 🔍 [gliffy_libraries/index.csv](gliffy_libraries/index.csv): Índice pesquisável

---

**Nota**: Este projeto não é afiliado oficialmente à SAP ou ao Gliffy. É uma ferramenta comunitária para facilitar o uso dos ícones SAP BTP em diagramas Gliffy. 

**Data da última atualização**: Novembro 2025