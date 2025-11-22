import { dom } from './dom.js';
import { state, MIN_STAT, MAX_STAT } from './state.js';

function generateTotalPoints() {
    let sum;
    do {
        sum = 0;
        for (let i = 0; i < 7; i++) sum += Math.floor(Math.random() * 10) + 1;
    } while (sum < 14); // Assure un minimum de 14 points pour les 7 stats (2 par stat)
    return sum;
}

function distributeAttributes(totalPoints) {
    const stats = state.gameData.stats.map(s => s.Statistique);
    const distributed = {};
    stats.forEach(stat => { distributed[stat] = MIN_STAT; });
    
    let pointsToSpend = totalPoints - (stats.length * MIN_STAT);
    
    while (pointsToSpend > 0) {
        const randomStat = stats[Math.floor(Math.random() * stats.length)];
        if (distributed[randomStat] < MAX_STAT) {
            distributed[randomStat]++;
            pointsToSpend--;
        }
    }
    return distributed;
}

export function initializeAttributes() {
    const totalPoints = generateTotalPoints();
    state.characterAttributes = distributeAttributes(totalPoints);
    state.attrPointsRemaining = 0;
}

function updateAttributeButtons() {
    document.querySelectorAll('.attribute-controls .quantity-btn[data-attr]').forEach(btn => {
        const action = btn.dataset.action;
        const attrKey = btn.dataset.attr;
        if (action === 'increase') {
            btn.disabled = (state.attrPointsRemaining === 0 || state.characterAttributes[attrKey] >= MAX_STAT);
        } else if (action === 'decrease') {
            btn.disabled = (state.characterAttributes[attrKey] <= MIN_STAT);
        }
    });
}

export function handleAttributeChange(attrKey, action, buttonElement) {
    const oldValue = state.characterAttributes[attrKey];
    if (action === 'increase' && state.attrPointsRemaining > 0 && oldValue < MAX_STAT) {
        state.characterAttributes[attrKey]++;
        state.attrPointsRemaining--;
    } else if (action === 'decrease' && oldValue > MIN_STAT) {
        state.characterAttributes[attrKey]--;
        state.attrPointsRemaining++;
    }

    if (oldValue !== state.characterAttributes[attrKey]) {
        buttonElement.closest('.attribute-controls').querySelector('.attribute-value').textContent = state.characterAttributes[attrKey];
        dom.pointsDisplay.textContent = state.attrPointsRemaining;
        updateAttributeButtons();

    if (attrKey === 'Esprit') {
                const humanityCardValue = document.querySelector('.humanity-card .attribute-value');
                if (humanityCardValue) {
                    humanityCardValue.textContent = state.characterAttributes['Esprit'] * 10;
                }
        }
    }
}
export function render() {
    dom.attributeGrid.innerHTML = '';
    dom.pointsDisplay.textContent = state.attrPointsRemaining;

    state.gameData.stats.forEach(statInfo => {
        const statName = statInfo.Statistique;
        const statValue = state.characterAttributes[statName];
        const card = document.createElement('div');
        card.className = 'attribute-card';
        card.innerHTML = `
            <h3>${statName}</h3>
            <p class="description">${statInfo.Détail}</p>
            <div class="attribute-controls">
                <button class="quantity-btn" data-attr="${statName}" data-action="decrease">-</button>
                <span class="attribute-value">${statValue}</span>
                <button class="quantity-btn" data-attr="${statName}" data-action="increase">+</button>
            </div>`;
        dom.attributeGrid.appendChild(card);

   });

    const humanityCard = document.createElement('div');
    humanityCard.className = 'attribute-card humanity-card';
    const humanityValue = (state.characterAttributes['Esprit'] || 0) * 10;
    humanityCard.innerHTML = `
        <h3>Humanité</h3>
        <p class="description">A combien de degrés de la cyberpsychose êtes vous ?</p>
        <div class="attribute-controls">
            <span class="attribute-value">${humanityValue}</span>
        </div>`;
    dom.attributeGrid.appendChild(humanityCard);

    updateAttributeButtons();
}