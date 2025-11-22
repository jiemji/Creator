import { dom } from './dom.js';
import { state, MIN_SKILL, MAX_STAT, TOTAL_CORE_SKILL_POINTS } from './state.js';

let skillButtonsCache = [];

export function initializeSkills() {
    // Étape 1: Tout remettre à zéro
    state.characterSkills = {};
    state.gameData.competences.forEach(skill => {
        state.characterSkills[skill['Sous-competence']] = 0;
    });
    state.gameData.specialskill.forEach(skill => {
        state.characterSkills[skill.specialskill] = 1;
    });
    state.coreSkillPointsRemaining = TOTAL_CORE_SKILL_POINTS;

}

export function calculatePickupSkillPoints() {
    const intelligence = state.characterAttributes['Intelligence'] || 0;
    const reflexes = state.characterAttributes['Réflexes'] || 0;
    const totalPickupPoints = intelligence + reflexes;
    
    const spentPickupPoints = Object.entries(state.characterSkills).reduce((acc, [skillName, value]) => {
        const isCore = state.gameData.coreskill.some(cs => cs.Classe === dom.identity.lifepath.value && cs.Skill === skillName);
        if (!isCore) {
            return acc + value;
        }
        return acc;
    }, 0);
    
    state.pickupSkillPointsRemaining = totalPickupPoints - spentPickupPoints;
}

export function updateSkillPointDisplays() {
    dom.coreSkillPointsDisplay.textContent = state.coreSkillPointsRemaining;
    dom.pickupSkillPointsDisplay.textContent = state.pickupSkillPointsRemaining;
}

export function updateSpecialSkillTitle() {
    const selectedRole = dom.identity.lifepath.value;
    const specialSkillInfo = state.gameData.specialskill.find(s => s.Classe === selectedRole);
    if (!specialSkillInfo) return;

    const specialSkillName = specialSkillInfo.specialskill;
    const specialSkillValue = state.characterSkills[specialSkillName] || 0;

    const budgetEntry = state.gameData.budget.find(entry => 
        entry.Classe === selectedRole && 
        parseInt(entry.Niveau, 10) === specialSkillValue
    );

    const title = budgetEntry ? budgetEntry.Titre : '';
    
    const titleElement = document.getElementById('special-skill-title');
    if (titleElement) {
        titleElement.textContent = `(${title})`;
    }
}


export function updateSkillButtons() {
    skillButtonsCache.forEach(btn => {
        const action = btn.dataset.action;
        const skillName = btn.dataset.skill;
        const isCore = btn.dataset.core === 'true';

        // Logique pour bloquer le bouton [-] de la compétence spéciale si elle est à 1
        const selectedRole = dom.identity.lifepath.value;
        const specialSkillInfo = state.gameData.specialskill.find(s => s.Classe === selectedRole);
        const isSpecialSkill = specialSkillInfo && skillName === specialSkillInfo.specialskill;

        if (action === 'increase') {
            if (state.characterSkills[skillName] >= MAX_STAT) {
                btn.disabled = true;
            } else if (isCore) {
                btn.disabled = state.coreSkillPointsRemaining <= 0;
            } else {
                btn.disabled = state.pickupSkillPointsRemaining <= 0;
            }
        } else if (action === 'decrease') {
            if (isSpecialSkill) {
                btn.disabled = state.characterSkills[skillName] <= 1;
            } else {
                btn.disabled = state.characterSkills[skillName] <= MIN_SKILL;
            }
        }
    });
}

export function handleSkillChange(skillName, isCore, action, buttonElement) {
    const oldValue = state.characterSkills[skillName];

    // La logique de blocage est maintenant gérée par updateSkillButtons, 
    // donc on peut simplifier ici, bien que la vérification ne nuise pas.
    if (action === 'increase' && oldValue < MAX_STAT) {
        if (isCore && state.coreSkillPointsRemaining > 0) {
            state.characterSkills[skillName]++;
            state.coreSkillPointsRemaining--;
        } else if (!isCore && state.pickupSkillPointsRemaining > 0) {
            state.characterSkills[skillName]++;
            state.pickupSkillPointsRemaining--;
        }
    } else if (action === 'decrease' && oldValue > MIN_SKILL) {
        // La logique de blocage dans updateSkillButtons empêchera cette condition
        // d'être appelée incorrectement pour la compétence spéciale.
        if (isCore) {
            state.characterSkills[skillName]--;
            state.coreSkillPointsRemaining++;
        } else {
            state.characterSkills[skillName]--;
            state.pickupSkillPointsRemaining++;
        }
    }

    if (oldValue !== state.characterSkills[skillName]) {
        buttonElement.closest('.skill-controls').querySelector('.skill-value').textContent = state.characterSkills[skillName];
        updateSkillPointDisplays();
        updateSkillButtons();
    }
}

