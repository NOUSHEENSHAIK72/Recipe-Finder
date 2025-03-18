const searchBox = document.querySelector('.searchBox');
const searchBtn = document.querySelector('.searchBtn');
const recipeContainer = document.querySelector('.recipe-container');
const recipeDetailsContent = document.querySelector('.recipe-details-content');
const recipeCloseBtn = document.querySelector('.recipe-close-Btn');

const API_KEY = '5c8777fa3a2844deba0ceeab81ee9eac'; // Use your API key here

const fetchRecipes = async (query) => {
    recipeContainer.innerHTML = "<h2>Fetching Recipes...</h2>";

    try {
        const res = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=10&apiKey=${API_KEY}`);
        const data = await res.json();

        recipeContainer.innerHTML = "";
        if (!data.results || data.results.length === 0) {
            recipeContainer.innerHTML = "<h2>No recipes found.</h2>";
            return;
        }

        data.results.forEach(recipe => {
            const recipeDiv = document.createElement('div');
            recipeDiv.classList.add('recipe');
            recipeDiv.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.title}">
                <h3>${recipe.title}</h3>
                <button class="view-recipe-btn" data-id="${recipe.id}">View Recipe</button>
            `;

            recipeContainer.appendChild(recipeDiv);
        });

        // Attach event listeners to all buttons after elements are added to DOM
        document.querySelectorAll('.view-recipe-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const recipeId = event.target.getAttribute('data-id');
                fetchRecipeDetails(recipeId);
            });
        });

    } catch (error) {
        recipeContainer.innerHTML = "<h2>Error fetching recipes...</h2>";
        console.error(error);
    }
};

const fetchRecipeDetails = async (id) => {
    try {
        const res = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`);
        const meal = await res.json();

        // Handle missing instructions
        const instructions = meal.instructions ? meal.instructions : "No instructions available.";

        recipeDetailsContent.innerHTML = `
            <h2>${meal.title}</h2>
            <img src="${meal.image}" alt="${meal.title}" style="width:100%;">
            <h3>Ingredients:</h3>
            <ul>${meal.extendedIngredients.map(ing => `<li>${ing.amount} ${ing.unit} ${ing.name}</li>`).join('')}</ul>
            <h3>Instructions:</h3>
            <p style="white-space: pre-line;">${instructions}</p>
        `;

        document.querySelector('.recipe-details').style.display = "block";

        // Call the AI Speech function
        speakRecipe(meal.title, meal.extendedIngredients, instructions);

    } catch (error) {
        console.error("Error fetching recipe details:", error);
    }
};

// AI Speech Function
const speakRecipe = (title, ingredients, instructions) => {
    const synth = window.speechSynthesis;
    synth.cancel(); // Stop any ongoing speech before starting a new one

    let speechText = `You selected the recipe for ${title}. Here are the ingredients: `;

    // Adding ingredients
    speechText += ingredients.map(ing => `${ing.amount} ${ing.unit} of ${ing.name}`).join(", ") + ". ";

    // Adding instructions
    speechText += "Here are the instructions: " + instructions.replace(/<[^>]+>/g, ''); // Remove HTML tags

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = "en-US";
    utterance.rate = 1; // Normal speed

    synth.speak(utterance);
};

// Close Recipe Popup and Stop Speech
recipeCloseBtn.addEventListener('click', () => {
    document.querySelector('.recipe-details').style.display = "none";
    window.speechSynthesis.cancel(); // Stop AI from speaking when closed
});

// Search Button Click Event
searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    fetchRecipes(searchBox.value.trim());
});
