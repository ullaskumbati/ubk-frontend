import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  Clock,
  Users,
  Flame,
  ChefHat,
  Loader2,
  ExternalLink,
  Zap,
  Plus,
  AlertCircle,
} from "lucide-react";
 
const CUISINES = [
  "Asian",
  "Mexican",
  "Italian",
  "Indian",
  "Chinese",
  "Thai",
  "Japanese",
  "Korean",
  "Mediterranean",
  "Middle Eastern",
  "American",
  "French",
];
 
const DIETS = ["Vegetarian", "Vegan", "Gluten Free", "Ketogenic", "Pescetarian", "Paleo"];
 
const INTOLERANCES = ["Dairy", "Egg", "Gluten", "Peanut", "Seafood", "Soy", "Tree Nut"];
 
const QUICK_ADD = ["chicken", "rice", "egg", "tomato", "onion", "garlic", "potato", "cheese"];
 
const MAX_INGREDIENTS = 15;
 
const errorText = (err) =>
  err?.response?.data?.message || err?.message || "Something went wrong. Try again.";
 
/* ---------- small pieces ---------- */
 
function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
        active
          ? "bg-cyan-500 text-black border-cyan-500"
          : "bg-[#0d121f] text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-600"
      }`}
    >
      {children}
    </button>
  );
}
 
function Stat({ icon: Icon, children }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-slate-400">
      <Icon size={13} className="text-slate-500" />
      {children}
    </span>
  );
}
 
function RecipeImage({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`relative bg-[#0a0e18] flex items-center justify-center ${className}`}>
      <ChefHat size={32} className="text-slate-700" />
      {src && !failed && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
}
 
function Macros({ nutrition }) {
  if (!nutrition || nutrition.calories == null) return null;
  const items = [
    ["Calories", nutrition.calories, "kcal"],
    ["Protein", nutrition.protein, "g"],
    ["Carbs", nutrition.carbs, "g"],
    ["Fat", nutrition.fat, "g"],
  ];
  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map(([label, value, unit]) => (
        <div key={label} className="rounded-xl bg-[#0a0e18] border border-slate-800 px-3 py-2.5">
          <p className="text-sm font-semibold text-slate-100">
            {value ?? "-"}
            <span className="text-[11px] font-normal text-slate-500 ml-0.5">{unit}</span>
          </p>
          <p className="text-[11px] text-slate-500">{label}</p>
        </div>
      ))}
    </div>
  );
}
 
