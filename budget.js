import { dom } from './dom.js';
import { state } from './state.js';

export function calculateAndDisplayBudget() {
    const selectedRole = dom.identity.lifepath.value;

    // 1. Obtenir la valeur de la compétence spéciale actuelle
    const specialSkillInfo = state.gameData.specialskill.find(s => s.Classe === selectedRole);
    const specialSkillName = specialSkillInfo ? specialSkillInfo.specialskill : null;
    const specialSkillValue = specialSkillName ? (state.characterSkills[specialSkillName] || 0) : 0;

    // 2. Trouver le salaire mensuel correspondant au niveau
    const budgetEntry = state.gameData.budget.find(entry => 
        entry.Classe === selectedRole && 
        parseInt(entry.Niveau, 10) === specialSkillValue
    );
    const monthlySalary = budgetEntry ? parseInt(budgetEntry.Montant, 10) : 0;

    // 3. Calculer l'épargne (Recalcul aléatoire à chaque appel)
    // On simule un jet de dé (1 à 6) divisé par 3.
    const dieRoll = Math.floor(Math.random() * 6) + 1; 
    const randomMultiplier = dieRoll / 3;
    
    const savings = Math.floor(monthlySalary * randomMultiplier);

    // 4. Mettre à jour l'état
    state.characterBudget.amount = savings;

    // 5. Mettre à jour l'affichage
    dom.budgetSalary.innerHTML = `${monthlySalary}<img src="donald.png" alt="crédits" class="currency-icon">`;
    dom.budgetDisplay.innerHTML = `${savings}<img src="donald.png" alt="crédits" class="currency-icon">`;
}