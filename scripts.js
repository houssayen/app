document.addEventListener('DOMContentLoaded', () => {

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const spinnerOverlay = document.getElementById('spinner-overlay');
    const form = document.getElementById('productForm');
    const productNameElement = document.getElementById('product-name');
    const brandElement = document.getElementById('brand');
    const ingredientsElement = document.getElementById('ingredients');
    const barcodeElement = document.getElementById('barcode');
    const expirationElement = document.getElementById('expiration');

    // Initialiser Quagga pour scanner le code-barres
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#interactive'),
            constraints: {
                facingMode: "environment"
            }
        },
        decoder: {
            readers: ["ean_reader", "upc_reader"]
        }
    }, function (err) {
        if (err) {
            console.error(err);
            alert("Erreur lors de l'initialisation du scanner.");
            return;
        }
        Quagga.start();

    });

    // Quand un code est détecté
    Quagga.onDetected(async function (data) {
        const code = data.codeResult.code;
        barcodeElement.value = code;

        // Rechercher le produit via Open Food Facts
        const apiUrl = `https://world.openfoodfacts.org/api/v0/product/${code}.json`;

        try {
            const response = await fetch(apiUrl);
            const result = await response.json();

            if (result.status === 1) {
                spinnerOverlay.classList.remove('d-none');
                await sleep(3000);
                spinnerOverlay.classList.add('d-none');
                const product = result.product;
                productNameElement.value = product.product_name;
                brandElement.value = product.brands;
                ingredientsElement.value = product.ingredients_text;
                document.getElementById('interactive').style.display = 'none';
                Quagga.stop();
            }

        } catch (error) {
            console.error("Erreur lors de la récupération des données :", error);
        }
    });

    function addDaysToDateTime(daysToAdd) {
        const now = new Date();
        // Ajouter directement les jours au temps UNIX
        const newTimestamp = now.getTime() + daysToAdd * 24 * 60 * 60 * 1000;
        // Créer une nouvelle date basée sur le timestamp ajusté
        const newDate = new Date(newTimestamp);
        // Formater la date et l'heure
        const formattedDate = newDate.toLocaleDateString("en-CA"); // Format YYYY-MM-DD (standard)
        const formattedTime = newDate.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
        }); // Format HH:mm (24 heures)

        return `${formattedDate} ${formattedTime}`;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Empêche la soumission du formulaire

        try {

            const produit = {
                nom: productNameElement.value,
                marque: brandElement.value,
                ingredients: ingredientsElement.value,
                code_scanne: barcodeElement.value,
                jours: expirationElement.value,
                date_expiration: addDaysToDateTime(expirationElement.value)
            };

            const responseRender = await fetch('https://scan-app-server.onrender.com/api/produits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(produit),
            });

            if (responseRender.ok) {
                const baseUrl = 'https://houssayen.github.io/';
                const pageToGo = 'app/products.html';
                const fullUrl = baseUrl + pageToGo;
                window.location.href = fullUrl;
            } else {
                throw new Error(responseRender.message);
            }
        } catch (error) {
            console.log(error);
        }
    });


});