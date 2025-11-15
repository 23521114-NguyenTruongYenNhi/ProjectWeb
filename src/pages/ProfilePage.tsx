import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockRecipes } from '../data/mockRecipes';
import { Recipe } from '../types/recipe';
import { RecipeCard } from '../components/RecipeCard';
import { userAPI } from '../api/client';
import { ChefHat, Heart, BookOpen, User, Mail, LogOut, Edit } from 'lucide-react';

export const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'favorites' | 'created'>('favorites');
    const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
    const [createdRecipes, setCreatedRecipes] = useState<Recipe[]>([]);

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!user) {
            navigate('/login');
            return;
        }

        const loadUserRecipes = async () => {
            try {
                // Fetch user's favorite recipes
                const favorites: any = await userAPI.getFavorites(user._id);
                setFavoriteRecipes(favorites);

                // Fetch user's created recipes
                const created: any = await userAPI.getCreatedRecipes(user._id);
                setCreatedRecipes(created);
            } catch (error) {
                console.error('Failed to load user recipes:', error);
                // Fallback to mock data
                setFavoriteRecipes(mockRecipes.slice(0, 3));
                setCreatedRecipes(mockRecipes.slice(3, 6));
            }
        };

        loadUserRecipes();
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleRecipeClick = (recipeId: string) => {
        navigate(`/recipe/${recipeId}`);
    };

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <ChefHat className="w-6 h-6 text-orange-500" />
                            <h1 className="text-xl font-bold text-gray-800">Mystère Meal</h1>
                        </Link>
                        <div className="flex items-center gap-4">
                            <Link to="/" className="text-gray-600 hover:text-gray-800 font-medium">
                                Home
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-6">
                            {/* Avatar */}
                            <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                                <User className="w-12 h-12 text-white" />
                            </div>

                            {/* User Info */}
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-2">{user.name}</h2>
                                <div className="flex items-center gap-2 text-gray-600 mb-4">
                                    <Mail className="w-4 h-4" />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex gap-6 text-sm">
                                    <div>
                                        <span className="font-bold text-orange-600 text-lg">{favoriteRecipes.length}</span>
                                        <span className="text-gray-600 ml-1">Favorites</span>
                                    </div>
                                    <div>
                                        <span className="font-bold text-orange-600 text-lg">{createdRecipes.length}</span>
                                        <span className="text-gray-600 ml-1">Recipes Created</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Edit Profile Button */}
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <Edit className="w-4 h-4" />
                            <span className="font-medium">Edit Profile</span>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Tab Headers */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('favorites')}
                            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-all ${activeTab === 'favorites'
                                    ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Heart className="w-5 h-5" />
                            Favorite Recipes
                        </button>
                        <button
                            onClick={() => setActiveTab('created')}
                            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-all ${activeTab === 'created'
                                    ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <BookOpen className="w-5 h-5" />
                            My Recipes
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-8">
                        {activeTab === 'favorites' && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-gray-800">Your Favorite Recipes</h3>
                                    <span className="text-sm text-gray-600">{favoriteRecipes.length} recipe{favoriteRecipes.length !== 1 ? 's' : ''}</span>
                                </div>

                                {favoriteRecipes.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {favoriteRecipes.map((recipe) => (
                                            <RecipeCard
                                                key={recipe.id}
                                                recipe={recipe}
                                                onClick={() => handleRecipeClick(recipe.id)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h4 className="text-xl font-bold text-gray-700 mb-2">No favorite recipes yet</h4>
                                        <p className="text-gray-600 mb-6">Start exploring and save recipes you love!</p>
                                        <Link
                                            to="/"
                                            className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                                        >
                                            Discover Recipes
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'created' && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-gray-800">Recipes You Created</h3>
                                    <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium">
                                        + Create New Recipe
                                    </button>
                                </div>

                                {createdRecipes.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {createdRecipes.map((recipe) => (
                                            <RecipeCard
                                                key={recipe.id}
                                                recipe={recipe}
                                                onClick={() => handleRecipeClick(recipe.id)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h4 className="text-xl font-bold text-gray-700 mb-2">No recipes created yet</h4>
                                        <p className="text-gray-600 mb-6">Share your culinary creations with the community!</p>
                                        <button className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium">
                                            Create Your First Recipe
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <Heart className="w-6 h-6 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Favorites</p>
                                <p className="text-2xl font-bold text-gray-800">{favoriteRecipes.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Recipes Created</p>
                                <p className="text-2xl font-bold text-gray-800">{createdRecipes.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <ChefHat className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Member Since</p>
                                <p className="text-2xl font-bold text-gray-800">2024</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
