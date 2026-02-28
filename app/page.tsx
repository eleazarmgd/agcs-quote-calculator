"use client";

import { useState, useMemo, useRef, useEffect } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

type MealCategory = "Breakfast" | "Lunch" | "Dinner" | "Snacks";

interface Food {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
}

interface LogEntry {
  id: string;
  food: Food;
  meal: MealCategory;
  servings: number;
  timestamp: number;
}

// ─── Food Database ───────────────────────────────────────────────────────────

const FOOD_DB: Food[] = [
  // Fruits
  { id: "f1",  name: "Apple",                  category: "Fruits",     calories: 95,  protein: 0.5, carbs: 25,  fat: 0.3, serving: "1 medium" },
  { id: "f2",  name: "Banana",                 category: "Fruits",     calories: 105, protein: 1.3, carbs: 27,  fat: 0.4, serving: "1 medium" },
  { id: "f3",  name: "Orange",                 category: "Fruits",     calories: 62,  protein: 1.2, carbs: 15,  fat: 0.2, serving: "1 medium" },
  { id: "f4",  name: "Strawberries",           category: "Fruits",     calories: 49,  protein: 1.0, carbs: 12,  fat: 0.5, serving: "1 cup" },
  { id: "f5",  name: "Blueberries",            category: "Fruits",     calories: 84,  protein: 1.1, carbs: 21,  fat: 0.5, serving: "1 cup" },
  { id: "f6",  name: "Grapes",                 category: "Fruits",     calories: 104, protein: 1.1, carbs: 27,  fat: 0.2, serving: "1 cup" },
  { id: "f7",  name: "Watermelon",             category: "Fruits",     calories: 86,  protein: 1.7, carbs: 22,  fat: 0.4, serving: "2 cups" },
  { id: "f8",  name: "Avocado",                category: "Fruits",     calories: 240, protein: 3.0, carbs: 13,  fat: 22,  serving: "1 whole" },
  { id: "f9",  name: "Mango",                  category: "Fruits",     calories: 201, protein: 2.8, carbs: 50,  fat: 1.3, serving: "1 whole" },
  { id: "f10", name: "Pineapple",              category: "Fruits",     calories: 82,  protein: 0.9, carbs: 22,  fat: 0.2, serving: "1 cup chunks" },
  { id: "f11", name: "Peach",                  category: "Fruits",     calories: 58,  protein: 1.4, carbs: 14,  fat: 0.4, serving: "1 medium" },
  { id: "f12", name: "Pear",                   category: "Fruits",     calories: 101, protein: 0.6, carbs: 27,  fat: 0.2, serving: "1 medium" },

  // Vegetables
  { id: "v1",  name: "Broccoli",               category: "Vegetables", calories: 55,  protein: 3.7, carbs: 11,  fat: 0.6, serving: "1 cup" },
  { id: "v2",  name: "Spinach",                category: "Vegetables", calories: 7,   protein: 0.9, carbs: 1.1, fat: 0.1, serving: "1 cup raw" },
  { id: "v3",  name: "Carrot",                 category: "Vegetables", calories: 52,  protein: 1.2, carbs: 12,  fat: 0.3, serving: "1 medium" },
  { id: "v4",  name: "Bell Pepper",            category: "Vegetables", calories: 37,  protein: 1.2, carbs: 9,   fat: 0.3, serving: "1 medium" },
  { id: "v5",  name: "Cucumber",               category: "Vegetables", calories: 16,  protein: 0.7, carbs: 3.8, fat: 0.1, serving: "1 cup sliced" },
  { id: "v6",  name: "Tomato",                 category: "Vegetables", calories: 35,  protein: 1.7, carbs: 7.5, fat: 0.4, serving: "1 medium" },
  { id: "v7",  name: "Sweet Potato",           category: "Vegetables", calories: 103, protein: 2.3, carbs: 24,  fat: 0.1, serving: "1 medium" },
  { id: "v8",  name: "Corn",                   category: "Vegetables", calories: 132, protein: 5.0, carbs: 29,  fat: 1.8, serving: "1 cup" },
  { id: "v9",  name: "Zucchini",               category: "Vegetables", calories: 33,  protein: 2.4, carbs: 6.1, fat: 0.6, serving: "1 cup" },
  { id: "v10", name: "Kale",                   category: "Vegetables", calories: 33,  protein: 2.9, carbs: 6,   fat: 0.5, serving: "1 cup" },
  { id: "v11", name: "Asparagus",              category: "Vegetables", calories: 27,  protein: 2.9, carbs: 5,   fat: 0.2, serving: "1 cup" },
  { id: "v12", name: "Cauliflower",            category: "Vegetables", calories: 25,  protein: 2.0, carbs: 5,   fat: 0.1, serving: "1 cup" },

  // Proteins
  { id: "p1",  name: "Chicken Breast",         category: "Proteins",   calories: 165, protein: 31,  carbs: 0,   fat: 3.6, serving: "100g" },
  { id: "p2",  name: "Salmon",                 category: "Proteins",   calories: 208, protein: 28,  carbs: 0,   fat: 10,  serving: "100g" },
  { id: "p3",  name: "Eggs",                   category: "Proteins",   calories: 155, protein: 13,  carbs: 1.1, fat: 11,  serving: "2 large" },
  { id: "p4",  name: "Ground Beef (lean)",     category: "Proteins",   calories: 215, protein: 27,  carbs: 0,   fat: 11,  serving: "100g" },
  { id: "p5",  name: "Tuna (canned)",          category: "Proteins",   calories: 132, protein: 29,  carbs: 0,   fat: 1.4, serving: "100g" },
  { id: "p6",  name: "Shrimp",                 category: "Proteins",   calories: 84,  protein: 18,  carbs: 0.9, fat: 0.9, serving: "100g" },
  { id: "p7",  name: "Turkey Breast",          category: "Proteins",   calories: 135, protein: 30,  carbs: 0,   fat: 1.5, serving: "100g" },
  { id: "p8",  name: "Tofu",                   category: "Proteins",   calories: 76,  protein: 8.1, carbs: 1.9, fat: 4.8, serving: "100g" },
  { id: "p9",  name: "Greek Yogurt",           category: "Proteins",   calories: 100, protein: 17,  carbs: 6,   fat: 0.7, serving: "170g" },
  { id: "p10", name: "Cottage Cheese",         category: "Proteins",   calories: 110, protein: 12,  carbs: 5,   fat: 5,   serving: "½ cup" },
  { id: "p11", name: "Tilapia",                category: "Proteins",   calories: 128, protein: 26,  carbs: 0,   fat: 2.7, serving: "100g" },

  // Grains
  { id: "g1",  name: "White Rice",             category: "Grains",     calories: 206, protein: 4.3, carbs: 45,  fat: 0.4, serving: "1 cup cooked" },
  { id: "g2",  name: "Brown Rice",             category: "Grains",     calories: 218, protein: 4.5, carbs: 46,  fat: 1.6, serving: "1 cup cooked" },
  { id: "g3",  name: "Oatmeal",                category: "Grains",     calories: 166, protein: 5.9, carbs: 32,  fat: 3.6, serving: "1 cup cooked" },
  { id: "g4",  name: "Whole Wheat Bread",      category: "Grains",     calories: 128, protein: 5.0, carbs: 24,  fat: 2.0, serving: "2 slices" },
  { id: "g5",  name: "Pasta",                  category: "Grains",     calories: 220, protein: 8.1, carbs: 43,  fat: 1.3, serving: "1 cup cooked" },
  { id: "g6",  name: "Quinoa",                 category: "Grains",     calories: 222, protein: 8.1, carbs: 39,  fat: 3.6, serving: "1 cup cooked" },
  { id: "g7",  name: "Bagel",                  category: "Grains",     calories: 270, protein: 10,  carbs: 53,  fat: 1.5, serving: "1 medium" },
  { id: "g8",  name: "White Bread",            category: "Grains",     calories: 133, protein: 4.5, carbs: 25,  fat: 1.8, serving: "2 slices" },
  { id: "g9",  name: "Flour Tortilla",         category: "Grains",     calories: 146, protein: 3.9, carbs: 25,  fat: 3.5, serving: "1 medium" },
  { id: "g10", name: "Granola",                category: "Grains",     calories: 597, protein: 18,  carbs: 65,  fat: 29,  serving: "1 cup" },
  { id: "g11", name: "Sourdough Bread",        category: "Grains",     calories: 140, protein: 5.0, carbs: 26,  fat: 1.0, serving: "1 slice" },

  // Dairy
  { id: "d1",  name: "Whole Milk",             category: "Dairy",      calories: 149, protein: 8.0, carbs: 12,  fat: 8.0, serving: "1 cup" },
  { id: "d2",  name: "Skim Milk",              category: "Dairy",      calories: 83,  protein: 8.3, carbs: 12,  fat: 0.2, serving: "1 cup" },
  { id: "d3",  name: "Cheddar Cheese",         category: "Dairy",      calories: 113, protein: 7.0, carbs: 0.4, fat: 9.3, serving: "1 oz" },
  { id: "d4",  name: "Mozzarella",             category: "Dairy",      calories: 85,  protein: 6.3, carbs: 0.6, fat: 6.3, serving: "1 oz" },
  { id: "d5",  name: "Butter",                 category: "Dairy",      calories: 102, protein: 0.1, carbs: 0,   fat: 12,  serving: "1 tbsp" },
  { id: "d6",  name: "Cream Cheese",           category: "Dairy",      calories: 99,  protein: 1.7, carbs: 1.5, fat: 10,  serving: "2 tbsp" },
  { id: "d7",  name: "Plain Yogurt",           category: "Dairy",      calories: 100, protein: 5.7, carbs: 14,  fat: 2.5, serving: "1 cup" },

  // Legumes & Nuts
  { id: "l1",  name: "Black Beans",            category: "Legumes & Nuts", calories: 227, protein: 15,  carbs: 41,  fat: 0.9, serving: "1 cup cooked" },
  { id: "l2",  name: "Chickpeas",              category: "Legumes & Nuts", calories: 269, protein: 14,  carbs: 45,  fat: 4.2, serving: "1 cup cooked" },
  { id: "l3",  name: "Lentils",                category: "Legumes & Nuts", calories: 230, protein: 18,  carbs: 40,  fat: 0.8, serving: "1 cup cooked" },
  { id: "l4",  name: "Almonds",                category: "Legumes & Nuts", calories: 164, protein: 6.0, carbs: 6.1, fat: 14,  serving: "1 oz (23 nuts)" },
  { id: "l5",  name: "Peanut Butter",          category: "Legumes & Nuts", calories: 188, protein: 8.0, carbs: 6.9, fat: 16,  serving: "2 tbsp" },
  { id: "l6",  name: "Walnuts",                category: "Legumes & Nuts", calories: 185, protein: 4.3, carbs: 3.9, fat: 18,  serving: "1 oz" },
  { id: "l7",  name: "Cashews",                category: "Legumes & Nuts", calories: 157, protein: 5.2, carbs: 8.6, fat: 12,  serving: "1 oz" },
  { id: "l8",  name: "Edamame",                category: "Legumes & Nuts", calories: 188, protein: 17,  carbs: 14,  fat: 8,   serving: "1 cup" },

  // Fast Food
  { id: "m1",  name: "Cheeseburger",           category: "Fast Food",  calories: 535, protein: 28,  carbs: 40,  fat: 30,  serving: "1 burger" },
  { id: "m2",  name: "Pizza Slice",            category: "Fast Food",  calories: 285, protein: 12,  carbs: 36,  fat: 10,  serving: "1 slice" },
  { id: "m3",  name: "French Fries",           category: "Fast Food",  calories: 365, protein: 4.1, carbs: 48,  fat: 17,  serving: "medium order" },
  { id: "m4",  name: "Hot Dog",                category: "Fast Food",  calories: 290, protein: 11,  carbs: 24,  fat: 17,  serving: "1 with bun" },
  { id: "m5",  name: "Grilled Chicken Sandwich", category: "Fast Food", calories: 395, protein: 37, carbs: 38,  fat: 10,  serving: "1 sandwich" },
  { id: "m6",  name: "Caesar Salad",           category: "Fast Food",  calories: 470, protein: 7.8, carbs: 20,  fat: 40,  serving: "full salad" },
  { id: "m7",  name: "Burrito",                category: "Fast Food",  calories: 490, protein: 22,  carbs: 65,  fat: 15,  serving: "1 burrito" },
  { id: "m8",  name: "Tacos (2)",              category: "Fast Food",  calories: 370, protein: 21,  carbs: 36,  fat: 16,  serving: "2 tacos" },
  { id: "m9",  name: "Chicken Wings (6)",      category: "Fast Food",  calories: 430, protein: 36,  carbs: 0,   fat: 30,  serving: "6 wings" },

  // Beverages
  { id: "b1",  name: "Orange Juice",           category: "Beverages",  calories: 112, protein: 1.7, carbs: 26,  fat: 0.5, serving: "1 cup" },
  { id: "b2",  name: "Coffee (black)",         category: "Beverages",  calories: 2,   protein: 0.3, carbs: 0,   fat: 0,   serving: "1 cup" },
  { id: "b3",  name: "Latte",                  category: "Beverages",  calories: 190, protein: 10,  carbs: 19,  fat: 7,   serving: "16 oz" },
  { id: "b4",  name: "Cola Soda",              category: "Beverages",  calories: 151, protein: 0,   carbs: 39,  fat: 0,   serving: "12 oz" },
  { id: "b5",  name: "Beer",                   category: "Beverages",  calories: 154, protein: 1.6, carbs: 13,  fat: 0,   serving: "12 oz" },
  { id: "b6",  name: "Protein Shake",          category: "Beverages",  calories: 150, protein: 25,  carbs: 8,   fat: 3,   serving: "1 scoop" },
  { id: "b7",  name: "Fruit Smoothie",         category: "Beverages",  calories: 170, protein: 2.0, carbs: 42,  fat: 0.5, serving: "1 cup" },
  { id: "b8",  name: "Energy Drink",           category: "Beverages",  calories: 110, protein: 1.0, carbs: 27,  fat: 0,   serving: "8.4 oz" },

  // Snacks & Sweets
  { id: "s1",  name: "Potato Chips",           category: "Snacks",     calories: 149, protein: 1.9, carbs: 15,  fat: 9.5, serving: "1 oz" },
  { id: "s2",  name: "Popcorn",                category: "Snacks",     calories: 106, protein: 3.1, carbs: 21,  fat: 1.2, serving: "3 cups" },
  { id: "s3",  name: "Dark Chocolate",         category: "Snacks",     calories: 170, protein: 2.2, carbs: 13,  fat: 12,  serving: "1 oz" },
  { id: "s4",  name: "Ice Cream",              category: "Snacks",     calories: 266, protein: 4.6, carbs: 31,  fat: 14,  serving: "1 cup" },
  { id: "s5",  name: "Granola Bar",            category: "Snacks",     calories: 193, protein: 4.3, carbs: 29,  fat: 7.6, serving: "1 bar" },
  { id: "s6",  name: "Protein Bar",            category: "Snacks",     calories: 200, protein: 20,  carbs: 22,  fat: 6,   serving: "1 bar" },
  { id: "s7",  name: "Rice Cake",              category: "Snacks",     calories: 35,  protein: 0.7, carbs: 7.3, fat: 0.3, serving: "1 cake" },
  { id: "s8",  name: "Hummus",                 category: "Snacks",     calories: 166, protein: 7.9, carbs: 18,  fat: 7.6, serving: "½ cup" },
  { id: "s9",  name: "Pretzels",               category: "Snacks",     calories: 108, protein: 2.6, carbs: 23,  fat: 0.8, serving: "1 oz" },

  // Breakfast
  { id: "br1", name: "Pancakes (2)",           category: "Breakfast",  calories: 260, protein: 6.0, carbs: 46,  fat: 6.1, serving: "2 medium" },
  { id: "br2", name: "Waffles (2)",            category: "Breakfast",  calories: 310, protein: 9.0, carbs: 43,  fat: 12,  serving: "2 waffles" },
  { id: "br3", name: "Scrambled Eggs",         category: "Breakfast",  calories: 182, protein: 12,  carbs: 1.8, fat: 14,  serving: "2 eggs" },
  { id: "br4", name: "Bacon (3 strips)",       category: "Breakfast",  calories: 143, protein: 9.7, carbs: 0.5, fat: 11,  serving: "3 strips" },
  { id: "br5", name: "Corn Flakes",            category: "Breakfast",  calories: 133, protein: 2.8, carbs: 31,  fat: 0.1, serving: "1 cup" },
  { id: "br6", name: "English Muffin",         category: "Breakfast",  calories: 134, protein: 4.4, carbs: 26,  fat: 1.0, serving: "1 muffin" },
  { id: "br7", name: "Hash Browns",            category: "Breakfast",  calories: 326, protein: 3.1, carbs: 36,  fat: 19,  serving: "1 cup" },
];

