import programmes from "./programmes.json" with { type: "json"};
import groupes from "./groupes.json" with { type: "json"};
import creneaux from "./creneaux.json" with { type: "json"};

const findEleve = (nom, prenom) => {
    for (const [numGroupe, groupe] of Object.entries(groupes.groupes)) {
        for (const eleve of groupe.eleves) {
            if (eleve.nom === nom && eleve.prenom === prenom) {
                return numGroupe;
            }
        }
    }
    return null;
}

const findGroupe = (numGroupe) => {
    return groupes.groupes[numGroupe]?.eleves || null;
}

const searchEleve = (query) => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results = [];
    for (const [numGroupe, groupe] of Object.entries(groupes.groupes)) {
        for (const eleve of groupe.eleves) {
            const fullName = `${eleve.nom} ${eleve.prenom}`.toLowerCase();
            if (fullName.includes(q)) {
                results.push({ ...eleve, numGroupe });
            }
        }
    }
    return results;
}

const findCodeInfo = (code) => {
    for (const [matiere, codes] of Object.entries(creneaux)) {
        for (const [codeKey, codeInfo] of Object.entries(codes)) {
            if (codeKey === code) {
                return { matiere, code: codeKey, ...codeInfo };
            }
        }
    }
    return null;
}

const getGroupeSemaine = (groupe, semaine) => {
    return programmes?.groupes?.[groupe]?.[`semaine${semaine}`] || null;
}

const getSemaineGroupe = (semaine, groupe) => {
    return programmes?.semaines?.[semaine]?.[`groupe${groupe}`] || null;
}

const buildCodeIndex = () => {
    const index = {};
    for (const [matiere, codes] of Object.entries(creneaux)) {
        for (const [code, info] of Object.entries(codes)) {
            index[code] = { matiere, code, ...info };
        }
    }
    return index;
}

const CODE_INDEX = buildCodeIndex();

const buildEleveIndex = () => {
    const eleveIndex = {};

    for (let i = 1; i <= Object.keys(groupes.groupes).length; i++) {
        const eleves = findGroupe(i);
        if (eleves) {
            for (const eleve of eleves) {
                const key = `${eleve.nom.toUpperCase()} ${eleve.prenom.toUpperCase()}`;
                eleveIndex[key] = i;
            }
        } 
    }
    return eleveIndex;
}

const getPlanningEleve = (nom, prenom) => {
    const numGroupe = findEleve(nom, prenom);
    if (!numGroupe) return null;
    return getPlanningGroupe(numGroupe);
}

const getPlanningGroupe = (numGroupe) => {
    const eleves = findGroupe(numGroupe);
    if (!eleves) return null;

    const planning = {};
    const codeIndex = CODE_INDEX;
    for (let semaine = 1; semaine <= 14; semaine++) {
        const codes = getGroupeSemaine(numGroupe, semaine);
        if (!codes) continue;

        planning[`semaine${semaine}`] = planning[`semaine${semaine}`] || [];
        for (const code of codes) {
            planning[`semaine${semaine}`].push(codeIndex[code]);
        }
    }

    return [numGroupe, planning];
}

const getPlanningSemaine = (semaine) => {
    const planning = {};
    const codeIndex = CODE_INDEX;

    for (let numGroupe = 1; numGroupe <= Object.keys(groupes.groupes).length; numGroupe++) {
        const codes = getSemaineGroupe(semaine, numGroupe);
        if (!codes) continue;

        planning[`groupe${numGroupe}`] = planning[`groupe${numGroupe}`] || [];
        for (const code of codes) {
            planning[`groupe${numGroupe}`].push(codeIndex[code]);
        }
    }

    return planning;
}

const findByProf = (nomProf) => {
    const q = nomProf.trim().toLowerCase();
    if (!q) return [];

    return Object.values(CODE_INDEX).filter(info =>
        info.Professeur && info.Professeur.toLowerCase().includes(q)
    );
}

const findBySalle = (salle) => {
    const q = salle.trim().toLowerCase();
    if (!q) return [];

    return Object.values(CODE_INDEX).filter(info =>
        info.salle && info.salle.toLowerCase().includes(q)
    );
}

const findGroupesByCode = (code) => {
    const results = [];
    for (const [numGroupe, semaines] of Object.entries(programmes.groupes)) {
        for (const [semaineKey, codes] of Object.entries(semaines)) {
            if (codes.includes(code)) {
                results.push({ numGroupe, semaine: semaineKey.replace('semaine', '') });
            }
        }
    }
    return results;
}

export {
    findEleve,
    findGroupe,
    searchEleve,
    findCodeInfo,
    getPlanningEleve,
    getPlanningGroupe,
    getPlanningSemaine,
    findByProf,
    findBySalle,
    findGroupesByCode,
    buildEleveIndex,
    CODE_INDEX
};