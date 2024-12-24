document.addEventListener('DOMContentLoaded', () => {

    function formatDateTimeWithLocation(dateTime) {

        const dateObj = new Date(dateTime);
        const dateLocal = dateObj.toLocaleDateString('fr-FR');
        const timeLocal = dateObj.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        });

        return `${dateLocal} - ${timeLocal}`;
    }

    function formatDateTime(dateTime) {

        const dateObj = new Date(dateTime);
        // Formater la date (YYYY-MM-DD) en UTC
        const dateLocal = dateObj.toISOString().split('T')[0];  // Format : YYYY-MM-DD (UTC)

        // Extraire l'heure et les minutes (HH:mm) en UTC
        const hours = String(dateObj.getUTCHours()).padStart(2, '0');  // Assure que l'heure est toujours sur 2 chiffres
        const minutes = String(dateObj.getUTCMinutes()).padStart(2, '0');  // Assure que les minutes sont sur 2 chiffres

        // Retourner la date et l'heure sous le format "YYYY-MM-DD - HH:mm" en UTC
        return `${dateLocal} - ${hours}:${minutes}`;
    }

    async function afficherProduits() {
        try {
            //const response = await fetch('http://localhost:3000/api/produits', { method: 'GET' });
            const response = await fetch('https://scan-app-server.onrender.com/api/produits', { method: 'GET' });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des produits');
            }

            const produits = await response.json();
            console.log(produits);

            const tableBody = document.getElementById('produits-table-body');
            tableBody.innerHTML = '';

            produits.forEach(produit => {
                const row = document.createElement('tr');
                row.innerHTML = `       
                    <td>${formatDateTimeWithLocation(produit.created_at)}</td>        
                    <td>${produit.nom_produit}</td>              
                    <td>${`${produit.jours}j`}</td>              
                    <td>${formatDateTime(produit.date_expiration)}</td>              
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Erreur lors de l\'affichage des produits :', error);
        }
    };

    afficherProduits();

});