const FOOD_CATEGORIES = ["All", ...Array.from(new Set(FOOD_DB.map(f => f.category)))];
const MEAL_CATEGORIES: MealCategory[] = ["Breakfast", "Lunch", "Dinner", "Snacks"];
const DEFAULT_GOAL = 2000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function macroColor(macro: "protein" | "carbs" | "fat") {
  if (macro === "protein") return "#9b8db0";
  if (macro === "carbs")   return "#c9a07a";
  return "#c47a7a";
}

// ─── ProgressBar ────────────────────────────────────────────────────────────

function ProgressBar({
  value,
  max,
  color = "#c9768a",
  height = 10,
}: {
  value: number;
  max: number;
  color?: string;
  height?: number;
}) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);
  const over = value > max;
  return (
    <div className="w-full rounded-full overflow-hidden bg-slate-100" style={{ height }}>
      <div
        className="progress-fill rounded-full"
        style={{ width: `${pct}%`, height, background: over ? "#c47a7a" : color }}
      />
    </div>
  );
}

// ─── MacroPill ───────────────────────────────────────────────────────────────

function MacroPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xs font-bold" style={{ color }}>{Math.round(value)}g</span>
      <span className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</span>
    </div>
  );
}

// ─── FoodCard ────────────────────────────────────────────────────────────────

