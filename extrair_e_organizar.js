const fs = require('fs');
const path = require('path');

// Configurações
const baseDir = path.join(__dirname, 'assets');
const outputBaseDir = path.join(__dirname, 'gliffy_libraries');
const MAX_ICONS_PER_LIBRARY = 30;

// Estrutura para armazenar ícones por categoria e nome
const iconCollections = {};
// Contador de ícones únicos
let totalUniqueIcons = 0;
let totalFilesProcessed = 0;

/**
 * Encontra todos os arquivos .xml recursivamente
 */
function findXmlFiles(dir) {
  let xmlFiles = [];
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        xmlFiles = xmlFiles.concat(findXmlFiles(fullPath));
      } else if (item.isFile() && path.extname(item.name).toLowerCase() === '.xml') {
        xmlFiles.push(fullPath);
      }
    }
  } catch (e) {
    console.warn(`Aviso: Não foi possível ler o diretório ${dir}. ${e.message}`);
  }
  return xmlFiles;
}

/**
 * Decodifica entidades HTML
 */
function decodeHtmlEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&amp;#10;/g, ' ')
    .replace(/&#10;/g, ' ');
}

/**
 * Extrai categoria do caminho do arquivo
 */
function extractCategoryFromPath(filePath) {
  const relativePath = path.relative(baseDir, filePath);
  const parts = relativePath.split(path.sep);
  
  // Se está em draw.io
  if (parts.includes('draw.io')) {
    const drawIoIndex = parts.indexOf('draw.io');
    
    // Se tem uma pasta depois de draw.io (as categorias numéricas)
    if (parts.length > drawIoIndex + 1) {
      const categoryFolder = parts[drawIoIndex + 1];
      
      // Extrair nome limpo da categoria
      // Ex: "20-02-00-sap-btp-service-icons-foundational-set" -> "foundational"
      // Ex: "20-02-01-sap-btp-service-icons-integration-suite-set" -> "integration-suite"
      
      if (categoryFolder.includes('foundational')) return 'foundational';
      if (categoryFolder.includes('integration-suite')) return 'integration-suite';
      if (categoryFolder.includes('app-dev-automation')) return 'app-dev-automation';
      if (categoryFolder.includes('data-analytics')) return 'data-analytics';
      if (categoryFolder.includes('ai-set')) return 'ai';
      if (categoryFolder.includes('btp-saas')) return 'btp-saas';
      if (categoryFolder.includes('generic-icons')) return 'generic-icons';
      if (categoryFolder.includes('all')) return 'all-icons';
      
      // Para arquivos diretos na pasta draw.io
      const fileName = path.basename(filePath, '.xml');
      if (fileName === 'essentials') return 'essentials';
      if (fileName === 'sap_brand_names') return 'sap-brands';
      if (fileName === 'devtoberfest_demo') return 'demo';
      if (fileName === 'connectors') return 'connectors';
      if (fileName === 'annotations_and_interfaces') return 'interfaces';
      if (fileName === 'area_shapes') return 'shapes';
      if (fileName === 'default_shapes') return 'shapes';
      if (fileName === 'numbers') return 'numbers';
      if (fileName === 'text_elements') return 'text';
    }
  }
  
  // Categoria padrão
  return 'misc';
}

/**
 * Extrai o tamanho do nome do arquivo
 */
function extractSizeFromFileName(fileName) {
  if (fileName.includes('size-S')) return 'S';
  if (fileName.includes('size-M')) return 'M';
  if (fileName.includes('size-L')) return 'L';
  return null;
}

/**
 * Extrai SVG do shape
 */
