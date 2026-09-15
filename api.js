import express from "express";
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
    getCurrentWeek,
    findEleve
} from "./mod.js";

const app = express();
app.use(express.json());

app.get("/eleve/:nom/:prenom", (req, res) => {
    const numGroupe = findEleve(req.params.nom, req.params.prenom);
    if (!numGroupe) return res.status(404).json({ error: "Eleve non trouvé(e)" });
    res.json(getPlanningGroupe(numGroupe));
});

app.get("/groupe/:num", (req, res) => {
    const groupe = findGroupe(req.params.num);
    if (!groupe) return res.status(404).json({ error: "Groupe non trouvé" });
});

app.get("/semaine/:num", (req, res) => {
    if (!(0 < req.params.num < 15)) return res.status(404).json({ error: "Numéro de semaine invalide" });
    res.json(getPlanningSemaine(req.params.num));
});

app.get("/code/:code", (req, res) => {
    const codeInfo = findCodeInfo(req.params.code);
    if (!codeInfo) return res.status(404).json({ error: "Code de colle invalide" });
    res.json(codeInfo);
});

app.get("/search", (req, res) => {
    res.json(searchCombined(req.query));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Colloscope Tool MP2I API listening on port ${PORT}`);
});