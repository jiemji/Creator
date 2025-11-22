import { dom } from './dom.js';
import { state } from './state.js';

export function calculateAndDisplayBudget() {
    const selectedRole = dom.identity.lifepath.value;
    
    // 2. Trouver la valeur de la compétence spéciale
    const specialSkillInfo = state.gameData.specialskill.find(s => s.Classe === selectedRole);
    const specialSkillName = specialSkillInfo ? specialSkillInfo.specialskill : null;
    const specialSkillValue = specialSkillName ? (state.characterSkills[specialSkillName] || 0) : 0;


// Étape 2: Rechercher l'entrée correspondante en utilisant la Classe ET le Niveau
const budgetEntry = state.gameData.budget.find(entry => 
    entry.Classe === selectedRole && 
    parseInt(entry.Niveau, 10) === specialSkillValue
);

    const baseAmount = budgetEntry ? parseInt(budgetEntry.Montant, 10) : 0;
    // 3. Calculer le multiplicateur aléatoire
    const randomMultiplier = (Math.floor(Math.random() * 6) + 1) / 3;

    // Appliquer la formule
    let finalAmount = 0;
    if (baseAmount > 0 && specialSkillValue > 0) {
        finalAmount = Math.floor(baseAmount * specialSkillValue * randomMultiplier);
    }

    // Mettre à jour l'état et l'affichage
    state.characterBudget.amount = finalAmount;

    dom.budgetDisplay.innerHTML = `${finalAmount} <img src="donald.png" alt="crédits" class="currency-icon">`;
    dom.budgetSalary.innerHTML =`${baseAmount}`;
}