/* The one memorable element: a bar showing how much of the recipe you already have. */
function MatchBar({ used, missed }) {
  const total = used + missed;
  const pct = total ? Math.round((used / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs text-slate-400">
          You have {used} of {total} ingredients
        </span>
        <span className="text-xs font-semibold text-cyan-400">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-cyan-400"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
 
function RecipeCard({ recipe, onOpen }) {
  const missed = recipe.missedIngredients || [];
  return (
    <button
      type="button"
      onClick={() => onOpen(recipe.id)}
      className="group text-left rounded-2xl bg-[#0d121f] border border-slate-800 overflow-hidden hover:border-cyan-500/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 flex flex-col"
    >
      <RecipeImage src={recipe.image} alt={recipe.title} className="h-40 w-full" />
      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="text-sm font-semibold text-slate-100 leading-snug line-clamp-2">
          {recipe.title}
        </h3>
 
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {recipe.readyInMinutes != null && <Stat icon={Clock}>{recipe.readyInMinutes} min</Stat>}
          {recipe.servings != null && <Stat icon={Users}>{recipe.servings} servings</Stat>}
          {recipe.nutrition?.calories != null && (
            <Stat icon={Flame}>{recipe.nutrition.calories} kcal</Stat>
          )}
        </div>
 
        <MatchBar used={recipe.usedIngredientCount} missed={recipe.missedIngredientCount} />
 
        {missed.length > 0 ? (
          <div className="mt-auto">
            <p className="text-[11px] text-slate-500 mb-1.5">You still need</p>
            <div className="flex flex-wrap gap-1.5">
              {missed.slice(0, 4).map((m) => (
                <span
                  key={m.id ?? m.name}
                  className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 text-[11px] border border-amber-500/20"
                >
                  {m.name}
                </span>
              ))}
              {missed.length > 4 && (
                <span className="px-2 py-0.5 text-[11px] text-slate-500">+{missed.length - 4} more</span>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-auto text-xs text-emerald-400">You have everything for this one.</p>
        )}
      </div>
    </button>
  );
}
 
function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-[#0d121f] border border-slate-800 overflow-hidden animate-pulse">
      <div className="h-40 bg-slate-800/50" />
      <div className="p-4 space-y-3">
        <div className="h-3.5 w-3/4 rounded bg-slate-800/70" />
        <div className="h-3 w-1/2 rounded bg-slate-800/50" />
        <div className="h-1.5 w-full rounded bg-slate-800/50" />
      </div>
    </div>
  );
}
 
/* ---------- detail modal ---------- */
 
function RecipeModal({ open, loading, detail, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
 
  if (!open) return null;
 
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={detail?.title || "Recipe details"}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0d121f] border border-slate-800 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close recipe"
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 text-slate-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <X size={16} />
        </button>
 
        {loading || !detail ? (
          <div className="h-80 flex items-center justify-center text-cyan-400">
            <Loader2 className="animate-spin" size={28} />
          </div>
        ) : (
          <>
            <RecipeImage src={detail.image} alt={detail.title} className="h-56 w-full" />
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-100 mb-3">{detail.title}</h2>
                <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                  {detail.readyInMinutes != null && (
                    <Stat icon={Clock}>{detail.readyInMinutes} min</Stat>
                  )}
                  {detail.servings != null && <Stat icon={Users}>{detail.servings} servings</Stat>}
                  {detail.sourceUrl && (
                    <a
                      href={detail.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-cyan-400 hover:underline"
                    >
                      <ExternalLink size={13} /> Original recipe
                    </a>
                  )}
                </div>
                {detail.diets?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {detail.diets.map((d) => (
                      <span
                        key={d}
                        className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 text-[11px] border border-cyan-500/20"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                )}
              </div>
 
              <div>
                <p className="text-xs text-slate-500 mb-2">Nutrition per serving</p>
                <Macros nutrition={detail.nutrition} />
              </div>
 
              <div className="grid md:grid-cols-5 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-sm font-semibold text-slate-200 mb-3">Ingredients</h3>
                  <ul className="space-y-2">
                    {detail.ingredients?.map((i, idx) => (
                      <li key={`${i.id}-${idx}`} className="text-xs text-slate-300 leading-relaxed">
                        {i.original || i.name}
                      </li>
                    ))}
                  </ul>
                </div>
 
                <div className="md:col-span-3">
                  <h3 className="text-sm font-semibold text-slate-200 mb-3">Steps</h3>
                  {detail.steps?.length ? (
                    <ol className="space-y-3">
                      {detail.steps.map((s) => (
                        <li key={s.number} className="flex gap-3">
                          <span className="shrink-0 w-6 h-6 rounded-full bg-cyan-500/15 text-cyan-300 text-xs font-semibold flex items-center justify-center">
                            {s.number}
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed pt-1">{s.step}</p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-xs text-slate-500">
                      No step-by-step instructions for this recipe. Open the original recipe for details.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
 
/* ---------- main component ---------- */
 
export default function RecipeFinder({ api, showMessage }) {
  const [ingredients, setIngredients] = useState([]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [diet, setDiet] = useState("");
  const [intolerances, setIntolerances] = useState([]);
 
  const [results, setResults] = useState(null); // null = never searched
  const [meta, setMeta] = useState({ cached: false, totalResults: 0 });
  const [quota, setQuota] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
 
  const [openId, setOpenId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
 
  const inputRef = useRef(null);
 
  const notify = (text, type = "error") => showMessage && showMessage(text, type);
 
  const toggle = (list, setList, value) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
 
  /* quota on mount */
  useEffect(() => {
    api
      .get("/recipes/quota")
      .then((res) => setQuota(res.data.data))
      .catch(() => {});
  }, [api]);
 
  /* debounced ingredient autocomplete */
  useEffect(() => {
    const q = input.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    let ignore = false;
    const t = setTimeout(async () => {
      try {
        const res = await api.get("/recipes/ingredients/autocomplete", { params: { q } });
        if (!ignore) setSuggestions(res.data.data || []);
      } catch {
        if (!ignore) setSuggestions([]);
      }
    }, 400);
    return () => {
      ignore = true;
      clearTimeout(t);
    };
  }, [input, api]);
 
  /* ingredients */
  const addIngredient = (raw) => {
    const name = raw.trim().toLowerCase();
    if (!name) return ingredients;
    if (ingredients.includes(name)) {
      setInput("");
      return ingredients;
    }
    if (ingredients.length >= MAX_INGREDIENTS) {
      notify(`You can add up to ${MAX_INGREDIENTS} ingredients.`);
      return ingredients;
    }
    const next = [...ingredients, name];
    setIngredients(next);
    setInput("");
    setSuggestions([]);
    return next;
  };
 
  const removeIngredient = (name) => setIngredients(ingredients.filter((i) => i !== name));
 
  const onInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (input.trim()) addIngredient(input);
      else if (e.key === "Enter") handleSearch();
    } else if (e.key === "Backspace" && !input && ingredients.length) {
      removeIngredient(ingredients[ingredients.length - 1]);
    }
  };
 
  /* search */
  const handleSearch = async () => {
    const list = input.trim() ? addIngredient(input) : ingredients;
    if (!list.length) {
      setError("Add at least one ingredient to search.");
      inputRef.current?.focus();
      return;
    }
 
    setLoading(true);
    setError("");
    try {
      const params = { ingredients: list.join(",") };
      if (cuisines.length) params.cuisine = cuisines.join(",");
      if (diet) params.diet = diet;
      if (intolerances.length) params.intolerances = intolerances.join(",");
 
      const res = await api.get("/recipes/search", { params });
      const data = res.data.data;
      setResults(data.results || []);
      setMeta({ cached: !!data.cached, totalResults: data.totalResults ?? 0 });
      if (data.quota) setQuota(data.quota);
    } catch (err) {
      const msg = errorText(err);
      setError(msg);
      notify(msg);
      api
        .get("/recipes/quota")
        .then((r) => setQuota(r.data.data))
        .catch(() => {});
    } finally {
      setLoading(false);
    }
  };
 
  /* recipe detail */
  const openRecipe = async (id) => {
    setOpenId(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await api.get(`/recipes/${id}`);
      setDetail(res.data.data);
    } catch (err) {
      notify(errorText(err));
      setOpenId(null);
    } finally {
      setDetailLoading(false);
    }
  };
 
  const closeRecipe = () => {
    setOpenId(null);
    setDetail(null);
  };
 
  const clearFilters = () => {
    setCuisines([]);
    setDiet("");
    setIntolerances([]);
  };
 
  const hasFilters = cuisines.length > 0 || diet || intolerances.length > 0;
 
  return (
    <div className="max-w-6xl mx-auto">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">What can I cook?</h1>
          <p className="text-sm text-slate-400 mt-1">
            Add what is in your kitchen and we will find recipes that need the least shopping.
          </p>
        </div>
        {quota && (
          <div
            className={`px-3.5 py-2 rounded-xl border text-xs ${
              quota.remaining === 0
                ? "bg-red-500/10 border-red-500/30 text-red-300"
                : "bg-[#0d121f] border-slate-800 text-slate-400"
            }`}
          >
            <span className="font-semibold text-slate-100">{quota.remaining}</span> of {quota.limit}{" "}
            fresh searches left today
          </div>
        )}
      </div>
 
      {/* search panel */}
      <section className="rounded-2xl bg-[#0d121f] border border-slate-800 p-5 md:p-6 space-y-6">
        <div>
          <label htmlFor="ingredient-input" className="block text-sm font-semibold text-slate-200 mb-2">
            Your ingredients
          </label>
 
          <div className="relative">
            <div
              onClick={() => inputRef.current?.focus()}
              className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-[#07090e] border border-slate-800 focus-within:border-cyan-500 transition-colors cursor-text"
            >
              {ingredients.map((name) => (
                <span
                  key={name}
                  className="flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-cyan-500/15 text-cyan-200 text-xs border border-cyan-500/30"
                >
                  {name}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeIngredient(name);
                    }}
                    aria-label={`Remove ${name}`}
                    className="p-0.5 rounded-full hover:bg-cyan-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                id="ingredient-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder={ingredients.length ? "Add another" : "Type an ingredient and press Enter"}
                autoComplete="off"
                className="flex-1 min-w-[10rem] bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-600 px-1.5 py-1"
              />
            </div>
 
            {suggestions.length > 0 && (
              <ul className="absolute z-20 left-0 right-0 mt-1.5 rounded-xl bg-[#0d121f] border border-slate-700 shadow-xl overflow-hidden">
                {suggestions.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => {
                        addIngredient(s.name);
                        inputRef.current?.focus();
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-800/70 focus:outline-none focus-visible:bg-slate-800"
                    >
                      {s.name}
                      <Plus size={14} className="text-slate-500" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
 
          {QUICK_ADD.some((n) => !ingredients.includes(n)) && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs text-slate-500">Common picks:</span>
              {QUICK_ADD.filter((n) => !ingredients.includes(n)).map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => addIngredient(name)}
                  className="px-2.5 py-1 rounded-full text-xs text-slate-400 border border-dashed border-slate-700 hover:text-cyan-300 hover:border-cyan-500/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  {name}
                </button>
              ))}
            </div>
          )}
          {ingredients.length > 0 && (
            <p className="text-[11px] text-slate-600 mt-2">
              {ingredients.length} of {MAX_INGREDIENTS} added
            </p>
          )}
        </div>
 
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-200">Cuisine</h2>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-slate-500 hover:text-slate-300 focus:outline-none focus-visible:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {CUISINES.map((c) => (
              <Chip key={c} active={cuisines.includes(c)} onClick={() => toggle(cuisines, setCuisines, c)}>
                {c}
              </Chip>
            ))}
          </div>
        </div>
 
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-200 mb-2">Diet</h2>
            <div className="flex flex-wrap gap-2">
              {DIETS.map((d) => (
                <Chip key={d} active={diet === d} onClick={() => setDiet(diet === d ? "" : d)}>
                  {d}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-200 mb-2">Avoid</h2>
            <div className="flex flex-wrap gap-2">
              {INTOLERANCES.map((i) => (
                <Chip
                  key={i}
                  active={intolerances.includes(i)}
                  onClick={() => toggle(intolerances, setIntolerances, i)}
                >
                  {i}
                </Chip>
              ))}
            </div>
          </div>
        </div>
 
        <div className="flex flex-wrap items-center gap-4 pt-1">
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-black text-sm font-semibold hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d121f]"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            {loading ? "Finding recipes" : "Find recipes"}
          </button>
          {error && (
            <p role="alert" className="flex items-center gap-2 text-xs text-red-400">
              <AlertCircle size={14} /> {error}
            </p>
          )}
        </div>
      </section>
 
      {/* results */}
      <section className="mt-8" aria-live="polite">
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}
 
        {!loading && results && results.length > 0 && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-sm font-semibold text-slate-200">
                {results.length} {results.length === 1 ? "recipe" : "recipes"}, best matches first
              </h2>
              {meta.cached && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <Zap size={13} /> Loaded instantly, no search used
                </span>
              )}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {results.map((r) => (
                <RecipeCard key={r.id} recipe={r} onOpen={openRecipe} />
              ))}
            </div>
          </>
        )}
 
        {!loading && results && results.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-800 py-16 px-6 text-center">
            <ChefHat size={36} className="mx-auto text-slate-700 mb-4" />
            <h2 className="text-sm font-semibold text-slate-200">No recipes match yet</h2>
            <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto">
              Try removing a cuisine or diet filter, or add a few more ingredients.
            </p>
          </div>
        )}
 
        {!loading && results === null && (
          <div className="rounded-2xl border border-dashed border-slate-800 py-16 px-6 text-center">
            <ChefHat size={36} className="mx-auto text-slate-700 mb-4" />
            <h2 className="text-sm font-semibold text-slate-200">Your recipes will show up here</h2>
            <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto">
              Add two or three ingredients above, pick a cuisine if you like, and press Find recipes.
            </p>
          </div>
        )}
      </section>
 
      <RecipeModal open={openId !== null} loading={detailLoading} detail={detail} onClose={closeRecipe} />
    </div>
  );
}