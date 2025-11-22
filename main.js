import { dom, initializeDom } from './dom.js';
import { state } from './state.js';
import { loadAllData } from './dataLoader.js';
import { initializeAttributes, handleAttributeChange } from './attributes.js';
import { initializeSkills, handleSkillChange, calculatePickupSkillPoints, updateSkillPointDisplays, updateSkillButtons } from './skills.js';
import { randomizeHistory, updateRoleSpecificHistory } from './history.js';
import { render as renderSummary, downloadTxt, exportCsv, updateSummaryAttribute, updateSummaryHumanity, updateSummarySkill } from './summary.js';
import { render as renderAttributes } from './attributes.js';
import { render as renderSkills } from './skills.js';
import { calculateAndDisplayBudget } from './budget.js';

function updateUI() {
    renderAttributes();
    renderSkills();
    renderSummary();
}

async function initializeApp() {
    try {
        initializeDom();
        state.gameData = await loadAllData();
        
        
        initializeSkills();
        initializeAttributes();
        calculatePickupSkillPoints();
        calculateAndDisplayBudget(); 
        
        randomizeHistory();
        updateUI(); // Premier rendu complet

        // --- SETUP EVENT LISTENERS (UNIQUES ET CORRECTS) ---

        dom.rerollHistoryBtn.addEventListener('click', () => {
            randomizeHistory();
            renderSummary();
        });

        // AJOUT DE L'ÉVÉNEMENT POUR LE REROLL DES ATTRIBUTS
        dom.rerollAttributesBtn.addEventListener('click', () => {
            initializeAttributes();       // 1. Refait le tirage des attributs
            initializeSkills();           // 2. Réinitialise les compétences
            calculatePickupSkillPoints(); // 3. Recalcule les points de compétence additionnels
            updateUI();                   // 4. Met à jour toute l'interface
        });

                // AJOUT DE L'ÉVÉNEMENT POUR LE REROLL DES SKILLS
        dom.rerollSkillsBtn.addEventListener('click', () => {
            initializeSkills();           // 2. Réinitialise les compétences
            calculatePickupSkillPoints(); // 3. Recalcule les points de compétence additionnels
            renderSkills();               // Nécessaire pour afficher les valeurs remises à zéro
            renderSummary();              // Nécessaire pour vider les compétences du résumé
        });

        dom.attributeGrid.addEventListener('click', (e) => {
            if (e.target.matches('.attribute-controls .quantity-btn')) {
                const attrKey = e.target.dataset.attr;
                handleAttributeChange(attrKey, e.target.dataset.action, e.target);
                
                calculatePickupSkillPoints();
                updateSkillPointDisplays(); 
                updateSummaryAttribute(attrKey);

                if (attrKey === 'Esprit') {
                    updateSummaryHumanity();
                }
                
                if (attrKey === 'Intelligence' || attrKey === 'Réflexes') {
                    updateSkillButtons();
                }
            }
        });

        dom.skillsContainer.addEventListener('click', (e) => {
            if (e.target.matches('.skill-controls .quantity-btn')) {
                const skillName = e.target.dataset.skill;
                handleSkillChange(
                    skillName,
                    e.target.dataset.core === 'true',
                    e.target.dataset.action,
                    e.target
                );
                updateSummarySkill(skillName);

                // Vérifie si la compétence modifiée est la compétence spéciale
                const selectedRole = dom.identity.lifepath.value;
                const specialSkillInfo = state.gameData.specialskill.find(s => s.Classe === selectedRole);
                if (specialSkillInfo && skillName === specialSkillInfo.specialskill) {
                    calculateAndDisplayBudget();
                    renderSummary();
                }

            }
        });

        dom.identity.name.addEventListener('input', renderSummary);
        dom.identity.handle.addEventListener('input', renderSummary);
        dom.identity.lifepath.addEventListener('change', () => {
            initializeSkills();
            calculatePickupSkillPoints();
            updateRoleSpecificHistory();
            calculateAndDisplayBudget();
            updateUI();
        });

        dom.printBtn.addEventListener('click', () => window.print());
        dom.downloadBtn.addEventListener('click', downloadTxt);
        dom.exportCsvBtn.addEventListener('click', exportCsv);

    } catch (error) {
        console.error("ERREUR D'INITIALISATION :", error);
        document.querySelectorAll('.history-value').forEach(el => el.textContent = "Erreur");
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);