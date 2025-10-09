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
  protein: number;
  carbs: number;
  fat: number;
  preparation: string;
}

interface DayMeals {
  [mealKey: string]: Meal;
}

interface MealPlan {
  [day: number]: DayMeals;
}

interface MealPlanWithUser {
  userName: string;
  days: MealPlan;
  calorieGoal: number;
  macroRatio: { protein: number; carbs: number; fat: number };
}

function App() {
  const [mealPlan, setMealPlan] = useState<MealPlanWithUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePrompt = (formData: FormData): string => {
    const totalCalories = Number(formData.calorieGoal);
 const days = Number(formData.numberOfDays || 1);
    const breakfastCalories = Math.floor(totalCalories * 0.25);
    const lunchCalories = Math.floor(totalCalories * 0.35);
    const dinnerCalories = Math.floor(totalCalories * 0.25);
    const snackCalories =
      totalCalories - (breakfastCalories + lunchCalories + dinnerCalories);

    return `
    You are a professional nutritionist.

    Create a ${days}-day diet plan for:
    - Name: ${formData.name}
    - Age: ${formData.age}
    - Gender: ${formData.gender}
    - Height: ${formData.height} cm
    - Weight: ${formData.weight} kg
    - City: Maharashtra (low-income)
    - Goal: ${formData.goal}
    - Daily Calories: ${formData.calorieGoal} kcal
    - Important Note: ${formData.note}
    - Meals per day: Breakfast, Lunch, Pre workout, Postworkout, Dinner
    - Make a proper personalised diet plan according to the height weight and age which will give the real results . Make the diet considering a he/she living in tier 3 and 4 city from maharashtra ,diet should be according to Maharashtrian meals and food choices and it should have only 4 meals per day, he/she is economically not good so give the plan which will be relevant , easy to understand and follow, should afford following the diet, no fancy meals.

    JSON structure example:
    {
      "1": {
        "breakfast": { "name": "Poha", "ingredients": ["poha","peanuts"], "calories": 350, "protein": 8, "carbs": 45, "fat": 10, "preparation": "Cook poha" },
        "lunch": {...},
        "snack": {...},
        "pre workout": {...},
        "post workout": {...},
        "dinner": {...}
      },
      "2": {
        "breakfast": {...},
        "lunch": {...},
        "snack": {...},
        "pre workout": {...},
        "post workout": {...},
        "dinner": {...}
      }
    }

    Output valid JSON only — include exactly ${days} separate day entries (Day 1, Day 2, ...).
    `;
  };

  const handleFormSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    setMealPlan(null);

    try {
      const prompt = generatePrompt(formData);
      const response = await fetch("api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a professional nutritionist. Provide multi-day meal plans in valid JSON only.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok)
        throw new Error(`OpenAI API error: ${response.statusText}`);

      const data = await response.json();
      const content = data.choices[0].message.content;
      const cleanContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      const parsedPlan: MealPlan = JSON.parse(cleanContent);

      Object.values(parsedPlan).forEach((day) => {
        Object.keys(day).forEach((mealKey) => {
          const meal = day[mealKey];
          if (!meal || typeof meal !== "object") {
            day[mealKey] = {
              name: "Meal not provided",
              ingredients: [],
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              preparation: "",
            };
          }
        });
      });

      setMealPlan({
        userName: formData.name || "User",
        days: parsedPlan,
        calorieGoal: formData.calorieGoal,
        macroRatio: { protein: 40, carbs: 35, fat: 25 },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error generating meal plan"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 🧾 PDF GENERATOR
  const downloadPDF = () => {
    if (!mealPlan) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let y = 25;

    doc.setFont("times", "italic");
    doc.setFontSize(11);
    doc.text("foodvez.com", pageWidth - margin, 15, { align: "right" });

    doc.setFont("times", "bold");
    doc.setFontSize(20);
    doc.text("Your Diet Plan", pageWidth / 2, y, { align: "center" });
    y += 10;

    doc.setFontSize(16);
    doc.text(`Diet Plan for ${mealPlan.userName}`, pageWidth / 2, y, {
      align: "center",
    });
    y += 10;

    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.text(
      `Total Calories: ${mealPlan.calorieGoal} kcal/day`,
      pageWidth / 2,
      y,
      { align: "center" }
    );
    y += 6;
    doc.text(
      `Macronutrient Ratio: Protein ${mealPlan.macroRatio.protein}%, Carbs ${mealPlan.macroRatio.carbs}%, Fat ${mealPlan.macroRatio.fat}%`,
      pageWidth / 2,
      y,
      { align: "center" }
    );
    y += 12;

    const mealOrder = [
      { key: "breakfast", label: "Breakfast", time: "7:30–9:30 AM" },
      { key: "lunch", label: "Lunch", time: "12:30–2:30 PM" },
      { key: "snack", label: "Snack", time: "4:00–5:00 PM" },
      { key: "pre workout", label: "pre workout", time: "4:00–5:00 PM" },
      { key: "post workout", label: "post workout", time: "6:00–7:00 PM" },
      { key: "dinner", label: "Dinner", time: "8:00–9:00 PM" },
    ];

    Object.entries(mealPlan.days).forEach(([day, meals]) => {
      doc.setFont("times", "bold");
      doc.setFontSize(13);
      doc.text(`Day ${day}`, pageWidth / 2, y, { align: "center" });
      y += 8;

      doc.setFontSize(12);
      doc.text("Time", margin, y);
      doc.text("Meal Name", margin + 40, y);
      doc.text("Meal Details", margin + 90, y);
      y += 4;
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;

      doc.setFont("times", "normal");
      doc.setFontSize(11);

      mealOrder.forEach(({ key, label, time }) => {
        const meal = meals[key];
        if (!meal || meal.name === "Meal not provided") return;

        doc.text(time, margin, y);
        doc.text(label, margin + 40, y);

        const details = `${meal.name}: ${meal.ingredients.join(", ")}${
          meal.preparation ? " – " + meal.preparation : ""
        }`;
        const splitText = doc.splitTextToSize(details, pageWidth - (margin + 90));
        splitText.forEach((line, i) => {
          doc.text(line, margin + 90, y + i * 5);
        });

        y += Math.max(10, splitText.length * 5 + 2);

        if (y > pageHeight - 25) {
          doc.addPage();
          doc.setFont("times", "italic");
          doc.setFontSize(11);
          doc.text("foodvez.com", pageWidth - margin, 15, { align: "right" });
          y = 25;
        }
      });

      y += 10;
    });

    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.text("Summary:", margin, y);
    y += 8;
    doc.setFont("times", "normal");
    doc.text("Hydration: Drink at least 3+ liters of water daily.", margin + 5, y);

    y = pageHeight - 10;
    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.text("Generated by Foodvez.com", pageWidth / 2, y, { align: "center" });

    doc.save(`${mealPlan.userName}_diet_plan.pdf`);
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
                <h2>{mealPlan.userName}'s Meal Plan</h2>
                <button className="download-btn" onClick={downloadPDF}>
                  <Download size={20} /> Download Plan
                </button>
              </div>

              <div className="meal-cards-grid">
                {Object.entries(mealPlan.days).map(([day, meals]) => (
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



