const fs = require('fs');
const path = require('path');

// Configurações
const LIBRARIES_DIR = path.join(__dirname, 'gliffy_libraries');
const OUTPUT_FILE = path.join(__dirname, 'ICON_CATALOG.md');
const ICONS_PER_ROW = 5; // Número de ícones por linha na tabela

/**
 * Lê o arquivo de índice JSON
 */
function readIndex() {
  const indexPath = path.join(LIBRARIES_DIR, 'index.json');
  
  if (!fs.existsSync(indexPath)) {
    console.error('Erro: index.json não encontrado. Execute primeiro o script de extração.');
    return null;
  }
  
  return JSON.parse(fs.readFileSync(indexPath, 'utf8'));
}

/**
 * Agrupa ícones por categoria
 */
function groupIconsByCategory(icons) {
  const grouped = {};
  
  icons.forEach(icon => {
    if (!grouped[icon.category]) {
      grouped[icon.category] = [];
    }
    grouped[icon.category].push(icon);
  });
  
  // Ordena ícones dentro de cada categoria
  Object.keys(grouped).forEach(category => {
    grouped[category].sort((a, b) => a.title.localeCompare(b.title));
  });
  
  return grouped;
}

/**
 * Converte SVG para base64 data URI
 */
function svgToDataUri(svgPath) {
  try {
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    const base64 = Buffer.from(svgContent).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  } catch (e) {
    console.warn(`Aviso: Não foi possível ler ${svgPath}`);
    return null;
  }
}

/**
 * Gera o nome formatado da categoria
 */
