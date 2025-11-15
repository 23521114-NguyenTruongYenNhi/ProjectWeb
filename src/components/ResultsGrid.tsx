import React from 'react';
import { Recipe } from '../types/recipe';
import { RecipeCard } from './RecipeCard';
import { UtensilsCrossed } from 'lucide-react';

interface ResultsGridProps {
    recipes: Recipe[];
    onRecipeClick: (recipeId: string) => void;
    isSearching: boolean;
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({ recipes, onRecipeClick, isSearching }) => {
    if (isSearching) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            </div>
        );
    }

    if (recipes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <UtensilsCrossed className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No recipes found</h3>
                <p className="text-gray-500 max-w-md">
                    Try adjusting your ingredients or filters to discover delicious recipes!
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
                <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onClick={() => onRecipeClick(recipe.id)}
                />
            ))}
        </div>
    );
};
