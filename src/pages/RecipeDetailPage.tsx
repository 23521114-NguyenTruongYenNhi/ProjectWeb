import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { mockRecipes } from '../data/mockRecipes';
import { Recipe } from '../types/recipe';
import { useAuth } from '../context/AuthContext';
import { recipeAPI, userAPI } from '../api/client';
import {
    ChefHat,
    Clock,
    Star,
    ArrowLeft,
    Heart,
    MessageSquare,
    Send,
    Check,
    Flame,
    Activity,
    Beef,
    Cookie,
} from 'lucide-react';

export const RecipeDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [isFavorited, setIsFavorited] = useState(false);
    const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(5);
    const [comments, setComments] = useState<any[]>([]);

    useEffect(() => {
        const loadRecipe = async () => {
            if (!id) return;

            try {
                // Try to fetch from backend API
                const data: any = await recipeAPI.getById(id);
                setRecipe(data);

                // Set comments from API response
                if (data.comments && Array.isArray(data.comments)) {
                    setComments(data.comments.map((c: any) => ({
                        id: c._id,
                        username: c.user?.name || 'Anonymous',
                        text: c.text,
                        rating: c.rating,
                        createdAt: new Date(c.createdAt).toISOString().split('T')[0],
                    })));
                }
            } catch (error) {
                console.error('Failed to fetch recipe:', error);
                // Fallback to mock data
                const foundRecipe = mockRecipes.find(r => r.id === id);
                if (foundRecipe) {
                    setRecipe(foundRecipe);
                    // Mock comments
                    setComments([
                        {
                            id: '1',
                            username: 'Chef Mai',
                            text: 'Amazing recipe! My family loved this dish.',
                            rating: 5,
                            createdAt: '2024-01-15',
                        },
                        {
                            id: '2',
                            username: 'John Smith',
                            text: 'Easy to make and delicious. I added some extra garlic.',
                            rating: 4,
                            createdAt: '2024-01-10',
                        },
                    ]);
                } else {
                    navigate('/');
                }
            }
        };

        loadRecipe();
    }, [id, navigate]);

    const handleIngredientCheck = (index: number) => {
        const newChecked = new Set(checkedIngredients);
        if (newChecked.has(index)) {
            newChecked.delete(index);
        } else {
            newChecked.add(index);
        }
        setCheckedIngredients(newChecked);
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }
        if (!comment.trim() || !id) return;

        try {
            // Submit comment to backend API
            await recipeAPI.addComment(id, { text: comment, rating: rating });

            // Add comment to local state
            const newComment = {
                id: String(comments.length + 1),
                username: user.name,
                text: comment,
                rating: rating,
                createdAt: new Date().toISOString().split('T')[0],
            };

            setComments([newComment, ...comments]);
            setComment('');
            setRating(5);
        } catch (error) {
            console.error('Failed to submit comment:', error);
            alert('Failed to submit comment. Please try again.');
        }
    };

    if (!recipe) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    const completionPercent = recipe.ingredients.length > 0
        ? Math.round((checkedIngredients.size / recipe.ingredients.length) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <ChefHat className="w-6 h-6 text-orange-500" />
                            <h1 className="text-xl font-bold text-gray-800">Mystère Meal</h1>
                        </Link>
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600">Hello, {user.name}</span>
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-orange-600 hover:text-orange-700 font-medium"
                                >
                                    Logout
                                </Link>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>

                {/* Recipe header */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                    <div className="relative h-96 bg-gradient-to-br from-orange-100 to-orange-200">
                        {recipe.image && (
                            <img
                                src={recipe.image}
                                alt={recipe.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                            <h1 className="text-4xl font-bold mb-4">{recipe.title}</h1>
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-1">
                                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    <span className="font-bold">{recipe.rating}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-5 h-5" />
                                    <span>{recipe.time} min</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <ChefHat className="w-5 h-5" />
                                    <span>{recipe.difficulty}</span>
                                </div>
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                                    {recipe.cuisine}
                                </span>
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                                    {recipe.mealType}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsFavorited(!isFavorited)}
                            className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                        >
                            <Heart
                                className={`w-6 h-6 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left column - Ingredients & Nutrition */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Ingredients */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ingredients</h2>

                            {/* Progress bar */}
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-600">Progress</span>
                                    <span className="text-sm font-bold text-orange-600">{completionPercent}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${completionPercent}%` }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                {recipe.ingredients.map((ingredient, index) => (
                                    <label
                                        key={index}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={checkedIngredients.has(index)}
                                                onChange={() => handleIngredientCheck(index)}
                                                className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                            />
                                            {checkedIngredients.has(index) && (
                                                <Check className="w-3 h-3 text-white absolute top-1 left-1 pointer-events-none" />
                                            )}
                                        </div>
                                        <span
                                            className={`capitalize ${checkedIngredients.has(index)
                                                    ? 'line-through text-gray-400'
                                                    : 'text-gray-700'
                                                }`}
                                        >
                                            {ingredient}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Nutrition */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Nutrition</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                    <Flame className="w-6 h-6 text-orange-500" />
                                    <div>
                                        <p className="text-xs text-gray-600">Calories</p>
                                        <p className="font-bold text-gray-800">{recipe.nutrition.calories}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                    <Beef className="w-6 h-6 text-blue-500" />
                                    <div>
                                        <p className="text-xs text-gray-600">Protein</p>
                                        <p className="font-bold text-gray-800">{recipe.nutrition.protein}g</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                    <Activity className="w-6 h-6 text-green-500" />
                                    <div>
                                        <p className="text-xs text-gray-600">Fat</p>
                                        <p className="font-bold text-gray-800">{recipe.nutrition.fat}g</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                                    <Cookie className="w-6 h-6 text-yellow-500" />
                                    <div>
                                        <p className="text-xs text-gray-600">Carbs</p>
                                        <p className="font-bold text-gray-800">{recipe.nutrition.carbs}g</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right column - Steps & Comments */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Steps */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Instructions</h2>
                            <div className="space-y-4">
                                {recipe.steps.map((step, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                                            {index + 1}
                                        </div>
                                        <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Comments section */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <MessageSquare className="w-6 h-6" />
                                Comments ({comments.length})
                            </h2>

                            {/* Comment form */}
                            {user ? (
                                <form onSubmit={handleSubmitComment} className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <div className="mb-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Your Rating
                                        </label>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRating(star)}
                                                    className="transition-transform hover:scale-110"
                                                >
                                                    <Star
                                                        className={`w-6 h-6 ${star <= rating
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'text-gray-300'
                                                            }`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Share your experience with this dish..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none resize-none"
                                        rows={3}
                                    />
                                    <button
                                        type="submit"
                                        className="mt-3 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                                    >
                                        <Send className="w-4 h-4" />
                                        Submit Comment
                                    </button>
                                </form>
                            ) : (
                                <div className="mb-6 p-4 bg-orange-50 rounded-lg text-center">
                                    <p className="text-gray-700 mb-2">Please login to comment</p>
                                    <Link
                                        to="/login"
                                        className="inline-block px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                                    >
                                        Login Now
                                    </Link>
                                </div>
                            )}

                            {/* Comments list */}
                            <div className="space-y-4">
                                {comments.map((c) => (
                                    <div key={c.id} className="p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-semibold text-gray-800">{c.username}</p>
                                                <div className="flex gap-1 mt-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`w-4 h-4 ${star <= c.rating
                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                    : 'text-gray-300'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500">{c.createdAt}</span>
                                        </div>
                                        <p className="text-gray-700">{c.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
