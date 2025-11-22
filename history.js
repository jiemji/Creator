import { dom } from './dom.js';
import { state } from './state.js';

const getRandomItem = (arr) => {
    if (!arr || arr.length === 0) return { texte: "ERREUR", ethnie: "ERREUR", langue: "ERREUR", 'Nom de la coiffure': "ERREUR" };
    return arr[Math.floor(Math.random() * arr.length)];
};

// FONCTION MODIFIÉE : Intègre maintenant les accessoires filtrés
export function updateRoleSpecificHistory() {
    const selectedRole = dom.identity.lifepath.value;

    // 1. Filtre Vêtements
    const filteredVetement = state.gameData.vetement.filter(item => item.Rôle === selectedRole);
    
    // 2. Filtre Coiffure
    const filteredCoiffure = state.gameData.coiffure.filter(item => item.Rôle === selectedRole);

    // 3. NOUVEAU : Filtre Accessoire par rôle
    // (Nécessite une colonne 'Rôle' dans le fichier accessoire.csv)
    const filteredAccessoire = state.gameData.accessoire.filter(item => item.classe === selectedRole);

    dom.history.style.textContent = getRandomItem(filteredVetement).texte;
    dom.history.hair.textContent = getRandomItem(filteredCoiffure).texte;
    dom.history.accessory.textContent = getRandomItem(filteredAccessoire).texte;
}

// FONCTION MODIFIÉE : Ne gère plus l'accessoire de manière générique
export function randomizeHistory() {
    // 1. Appelle la fonction ciblée pour les éléments dépendants du rôle (Vêtement, Coiffure, Accessoire)
    updateRoleSpecificHistory();
    
    // 2. S'occupe du reste des éléments indépendants
    // Note : La ligne concernant l'accessoire a été supprimée ici car déplacée au-dessus
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