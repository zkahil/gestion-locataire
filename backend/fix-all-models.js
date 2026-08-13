// backend/scripts/fix-all-models.js

const fs = require('fs');
const path = require('path');

// Détection automatique du bon chemin
function findModelsDir() {
    // Chemins possibles
    const possiblePaths = [
        path.join(__dirname, '../src/models'),           // depuis backend/scripts/
        path.join(__dirname, 'src/models'),              // depuis backend/
        path.join(process.cwd(), 'src/models'),          // depuis la racine
        path.join(process.cwd(), 'backend/src/models'),  // depuis la racine
        path.join(__dirname, '../../backend/src/models'), // depuis backend/scripts/ (si déplacé)
    ];

    for (const testPath of possiblePaths) {
        if (fs.existsSync(testPath)) {
            console.log(`✅ Répertoire trouvé: ${testPath}`);
            return testPath;
        }
    }

    // Si aucun chemin n'est trouvé, chercher récursivement
    console.log('🔍 Recherche du répertoire models...');
    const found = findModelsRecursive(process.cwd());
    if (found) {
        console.log(`✅ Répertoire trouvé: ${found}`);
        return found;
    }

    console.error('❌ Répertoire models non trouvé');
    console.log('📁 Vérifiez que les modèles existent dans l\'un de ces chemins:');
    possiblePaths.forEach(p => console.log(`   ${p}`));
    process.exit(1);
}

function findModelsRecursive(dir, maxDepth = 5) {
    if (maxDepth === 0) return null;
    
    try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                if (item === 'models' && fs.existsSync(path.join(fullPath, 'contrat.model.js'))) {
                    return fullPath;
                }
                const found = findModelsRecursive(fullPath, maxDepth - 1);
                if (found) return found;
            }
        }
    } catch (error) {
        // Ignorer les erreurs de permission
    }
    
    return null;
}

const modelsDir = findModelsDir();

// Mapping des colonnes à corriger
const columnMappings = {
    // Locataire
    'nomComplet': '"nomComplet"',
    'dateCreation': '"dateCreation"',
    'creePar': '"creePar"',
    'derniereConnexion': '"derniereConnexion"',
    
    // Site
    'codePostal': '"codePostal"',
    'createdAt': '"createdAt"',
    'updatedAt': '"updatedAt"',
    
    // Etage
    'siteId': '"siteId"',
    
    // Espace
    'contratActifId': '"contratActifId"',
    'loyerReference': '"loyerReference"',
    'chargesReference': '"chargesReference"',
    'positionX': '"positionX"',
    'positionY': '"positionY"',
    
    // Contrat
    'espaceId': '"espaceId"',
    'locataireId': '"locataireId"',
    'dateSignature': '"dateSignature"',
    'dateDebut': '"dateDebut"',
    'dateFin': '"dateFin"',
    'dureeMois': '"dureeMois"',
    'renouvellementAuto': '"renouvellementAuto"',
    'delaiPreavisJours': '"delaiPreavisJours"',
    'conditionsResiliation': '"conditionsResiliation"',
    'montantLoyer': '"montantLoyer"',
    'montantCharges': '"montantCharges"',
    'montantCaution': '"montantCaution"',
    'moisCaution': '"moisCaution"',
    'avanceVersee': '"avanceVersee"',
    'modalitesPaiement': '"modalitesPaiement"',
    'datePaiementPrevue': '"datePaiementPrevue"',
    'penalitesRetard': '"penalitesRetard"',
    'obligationsParticulieres': '"obligationsParticulieres"',
    'assuranceObligatoire': '"assuranceObligatoire"',
    'clauseResponsabiliteMarchandises': '"clauseResponsabiliteMarchandises"',
    'importePar': '"importePar"',
    'validePar': '"validePar"',
    'dateImport': '"dateImport"',
    'dateValidation': '"dateValidation"',
    
    // Facture
    'contratId': '"contratId"',
    'periodeDebut': '"periodeDebut"',
    'periodeFin': '"periodeFin"',
    'montantTotal': '"montantTotal"',
    'dateEmission': '"dateEmission"',
    'dateEcheance': '"dateEcheance"',
    'fichierPdf': '"fichierPdf"',
    'motifAnnulation': '"motifAnnulation"',
    'avoirLieId': '"avoirLieId"',
    
    // Paiement
    'factureId': '"factureId"',
    'datePaiement': '"datePaiement"',
    'justificatifFichier': '"justificatifFichier"',
    'enregistrePar': '"enregistrePar"',
    
    // Caution
    'montantAttendu': '"montantAttendu"',
    'montantRecu': '"montantRecu"',
    'modeReglement': '"modeReglement"',
    'dateVersement': '"dateVersement"',
    'conditionsRemboursement': '"conditionsRemboursement"',
    'conditionsRetenue': '"conditionsRetenue"',
    'justificatifFichier': '"justificatifFichier"',
    
    // Alerte
    'userId': '"userId"',
    
    // Journal
    'entiteId': '"entiteId"',
    'adresseIp': '"adresseIp"',
};

