import { dom } from './dom.js';
import { state, MIN_SKILL, MAX_STAT, TOTAL_CORE_SKILL_POINTS } from './state.js';

export function initializeSkills() {
    state.characterSkills = {};
    state.gameData.competences.forEach(skill => {
        state.characterSkills[skill['Sous-competence']] = 0;
    });
    state.gameData.specialskill.forEach(skill => {
        state.characterSkills[skill.specialskill] = 0;
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

function updateSkillPointDisplays() {
    dom.coreSkillPointsDisplay.textContent = state.coreSkillPointsRemaining;
    dom.pickupSkillPointsDisplay.textContent = state.pickupSkillPointsRemaining;
}

function updateSkillButtons() {
    document.querySelectorAll('.skill-controls .quantity-btn').forEach(btn => {
        const action = btn.dataset.action;
        const skillName = btn.dataset.skill;
        const isCore = btn.dataset.core === 'true';

        if (action === 'increase') {
            if (state.characterSkills[skillName] >= MAX_STAT) {
                btn.disabled = true;
            } else if (isCore) {
                btn.disabled = state.coreSkillPointsRemaining <= 0;
            } else {
                btn.disabled = state.pickupSkillPointsRemaining <= 0;
            }
        } else if (action === 'decrease') {
            btn.disabled = state.characterSkills[skillName] <= MIN_SKILL;
        }
    });
}

export function handleSkillChange(skillName, isCore, action) {
    if (action === 'increase' && state.characterSkills[skillName] < MAX_STAT) {
        if (isCore && state.coreSkillPointsRemaining > 0) {
            state.characterSkills[skillName]++;
            state.coreSkillPointsRemaining--;
        } else if (!isCore && state.pickupSkillPointsRemaining > 0) {
            state.characterSkills[skillName]++;
            state.pickupSkillPointsRemaining--;
        }
    } else if (action === 'decrease' && state.characterSkills[skillName] > MIN_SKILL) {
        if (isCore) {
            state.characterSkills[skillName]--;
            state.coreSkillPointsRemaining++;
        } else {
            state.characterSkills[skillName]--;
            state.pickupSkillPointsRemaining++;
        }
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
            <h3>Spécial</h3>
            <div class="skills-list">
                <div class="skill-item ${coreClass}">
                    <span class="skill-name">${specialSkillName}</span>
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

    const statOrder = ['Intelligence', 'Technique', 'Classe' ,'Réflexes', 'Psychologie', 'Sang-Froid',  'Puissance'];

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
    
    updateSkillButtons();
    updateSkillPointDisplays();
}