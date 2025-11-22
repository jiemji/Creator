export const dom = {};

export function initializeDom() {
    Object.assign(dom, {
        attributeGrid: document.querySelector('.attribute-grid'),
        pointsDisplay: document.getElementById('points-remaining'),
        skillsContainer: document.getElementById('skills-container'),
        coreSkillPointsDisplay: document.getElementById('core-skill-points-remaining'),
        pickupSkillPointsDisplay: document.getElementById('pickup-skill-points-remaining'),
        rerollHistoryBtn: document.getElementById('reroll-history-btn'),
        rerollAttributesBtn: document.getElementById('reroll-attributes-btn'),
        rerollSkillsBtn: document.getElementById('reroll-skills-btn'),
        refreshSummaryBtn: document.getElementById('refresh-summary-btn'),
        budgetDisplay: document.getElementById('char-budget'),
        budgetSalary: document.getElementById('char-salary'),
        exportCsvBtn: document.getElementById('export-csv-btn'),
        downloadBtn: document.getElementById('download-btn'),
        printBtn: document.getElementById('print-btn'),
        identity: {
            name: document.getElementById('char-name'),
            handle: document.getElementById('char-handle'),
            lifepath: document.getElementById('lifepath'),
            jobDescription: document.getElementById('char-job-description')
        },
        history: {
            style: document.getElementById('char-style'),
            hair: document.getElementById('char-hair'),
            accessory: document.getElementById('char-accessory'),
            origin: document.getElementById('char-origin'),
            language: document.getElementById('char-language'),
            csp: document.getElementById('char-csp'),
            childhood: document.getElementById('char-childhood'),
            familyFate: document.getElementById('char-family-fate'),
            siblings: document.getElementById('char-siblings'),
        },
        summary: {
            identity: document.getElementById('summary-identity'),
            history: document.getElementById('summary-history'),
            attributes: document.getElementById('summary-attributes'),
            skills: document.getElementById('summary-skills'),
            budget: document.getElementById('summary-budget'),
        }
    });
}