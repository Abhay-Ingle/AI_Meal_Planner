import React, { useState } from "react";
import jsPDF from "jspdf";
import { Download } from "lucide-react";
import MealForm, { FormData } from "./components/MealForm";
import MealCard from "./components/MealCard";
import "./styles/App.css";

interface Meal {
  name: string;
  ingredients: string[];
  calorieGoal: number;
  preparation: string;
}

interface DayMeals {
  [mealKey: string]: Meal;
}

interface MealPlan {
  [day: number]: DayMeals;
}

function App() {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate structured JSON prompt for OpenAI
  // 📌 Replace your existing generatePrompt with this
const generatePrompt = (formData: FormData): string => {

const totalCalories = Number(formData.calorieGoal);
const breakfastCalories = Math.floor(totalCalories * 0.25);
const lunchCalories = Math.floor(totalCalories * 0.35);
const dinnerCalories = Math.floor(totalCalories * 0.25);
const snackCalories = totalCalories - (breakfastCalories + lunchCalories + dinnerCalories);

  
  return `
  You are an expert nutritionist and weight management coach with over 15 years of experience.

  Your task is to create a highly personalized ${formData.goal === "weight_loss" ? "weight loss" : "weight gain"} diet plan for:
  - Gender: ${formData.gender}
  - Age: ${formData.age}
  - Height: ${formData.height} cm
  - Weight: ${formData.weight} kg
  - City: Tier 3 / 4 city in Maharashtra
  - Diet Preference: ${formData.dietType} 
  - Number of meals: 4 meals per day
  - Economic status: Low income — meals should be affordable, simple, realistic and use **locally available Maharashtrian foods**. Avoid fancy or expensive ingredients.
    Distribute total daily calories roughly as:
- Breakfast: 25%
- Lunch: 35%
- Dinner: 25%
- Snack: 15%
  ⚠️ Important:
   ⚠️ Important:
1. Distribute calories as: 
   - Breakfast: ${breakfastCalories} kcal
   - Lunch: ${lunchCalories} kcal
   - Dinner: ${dinnerCalories} kcal
   - Snack: ${snackCalories} kcal
2. Each meal's calories must **not exceed the assigned amount**, and the **total daily calories must not exceed ${formData.calorieGoal} kcal**.

  - The diet plan should include only **Maharashtrian food choices** and use easy-to-follow language.
  - Give a **4-meal plan per day** (Breakfast, Lunch, Snack, Dinner).
  - Include **total daily calories** and **macronutrients** (protein, carbohydrates, fats).
  - Format the output as **valid JSON only** (no markdown). 
 

  JSON structure example:
  {
    "1": {
      "breakfast": {
        "name": "Poha with peanuts",
        "ingredients": ["poha", "peanuts", "onion", "oil"],
        "calories": 350,
        "protein": 10,
        "carbs": 45,
        "fats": 12,
        "preparation": "Cook poha with peanuts and onions."
      },
      "lunch": {...},
      "snack": {...},
      "dinner": {...},
      "total_nutrients": {
        "calories": 1800,
        "protein": 65,
        "carbs": 230,
        "fats": 55
      }
    },
    "2": { ... }
  }

  Generate for ${formData.numberOfDays} days.
  `;
};

  // Handle form submission
  const handleFormSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    setMealPlan(null);

    try {
      const prompt = generatePrompt(formData);

   const response = await fetch("http://localhost:3000/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional nutritionist. Provide meal plans in valid JSON only."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      }),
    });



      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Clean and parse JSON
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsedPlan: MealPlan = JSON.parse(cleanContent);

// Ensure all meals have required fields to prevent errors
Object.values(parsedPlan).forEach(day => {
  Object.keys(day).forEach(mealKey => {
    const meal = day[mealKey];
    if (!meal || typeof meal !== "object") {
      day[mealKey] = { 
        name: "Meal not provided", 
        ingredients: [], 
        calories: 0, 
        preparation: "" 
      };
    } else {
      if (!meal.name) meal.name = "Meal not provided";
      if (!meal.ingredients) meal.ingredients = [];
      if (!meal.calories && meal.calories !== 0) meal.calories = 0;
      if (!meal.preparation) meal.preparation = "";
    }
  });
});


setMealPlan(parsedPlan);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Error generating meal plan");
    } finally {
      setIsLoading(false);
    }
  };

  // Format meal description for display or PDF
 const formatMealDescription = (meal: Meal) => {
  if (!meal) return "No meal data";

  const ingredients = Array.isArray(meal.ingredients) ? meal.ingredients.join(", ") : "No ingredients listed";

  return `${meal.name || "No name"}\nIngredients: ${ingredients}\nCalories: ${meal.calories ?? 0}\n${meal.preparation || ""}`;
};


  // Download PDF
  const downloadPDF = () => {
    if (!mealPlan) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    let y = 20;
    const margin = 15;
    const lineHeight = 7;

    // Title
    doc.setFont("times", "bold");
    doc.setFontSize(18);
    doc.text("MY PERSONALIZED MEAL PLAN", pageWidth / 2, y, { align: "center" });
    y += 15;

    // Loop through days
    Object.entries(mealPlan).forEach(([day, dayMeals]) => {
      doc.setFont("times", "bold");
      doc.setFontSize(14);
      doc.text(`DAY ${day}`, margin, y);
      y += lineHeight + 2;

      Object.values(dayMeals).forEach(meal => {
        // Meal name
        doc.setFont("times", "bold");
        doc.setFontSize(12);
        doc.text(meal.name, margin + 5, y);
        y += lineHeight;

        // Ingredients
        doc.setFont("times", "normal");
        doc.setFontSize(11);
        const ingredientsText = `Ingredients: ${meal.ingredients.join(", ")}`;
        const splitIngredients = doc.splitTextToSize(ingredientsText, pageWidth - 2 * margin - 5);
        splitIngredients.forEach(line => {
          doc.text(line, margin + 10, y);
          y += lineHeight;
        });

        // Calories
       // Current

// Update
doc.text(`Calories: ${meal.calories ?? 0}`, margin + 10, y);

        y += lineHeight;

        // Preparation
        if (meal.preparation) {
          doc.setFont("times", "italic");
          const prepText = `Preparation: ${meal.preparation}`;
          const splitPrep = doc.splitTextToSize(prepText, pageWidth - 2 * margin - 5);
          splitPrep.forEach(line => {
            doc.text(line, margin + 10, y);
            y += lineHeight;
          });
          doc.setFont("times", "normal");
        }

        y += 5;

        // New page if needed
        if (y > pageHeight - 25) {
          doc.addPage();
          y = 20;
        }
      });

      y += 10;
    });

    // Footer
    y = pageHeight - 15;
    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.text("Generated by AI Meal Planner", pageWidth / 2, y, { align: "center" });

    doc.save("meal-plan.pdf");
  };

  return (
    <div className="app">
      <div className="app-container">
        <header className="app-header">
          <h1>AI Meal Planner</h1>
          <p>Create personalized meal plans tailored to your nutritional needs</p>
        </header>

        <div className="content-wrapper">
          <MealForm onSubmit={handleFormSubmit} isLoading={isLoading} />

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {mealPlan && (
            <div className="meal-plan-section">
              <div className="meal-plan-header">
                <h2>Your Meal Plan</h2>
                <button className="download-btn" onClick={downloadPDF}>
                  <Download size={20} /> Download Plan
                </button>
              </div>

              <div className="meal-cards-grid">
                {Object.entries(mealPlan).map(([day, meals]) => (
                  <MealCard key={day} day={parseInt(day)} meals={meals} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