function extractSVGFromShape(shape) {
  let title = null;
  let svgContent = null;

  if (shape.xml) {
    const decodedXml = decodeHtmlEntities(shape.xml);

    // Extrai título
    if (shape.title) {
      title = shape.title
        .replace(/\s*\(.*?\)\s*/g, '')
        .replace(/[^a-z0-9\s-]/gi, '')
        .trim();
    }

    if (!title) {
      const titleMatch = decodedXml.match(/value="([^"]+)"/);
      if (titleMatch) {
        title = titleMatch[1]
          .replace(/\s*&#10;\s*/g, ' ')
          .replace(/\s*\n\s*/g, ' ')
          .replace(/[^a-z0-9\s-]/gi, '')
          .trim();
      }
    }
    
    // Extrai SVG - tenta vários formatos
    let imageMatch = decodedXml.match(/image=data:image\/svg\+xml,([^;"\s]+)/);
    if (imageMatch && imageMatch[1]) {
      try {
        svgContent = Buffer.from(imageMatch[1], 'base64').toString('utf8');
        if (!svgContent.includes('<svg') && !svgContent.includes('<?xml')) {
          svgContent = null;
        }
      } catch (e) {
        svgContent = null;
      }
    }
    
    if (!svgContent) {
      const base64Match = decodedXml.match(/image=data:image\/svg\+xml;base64,([^;"\s]+)/);
      if (base64Match && base64Match[1]) {
        try {
          svgContent = Buffer.from(base64Match[1], 'base64').toString('utf8');
          if (!svgContent.includes('<svg') && !svgContent.includes('<?xml')) {
            svgContent = null;
          }
        } catch (e) {
          svgContent = null;
        }
      }
    }
    
    if (!svgContent) {
      const cleanedXml = decodedXml.replace(/[\r\n\s]+/g, '');
      const cleanMatch = cleanedXml.match(/image=data:image\/svg\+xml,([^;"\s]+)/);
      if (cleanMatch && cleanMatch[1]) {
        try {
          svgContent = Buffer.from(cleanMatch[1], 'base64').toString('utf8');
          if (!svgContent.includes('<svg') && !svgContent.includes('<?xml')) {
            svgContent = null;
          }
        } catch (e) {
          svgContent = null;
        }
      }
    }
  }
  else if (shape.title && shape.data) {
    title = shape.title;
    if (shape.data.includes('base64,')) {
      const base64Data = shape.data.split('base64,')[1];
      try {
        svgContent = Buffer.from(base64Data, 'base64').toString('utf8');
      } catch (e) {
        svgContent = null;
      }
    }
  }
  
  return { title, svgContent };
}

/**
 * Processa um arquivo XML e armazena os ícones na estrutura
 */
function processXmlFile(filePath) {
  const fileName = path.basename(filePath, '.xml');
  const category = extractCategoryFromPath(filePath);
  const size = extractSizeFromFileName(fileName);
  
  console.log(`\nProcessando: ${path.relative(__dirname, filePath)}`);
  console.log(`  Categoria: ${category}, Tamanho: ${size || 'N/A'}`);
  
  try {
    const xmlData = fs.readFileSync(filePath, 'utf8');
    
    const match = xmlData.match(/<mxlibrary>(.*?)<\/mxlibrary>/s);
    if (!match || !match[1]) {
      console.warn(`  -> Pular. Não é um formato <mxlibrary> válido.`);
      return 0;
    }

    const cleanedJsonString = match[1].replace(/<!--.*?-->/g, '').trim();
    
    if (!cleanedJsonString.startsWith('[')) {
      console.warn(`  -> Pular. Conteúdo não é um JSON array.`);
      return 0;
    }

    let library;
    try {
      library = JSON.parse(cleanedJsonString);
    } catch (parseError) {
      console.error(`  -> ERRO ao fazer parse do JSON: ${parseError.message}`);
      return 0;
    }
    
    let iconsInFile = 0;
    
    // Inicializar categoria se não existir
    if (!iconCollections[category]) {
      iconCollections[category] = {};
    }
    
    // Processar cada shape
    for (const shape of library) {
      const { title, svgContent } = extractSVGFromShape(shape);
      
      if (title && svgContent) {
        // Usar título limpo como chave
        const iconKey = title
          .replace(/[^a-z0-9\s-]/gi, '')
          .replace(/[\s_]+/g, '-')
          .toLowerCase()
          .replace(/^-+|-+$/g, '');
        
        // Inicializar entrada do ícone se não existir
        if (!iconCollections[category][iconKey]) {
          iconCollections[category][iconKey] = {
            title: title,
            sizes: {}
          };
        }
        
        // Armazenar o SVG com seu tamanho
        iconCollections[category][iconKey].sizes[size || 'default'] = svgContent;
        
        iconsInFile++;
      }
    }
    
    console.log(`  -> Extraídos ${iconsInFile} ícones deste arquivo.`);
    totalFilesProcessed++;
    return iconsInFile;
    
  } catch (e) {
    console.error(`  -> ERRO ao processar o arquivo: ${e.message}`);
    return 0;
  }
}

/**
 * Salva os ícones organizados em pastas
 */
function saveOrganizedIcons() {
  console.log('\n=== Salvando ícones organizados ===\n');
  
  // Criar diretório base se não existir
  if (!fs.existsSync(outputBaseDir)) {
    fs.mkdirSync(outputBaseDir, { recursive: true });
  }
  
  const indexData = [];
  let totalLibraries = 0;
  
  // Processar cada categoria
  Object.keys(iconCollections).sort().forEach(category => {
    const categoryIcons = iconCollections[category];
    const iconKeys = Object.keys(categoryIcons).sort();
    
    if (iconKeys.length === 0) return;
    
    console.log(`\nCategoria: ${category}`);
    console.log(`  Total de ícones únicos: ${iconKeys.length}`);
    
    // Coletar ícones preferindo tamanho M, depois L, depois S
    const iconsToSave = [];
    iconKeys.forEach(iconKey => {
      const icon = categoryIcons[iconKey];
      let selectedSize = null;
      let selectedContent = null;
      
      // Prioridade: M > L > S > default
      if (icon.sizes['M']) {
        selectedSize = 'M';
        selectedContent = icon.sizes['M'];
      } else if (icon.sizes['L']) {
        selectedSize = 'L';
        selectedContent = icon.sizes['L'];
      } else if (icon.sizes['S']) {
        selectedSize = 'S';
        selectedContent = icon.sizes['S'];
      } else if (icon.sizes['default']) {
        selectedSize = 'default';
        selectedContent = icon.sizes['default'];
      }
      
      if (selectedContent) {
        iconsToSave.push({
          key: iconKey,
          title: icon.title,
          size: selectedSize,
          content: selectedContent
        });
      }
    });
    
    // Dividir em lotes de MAX_ICONS_PER_LIBRARY
    const batches = [];
    for (let i = 0; i < iconsToSave.length; i += MAX_ICONS_PER_LIBRARY) {
      batches.push(iconsToSave.slice(i, i + MAX_ICONS_PER_LIBRARY));
    }
    
    // Salvar cada lote
    batches.forEach((batch, batchIndex) => {
      const libraryName = batches.length > 1 
        ? `${category}-${String(batchIndex + 1).padStart(2, '0')}`
        : category;
      
      const libraryPath = path.join(outputBaseDir, libraryName);
      
      // Criar pasta da biblioteca
      if (!fs.existsSync(libraryPath)) {
        fs.mkdirSync(libraryPath, { recursive: true });
      }
      
      // Salvar cada ícone
      batch.forEach(icon => {
        const fileName = `${icon.key}.svg`;
        const filePath = path.join(libraryPath, fileName);
        
        fs.writeFileSync(filePath, icon.content);
        
        // Adicionar ao índice
        indexData.push({
          file: fileName,
          title: icon.title,
          category: category,
          library: libraryName,
          size: icon.size,
          path: `${libraryName}/${fileName}`
        });
        
        totalUniqueIcons++;
      });
      
      console.log(`  ✓ Biblioteca criada: ${libraryName} (${batch.length} ícones)`);
      totalLibraries++;
    });
  });
  
  // Salvar índice
  const indexPath = path.join(outputBaseDir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
  
  const csvPath = path.join(outputBaseDir, 'index.csv');
  const csvContent = 'Arquivo,Título,Categoria,Biblioteca,Tamanho,Caminho\n' + 
    indexData.map(item => 
      `"${item.file}","${item.title}","${item.category}","${item.library}","${item.size}","${item.path}"`
    ).join('\n');
  fs.writeFileSync(csvPath, csvContent);
  
  return { totalLibraries, indexPath, csvPath };
}

/**
 * Função principal
 */
function main() {
  console.log('=== Extrator e Organizador de SVGs para Gliffy ===');
  console.log(`Base: ${baseDir}`);
  console.log(`Saída: ${outputBaseDir}`);
  console.log(`Máximo por biblioteca: ${MAX_ICONS_PER_LIBRARY} ícones\n`);
  
  // Encontrar todos os XMLs
  const allXmlFiles = findXmlFiles(baseDir);
  const libraryFiles = allXmlFiles.filter(file => 
    file.includes(path.join('assets', 'shape-libraries-and-editable-presets', 'draw.io'))
  );
  
  console.log(`Encontrados ${libraryFiles.length} arquivos de biblioteca .xml\n`);
  
  // Processar cada arquivo
  libraryFiles.forEach(file => {
    processXmlFile(file);
  });
  
  // Salvar ícones organizados
  const { totalLibraries, indexPath, csvPath } = saveOrganizedIcons();
  
  // Estatísticas finais
  console.log('\n=== Resumo Final ===');
  console.log(`Arquivos XML processados: ${totalFilesProcessed}`);
  console.log(`Ícones únicos extraídos: ${totalUniqueIcons}`);
  console.log(`Bibliotecas criadas: ${totalLibraries}`);
  console.log(`\nÍndices criados:`);
  console.log(`  - ${indexPath}`);
  console.log(`  - ${csvPath}`);
  console.log(`\nBibliotecas salvas em: ${outputBaseDir}`);
  
  // Mostrar distribuição
  console.log('\n=== Distribuição por Categoria ===');
  Object.keys(iconCollections).sort().forEach(category => {
    const count = Object.keys(iconCollections[category]).length;
    const libs = Math.ceil(count / MAX_ICONS_PER_LIBRARY);
    console.log(`  ${category}: ${count} ícones únicos (${libs} biblioteca${libs > 1 ? 's' : ''})`);
  });
}

// Executar
main();