function formatCategoryName(category) {
  const categoryNames = {
    'foundational': '🔧 Foundational Services',
    'integration-suite': '🔗 Integration Suite',
    'app-dev-automation': '⚙️ App Development & Automation',
    'data-analytics': '📊 Data & Analytics',
    'ai': '🤖 AI Services',
    'btp-saas': '☁️ BTP SaaS',
    'generic-icons': '📦 Generic Icons',
    'sap-brands': '💙 SAP Brands',
    'essentials': '✨ Essentials',
    'security-identity': '🔐 Security & Identity',
    'connectivity': '🌐 Connectivity',
    'observability': '👁️ Observability',
    'devops': '🚀 DevOps',
    'misc': '📌 Miscellaneous'
  };
  
  return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

/**
 * Gera tabela de ícones em Markdown
 */
function generateIconTable(icons, librariesDir) {
  let table = '';
  const rows = Math.ceil(icons.length / ICONS_PER_ROW);
  
  for (let row = 0; row < rows; row++) {
    // Linha de imagens
    let imageRow = '|';
    let nameRow = '|';
    let separatorRow = '|';
    
    for (let col = 0; col < ICONS_PER_ROW; col++) {
      const index = row * ICONS_PER_ROW + col;
      
      if (index < icons.length) {
        const icon = icons[index];
        const svgPath = path.join(librariesDir, icon.path);
        
        // Usar caminho relativo para o SVG
        const relativePath = `./${path.relative(__dirname, svgPath).replace(/\\/g, '/')}`;
        
        // Adiciona a imagem
        imageRow += ` <img src="${relativePath}" width="48" height="48" alt="${icon.title}"/> |`;
        
        // Adiciona o nome (truncado se muito longo)
        const displayName = icon.file.replace('.svg', '');
        const truncatedName = displayName.length > 20 
          ? displayName.substring(0, 17) + '...' 
          : displayName;
        nameRow += ` \`${truncatedName}\` |`;
        
        separatorRow += ' :---: |';
      } else {
        // Células vazias
        imageRow += ' |';
        nameRow += ' |';
        separatorRow += ' :---: |';
      }
    }
    
    // Adiciona as linhas à tabela
    if (row === 0) {
      table += imageRow + '\n';
      table += separatorRow + '\n';
    } else {
      table += imageRow + '\n';
    }
    table += nameRow + '\n';
  }
  
  return table;
}

/**
 * Gera lista simples de ícones (alternativa à tabela)
 */
function generateIconList(icons, librariesDir) {
  let list = '';
  
  icons.forEach(icon => {
    const relativePath = `./${path.relative(__dirname, path.join(librariesDir, icon.path)).replace(/\\/g, '/')}`;
    const displayName = icon.file.replace('.svg', '');
    
    // Formato: imagem inline + nome
    list += `- <img src="${relativePath}" width="24" height="24" alt="${icon.title}" style="vertical-align: middle"/> **${displayName}**`;
    
    // Adiciona informações extras se disponíveis
    if (icon.title !== displayName) {
      list += ` _(${icon.title})_`;
    }
    if (icon.size && icon.size !== 'default') {
      list += ` [${icon.size}]`;
    }
    
    list += '\n';
  });
  
  return list;
}

/**
 * Gera o conteúdo completo do catálogo
 */
function generateCatalog(indexData, useTable = true) {
  const grouped = groupIconsByCategory(indexData);
  const categories = Object.keys(grouped).sort();
  
  let markdown = '# 📚 SAP BTP Icons Catalog for Gliffy\n\n';
  markdown += `> Catálogo visual completo dos ${indexData.length} ícones SAP BTP organizados para uso no Gliffy\n\n`;
  
  // Adiciona data de geração
  markdown += `_Gerado em: ${new Date().toLocaleString('pt-BR')}_\n\n`;
  
  // Adiciona sumário
  markdown += '## 📑 Índice\n\n';
  categories.forEach(category => {
    const count = grouped[category].length;
    const formattedName = formatCategoryName(category);
    const anchor = category.toLowerCase().replace(/[^a-z0-9]/g, '-');
    markdown += `- [${formattedName}](#${anchor}) (${count} ícones)\n`;
  });
  markdown += '\n---\n\n';
  
  // Adiciona seção de instruções
  markdown += '## 🎯 Como Usar\n\n';
  markdown += '1. **No Gliffy**: Importe cada pasta de biblioteca (máx. 30 ícones) como Custom Library\n';
  markdown += '2. **Localização Rápida**: Use `Ctrl+F` para buscar ícones específicos neste catálogo\n';
  markdown += '3. **Download**: Clique com o botão direito em qualquer ícone para baixar o SVG individual\n\n';
  markdown += '---\n\n';
  
  // Estatísticas
  markdown += '## 📊 Estatísticas\n\n';
  markdown += `| Categoria | Quantidade | Bibliotecas Gliffy |\n`;
  markdown += `| :--- | :---: | :---: |\n`;
  
  let totalLibraries = 0;
  categories.forEach(category => {
    const count = grouped[category].length;
    const libraries = Math.ceil(count / 30);
    totalLibraries += libraries;
    markdown += `| ${formatCategoryName(category)} | ${count} | ${libraries} |\n`;
  });
  
  markdown += `| **Total** | **${indexData.length}** | **${totalLibraries}** |\n\n`;
  markdown += '---\n\n';
  
  // Adiciona cada categoria
  categories.forEach(category => {
    const icons = grouped[category];
    const formattedName = formatCategoryName(category);
    const anchor = category.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    markdown += `## <a id="${anchor}"></a>${formattedName}\n\n`;
    markdown += `_${icons.length} ícones disponíveis_\n\n`;
    
    // Escolhe entre tabela ou lista
    if (useTable && icons.length <= 100) {
      // Usa tabela para até 100 ícones (fica mais visual)
      markdown += generateIconTable(icons, LIBRARIES_DIR);
    } else {
      // Usa lista para muitos ícones (mais compacto)
      markdown += '<details>\n';
      markdown += `<summary>Clique para expandir lista de ${icons.length} ícones</summary>\n\n`;
      markdown += generateIconList(icons, LIBRARIES_DIR);
      markdown += '\n</details>\n';
    }
    
    markdown += '\n---\n\n';
  });
  
  // Adiciona rodapé
  markdown += '## 📝 Notas\n\n';
  markdown += '- **Fonte**: Ícones extraídos do [SAP BTP Solution Diagrams](https://github.com/SAP/btp-solution-diagrams)\n';
  markdown += '- **Licença**: Apache 2.0 (conforme projeto original)\n';
  markdown += '- **Limitação Gliffy**: Máximo de 30 ícones por biblioteca customizada\n';
  markdown += '- **Organização**: Ícones agrupados por categoria e priorizando tamanho M\n\n';
  
  markdown += '---\n\n';
  markdown += '_Este catálogo foi gerado automaticamente pelo script `gerar_catalogo.js`_\n';
  
  return markdown;
}

/**
 * Gera versão alternativa com links para GitHub
 */
function generateGitHubCatalog(indexData) {
  const grouped = groupIconsByCategory(indexData);
  const categories = Object.keys(grouped).sort();
  
  let markdown = '# 📚 SAP BTP Icons Catalog for Gliffy\n\n';
  markdown += `> Catálogo visual de ${indexData.length} ícones SAP BTP para Gliffy\n\n`;
  
  // Versão simplificada com grade de ícones
  markdown += '## 🎨 Galeria Visual\n\n';
  
  categories.forEach(category => {
    const icons = grouped[category];
    const formattedName = formatCategoryName(category);
    
    markdown += `### ${formattedName}\n\n`;
    
    // Grade de ícones usando tabela HTML (melhor compatibilidade)
    markdown += '<table>\n<tr>\n';
    
    icons.forEach((icon, index) => {
      if (index > 0 && index % ICONS_PER_ROW === 0) {
        markdown += '</tr>\n<tr>\n';
      }
      
      const relativePath = `./gliffy_libraries/${icon.path}`;
      const displayName = icon.file.replace('.svg', '');
      
      markdown += '<td align="center" width="150">\n';
      markdown += `  <img src="${relativePath}" width="64" height="64" alt="${icon.title}"/><br/>\n`;
      markdown += `  <sub><b>${displayName}</b></sub>\n`;
      markdown += '</td>\n';
    });
    
    // Preenche células vazias se necessário
    const remainder = icons.length % ICONS_PER_ROW;
    if (remainder !== 0) {
      for (let i = remainder; i < ICONS_PER_ROW; i++) {
        markdown += '<td></td>\n';
      }
    }
    
    markdown += '</tr>\n</table>\n\n';
  });
  
  return markdown;
}

/**
 * Função principal
 */
function main() {
  console.log('=== Gerador de Catálogo de Ícones ===\n');
  
  // Lê o índice
  const indexData = readIndex();
  if (!indexData) {
    return;
  }
  
  console.log(`Total de ícones encontrados: ${indexData.length}`);
  
  // Gera o catálogo principal
  const catalog = generateCatalog(indexData, true);
  
  // Salva o arquivo
  fs.writeFileSync(OUTPUT_FILE, catalog);
  console.log(`\n✅ Catálogo gerado com sucesso: ${OUTPUT_FILE}`);
  
  // Gera versão alternativa para GitHub
  const githubCatalogPath = path.join(__dirname, 'ICON_GALLERY.md');
  const githubCatalog = generateGitHubCatalog(indexData);
  fs.writeFileSync(githubCatalogPath, githubCatalog);
  console.log(`✅ Galeria visual gerada: ${githubCatalogPath}`);
  
  // Estatísticas
  const grouped = groupIconsByCategory(indexData);
  console.log('\n📊 Estatísticas:');
  Object.keys(grouped).sort().forEach(category => {
    console.log(`  ${formatCategoryName(category)}: ${grouped[category].length} ícones`);
  });
}

// Executar
main();