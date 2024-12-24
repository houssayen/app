const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const { hostname } = require('os');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connexion à la base de données
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Récupération depuis les variables d'environnement
    ssl: {
        rejectUnauthorized: false, // Nécessaire si Render impose SSL
    },
});

pool.connect(err => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);
        return;
    }
    console.log('Connecté à la base de données Render');
}); 

// Route GET pour récupérer tous les produits
app.get('/api/produits', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM produits'); // Requête pour récupérer toutes les données
        res.json(result.rows); // Retourne les résultats au format JSON
    } catch (error) {
        console.error('Erreur lors de la récupération des produits :', error.message);
        res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
    }
});

app.post('/api/produits', async (req, res) => {
    const { nom, marque, ingredients, code_scanne, jours, date_expiration } = req.body; // Supposons que ces champs sont envoyés dans le corps de la requête

    // Vérification de la présence des champs requis
    if (!nom || !marque || !ingredients || !code_scanne || !jours || !date_expiration) {
        return res.status(400).json({ error: 'Données manquantes.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO produits (nom_produit, marque, ingredients, code_scanne, jours, date_expiration) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [nom, marque, ingredients, code_scanne, jours, date_expiration]
        );
        res.status(201).json(result.rows[0]); // Retourne le produit inséré avec un statut 201 (Créé)
    } catch (error) {
        console.error('Erreur lors de l\'insertion du produit :', error.message);
        res.status(500).json({ error: 'Erreur lors de l\'insertion du produit' });
    }
});

app.listen(port, () => {
    console.log(`Server running at ${port}`);
});

console.log(`Hostname: ${hostname()}`);