function FoodCard({ food, onAdd }: { food: Food; onAdd: (food: Food, meal: MealCategory, servings: number) => void }) {
  const [open, setOpen] = useState(false);
  const [meal, setMeal] = useState<MealCategory>("Breakfast");
  const [servings, setServings] = useState(1);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow" style={{ borderColor: "#eeddd8" }}>
      <button
        className="w-full text-left p-3 flex items-center justify-between gap-2"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm truncate">{food.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{food.serving}</p>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="text-sm font-bold text-green-600">{food.calories}</span>
          <span className="text-[10px] text-slate-400">kcal</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-100 p-3 fade-in space-y-3">
          {/* Macros */}
          <div className="flex justify-around py-1 bg-slate-50 rounded-xl">
            <MacroPill label="Protein" value={food.protein} color={macroColor("protein")} />
            <div className="w-px bg-slate-200" />
            <MacroPill label="Carbs"   value={food.carbs}   color={macroColor("carbs")} />
            <div className="w-px bg-slate-200" />
            <MacroPill label="Fat"     value={food.fat}     color={macroColor("fat")} />
          </div>

          {/* Meal selector */}
          <div className="flex gap-1.5 flex-wrap">
            {MEAL_CATEGORIES.map(m => (
              <button
                key={m}
                onClick={() => setMeal(m)}
                className="px-2.5 py-1 rounded-full text-xs font-medium border transition-colors"
                style={
                  meal === m
                    ? { background: "#c9768a", color: "#fff", borderColor: "#c9768a" }
                    : { background: "transparent", color: "#9e8286", borderColor: "#e0d0cc" }
                }
              >
                {m}
              </button>
            ))}
          </div>

          {/* Servings stepper */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 flex-1">Servings</span>
            <button
              onClick={() => setServings(s => Math.max(0.5, +(s - 0.5).toFixed(1)))}
              className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center hover:bg-slate-200 transition-colors"
            >-</button>
            <span className="w-8 text-center text-sm font-semibold text-slate-700">{servings}</span>
            <button
              onClick={() => setServings(s => +(s + 0.5).toFixed(1))}
              className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center hover:bg-slate-200 transition-colors"
            >+</button>
            <span className="text-xs font-semibold w-16 text-right" style={{ color: "#c9768a" }}>
              {Math.round(food.calories * servings)} kcal
            </span>
          </div>

          <button
            onClick={() => { onAdd(food, meal, servings); setOpen(false); setServings(1); }}
            className="w-full py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ background: "#c9768a" }}
          >
            Add to {meal}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── LogItem ─────────────────────────────────────────────────────────────────

function LogItem({ entry, onRemove }: { entry: LogEntry; onRemove: (id: string) => void }) {
  const cal = Math.round(entry.food.calories * entry.servings);
  return (
    <div className="flex items-center gap-2 py-2 border-b border-slate-50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 truncate">{entry.food.name}</p>
        <p className="text-xs text-slate-400">{entry.servings}× {entry.food.serving}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-semibold text-green-600">{cal} kcal</span>
        <button
          onClick={() => onRemove(entry.id)}
          className="w-6 h-6 rounded-full bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors text-xs font-bold"
        >×</button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CalorieTracker() {
  const [log, setLog] = useState<LogEntry[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState<"add" | "log" | "summary">("add");
  const [goal, setGoal] = useState(DEFAULT_GOAL);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(DEFAULT_GOAL));
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === "add") searchRef.current?.focus();
  }, [activeTab]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return FOOD_DB.filter(f => {
      const matchCat = selectedCategory === "All" || f.category === selectedCategory;
      const matchQ   = !q || f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [search, selectedCategory]);

  const totals = useMemo(() =>
    log.reduce(
      (acc, e) => ({
        calories: acc.calories + e.food.calories * e.servings,
        protein:  acc.protein  + e.food.protein  * e.servings,
        carbs:    acc.carbs    + e.food.carbs     * e.servings,
        fat:      acc.fat      + e.food.fat       * e.servings,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    ), [log]);

  const byMeal = useMemo(() => {
    const map: Record<MealCategory, LogEntry[]> = { Breakfast: [], Lunch: [], Dinner: [], Snacks: [] };
    log.forEach(e => map[e.meal].push(e));
    return map;
  }, [log]);

  function addEntry(food: Food, meal: MealCategory, servings: number) {
    setLog(l => [...l, { id: uid(), food, meal, servings, timestamp: Date.now() }]);
    setActiveTab("log");
  }

  function removeEntry(id: string) {
    setLog(l => l.filter(e => e.id !== id));
  }

  function saveGoal() {
    const n = parseInt(goalInput);
    if (!isNaN(n) && n > 0) setGoal(n);
    setEditingGoal(false);
  }

  const remaining = goal - totals.calories;
  const isOver    = totals.calories > goal;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto">

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-20 shadow-sm"
        style={{ background: "linear-gradient(135deg, #c9768a 0%, #9b8db0 100%)" }}
      >
        <div className="px-4 pt-5 pb-3">
          {/* Title row */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-xl text-white tracking-tight" style={{ fontFamily: "var(--font-pacifico)" }}>Calorie Tracker</h1>
              <p className="text-green-100 text-xs mt-0.5">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            {/* Goal editor */}
            {editingGoal ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={goalInput}
                  onChange={e => setGoalInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && saveGoal()}
                  className="w-20 text-sm text-center rounded-lg px-2 py-1 bg-white/20 text-white border border-white/40 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={saveGoal}
                  className="text-white text-xs bg-white/20 rounded-lg px-2 py-1 hover:bg-white/30 transition-colors"
                >
                  Save
                </button>
              </div>
            ) : (
              <button onClick={() => { setEditingGoal(true); setGoalInput(String(goal)); }} className="text-right">
                <p className="text-white text-lg font-bold leading-none">{goal.toLocaleString()}</p>
                <p className="text-green-100 text-xs">kcal goal ✏️</p>
              </button>
            )}
          </div>

          {/* Calorie summary bar */}
          <div className="bg-white/15 rounded-2xl p-3">
            <div className="flex justify-between text-white/80 text-xs mb-1">
              <span>Consumed</span>
              <span>{isOver ? "Over goal" : "Remaining"}</span>
            </div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-2xl font-extrabold text-white">
                {Math.round(totals.calories).toLocaleString()}
              </span>
              <span className={`text-xl font-bold ${isOver ? "text-red-200" : "text-white"}`}>
                {isOver ? `+${Math.round(Math.abs(remaining)).toLocaleString()}` : Math.round(remaining).toLocaleString()}
              </span>
            </div>
            <ProgressBar value={totals.calories} max={goal} color={isOver ? "#e8a0a0" : "#f5b8c8"} height={8} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-white/20">
          {(["add", "log", "summary"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 text-xs font-semibold capitalize transition-colors"
              style={
                activeTab === tab
                  ? { color: "#fff", borderBottom: "2px solid #fff" }
                  : { color: "rgba(255,255,255,0.6)", borderBottom: "2px solid transparent" }
              }
            >
              {tab === "add" ? "Add Food" : tab === "log" ? `Log (${log.length})` : "Summary"}
            </button>
          ))}
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto">

        {/* ── ADD FOOD ── */}
        {activeTab === "add" && (
          <div className="p-4 space-y-3 fade-in">
            {/* Search bar */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.15 10.15z" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search 91+ foods…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none transition-colors"
                style={{ borderColor: "#e0d0cc" }}
                onFocus={e => (e.currentTarget.style.borderColor = "#c9768a")}
                onBlur={e => (e.currentTarget.style.borderColor = "#e0d0cc")}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg leading-none"
                >×</button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {FOOD_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap"
                  style={
                    selectedCategory === cat
                      ? { background: "#c9768a", color: "#fff", borderColor: "#c9768a" }
                      : { background: "#fff", color: "#9e8286", borderColor: "#e0d0cc" }
                  }
                >
                  {cat}
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-400">
              {filtered.length} food{filtered.length !== 1 ? "s" : ""}
            </p>

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <p className="text-4xl mb-2">🥦</p>
                <p className="text-sm">No foods match your search.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(f => <FoodCard key={f.id} food={f} onAdd={addEntry} />)}
              </div>
            )}
          </div>
        )}

        {/* ── FOOD LOG ── */}
        {activeTab === "log" && (
          <div className="p-4 space-y-4 fade-in">
            {log.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <p className="text-5xl mb-3">🍽️</p>
                <p className="text-sm font-medium text-slate-600">Your log is empty.</p>
                <p className="text-xs mt-1">Tap Add Food to get started.</p>
                <button
                  onClick={() => setActiveTab("add")}
                  className="mt-5 px-6 py-2 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "#c9768a" }}
                >
                  Add Food
                </button>
              </div>
            ) : (
              <>
                {MEAL_CATEGORIES.map(meal => {
                  const entries = byMeal[meal];
                  if (entries.length === 0) return null;
                  const mealCal = Math.round(entries.reduce((s, e) => s + e.food.calories * e.servings, 0));
                  return (
                    <div key={meal} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                        <span className="text-sm font-bold text-slate-700">{meal}</span>
                        <span className="text-xs font-semibold" style={{ color: "#c9768a" }}>{mealCal} kcal</span>
                      </div>
                      <div className="px-4">
                        {entries.map(e => <LogItem key={e.id} entry={e} onRemove={removeEntry} />)}
                      </div>
                    </div>
                  );
                })}

                {/* Daily totals */}
                <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                  <p className="text-sm font-bold text-green-800 mb-2">Daily Totals</p>
                  <div className="flex justify-around text-center">
                    <div>
                      <p className="text-lg font-extrabold" style={{ color: "#c9768a" }}>{Math.round(totals.calories)}</p>
                      <p className="text-[10px] text-green-600">kcal</p>
                    </div>
                    <div>
                      <p className="text-lg font-extrabold" style={{ color: macroColor("protein") }}>{Math.round(totals.protein)}g</p>
                      <p className="text-[10px] text-slate-500">Protein</p>
                    </div>
                    <div>
                      <p className="text-lg font-extrabold" style={{ color: macroColor("carbs") }}>{Math.round(totals.carbs)}g</p>
                      <p className="text-[10px] text-slate-500">Carbs</p>
                    </div>
                    <div>
                      <p className="text-lg font-extrabold" style={{ color: macroColor("fat") }}>{Math.round(totals.fat)}g</p>
                      <p className="text-[10px] text-slate-500">Fat</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setLog([])}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  Clear All
                </button>
              </>
            )}
          </div>
        )}

        {/* ── SUMMARY ── */}
        {activeTab === "summary" && (
          <div className="p-4 space-y-4 fade-in">

            {/* Calorie card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <h2 className="text-sm font-bold text-slate-700 mb-3">Calories</h2>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-3xl font-extrabold text-slate-800">{Math.round(totals.calories).toLocaleString()}</p>
                  <p className="text-xs text-slate-400">consumed</p>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold`} style={{ color: isOver ? "#c47a7a" : "#c9768a" }}>
                    {isOver
                      ? `+${Math.round(Math.abs(remaining)).toLocaleString()}`
                      : Math.round(remaining).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400">{isOver ? "over goal" : "remaining"}</p>
                </div>
              </div>
              <ProgressBar value={totals.calories} max={goal} color={isOver ? "#c47a7a" : "#c9768a"} height={12} />
              <p className="text-xs text-slate-400 text-right mt-1">Goal: {goal.toLocaleString()} kcal</p>
            </div>

            {/* Macros card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
              <h2 className="text-sm font-bold text-slate-700">Macronutrients</h2>

              {(["protein", "carbs", "fat"] as const).map(macro => {
                const value = totals[macro];
                const target = macro === "protein"
                  ? Math.round(goal * 0.30 / 4)
                  : macro === "carbs"
                  ? Math.round(goal * 0.50 / 4)
                  : Math.round(goal * 0.20 / 9);
                const label = macro === "protein" ? "Protein" : macro === "carbs" ? "Carbohydrates" : "Fat";
                return (
                  <div key={macro}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold" style={{ color: macroColor(macro) }}>{label}</span>
                      <span className="text-slate-500">{Math.round(value)}g / {target}g</span>
                    </div>
                    <ProgressBar value={value} max={target} color={macroColor(macro)} height={8} />
                  </div>
                );
              })}

              <p className="text-[10px] text-slate-400 pt-1">
                Targets based on 30% protein / 50% carbs / 20% fat split of your {goal.toLocaleString()} kcal goal.
              </p>
            </div>

            {/* Meal breakdown */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <h2 className="text-sm font-bold text-slate-700 mb-3">Meal Breakdown</h2>
              {MEAL_CATEGORIES.map(meal => {
                const mealCal = byMeal[meal].reduce((s, e) => s + e.food.calories * e.servings, 0);
                if (mealCal === 0) return null;
                return (
                  <div key={meal} className="mb-3 last:mb-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-600">{meal}</span>
                      <span className="text-slate-500">{Math.round(mealCal)} kcal</span>
                    </div>
                    <ProgressBar value={mealCal} max={goal} color="#c9768a" height={6} />
                  </div>
                );
              })}
              {totals.calories === 0 && (
                <p className="text-xs text-slate-400 text-center py-3">No foods logged yet.</p>
              )}
            </div>

            {/* Tips */}
            <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
              <h2 className="text-sm font-bold text-green-800 mb-2">Nutrition Tips</h2>
              <ul className="text-xs text-green-700 space-y-1.5 list-disc list-inside">
                <li>Aim for 0.8–1g of protein per lb of bodyweight.</li>
                <li>Eat complex carbs around workouts for best energy.</li>
                <li>Healthy fats from avocado, nuts, and fish support hormones.</li>
                <li>Drink at least 8 cups (2L) of water daily.</li>
                <li>Eat leafy greens at every meal for micronutrients.</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
