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
    
    // 1. Récupération de la description
    const jobDescription = skillInfo ? skillInfo.resume : '';

    // 2. Récupération du Titre (basé sur le niveau de la compétence spéciale)
    const specialSkillName = skillInfo ? skillInfo.specialskill : null;
    const specialSkillValue = specialSkillName ? (state.characterSkills[specialSkillName] || 0) : 0;
    
    const budgetEntry = state.gameData.budget.find(entry => 
        entry.Classe === selectedRole && 
        parseInt(entry.Niveau, 10) === specialSkillValue
    );
    const jobTitle = budgetEntry ? budgetEntry.Titre : 'Débutant';

    dom.summary.identity.innerHTML = `
        <p><strong>${dom.identity.name.value || '...'}</strong> - <em>${dom.identity.handle.value || '...'}</em></p>
        <p><strong>${selectedRole}</strong> (${jobDescription})</p>
        <p><strong>Titre :</strong> ${jobTitle}</p>
    `;
}

function renderHistory() {
    dom.summary.history.innerHTML = `
        <p>${dom.history.style.textContent}</p>
        <br>
        <p>${dom.history.hair.textContent}</p>
        <br>
        <p>${dom.history.accessory.textContent}</p>
        
        <br><br>
        <p><strong>Origines ethniques : </strong>${dom.history.origin.textContent}</p>
        <p><strong>Langues maternelles : </strong>${dom.history.language.textContent}</p>
        
        <br><br>
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
    // "saute une ligne" au début
    let html = '<br>'; 
    
    // Ordre des attributs (avec Reflexes sans accent comme validé précédemment)
    const statOrder = ['Intelligence', 'Classe', 'Technique', 'Reflexes', 'Sang-Froid', 'Puissance', 'Esprit'];
    
    statOrder.forEach(statName => {
        // Récupère les compétences de cet attribut qui ont des points investis (> 0)
        const skillsForStat = state.gameData.competences
            .filter(skill => skill.Statistique === statName)
            .map(skill => skill['Sous-competence'])
            // On filtre directement ici les valeurs > 0 dans le state
            .filter(skillName => (state.characterSkills[skillName] || 0) > 0);

        // Si on a au moins une compétence, on affiche le groupe
        if (skillsForStat.length > 0) {
            html += `<h5>${statName.toUpperCase()}</h5>`;
            skillsForStat.forEach(skillName => {
                html += `<p>${skillName}: ${state.characterSkills[skillName]}</p>`;
            });
        }
    });

    // Si rien n'a été ajouté (html est juste <br>), on affiche un message par défaut, sinon le HTML généré
    dom.summary.skills.innerHTML = html.length > 4 ? html : '<br><p>Aucune compétence.</p>';
}

function renderBudget() {
    // 1. Fonds d'équipement : Valeur fixe
    const equipmentFunds = 80000;

    // 2. Epargne : Récupère la valeur calculée dans le module budget.js
    const savings = state.characterBudget.amount || 0;

    // 3. Salaire mensuel : Recalcul basé sur le niveau de compétence spéciale
    const selectedRole = dom.identity.lifepath.value;
    const specialSkillInfo = state.gameData.specialskill.find(s => s.Classe === selectedRole);
    const specialSkillName = specialSkillInfo ? specialSkillInfo.specialskill : null;
    const specialSkillValue = specialSkillName ? (state.characterSkills[specialSkillName] || 0) : 0;

    const budgetEntry = state.gameData.budget.find(entry => 
        entry.Classe === selectedRole && 
        parseInt(entry.Niveau, 10) === specialSkillValue
    );
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