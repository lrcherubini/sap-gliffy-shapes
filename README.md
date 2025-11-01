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
git clone https://github.com/seu-usuario/sap-gliffy-shapes.git
cd sap-gliffy-shapes
```

2. Instale as dependências (se houver):
```bash
npm install
```

3. Certifique-se de que a pasta `assets` contém os arquivos do SAP BTP Solution Diagrams

## 🔧 Uso

### Extração e Organização Automática

Execute o script principal:

```bash
node extrair_e_organizar.js
```

O script irá:
1. Procurar arquivos XML em `assets/shape-libraries-and-editable-presets/draw.io/`
2. Extrair os ícones SVG de cada arquivo
3. Categorizar automaticamente baseado no nome/caminho
4. Priorizar tamanho M (ou L/S se M não estiver disponível)
5. Organizar em pastas com máximo de 30 ícones cada
6. Gerar índices para localização fácil

### Saída

Os ícones organizados serão salvos em `gliffy_libraries/` com:
- Pastas categorizadas com no máximo 30 ícones cada
- Arquivo `index.json` com metadados completos
- Arquivo `index.csv` para visualização em Excel

## 📊 Categorias de Ícones

O script organiza automaticamente os ícones nas seguintes categorias:

- **foundational**: Serviços fundamentais do SAP BTP
- **integration-suite**: API Management, Cloud Integration, Event Mesh
- **app-dev-automation**: SAP Build, Work Zone, Business Application Studio
- **data-analytics**: Analytics Cloud, HANA Cloud, Datasphere
- **ai**: AI Core, AI Launchpad, Document Information Extraction
- **btp-saas**: Aplicações SaaS no BTP
- **generic-icons**: Ícones genéricos (user, web, cloud, etc.)
- **sap-brands**: Logos SAP (Ariba, Concur, SuccessFactors, etc.)
- **essentials**: Elementos essenciais de diagramação
- **misc**: Outros ícones não categorizados

## 🎨 Importação no Gliffy

Para usar as bibliotecas no Gliffy:

1. Acesse seu diagrama no Gliffy
2. No menu lateral, clique em "More Shapes"
3. Selecione "Custom Library" > "Import Custom Library"
4. Faça upload de uma pasta de biblioteca (máx. 30 arquivos SVG)
5. Repita para cada biblioteca gerada
6. Os ícones estarão disponíveis na seção "Custom" do menu de shapes

## 📝 Configurações

Você pode ajustar as seguintes configurações no script:

```javascript
const MAX_ICONS_PER_LIBRARY = 30;  // Máximo de ícones por biblioteca
const OUTPUT_BASE_DIR = path.join(__dirname, 'gliffy_libraries');  // Diretório de saída
```

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

---

**Nota**: Este projeto não é afiliado oficialmente à SAP ou ao Gliffy. É uma ferramenta comunitária para facilitar o uso dos ícones SAP BTP em diagramas Gliffy.