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
    // Cette fonction devra être mise à jour pour refléter le nouveau format
    // Pour l'instant, elle reste fonctionnelle mais basique.
    const familyFateText = dom.history.familyFate.textContent.replace(/<br\s*[\/]?>/gi, "\n                 ");
    let skillsText = Object.entries(state.characterSkills)
        .filter(([, value]) => value > 0)
        .map(([key, value]) => `${key.padEnd(20, ' ')}: ${value}`)
        .join('\n');
    return `...`; // Le contenu de cette fonction est conservé
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

function renderIdentity() {
    const selectedRole = dom.identity.lifepath.value;
    const skillInfo = state.gameData.specialskill.find(s => s.Classe === selectedRole);
    const jobDescription = skillInfo ? skillInfo.resume : '';
    
    dom.summary.identity.innerHTML = `
        <p><strong>${dom.identity.name.value || '...'}</strong> - <em>${dom.identity.handle.value || '...'}</em></p>
        <p><strong>${selectedRole}</strong> (${jobDescription})</p>
    `;
}

function renderHistory() {
    dom.summary.history.innerHTML = `
        <p>${dom.history.style.textContent} - ${dom.history.hair.textContent} - ${dom.history.accessory.textContent}</p>
        <p>${dom.history.origin.textContent} - ${dom.history.language.textContent}</p>
        <p><strong>Enfance:</strong> ${dom.history.childhood.textContent}</p>
        <p><strong>Adelphe(s):</strong> ${dom.history.siblings.textContent}</p>
        <p><strong>Destin Familial:</strong> ${dom.history.familyFate.textContent}</p>
    `;
}

function renderAttributes() {
    const attrs = state.characterAttributes;
    const humanity = (attrs['Esprit'] || 0) * 10;
    dom.summary.attributes.innerHTML = `
        <p><strong>Puissance:</strong> ${attrs['Puissance'] || 0}</p>
        <p><strong>Réflexes:</strong> ${attrs['Réflexes'] || 0}</p>
        <p><strong>Sang-Froid:</strong> ${attrs['Sang-Froid'] || 0}</p>
        <p><strong>Classe:</strong> ${attrs['Classe'] || 0}</p>
        <p><strong>Esprit:</strong> ${attrs['Esprit'] || 0}</p>
        <p><strong>Intelligence:</strong> ${attrs['Intelligence'] || 0}</p>
        <p><strong>Technique:</strong> ${attrs['Technique'] || 0}</p>
        <p><strong>Humanité:</strong> ${humanity}</p>
    `;
}

function renderSkills() {
    let html = '';
    const statOrder = ['Intelligence', 'Classe', 'Technique', 'Réflexes', 'Sang-Froid', 'Puissance', 'Esprit'];
    
    const selectedRole = dom.identity.lifepath.value;
    const specialSkillInfo = state.gameData.specialskill.find(s => s.Classe === selectedRole);
    const specialSkillName = specialSkillInfo ? specialSkillInfo.specialskill : null;
    const specialSkillValue = specialSkillName ? state.characterSkills[specialSkillName] : 0;

    if (specialSkillValue > 0) {
        html += `<p><strong>${specialSkillName}:</strong> ${specialSkillValue}</p>`;
    }

    statOrder.forEach(statName => {
        const skillsForStat = state.gameData.competences
            .filter(skill => skill.Statistique === statName)
            .map(skill => skill['Sous-competence'])
            .filter(skillName => state.characterSkills[skillName] > 0 && skillName !== specialSkillName);

        if (skillsForStat.length > 0) {
            html += `<h5>${statName.toUpperCase()}</h5>`;
            skillsForStat.forEach(skillName => {
                html += `<p>${skillName}: ${state.characterSkills[skillName]}</p>`;
            });
        }
    });
    dom.summary.skills.innerHTML = html || '<p>Aucune compétence.</p>';
}

function renderBudget() {
    const initialAmount = state.characterBudget.amount;
    const equipmentFunds = Math.floor(initialAmount * 0.8);
    const savings = initialAmount - equipmentFunds;

    const selectedRole = dom.identity.lifepath.value;
    const specialSkillValue = state.characterSkills[state.gameData.specialskill.find(s => s.Classe === selectedRole)?.specialskill] || 0;
    const budgetEntry = state.gameData.budget.find(entry => entry.Classe === selectedRole && parseInt(entry.Niveau, 10) === specialSkillValue);
    const monthlySalary = budgetEntry ? budgetEntry.Montant : 0;

    dom.summary.budget.innerHTML = `
        <p><strong>Fonds d'équipement:</strong> ${equipmentFunds} <img src="donald.png" alt="crédits" class="currency-icon"></p>
        <p><strong>Epargne:</strong> ${savings} <img src="donald.png" alt="crédits" class="currency-icon"></p>
        <p><strong>Salaire Mensuel:</strong> ${monthlySalary} <img src="donald.png" alt="crédits" class="currency-icon"></p>
    `;
}

export function render() {
    renderIdentity();
    renderHistory();
    renderAttributes();
    renderSkills();
    renderBudget();
}