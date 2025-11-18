import { dom } from './dom.js';
import { state } from './state.js';
import { loadAllData } from './dataLoader.js';
import { initializeAttributes, handleAttributeChange } from './attributes.js';
import { initializeSkills, handleSkillChange, calculatePickupSkillPoints } from './skills.js';
import { randomizeHistory } from './history.js';
import { render as renderSummary, downloadTxt, exportCsv } from './summary.js';
import { render as renderAttributes } from './attributes.js';
import { render as renderSkills } from './skills.js';

function updateUI() {
    renderAttributes();
    renderSkills();
    renderSummary();
}

function fullCharacterReset() {
    initializeAttributes();
    calculatePickupSkillPoints();
    randomizeHistory();
    updateUI();
}

async function initializeApp() {
    dom.randomizeHistoryBtn.disabled = true;
    dom.randomizeHistoryBtn.textContent = "Chargement des données...";

    try {
        state.gameData = await loadAllData();
        
        initializeSkills();
        initializeAttributes();
        calculatePickupSkillPoints();
        
        dom.randomizeHistoryBtn.disabled = false;
        dom.randomizeHistoryBtn.textContent = "Reroll";
        
        randomizeHistory();
        updateUI();

        // --- SETUP EVENT LISTENERS ---

        dom.attributeGrid.addEventListener('click', (e) => {
            if (e.target.matches('.attribute-controls .quantity-btn')) {
                handleAttributeChange(e.target.dataset.attr, e.target.dataset.action);
                calculatePickupSkillPoints();
                updateUI();
            }
        });

        dom.skillsContainer.addEventListener('click', (e) => {
            if (e.target.matches('.skill-controls .quantity-btn')) {
                handleSkillChange(
                    e.target.dataset.skill,
                    e.target.dataset.core === 'true',
                    e.target.dataset.action
                );
                updateUI();
            }
        });

        dom.randomizeHistoryBtn.addEventListener('click', fullCharacterReset);

        dom.identity.name.addEventListener('input', renderSummary);
        dom.identity.handle.addEventListener('input', renderSummary);
        dom.identity.lifepath.addEventListener('change', () => {
            // Recalculer les points de compétence métier lors du changement de classe
            const spentCorePoints = Object.entries(state.characterSkills).reduce((acc, [skillName, value]) => {
                const isCore = state.gameData.coreskill.some(cs => cs.Classe === dom.identity.lifepath.value && cs.Skill === skillName);
                if (isCore) return acc + value;
                return acc;
            }, 0);
            state.coreSkillPointsRemaining = 36 - spentCorePoints; // Le total est de 36
            updateUI();
        });

        dom.printBtn.addEventListener('click', () => window.print());
        dom.downloadBtn.addEventListener('click', downloadTxt);
        dom.exportCsvBtn.addEventListener('click', exportCsv);

    } catch (error) {
        console.error("ERREUR D'INITIALISATION :", error);
        dom.randomizeHistoryBtn.textContent = "ERREUR DE CHARGEMENT";
        document.querySelectorAll('.history-value').forEach(el => el.textContent = "Erreur");
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);