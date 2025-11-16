document.addEventListener('DOMContentLoaded', () => {
    
    const gameData = {};
    const domElements = {};
    let characterAttributes = {};
    let pointsRemaining = 0;
    const MIN_STAT = 2;
    const MAX_STAT = 10;

    async function loadCsv(filePath) {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Erreur HTTP ${response.status} pour le fichier ${filePath}`);
        let text = await response.text();
        if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) return [];
        const header = lines.shift().split(';').map(h => h.trim());
        return lines.map(line => {
            const values = line.split(';').map(v => v.trim());
            return header.reduce((obj, key, index) => {
                obj[key] = values[index] || '';
                return obj;
            }, {});
        });
    }

    const getRandomItem = (arr) => {
        if (!arr || arr.length === 0) return { texte: "ERREUR", ethnie: "ERREUR", langue: "ERREUR"};
        return arr[Math.floor(Math.random() * arr.length)];
    };

    function generateTotalPoints() {
        let sum;
        do {
            sum = 0;
            for (let i = 0; i < 7; i++) sum += Math.floor(Math.random() * 10) + 1;
        } while (sum < 14);
        return sum;
    }

    function distributeAttributes(totalPoints) {
        const stats = gameData.stats.map(s => s.Statistique);
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

    function randomizeHistory() {
        domElements.history.style.textContent = getRandomItem(gameData.vetement).texte;
        domElements.history.hair.textContent = getRandomItem(gameData.coiffure).texte;
        domElements.history.accessory.textContent = getRandomItem(gameData.accessoire).texte;
        domElements.history.csp.textContent = getRandomItem(gameData.origine).texte;
        domElements.history.childhood.textContent = getRandomItem(gameData.childhood).texte;
        const ethnieRoll = getRandomItem(gameData.ethnie);
        domElements.history.origin.textContent = ethnieRoll.ethnie;
        domElements.history.language.textContent = ethnieRoll.langue;
        const fateRoll = Math.floor(Math.random() * 10) + 1;
		const misfortune = getRandomItem(gameData.lose).texte;
		const destin = getRandomItem(gameData.destin).texte
        if (fateRoll <= 6) {
            domElements.history.familyFate.innerHTML = `Vos 2 parents sont vivants.<br>${misfortune}`;
        } else {
            domElements.history.familyFate.innerHTML = `${destin}<br>${misfortune}`;
        }
        const siblingsRoll = Math.floor(Math.random() * 10) + 1;
        if (siblingsRoll > 7) {
            domElements.history.siblings.textContent = 'Vous êtes enfant unique';
        } else {
            const totalSiblings = siblingsRoll;
            const numBrothers = Math.floor(Math.random() * (totalSiblings + 1));
            const numSisters = totalSiblings - numBrothers;
            domElements.history.siblings.textContent = `Vous avez ${numBrothers} frère(s) et ${numSisters} soeur(s)`;
        }
        updateSummary();
    }

    function updateSummary() {
        domElements.summary.name.textContent = domElements.identity.name.value || '...';
        domElements.summary.handle.textContent = domElements.identity.handle.value || '...';
        domElements.summary.lifepath.textContent = domElements.identity.lifepath.options[domElements.identity.lifepath.selectedIndex].text;
        domElements.summary.style.textContent = domElements.history.style.textContent;
        domElements.summary.hair.textContent = domElements.history.hair.textContent;
        domElements.summary.accessory.textContent = domElements.history.accessory.textContent;
        domElements.summary.origin.textContent = domElements.history.origin.textContent;
        domElements.summary.language.textContent = domElements.history.language.textContent;
        domElements.summary.csp.textContent = domElements.history.csp.textContent;
        domElements.summary.childhood.textContent = domElements.history.childhood.textContent;
        domElements.summary.familyFate.innerHTML = domElements.history.familyFate.innerHTML;
        domElements.summary.siblings.textContent = domElements.history.siblings.textContent;
        if (domElements.summary.attributes) {
            domElements.summary.attributes.innerHTML = '';
            for (const statName in characterAttributes) {
                const summaryLine = document.createElement('p');
                summaryLine.innerHTML = `<strong>${statName}:</strong> ${characterAttributes[statName]}`;
                domElements.summary.attributes.appendChild(summaryLine);
            }
        }
        if (characterAttributes['Psychologie']) {
            const humanity = characterAttributes['Psychologie'] * 10;
            domElements.summary.humanity.textContent = humanity;
        }
    }

    function renderAttributes() {
        domElements.attributeGrid.innerHTML = '';
        domElements.pointsDisplay.textContent = pointsRemaining;
        gameData.stats.forEach(statInfo => {
            const statName = statInfo.Statistique;
            const statValue = characterAttributes[statName];
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
            domElements.attributeGrid.appendChild(card);
            if (statName === 'Technique') {
                const humanityCard = document.createElement('div');
                humanityCard.className = 'attribute-card humanity-card';
                const humanityValue = characterAttributes['Psychologie'] * 10;
                humanityCard.innerHTML = `
                    <h3>Humanité</h3>
                    <p class="description">A combien de degrés de la cyberpsychose êtes vous ?</p>
                    <div class="attribute-controls">
                        <span class="attribute-value">${humanityValue}</span>
                    </div>`;
                domElements.attributeGrid.appendChild(humanityCard);
            }
        });
        updateAttributeButtons();
    }
    
    function changeAttribute(attrKey, action) {
        if (action === 'increase' && pointsRemaining > 0 && characterAttributes[attrKey] < MAX_STAT) {
            characterAttributes[attrKey]++;
            pointsRemaining--;
        } else if (action === 'decrease' && characterAttributes[attrKey] > MIN_STAT) {
            characterAttributes[attrKey]--;
            pointsRemaining++;
        }
        renderAttributes();
        updateSummary();
    }

    function updateAttributeButtons() {
        document.querySelectorAll('[data-action="increase"]').forEach(btn => {
            const attrKey = btn.dataset.attr;
            btn.disabled = (pointsRemaining === 0 || characterAttributes[attrKey] >= MAX_STAT);
        });
        document.querySelectorAll('[data-action="decrease"]').forEach(btn => {
            const attrKey = btn.dataset.attr;
            btn.disabled = (characterAttributes[attrKey] <= MIN_STAT);
        });
    }

    function renderSkills() {
        const skillsContainer = domElements.skillsContainer;
        skillsContainer.innerHTML = '';

        const skillsByStat = gameData.competences.reduce((acc, skill) => {
            const stat = skill.Statistique;
            if (!acc[stat]) acc[stat] = [];
            acc[stat].push(skill);
            return acc;
        }, {});

        const statOrder = ['Intelligence', 'Technique', 'Réflexes', 'Psychologie', 'Sang-Froid', 'Puissance', 'Classe'];

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
                    skillsListHtml += `
                        <div class="skill-item">
                            <span class="skill-name">${compName}</span>
                            <div class="skill-controls">
                                <button class="quantity-btn" disabled>-</button>
                                <span class="skill-value">0</span>
                                <button class="quantity-btn" disabled>+</button>
                            </div>
                        </div>`;
                } else {
                    skillsListHtml += `<div class="skill-parent">${compName}</div>`;
                    subSkills.forEach(subSkillName => {
                        skillsListHtml += `
                            <div class="skill-sub-item">
                                <span class="skill-name">${subSkillName}</span>
                                <div class="skill-controls">
                                    <button class="quantity-btn" disabled>-</button>
                                    <span class="skill-value">0</span>
                                    <button class="quantity-btn" disabled>+</button>
                                </div>
                            </div>`;
                    });
                }
            }
            skillGroup.innerHTML = `<h3>${statName}</h3><div class="skills-list">${skillsListHtml}</div>`;
            skillsContainer.appendChild(skillGroup);
        });
    }

    function generateCharacterSheetText() {
        const familyFateText = domElements.summary.familyFate.innerHTML.replace(/<br\s*[\/]?>/gi, "\n                 ");
        return `
=== FICHE DE PERSONNAGE CYBERPUNK ===

--- IDENTITÉ ---
NOM D'AGENT:     ${domElements.summary.name.textContent}
PSEUDONYME:      ${domElements.summary.handle.textContent}
ARCHÉTYPE:       ${domElements.summary.lifepath.textContent}

--- HISTORIQUE PERSONNEL ---
Style:           ${domElements.summary.style.textContent}
Coiffure:        ${domElements.summary.hair.textContent}
Accessoire:      ${domElements.summary.accessory.textContent}
Origine:         ${domElements.summary.origin.textContent}
Langue:          ${domElements.summary.language.textContent}
CSP d'Origine:   ${domElements.summary.csp.textContent}
Enfance:         ${domElements.summary.childhood.textContent}
Destin Familial: ${familyFateText}
Adelphe(s):      ${domElements.summary.siblings.textContent}

--- ATTRIBUTS ---
${Object.entries(characterAttributes).map(([key, value]) => `${key.padEnd(15, ' ')}: ${value}`).join('\n')}

--- STATS SECONDAIRES ---
Humanité:        ${domElements.summary.humanity.textContent}
        `.trim();
    }

    function generateCharacterCSV() {
        const charName = domElements.identity.name.value || 'personnage_sans_nom';
        let csvContent = "Nom du personnage;Nom de l'attribut;Valeur de l'attribut\n";
        for (const statName in characterAttributes) {
            const statValue = characterAttributes[statName];
            csvContent += `"${charName}";"${statName}";"${statValue}"\n`;
        }
        return csvContent;
    }

    function downloadFile(content, fileName, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async function initializeApp() {
        Object.assign(domElements, {
            attributeGrid: document.querySelector('.attribute-grid'),
            pointsDisplay: document.getElementById('points-remaining'),
            skillsContainer: document.getElementById('skills-container'),
            randomizeHistoryBtn: document.getElementById('randomize-history-btn'),
            exportCsvBtn: document.getElementById('export-csv-btn'),
            downloadBtn: document.getElementById('download-btn'),
            printBtn: document.getElementById('print-btn'),
            identity: { name: document.getElementById('char-name'), handle: document.getElementById('char-handle'), lifepath: document.getElementById('lifepath') },
            history: {
                style: document.getElementById('char-style'), hair: document.getElementById('char-hair'), accessory: document.getElementById('char-accessory'),
                origin: document.getElementById('char-origin'), language: document.getElementById('char-language'), csp: document.getElementById('char-csp'),
                childhood: document.getElementById('char-childhood'), familyFate: document.getElementById('char-family-fate'),
                siblings: document.getElementById('char-siblings'),
            },
            summary: {
                name: document.getElementById('summary-name'), handle: document.getElementById('summary-handle'), lifepath: document.getElementById('summary-lifepath'),
                style: document.getElementById('summary-style'), hair: document.getElementById('summary-hair'), accessory: document.getElementById('summary-accessory'),
                origin: document.getElementById('summary-origin'), language: document.getElementById('summary-language'), csp: document.getElementById('summary-csp'),
                childhood: document.getElementById('summary-childhood'), familyFate: document.getElementById('summary-family-fate'),
                siblings: document.getElementById('summary-siblings'),
                attributes: document.getElementById('summary-attributes'),
                humanity: document.getElementById('summary-humanity'),
            }
        });
        domElements.randomizeHistoryBtn.disabled = true;
        domElements.randomizeHistoryBtn.textContent = "Chargement des données...";
        try {
            const filePaths = ['vetement.csv', 'coiffure.csv', 'accessoire.csv', 'origine.csv', 'childhood.csv', 'ethnie.csv', 'destin.csv', 'lose.csv', 'stat.csv', 'competences.csv'];
            const promises = filePaths.map(path => loadCsv(path));
            const [vetement, coiffure, accessory, origine, childhood, ethnie, destin, lose, stats, competences] = await Promise.all(promises);
            if ([...promises].some(data => !data || data.length === 0)) {
                throw new Error("Un ou plusieurs fichiers CSV sont vides ou n'ont pas pu être parsés.");
            }
            Object.assign(gameData, { vetement, coiffure, accessoire: accessory, origine, childhood, ethnie, destin, lose, stats, competences });
            const totalPoints = generateTotalPoints();
            characterAttributes = distributeAttributes(totalPoints);
            pointsRemaining = 0;
            domElements.randomizeHistoryBtn.disabled = false;
            domElements.randomizeHistoryBtn.textContent = "Générer un nouvel historique";
            renderAttributes();
            renderSkills();
            randomizeHistory();
            domElements.attributeGrid.addEventListener('click', (e) => {
                if (e.target.matches('.quantity-btn')) changeAttribute(e.target.dataset.attr, e.target.dataset.action);
            });
            domElements.randomizeHistoryBtn.addEventListener('click', () => {
                const newTotalPoints = generateTotalPoints();
                characterAttributes = distributeAttributes(newTotalPoints);
                pointsRemaining = 0;
                renderAttributes();
                randomizeHistory();
            });
            domElements.identity.name.addEventListener('input', updateSummary);
            domElements.identity.handle.addEventListener('input', updateSummary);
            domElements.identity.lifepath.addEventListener('change', updateSummary);
            domElements.printBtn.addEventListener('click', () => window.print());
            domElements.downloadBtn.addEventListener('click', () => {
                const textToDownload = generateCharacterSheetText();
                downloadFile(textToDownload, 'cyberpunk_personnage.txt', 'text/plain');
            });
            domElements.exportCsvBtn.addEventListener('click', () => {
                const csvContent = generateCharacterCSV();
                downloadFile(csvContent, 'export_personnage.csv', 'text/csv;charset=utf-8;');
            });
        } catch (error) {
            console.error("ERREUR D'INITIALISATION :", error);
            domElements.randomizeHistoryBtn.textContent = "ERREUR DE CHARGEMENT";
            document.querySelectorAll('.history-value').forEach(el => el.textContent = "Erreur");
        }
    }
    initializeApp();
});