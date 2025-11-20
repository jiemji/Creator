import { dom } from './dom.js';
import { state } from './state.js';

const getRandomItem = (arr) => {
    if (!arr || arr.length === 0) return { texte: "ERREUR", ethnie: "ERREUR", langue: "ERREUR", 'Nom de la coiffure': "ERREUR" };
    return arr[Math.floor(Math.random() * arr.length)];
};

// NOUVELLE FONCTION EXPORTÉE pour la mise à jour ciblée
export function updateRoleSpecificHistory() {
    const selectedRole = dom.identity.lifepath.value;

    const filteredVetement = state.gameData.vetement.filter(item => item.Rôle === selectedRole);
    const filteredCoiffure = state.gameData.coiffure.filter(item => item.Rôle === selectedRole);

    dom.history.style.textContent = getRandomItem(filteredVetement).texte;
    dom.history.hair.textContent = getRandomItem(filteredCoiffure).texte;
}

// ANCIENNE FONCTION MODIFIÉE pour une regénération complète
export function randomizeHistory() {
    // 1. Appelle la fonction ciblée pour les éléments dépendants du rôle
    updateRoleSpecificHistory();
    
    // 2. S'occupe du reste des éléments indépendants
    dom.history.accessory.textContent = getRandomItem(state.gameData.accessoire).texte;
    dom.history.csp.textContent = getRandomItem(state.gameData.origine).texte;
    dom.history.childhood.textContent = getRandomItem(state.gameData.childhood).texte;

    const ethnieRoll = getRandomItem(state.gameData.ethnie);
    dom.history.origin.textContent = ethnieRoll.ethnie;
    dom.history.language.textContent = ethnieRoll.langue;

    const fateRoll = Math.floor(Math.random() * 10) + 1;
    const misfortune = getRandomItem(state.gameData.lose).texte;
    const destin = getRandomItem(state.gameData.destin).texte;

    if (fateRoll <= 6) {
        dom.history.familyFate.innerHTML = `Vos 2 parents sont vivants.<br>${misfortune}`;
    } else {
        dom.history.familyFate.innerHTML = `${destin}<br>${misfortune}`;
    }

    const siblingsRoll = Math.floor(Math.random() * 10) + 1;
    if (siblingsRoll > 7) {
        dom.history.siblings.textContent = 'Vous êtes enfant unique';
    } else {
        const totalSiblings = siblingsRoll;
        const numBrothers = Math.floor(Math.random() * (totalSiblings + 1));
        const numSisters = totalSiblings - numBrothers;
        dom.history.siblings.textContent = `Vous avez ${numBrothers} frère(s) et ${numSisters} soeur(s)`;
    }
}