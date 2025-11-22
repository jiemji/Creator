import { dom } from './dom.js';
import { state } from './state.js';

export function updateJobDescription() {
    const selectedRole = dom.identity.lifepath.value;
    const skillInfo = state.gameData.specialskill.find(s => s.Classe === selectedRole);
    
    if (skillInfo && dom.identity.jobDescription) {
        dom.identity.jobDescription.textContent = skillInfo.resume;
    } else if (dom.identity.jobDescription) {
        dom.identity.jobDescription.textContent = "Description non trouvée.";
    }
}