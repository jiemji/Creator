export const MIN_STAT = 2;
export const MAX_STAT = 10;
export const MIN_SKILL = 0;
export const TOTAL_CORE_SKILL_POINTS = 36;

export const state = {
    gameData: {},
    characterAttributes: {},
    characterSkills: {},
    characterBudget: { amount: 0, currency: '€$' },
    attrPointsRemaining: 0,
    coreSkillPointsRemaining: TOTAL_CORE_SKILL_POINTS,
    pickupSkillPointsRemaining: 0,
};