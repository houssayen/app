document.addEventListener('DOMContentLoaded', () => {
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

                const dateObj = new Date(produit.created_at);
                const dateLocal = dateObj.toLocaleDateString('fr-FR');
                const timeLocal = dateObj.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                });

                const row = document.createElement('tr');
                row.innerHTML = `       
                 <td>${`${dateLocal} - ${timeLocal}`}</td>        
                <td>${produit.nom_produit}</td>              
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Erreur lors de l\'affichage des produits :', error.message);
        }
    };

    afficherProduits();

});