import { dom } from './dom.js';
import { state } from './state.js';

export function calculateAndDisplayBudget() {
    const selectedRole = dom.identity.lifepath.value;
    const budgetInfo = state.gameData.budget.find(b => b.Classe === selectedRole);

    if (budgetInfo) {
        state.characterBudget.amount = parseInt(budgetInfo.Montant, 10);
    } else {
        state.characterBudget.amount = 0;
    }

dom.budgetDisplay.innerHTML = `${state.characterBudget.amount} <img src="donald.png" alt="crédits" class="currency-icon">`;
}