function fixFile(filePath) {
    console.log(`📝 Traitement: ${path.basename(filePath)}`);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let changes = [];
    
    // 1. Corriger les noms de colonnes
    for (const [oldCol, newCol] of Object.entries(columnMappings)) {
        // Ne pas remplacer si déjà entre guillemets
        const regex = new RegExp(`(?<!")\\b${oldCol}\\b(?!")(?!\\s*\\()`, 'g');
        const matches = content.match(regex);
        if (matches) {
            content = content.replace(regex, newCol);
            modified = true;
            changes.push(`  ${oldCol} → ${newCol} (${matches.length} occurences)`);
        }
    }
    
    // 2. Corriger CURRENT_TIMESTAMP dans les UPDATE
    const timestampRegex = /updatedAt\s*=\s*CURRENT_TIMESTAMP/gi;
    if (timestampRegex.test(content)) {
        content = content.replace(timestampRegex, '"updatedAt" = CURRENT_TIMESTAMP');
        modified = true;
        changes.push('  updatedAt = CURRENT_TIMESTAMP → "updatedAt" = CURRENT_TIMESTAMP');
    }
    
    // 3. Corriger ORDER BY
    const orderByRegex = /ORDER\s+BY\s+createdAt/gi;
    if (orderByRegex.test(content)) {
        content = content.replace(orderByRegex, 'ORDER BY "createdAt"');
        modified = true;
        changes.push('  ORDER BY createdAt → ORDER BY "createdAt"');
    }
    
    const orderByUpdatedRegex = /ORDER\s+BY\s+updatedAt/gi;
    if (orderByUpdatedRegex.test(content)) {
        content = content.replace(orderByUpdatedRegex, 'ORDER BY "updatedAt"');
        modified = true;
        changes.push('  ORDER BY updatedAt → ORDER BY "updatedAt"');
    }
    
    // 4. Corriger les INSERT avec des colonnes camelCase
    const insertRegex = /INSERT\s+INTO\s+\w+\s*\(([^)]+)\)/gi;
    let match;
    while ((match = insertRegex.exec(content)) !== null) {
        const columns = match[1].split(',').map(c => c.trim());
        let modifiedInsert = false;
        const newColumns = columns.map(col => {
            // Enlever les guillemets existants pour vérification
            const cleanCol = col.replace(/^"|"$/g, '');
            if (columnMappings[cleanCol] && !col.startsWith('"')) {
                modifiedInsert = true;
                return columnMappings[cleanCol];
            }
            return col;
        });
        if (modifiedInsert) {
            const newInsert = match[0].replace(match[1], newColumns.join(', '));
            content = content.replace(match[0], newInsert);
            modified = true;
            changes.push(`  INSERT columns: ${columns.join(', ')} → ${newColumns.join(', ')}`);
        }
    }
    
    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixé: ${path.basename(filePath)}`);
        if (changes.length > 0) {
            console.log('   Changements:');
            changes.forEach(c => console.log(c));
        }
        return true;
    } else {
        console.log(`⏭️  Aucun changement: ${path.basename(filePath)}`);
        return false;
    }
}

function fixDirectory(dir) {
    console.log(`\n📂 Scan du répertoire: ${dir}`);
    
    if (!fs.existsSync(dir)) {
        console.error(`❌ Répertoire non trouvé: ${dir}`);
        return 0;
    }
    
    const files = fs.readdirSync(dir);
    let totalFixed = 0;
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            totalFixed += fixDirectory(filePath);
        } else if (file.endsWith('.model.js') || (file.endsWith('.js') && file !== 'index.js')) {
            const fixed = fixFile(filePath);
            if (fixed) totalFixed++;
        }
    }
    
    return totalFixed;
}

console.log('🔧 Correction des noms de colonnes dans les modèles...');
console.log('================================================\n');

const fixed = fixDirectory(modelsDir);

console.log('\n================================================');
console.log(`✅ ${fixed} fichiers corrigés`);
console.log('✅ Terminé !');
console.log('\n💡 Redémarrez le serveur et testez à nouveau :');
console.log('   cd backend && npm start');
console.log('   node test-api.js');