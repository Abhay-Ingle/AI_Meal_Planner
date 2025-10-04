import React from 'react';
import { UtensilsCrossed } from 'lucide-react';
import '../styles/MealCard.css';

interface Meal {
  name: string;
  ingredients: string[];
  calories: number;
  preparation: string;
}

interface MealCardProps {
  day: number;
  meals: { [key: string]: Meal };
}

const formatMealDescription = (meal: Meal) => {
  if (!meal) return 'No meal data';
  return `${meal.name}\nIngredients: ${meal.ingredients.join(', ')}\nCalories: ${meal.calories}\n${meal.preparation || ''}`;
};

const MealCard: React.FC<MealCardProps> = ({ day, meals }) => {
  const mealNames = ['Breakfast', 'Lunch', 'Dinner', 'Snack 1', 'Snack 2', 'Snack 3'];

  return (
    <div className="meal-card">
      <div className="meal-card-header">
        <UtensilsCrossed className="meal-icon" size={24} />
        <h3>Day {day}</h3>
      </div>
      <div className="meal-card-body">
        {Object.values(meals).map((meal, index) => (
          <div key={index} className="meal-item">
            <h4 className="meal-type">{mealNames[index] || `Meal ${index + 1}`}</h4>
            <p className="meal-description">
              {formatMealDescription(meal).split('\n').map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MealCard;
