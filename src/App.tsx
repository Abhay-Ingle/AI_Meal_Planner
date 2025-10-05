import React, { useState } from "react";
import jsPDF from "jspdf";
import { Download } from "lucide-react";
import MealForm, { FormData } from "./components/MealForm";
import MealCard from "./components/MealCard";
import "./styles/App.css";

interface Meal {
  name: string;
  ingredients: string[];
  calories: number;
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
  const generatePrompt = (formData: FormData): string => {
    const mealNames = ["breakfast", "lunch", "dinner", "snack 1", "snack 2", "snack 3"];
    const mealsToGenerate = mealNames.slice(0, parseInt(formData.mealsPerDay));

    return `Create a ${formData.numberOfDays}-day meal plan with the following requirements:
- Age: ${formData.age}
- Gender: ${formData.gender}
- Diet type: ${formData.dietType}
- Daily calorie goal: ${formData.calorieGoal} calories
- Meals per day: ${formData.mealsPerDay}
${formData.allergies ? `- Allergies/Dislikes: ${formData.allergies}` : ""}

For each day, provide ${formData.mealsPerDay} meals: ${mealsToGenerate.join(", ")}.

**Important:** Format your response as JSON with this structure:
{
  "1": {
    "meal1": { "name": "Dish name", "ingredients": ["list"], "calories": 250, "preparation": "note" },
    "meal2": { ... }
  },
  "2": { ... }
}

Each meal must include: name, ingredients (array), calories (integer), optional preparation note.
Do not include any extra text or markdown. Only valid JSON.`;
  };

  // Handle form submission
  const handleFormSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    setMealPlan(null);

    try {
      const prompt = generatePrompt(formData);

    const response = await fetch("/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a professional nutritionist. Provide meal plans in valid JSON only." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
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

      // Fill missing meals to avoid blank cards
      Object.values(parsedPlan).forEach(day => {
        Object.keys(day).forEach(mealKey => {
          if (!day[mealKey]) {
            day[mealKey] = {
              name: "Meal not provided",
              ingredients: [],
              calories: 0,
              preparation: "",
            };
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
    return `${meal.name}\nIngredients: ${meal.ingredients.join(", ")}\nCalories: ${meal.calories}\n${meal.preparation || ""}`;
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
        doc.text(`Calories: ${meal.calories}`, margin + 10, y);
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
