import { dom } from './dom.js';
import { state } from './state.js';

function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function generateCharacterSheetText() {
    const familyFateText = dom.summary.familyFate.innerHTML.replace(/<br\s*[\/]?>/gi, "\n                 ");
    let skillsText = Object.entries(state.characterSkills)
        .filter(([, value]) => value > 0)
        .map(([key, value]) => `${key.padEnd(20, ' ')}: ${value}`)
        .join('\n');
    return `
=== FICHE DE PERSONNAGE CYBERPUNK ===

--- IDENTITÉ ---
NOM D'AGENT:     ${dom.summary.name.textContent}
PSEUDONYME:      ${dom.summary.handle.textContent}
ARCHÉTYPE:       ${dom.summary.lifepath.textContent}

--- HISTORIQUE PERSONNEL ---
Style:           ${dom.summary.style.textContent}
Coiffure:        ${dom.summary.hair.textContent}
Accessoire:      ${dom.summary.accessory.textContent}
Origine:         ${dom.summary.origin.textContent}
Langue:          ${dom.summary.language.textContent}
CSP d'Origine:   ${dom.summary.csp.textContent}
Enfance:         ${dom.summary.childhood.textContent}
Destin Familial: ${familyFateText}
Adelphe(s):      ${dom.summary.siblings.textContent}

--- ATTRIBUTS ---
${Object.entries(state.characterAttributes).map(([key, value]) => `${key.padEnd(15, ' ')}: ${value}`).join('\n')}

--- STATS SECONDAIRES ---
Humanité:        ${dom.summary.humanity.textContent}

--- COMPÉTENCES ---
${skillsText || 'Aucune compétence acquise.'}
    `.trim();
}

function generateCharacterCSV() {
    const charName = dom.identity.name.value || 'personnage_sans_nom';
    let csvContent = "Nom du personnage;Element;Type;Valeur\n";
    for (const statName in state.characterAttributes) {
        csvContent += `"${charName}";"${statName}";"Attribut";"${state.characterAttributes[statName]}"\n`;
    }
    for (const skillName in state.characterSkills) {
        if (state.characterSkills[skillName] > 0) {
            csvContent += `"${charName}";"${skillName}";"Compétence";"${state.characterSkills[skillName]}"\n`;
        }
    }
    return csvContent;
}

export function downloadTxt() {
    const textToDownload = generateCharacterSheetText();
    downloadFile(textToDownload, 'cyberpunk_personnage.txt', 'text/plain');
}

export function exportCsv() {
    const csvContent = generateCharacterCSV();
    downloadFile(csvContent, 'export_personnage.csv', 'text/csv;charset=utf-8;');
}

export function render() {
    // Identity
    dom.summary.name.textContent = dom.identity.name.value || '...';
    dom.summary.handle.textContent = dom.identity.handle.value || '...';
    dom.summary.lifepath.textContent = dom.identity.lifepath.options[dom.identity.lifepath.selectedIndex].text;
    
    // History
    dom.summary.style.textContent = dom.history.style.textContent;
    dom.summary.hair.textContent = dom.history.hair.textContent;
    dom.summary.accessory.textContent = dom.history.accessory.textContent;
    dom.summary.origin.textContent = dom.history.origin.textContent;
    dom.summary.language.textContent = dom.history.language.textContent;
    dom.summary.csp.textContent = dom.history.csp.textContent;
    dom.summary.childhood.textContent = dom.history.childhood.textContent;
    dom.summary.familyFate.innerHTML = dom.history.familyFate.innerHTML;
    dom.summary.siblings.textContent = dom.history.siblings.textContent;
    
    // Attributes
    if (dom.summary.attributes) {
        dom.summary.attributes.innerHTML = '';
        for (const statName in state.characterAttributes) {
            const summaryLine = document.createElement('p');
            summaryLine.innerHTML = `<strong>${statName}:</strong> ${state.characterAttributes[statName]}`;
            dom.summary.attributes.appendChild(summaryLine);
        }
    }
    
    // Secondary Stats
    if (state.characterAttributes['Psychologie']) {
        const humanity = state.characterAttributes['Psychologie'] * 10;
        dom.summary.humanity.textContent = humanity;
    }
    
    // Skills
    if (dom.summary.skills) {
        dom.summary.skills.innerHTML = '';
        // Trie les compétences par ordre alphabétique pour un affichage cohérent
        const sortedSkills = Object.entries(state.characterSkills).sort((a, b) => a[0].localeCompare(b[0]));
        for (const [skillName, skillValue] of sortedSkills) {
            if (skillValue > 0) {
                const skillLine = document.createElement('p');
                skillLine.innerHTML = `<strong>${skillName}:</strong> ${skillValue}`;
                dom.summary.skills.appendChild(skillLine);
            }
        }
    }
}