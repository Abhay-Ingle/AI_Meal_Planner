import React, { useState } from 'react';
import '../styles/MealForm.css';

interface MealFormProps {
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
}

export interface FormData {
  name?: string;
  age: string;
  gender: string;
  dietType: string;
  note: string;
  calorieGoal: string; // input returns string
  mealsPerDay: string;
  numberOfDays: string; // same key used in App.tsx
  goal: string;
  height: string;
  weight: string;
}

const MealForm: React.FC<MealFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    gender: '',
    dietType: '',
    note: '',
    calorieGoal: '',
    mealsPerDay: '4', // default as per prompt
    numberOfDays: '7', // default 7 days
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
        {/* Name */}
        <div className="form-group">
          <label htmlFor="name">Your Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />
        </div>

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
            <option value="2">2 Days</option>
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
        <label htmlFor="note">Allergies or note Ingredients</label>
        <textarea
          id="note"
          name="note"
          value={formData.note}
          onChange={handleChange}
          placeholder="He/she want veg diet only.....(optional)"
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
            <option value="muscle gain">Muscle gain</option>
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