export function render() {
    const skillsContainer = dom.skillsContainer;
    skillsContainer.innerHTML = '';
    const selectedClass = dom.identity.lifepath.value;
    const coreSkillsForClass = state.gameData.coreskill
        .filter(skill => skill.Classe === selectedClass)
        .map(skill => skill.Skill);

    const specialSkillInfo = state.gameData.specialskill.find(s => s.Classe === selectedClass);
    if (specialSkillInfo) {
        const specialSkillName = specialSkillInfo.specialskill;
        const specialSkillGroup = document.createElement('div');
        specialSkillGroup.className = 'skill-group';
        specialSkillGroup.id = 'special-skill-group';
        const isCore = true;
        const coreClass = 'core-skill';
        specialSkillGroup.innerHTML = `
            <h3>Compétence spéciale</h3>
            <div class="skills-list">
                <div class="skill-item ${coreClass}">
                        <div class="skill-name-container">
                            <span class="skill-name">${specialSkillName}<br>
                            <span id="special-skill-title" class="special-skill-title"></span></span>
                    </div>
                    <div class="skill-controls">
                        <button class="quantity-btn" data-skill="${specialSkillName}" data-core="${isCore}" data-action="decrease">-</button>
                        <span class="skill-value">${state.characterSkills[specialSkillName]}</span>
                        <button class="quantity-btn" data-skill="${specialSkillName}" data-core="${isCore}" data-action="increase">+</button>
                    </div>
                </div>
            </div>`;
        skillsContainer.appendChild(specialSkillGroup);
    };


    const skillsByStat = state.gameData.competences.reduce((acc, skill) => {
        const stat = skill.Statistique;
        if (!acc[stat]) acc[stat] = [];
        acc[stat].push(skill);
        return acc;
    }, {});

    const statOrder = ['Intelligence', 'Classe','Technique' ,'Réflexes',  'Sang-Froid',  'Puissance', 'Esprit'];

    statOrder.forEach(statName => {
        if (!skillsByStat[statName]) return;
        
        const skillGroup = document.createElement('div');
        skillGroup.className = 'skill-group';
        let skillsListHtml = '';
        
        const groupedByCompetence = skillsByStat[statName].reduce((acc, item) => {
            const comp = item.Competence;
            if (!acc[comp]) acc[comp] = [];
            acc[comp].push(item['Sous-competence']);
            return acc;
        }, {});

        for (const compName in groupedByCompetence) {
            const subSkills = groupedByCompetence[compName];
            if (subSkills.length === 1 && subSkills[0] === compName) {
                const isCore = coreSkillsForClass.includes(compName);
                const coreClass = isCore ? 'core-skill' : '';
                skillsListHtml += `
                    <div class="skill-item ${coreClass}">
                        <span class="skill-name">${compName}</span>
                        <div class="skill-controls">
                            <button class="quantity-btn" data-skill="${compName}" data-core="${isCore}" data-action="decrease">-</button>
                            <span class="skill-value">${state.characterSkills[compName]}</span>
                            <button class="quantity-btn" data-skill="${compName}" data-core="${isCore}" data-action="increase">+</button>
                        </div>
                    </div>`;
            } else {
                skillsListHtml += `<div class="skill-parent">${compName}</div>`;
                subSkills.forEach(subSkillName => {
                    const isCore = coreSkillsForClass.includes(subSkillName);
                    const coreClass = isCore ? 'core-skill' : '';
                    skillsListHtml += `
                        <div class="skill-sub-item ${coreClass}">
                            <span class="skill-name">${subSkillName}</span>
                            <div class="skill-controls">
                                <button class="quantity-btn" data-skill="${subSkillName}" data-core="${isCore}" data-action="decrease">-</button>
                                <span class="skill-value">${state.characterSkills[subSkillName]}</span>
                                <button class="quantity-btn" data-skill="${subSkillName}" data-core="${isCore}" data-action="increase">+</button>
                            </div>
                        </div>`;
                });
            }
        }
        skillGroup.innerHTML = `<h3>${statName}</h3><div class="skills-list">${skillsListHtml}</div>`;
        skillsContainer.appendChild(skillGroup);
    });
    
    skillButtonsCache = document.querySelectorAll('.skill-controls .quantity-btn');

    updateSkillButtons();
    updateSkillPointDisplays();
}