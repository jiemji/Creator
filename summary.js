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
    const separator = "--------------------------------------------------\n";
    let text = ">>> FICHE DE PERSONNAGE CYBERPUNK 2020 <<<\n\n";

    // --- 1. IDENTITÉ ---
    const selectedRole = dom.identity.lifepath.value;
    const skillInfo = state.gameData.specialskill.find(s => s.Classe === selectedRole);
    const jobDescription = skillInfo ? skillInfo.resume : '';
    
    // Calcul du Titre et Salaire (Logique identique à renderIdentity/renderBudget)
    const specialSkillName = skillInfo ? skillInfo.specialskill : null;
    const specialSkillValue = specialSkillName ? (state.characterSkills[specialSkillName] || 0) : 0;
    const budgetEntry = state.gameData.budget.find(entry => 
        entry.Classe === selectedRole && 
        parseInt(entry.Niveau, 10) === specialSkillValue
    );
    const jobTitle = budgetEntry ? budgetEntry.Titre : 'Débutant';
    const monthlySalary = budgetEntry ? budgetEntry.Montant : 0;
    const story = state.characterStory || { story: '', text: '' };

    text += "> IDENTITÉ\n" + separator;
    text += `Nom        : ${dom.identity.name.value || '...'}\n`;
    text += `Pseudonyme : ${dom.identity.handle.value || '...'}\n\n`;
    text += `Rôle       : ${selectedRole} (${jobDescription})\n`;
    text += `Titre      : ${jobTitle}\n\n`;
    text += `Capacité spéciale (niv. ${specialSkillValue})     : ${specialSkillName}\n\n`;
    text += `Histoire   : ${story.text}\n\n`;

    // --- 2. HISTOIRE ---
    // On remplace les <br> HTML par des sauts de ligne \n
    text += "> HISTOIRE\n" + separator;
    text += `Style vestimentaire : ${dom.history.style.textContent}\n\n`;
    text += `Coiffure            : ${dom.history.hair.textContent}\n\n`;
    text += `Accessoire          : ${dom.history.accessory.textContent}\n\n`;
    text += `Origine ethnique    : ${dom.history.origin.textContent}\n`;
    text += `Langue maternelle   : ${dom.history.language.textContent}\n\n`;
    text += `Enfance             : ${dom.history.childhood.textContent}\n`;
    text += `Adelphe(s)          : ${dom.history.siblings.textContent}\n`;
    text += `Destin Familial     : ${dom.history.familyFate.textContent.replace(/<br\s*\/?>/gi, ' ')}\n\n`;

    // --- 3. ATTRIBUTS ---
    text += "> ATTRIBUTS\n" + separator;
    const attrs = state.characterAttributes;
    const humanity = (attrs['Esprit'] || 0) * 10;
    
    text += `Puissance   : ${attrs['Puissance'] || 0}\n`;
    text += `Reflexes    : ${attrs['Reflexes'] || 0}\n`; // Sans accent comme validé
    text += `Sang-Froid  : ${attrs['Sang-Froid'] || 0}\n`;
    text += `Classe      : ${attrs['Classe'] || 0}\n`;
    text += `Esprit      : ${attrs['Esprit'] || 0}\n`;
    text += `Intelligence: ${attrs['Intelligence'] || 0}\n`;
    text += `Technique   : ${attrs['Technique'] || 0}\n`;
    text += `Humanité    : ${humanity}\n\n`;

    // --- 4. COMPÉTENCES ---
    text += "> COMPÉTENCES\n" + separator;
    const statOrder = ['Intelligence', 'Classe', 'Technique', 'Reflexes', 'Sang-Froid', 'Puissance', 'Esprit'];
    let hasSkills = false;

    statOrder.forEach(statName => {
        const skillsForStat = state.gameData.competences
            .filter(skill => skill.Statistique === statName)
            .map(skill => skill['Sous-competence'])
            .filter(skillName => (state.characterSkills[skillName] || 0) > 0);

        if (skillsForStat.length > 0) {
            hasSkills = true;
            text += `[${statName.toUpperCase()}]\n`;
            skillsForStat.forEach(skillName => {
                text += `  - ${skillName.padEnd(25, ' ')}: ${state.characterSkills[skillName]}\n`;
            });
            text += "\n";
        }
    });

    if (!hasSkills) text += "Aucune compétence.\n\n";

    // --- 5. BUDGET ---
    text += "> BUDGET\n" + separator;
    text += `Fonds d'équipement : 80000 D$\n`;
    text += `Epargne            : ${state.characterBudget.amount || 0} D$\n`;
    text += `Salaire Mensuel    : ${monthlySalary} D$\n`;

    return text;
}

export function downloadTxt() {
    const textToDownload = generateCharacterSheetText();
    downloadFile(textToDownload, 'cyberpunk_personnage.txt', 'text/plain');
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
    const story = state.characterStory || { story: '...'};

    dom.summary.identity.innerHTML = `
        <p><strong>${dom.identity.name.value || '...'}</strong> - <em>${dom.identity.handle.value || '...'}</em></p>
        <p><strong>${selectedRole}</strong> (${jobDescription})</p>
        <p><strong>Titre :</strong> ${jobTitle}</p>
        <p><strong>Compétences Spéciales (niv. ${specialSkillValue}) :</strong> ${specialSkillName}</p><br>
        <p><strong>Expérience :</strong> ${story.story}</p>
    `;
}

function renderHistory() {
    dom.summary.history.innerHTML = `
        <p><strong>Style : </strong>${dom.history.style.textContent}</p>
        <p><strong>Coiffure : </strong>${dom.history.hair.textContent}</p>
        <p><strong>Objet iconique : </strong>${dom.history.accessory.textContent}</p>
                <br>
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
        <p><strong>Fonds d'équipement:</strong> ${equipmentFunds}<img src="donald.png" alt="crédits" class="currency-icon"></p>
        <p><strong>Epargne:</strong> ${savings}<img src="donald.png" alt="crédits" class="currency-icon"></p>
        <p><strong>Salaire Mensuel:</strong> ${monthlySalary}<img src="donald.png" alt="crédits" class="currency-icon"></p>
    `;
}

export function render() {
    renderIdentity();
    renderHistory();
    renderAttributes();
    renderSkills();
    renderBudget();
}