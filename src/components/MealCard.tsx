import React from 'react';
import { UtensilsCrossed } from 'lucide-react';
import '../styles/MealCard.css';

interface Meal {
  name?: string;
  ingredients?: string[];
  calories?: number;
  protein?: number;  // new
  carbs?: number;    // new
  fat?: number;      // new
  preparation?: string;
}

interface MealCardProps {
  day: number;
  meals: { [key: string]: Meal };
}

const MealCard: React.FC<MealCardProps> = ({ day, meals }) => {
  const mealNames = ['Breakfast', 'Lunch','pre workout','post workout' 'Dinner'];

  const filledMeals: Meal[] = mealNames.map((_, index) => {
    const key = Object.keys(meals)[index];
    const meal = key ? meals[key] : undefined;

    return {
      name: meal?.name || 'Meal not provided',
      ingredients: meal?.ingredients || [],
      calories: meal?.calories ?? 0,
      protein: meal?.protein ?? 0, // default 0
      carbs: meal?.carbs ?? 0,
      fat: meal?.fat ?? 0,
      preparation: meal?.preparation || '',
    };
  });

  return (
    <div className="meal-card">
      <div className="meal-card-header">
        <UtensilsCrossed className="meal-icon" size={24} />
        <h3>Day {day}</h3>
      </div>
      <div className="meal-card-body">
        {filledMeals.map((meal, index) => (
          <div key={index} className="meal-item">
            <h4 className="meal-type">{mealNames[index]}</h4>
            <p className="meal-description">
              {meal.name && <span>{meal.name}<br /></span>}
              {meal.ingredients?.length > 0 && <span>Ingredients: {meal.ingredients.join(', ')}<br /></span>}
              <span>Calories: {meal.calories} kcal<br /></span>
              <span>Protein: {meal.protein}g | Carbs: {meal.carbs}g | Fat: {meal.fat}g<br /></span>
              {meal.preparation && <span>{meal.preparation}<br /></span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MealCard;
