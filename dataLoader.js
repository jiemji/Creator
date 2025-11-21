async function loadCsv(filePath) {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Erreur HTTP ${response.status} pour le fichier ${filePath}`);
    
    let text = await response.text();
    // Gérer l'indicateur d'ordre des octets (BOM)
    if (text.charCodeAt(0) === 0xFEFF) {
        text = text.slice(1);
    }
    
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return []; // Retourne un tableau vide s'il n'y a pas de données

    const header = lines.shift().split(';').map(h => h.trim());
    
    return lines.map(line => {
        const values = line.split(';').map(v => v.trim());
        return header.reduce((obj, key, index) => {
            obj[key] = values[index] || '';
            return obj;
        }, {});
    });
}

export async function loadAllData() {
    const filePaths = {
        vetement: 'vetement.csv',
        coiffure: 'coiffure.csv',
        accessoire: 'accessoire.csv',
        origine: 'origine.csv',
        childhood: 'childhood.csv',
        ethnie: 'ethnie.csv',
        destin: 'destin.csv',
        lose: 'lose.csv',
        stats: 'stat.csv',
        competences: 'competences.csv',
        coreskill: 'coreskill.csv',
        specialskill: 'specialskill.csv',
        budget: 'budget.csv'
    };

    const promises = Object.entries(filePaths).map(([key, path]) => 
        loadCsv(path).then(data => ({ key, data }))
    );

    const results = await Promise.all(promises);

    const gameData = results.reduce((acc, { key, data }) => {
        if (!data || data.length === 0) {
            throw new Error(`Le fichier CSV ${filePaths[key]} est vide ou n'a pas pu être parsé.`);
        }
        acc[key] = data;
        return acc;
    }, {});

    return gameData;
}