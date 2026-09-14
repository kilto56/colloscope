import {
    findGroupe,
    searchEleve,
    findCodeInfo,
    getPlanningGroupe,
    getPlanningSemaine,
    findByProf,
    findBySalle,
    findGroupesByCode,
    searchCombined,
    getCurrentWeek
} from "./mod.js";

const resultat = document.querySelector('.resultat');
const resultatDetails = resultat.closest('details');

const render = (html) => {
    resultat.innerHTML = html;
    if (resultatDetails) resultatDetails.open = true;
}

const renderMessage = (msg) => {
    render(`<p class="message">${msg}</p>`);
}


const planningToHTML = (planning) => {
    let rows = '';
    for (let s = 1; s <= 14; s++) {
        const items = planning[`semaine${s}`] || [];
        const itemsHTML = items.length
            ? items.map(info => `
                <div class="colle-item">
                    <span class="badge" data-matiere="${info.matiere}">${info.code}</span>
                    <span>${info.Professeur}</span>
                    <span>${info.creneau} (${info.duree})</span>
                    <span>${info.salle}</span>
                </div>
            `).join('')
            : '<span class="empty">-</span>';

        rows += `
            <tr>
                <td>S${s}</td>
                <td>${itemsHTML}</td>
            </tr>
        `;
    }

    return `
        <table class="planning-table">
            <thead><tr><th>Semaine</th><th>Colles</th></tr></thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

const renderGroupePlanning = (numGroupe, planning) => {
    const eleves = findGroupe(numGroupe);
    const elevesHTML = eleves
        ? `<ul class="eleves-list">${eleves.map(e => `<li>${e.nom} ${e.prenom}</li>`).join('')}</ul>`
        : '';

    render(`
        <h3>Groupe ${numGroupe}</h3>
        ${elevesHTML}
        ${planningToHTML(planning)}
    `);
}


const combineCheckbox = document.getElementById('combine-queries');

// Recupere la valeur de tous les champs de recherche en une seule fois
const getAllFilters = () => ({
    eleveQuery: document.getElementById('input-student').value,
    numGroupe: document.getElementById('input-group').value,
    profQuery: document.getElementById('input-prof').value,
    salleQuery: document.getElementById('input-salle').value,
    semaine: document.getElementById('input-semaine').value,
    code: document.getElementById('input-code').value
});

const hasAnyFilter = (filters) => Object.values(filters).some(v => v.trim());

const renderCombinedResults = () => {
    const filters = getAllFilters();
    if (!hasAnyFilter(filters)) {
        return renderMessage("Remplissez au moins un des champs de recherche ci-dessus.");
    }

    const results = searchCombined(filters);
    if (results.length === 0) {
        return renderMessage("Aucun résultat pour cette combinaison de critères.");
    }

    const rows = results.map(r => `
        <tr>
            <td>Gr ${r.numGroupe}</td>
            <td>S${r.semaine}</td>
            <td><span class="badge" data-matiere="${r.matiere}">${r.code}</span></td>
            <td>${r.Professeur}</td>
            <td>${r.creneau} (${r.duree})</td>
            <td>${r.salle}</td>
        </tr>
    `).join('');

    render(`
        <h3>${results.length} résultat${results.length > 1 ? 's' : ''}</h3>
        <table class="planning-table">
            <thead><tr><th>Groupe</th><th>Semaine</th><th>Code</th><th>Prof</th><th>Créneau</th><th>Salle</th></tr></thead>
            <tbody>${rows}</tbody>
        </table>
    `);
}

const bindSearch = (buttonId, handler) => {
    const button = document.getElementById(buttonId);
    const input = button.closest('.search').querySelector('input');

    const run = () => {
        if (combineCheckbox.checked) {
            renderCombinedResults();
        } else {
            handler(input.value);
        }
    };

    button.addEventListener('click', run);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') run();
    });
}

//search student

bindSearch('search-student', (value) => {
    if (!value.trim()) return renderMessage("Entrez un nom d'élève.");

    const matches = searchEleve(value);

    if (matches.length === 0) {
        renderMessage("Aucun élève trouvé.");
    } else if (matches.length === 1) {
        const [numGroupe, planning] = getPlanningGroupe(matches[0].numGroupe);
        renderGroupePlanning(numGroupe, planning);
    } else {
        render(`
            <p>${matches.length} résultats, précisez votre recherche :</p>
            <ul class="eleves-list">
                ${matches.map(e => `<li>${e.nom} ${e.prenom} — Groupe ${e.numGroupe}</li>`).join('')}
            </ul>
        `);
    }
});

//search grp

bindSearch('search-group', (value) => {
    const numGroupe = parseInt(value, 10);
    if (!numGroupe || numGroupe < 1 || numGroupe > 15) {
        return renderMessage("Entrez un numéro de groupe entre 1 et 15.");
    }

    const result = getPlanningGroupe(numGroupe);
    if (!result) return renderMessage("Groupe introuvable.");

    const [groupe, planning] = result;
    renderGroupePlanning(groupe, planning);
});

//search prof

bindSearch('search-prof', (value) => {
    if (!value.trim()) return renderMessage("Entrez un nom de professeur.");

    const results = findByProf(value);
    if (results.length === 0) return renderMessage("Aucun créneau trouvé pour ce professeur.");

    render(`
        <h3>Créneaux — ${value}</h3>
        <ul class="creneaux-list">
            ${results.map(info => `
                <li>
                    <span class="badge" data-matiere="${info.matiere}">${info.code}</span>
                    ${info.Professeur} — ${info.creneau} (${info.duree}) — Salle ${info.salle}
                </li>
            `).join('')}
        </ul>
    `);
});

//search room

bindSearch('search-salle', (value) => {
    if (!value.trim()) return renderMessage("Entrez un nom de salle.");

    const results = findBySalle(value);
    if (results.length === 0) return renderMessage("Aucun créneau trouvé pour cette salle.");

    render(`
        <h3>Créneaux — Salle ${value}</h3>
        <ul class="creneaux-list">
            ${results.map(info => `
                <li>
                    <span class="badge" data-matiere="${info.matiere}">${info.code}</span>
                    ${info.Professeur} — ${info.creneau} (${info.duree})
                </li>
            `).join('')}
        </ul>
    `);
});

//search week

bindSearch('search-semaine', (value) => {
    const semaine = parseInt(value, 10);
    if (!semaine || semaine < 1 || semaine > 14) {
        return renderMessage("Entrez un numéro de semaine entre 1 et 14.");
    }

    const planning = getPlanningSemaine(semaine);
    const groupesHTML = Object.entries(planning).map(([groupeKey, items]) => `
        <tr>
            <td>${groupeKey.replace('groupe', 'Gr ')}</td>
            <td>
                ${items.length
                    ? items.map(info => `
                        <div class="colle-item">
                            <span class="badge" data-matiere="${info.matiere}">${info.code}</span>
                            ${info.Professeur} — ${info.creneau}
                        </div>
                    `).join('')
                    : '<span class="empty">-</span>'}
            </td>
        </tr>
    `).join('');

    render(`
        <h3>Semaine ${semaine}</h3>
        <table class="planning-table">
            <thead><tr><th>Groupe</th><th>Colles</th></tr></thead>
            <tbody>${groupesHTML}</tbody>
        </table>
    `);
});

//search code

bindSearch('search-code', (value) => {
    const code = value.trim().toUpperCase();
    if (!code) return renderMessage("Entrez un code.");

    const info = findCodeInfo(code);
    if (!info) return renderMessage("Code introuvable.");

    const occurrences = findGroupesByCode(code);
    const occurrencesHTML = occurrences.length
        ? `<ul class="eleves-list">${occurrences.map(o => `<li>Groupe ${o.numGroupe} — Semaine ${o.semaine}</li>`).join('')}</ul>`
        : '<p>Ce code n\'apparaît dans aucun planning.</p>';

    render(`
        <h3>${info.code} — ${info.matiere}</h3>
        <p>${info.Professeur} — ${info.creneau} (${info.duree}) — Salle ${info.salle}</p>
        <h4>Utilisé par :</h4>
        ${occurrencesHTML}
    `);
});

//auto fill week

(() => {
    const weekInput = document.getElementById('input-semaine');
    weekInput.value = (Math.trunc(getCurrentWeek()) % 10) + 1;
})();

//details/summary system, opened on mobile
(() => {
    const allDetails = document.querySelectorAll('.sections-row > section > details');
    const mobileQuery = window.matchMedia('(max-width: 700px)');

    const applyResponsiveState = (isMobile) => {
        allDetails.forEach((details, index) => {
            details.open = isMobile ? index === 0 : true;
        });
    };

    applyResponsiveState(mobileQuery.matches);

    mobileQuery.addEventListener('change', (e) => applyResponsiveState(e.matches));
})();