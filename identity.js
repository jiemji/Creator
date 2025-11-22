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

export function updateStory() {
    const selectedRole = dom.identity.lifepath.value;
    
    // Filtrer les histoires correspondant au rôle
    const possibleStories = state.gameData.story.filter(s => s.classe === selectedRole);
    
    if (possibleStories.length > 0) {
        // Tirage au sort
        const randomStory = possibleStories[Math.floor(Math.random() * possibleStories.length)];
        
        // Mise à jour de l'état
        state.characterStory = {
            story: randomStory.story,
        };

        // Affichage
        if (dom.identity.story) {
            dom.identity.story.innerHTML = `${randomStory.story}`;
        }
    } else {
        state.characterStory = { archetype: 'Inconnu', text: 'Aucune histoire disponible.' };
        if (dom.identity.story) dom.identity.story.textContent = "Aucune histoire disponible.";
    }
}