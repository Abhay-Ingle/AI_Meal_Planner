import React, { useState } from 'react';
import '../styles/MealForm.css';

interface MealFormProps {
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
}

export interface FormData {
  age: string;
  gender: string;
  dietType: string;
  allergies: string;
  calorieGoal: string; // ✅ should be string (input returns string)
  mealsPerDay: string;
  numberOfDays: string;
  goal: string;
  height: string;
  weight: string;
}

const MealForm: React.FC<MealFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<FormData>({
    age: '',
    gender: '',
    dietType: '',
    allergies: '',
    calorieGoal: '',
    mealsPerDay: '4', // default to 4 meals as per your AI prompt
    numberOfDays: '7',
    goal: 'weight_loss',
    height: '',
    weight: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="meal-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        {/* Age */}
        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
            min={1}
            max={120}
            placeholder="Enter your age"
          />
        </div>

        {/* Gender */}
        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Diet Type */}
        <div className="form-group">
          <label htmlFor="dietType">Diet Type</label>
          <select
            id="dietType"
            name="dietType"
            value={formData.dietType}
            onChange={handleChange}
            required
          >
            <option value="">Select diet type</option>
            <option value="balanced">Balanced</option>
            <option value="vegan">Vegan</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="keto">Keto</option>
            <option value="paleo">Paleo</option>
            <option value="mediterranean">Mediterranean</option>
            <option value="low-carb">Low Carb</option>
            <option value="high-protein">High Protein</option>
          </select>
        </div>

        {/* Calorie Goal */}
        <div className="form-group">
          <label htmlFor="calorieGoal">Daily Calorie Goal</label>
          <input
            type="number"
            id="calorieGoal"
            name="calorieGoal"
            value={formData.calorieGoal}
            onChange={handleChange}
            required
            min={1000}
            max={5000}
            placeholder="e.g., 2000"
          />
        </div>

      

        {/* Number of Days */}
        <div className="form-group">
          <label htmlFor="numberOfDays">Number of Days</label>
          <select
            id="numberOfDays"
            name="numberOfDays"
            value={formData.numberOfDays}
            onChange={handleChange}
            required
          >
            <option value="1">1 Day</option>
            <option value="3">3 Days</option>
            <option value="5">5 Days</option>
            <option value="7">7 Days</option>
            <option value="14">14 Days</option>
            <option value="30">30 Days</option>
          </select>
        </div>
      </div>

      {/* Allergies */}
      <div className="form-group full-width">
        <label htmlFor="allergies">Allergies or Disliked Ingredients</label>
        <textarea
          id="allergies"
          name="allergies"
          value={formData.allergies}
          onChange={handleChange}
          placeholder="e.g., peanuts, shellfish, mushrooms (optional)"
          rows={3}
        />
      </div>

      <div className="form-grid">
        {/* Goal */}
        <div className="form-group">
          <label htmlFor="goal">Goal</label>
          <select
            id="goal"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            required
          >
            <option value="weight_loss">Weight Loss</option>
            <option value="weight_gain">Weight Gain</option>
          </select>
        </div>

        {/* Height */}
        <div className="form-group">
          <label htmlFor="height">Height (cm)</label>
          <input
            type="number"
            id="height"
            name="height"
            value={formData.height}
            onChange={handleChange}
            required
            placeholder="e.g., 170"
          />
        </div>

        {/* Weight */}
        <div className="form-group">
          <label htmlFor="weight">Weight (kg)</label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            required
            placeholder="e.g., 65"
          />
        </div>
      </div>

      <button type="submit" className="submit-btn" disabled={isLoading}>
        {isLoading ? 'Generating Plan...' : 'Generate Meal Plan'}
      </button>
    </form>
  );
};

export default MealForm;
