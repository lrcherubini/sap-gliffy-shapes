const fs = require('fs');
const path = require('path');

// Diretório base para procurar (a pasta 'assets' na raiz do script)
const baseDir = path.join(__dirname, 'assets');
// Diretório de saída para os SVGs
const outputDir = path.join(__dirname, 'icones_para_gliffy_extraidos');

/**
 * Encontra todos os arquivos .xml recursivamente a partir de um diretório.
 */
function findXmlFiles(dir) {
  let xmlFiles = [];
  try {
    // Usar { withFileTypes: true } para verificar se é diretório ou arquivo
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        // Se for um diretório, entra nele
        xmlFiles = xmlFiles.concat(findXmlFiles(fullPath));
      } else if (item.isFile() && path.extname(item.name).toLowerCase() === '.xml') {
        // Se for um arquivo .xml, adiciona à lista
        xmlFiles.push(fullPath);
      }
    }
  } catch (e) {
    console.warn(`Aviso: Não foi possível ler o diretório ${dir}. ${e.message}`);
  }
  return xmlFiles;
}

/**
 * Decodifica entidades HTML em uma string
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
 * Extrai SVG de diferentes formatos de objetos
 */
function extractSVGFromShape(shape, sourceFile = '') {
  let title = null;
  let svgContent = null;

  // Formato 1: XML embedado (como no exemplo que você passou)
  if (shape.xml) {
    // Decodifica o XML primeiro
    const decodedXml = decodeHtmlEntities(shape.xml);
    
    // Extrai o título do value no XML
    const titleMatch = decodedXml.match(/value="([^"]+)"/);
    if (titleMatch) {
      title = titleMatch[1]
        .replace(/\s*&#10;\s*/g, ' ')
        .replace(/\s*\n\s*/g, ' ')
        .replace(/[^a-z0-9\s-]/gi, '')
        .trim();
    }
    
    // Tenta extrair SVG de diferentes formatos
    
    // Formato 1: image=data:image/svg+xml,PHN2Z... (base64 direto sem marcador)
    let imageMatch = decodedXml.match(/image=data:image\/svg\+xml,([^;"\s]+)/);
    if (imageMatch && imageMatch[1]) {
      try {
        // Tenta decodificar como base64
        svgContent = Buffer.from(imageMatch[1], 'base64').toString('utf8');
        // Verifica se é SVG válido
        if (!svgContent.includes('<svg') && !svgContent.includes('<?xml')) {
          svgContent = null;
        }
      } catch (e) {
        svgContent = null;
      }
    }
    
    // Formato 2: image=data:image/svg+xml;base64,... (com marcador base64 explícito)
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
    
    // Formato 3: pode ter quebras de linha no meio do base64
    if (!svgContent) {
      // Remove todas as quebras de linha e espaços do XML decodificado
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
    
    // Debug para ver o que está sendo extraído
    if (title && !svgContent) {
      console.log(`  -> Título encontrado mas sem SVG: ${title}`);
    }
  }
  
  // Formato 2: Dados diretos (formato simples)
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
 * Função principal para executar a conversão.
 */
function convertLibraries() {
  try {
    // 1. Criar a pasta de saída se não existir
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
      console.log(`Pasta de saída criada: ${outputDir}`);
    }

    // 2. Encontrar todos os arquivos .xml dentro de 'assets'
    console.log(`Iniciando... Procurando arquivos .xml em: ${baseDir}`);
    const allXmlFiles = findXmlFiles(baseDir);

    // Filtra para processar apenas os arquivos na pasta 'draw.io'
    const libraryFiles = allXmlFiles.filter(file => 
      file.includes(path.join('assets', 'shape-libraries-and-editable-presets', 'draw.io'))
    );

    console.log(`Encontrados ${libraryFiles.length} arquivos de biblioteca .xml para processar.`);

    let totalIcons = 0;
    const seenIconKeys = new Set(); // Para evitar salvar ícones duplicados (título + arquivo)

    // 3. Processar cada arquivo de biblioteca
    for (const file of libraryFiles) {
      console.log(`\nProcessando: ${path.relative(__dirname, file)}`);

      try {
        const xmlData = fs.readFileSync(file, 'utf8');
        const fileName = path.basename(file, '.xml');

        // 4. Extrair o conteúdo JSON de dentro da tag <mxlibrary>
        const match = xmlData.match(/<mxlibrary>(.*?)<\/mxlibrary>/s);
        if (!match || !match[1]) {
          console.warn(` -> Pular. Não é um formato <mxlibrary> válido.`);
          continue;
        }

        // 5. Limpar os comentários XML (<!-- -->) que quebram o JSON
        const cleanedJsonString = match[1].replace(/<!--.*?-->/g, '').trim();

        // 6. Verificar se é um array JSON (ícones) ou XML (formas)
        if (!cleanedJsonString.startsWith('[')) {
          console.warn(` -> Pular. Conteúdo não é um JSON array (Provavelmente um arquivo de formas/texto).`);
          continue;
        }

        // 7. Parse do JSON *limpo*
        let library;
        try {
          library = JSON.parse(cleanedJsonString);
        } catch (parseError) {
          console.error(` -> ERRO ao fazer parse do JSON: ${parseError.message}`);
          continue;
        }
        
        let iconsInFile = 0;

        // Extrai o indicador de tamanho do nome do arquivo (size-S, size-M, size-L)
        const sizeMatch = fileName.match(/size-([SML])/i);
        const sizeIndicator = sizeMatch ? sizeMatch[1].toUpperCase() : '';

        // 8. Extrair e salvar cada SVG
        for (const shape of library) {
          const { title, svgContent } = extractSVGFromShape(shape, fileName);

          // Verifica se conseguiu extrair título e SVG
          if (title && svgContent) {
            // Cria uma chave única combinando título e tamanho
            const iconKey = sizeIndicator ? `${title}-${sizeIndicator}` : title;

            // Evita ícones duplicados
            if (seenIconKeys.has(iconKey)) {
              continue;
            }
            seenIconKeys.add(iconKey);

            // Limpa o nome do arquivo
            let cleanTitle = title
              .replace(/[^a-z0-9\s-]/gi, '')
              .replace(/[\s_]+/g, '-')
              .toLowerCase()
              .replace(/^-+|-+$/g, ''); // Remove hífens do início e fim

            // Adiciona o indicador de tamanho ao nome do arquivo, se existir
            const filename = sizeIndicator
              ? `${cleanTitle}-${sizeIndicator}.svg`
              : `${cleanTitle}.svg`;
            
            try {
              // Salva o arquivo .svg
              const outputPath = path.join(outputDir, filename);
              fs.writeFileSync(outputPath, svgContent);
              
              iconsInFile++;
              totalIcons++;
              
              console.log(`  -> Extraído: ${filename}`);
            } catch (saveError) {
              console.error(`  -> Erro ao salvar SVG ${title}: ${saveError.message}`);
            }
          }
        }
        
        console.log(` -> Extraídos ${iconsInFile} ícones únicos deste arquivo.`);

      } catch (e) {
        console.error(`  -> ERRO ao processar o arquivo ${file}: ${e.message}`);
      }
    } // Fim do loop for...of

    console.log(`\n--- Concluído! ---`);
    console.log(`Total de ${totalIcons} ícones SVG únicos foram extraídos.`);
    console.log(`Salvos em: ${outputDir}`);

  } catch (error) {
    console.error('Ocorreu um erro geral:', error.message);
  }
} // Fim da função convertLibraries

// Executar o script
convertLibraries();