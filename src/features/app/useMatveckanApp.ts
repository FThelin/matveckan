import { useEffect, useMemo, useState } from 'react';

import { DAYS, DEFAULT_TAGS } from '../../domain/constants';
import {
  addRecipeComment,
  averageRating,
  buildDiscoverSections,
  buildShoppingList,
  copyRecipeToLibrary,
  createProfile,
  createRecipe,
  createWeeklyTemplate,
  generateWeeklyPlan,
  regeneratePlanDay,
  upsertRecipeRating,
} from '../../domain/recipes';
import { communityRecipes, seedRecipes } from '../../domain/seedData';
import type { DayOfWeek, Recipe, UserProfile, WeeklyPlan } from '../../domain/types';
import {
  buildSupabaseConfig,
  createSupabaseClient,
  getSupabaseStatusLabel,
} from '../../lib/supabase/client';
import { requestMagicLink } from '../../lib/supabase/auth';
import { ensureProfileForSessionUser, loadSessionUser } from '../../lib/supabase/profileSync';
import { copyRecipeRecord } from '../../lib/supabase/recipeCopy';
import { addRecipeCommentRecord, upsertRecipeRatingRecord } from '../../lib/supabase/recipeFeedback';
import { createRecipeRecord, loadOwnedRecipes } from '../../lib/supabase/recipeMutations';
import { loadCatalogRecipes } from '../../lib/supabase/repository';

const createInitialTemplateTags = (): Record<DayOfWeek, string> => ({
  Mondag: 'Vegetariskt',
  Tisdag: 'Fisk',
  Onsdag: 'Vegetariskt',
  Torsdag: 'Kott',
  Fredag: 'Fredagsmys',
  Lordag: 'Pasta',
  Sondag: 'Vegetariskt',
});

export const useMatveckanApp = () => {
  const supabaseConfig = buildSupabaseConfig();
  const supabaseClient = createSupabaseClient(supabaseConfig);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([...seedRecipes, ...communityRecipes]);
  const [templateTags, setTemplateTags] = useState<Record<DayOfWeek, string>>(createInitialTemplateTags);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [selectedDiscoverRecipeId, setSelectedDiscoverRecipeId] = useState<string | null>(
    seedRecipes[0]?.id ?? null,
  );
  const [authFeedback, setAuthFeedback] = useState<string | null>(null);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [catalogFeedback, setCatalogFeedback] = useState<string | null>(null);
  const [sessionFeedback, setSessionFeedback] = useState<string | null>(null);
  const [recipeFeedback, setRecipeFeedback] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!supabaseClient) {
      setCatalogFeedback(null);
      return () => {
        isMounted = false;
      };
    }

    const run = async () => {
      try {
        const remoteRecipes = await loadCatalogRecipes(supabaseClient);
        if (!isMounted || remoteRecipes.length === 0) {
          return;
        }

        setRecipes((current) => {
          const localUserRecipes = current.filter((recipe) => recipe.ownerId);
          return [...remoteRecipes, ...localUserRecipes];
        });
        setSelectedDiscoverRecipeId((current) => current ?? remoteRecipes[0]?.id ?? null);
        setCatalogFeedback('Recept laddade från Supabase');
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setCatalogFeedback(
          error instanceof Error ? error.message : 'Kunde inte ladda recept från Supabase',
        );
      }
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, [supabaseClient]);

  useEffect(() => {
    let isMounted = true;

    if (!supabaseClient || !currentUserId) {
      setRecipeFeedback(null);
      return () => {
        isMounted = false;
      };
    }

    const run = async () => {
      try {
        const ownedRecipes = await loadOwnedRecipes(supabaseClient, currentUserId);
        if (!isMounted) {
          return;
        }

        setRecipes((current) => {
          const sharedRecipes = current.filter((recipe) => recipe.ownerId !== currentUserId);
          return [...sharedRecipes, ...ownedRecipes];
        });
        if (ownedRecipes.length > 0) {
          setRecipeFeedback('Egna recept laddade från Supabase');
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setRecipeFeedback(
          error instanceof Error ? error.message : 'Kunde inte ladda egna recept från Supabase',
        );
      }
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, [currentUserId, supabaseClient]);

  useEffect(() => {
    let isMounted = true;

    if (!supabaseClient) {
      setSessionFeedback(null);
      return () => {
        isMounted = false;
      };
    }

    const run = async () => {
      try {
        const authUser = await loadSessionUser(supabaseClient);
        if (!isMounted || !authUser) {
          return;
        }

        const profile = await ensureProfileForSessionUser(supabaseClient, authUser);
        if (!isMounted) {
          return;
        }

        setProfiles([profile]);
        setCurrentUserId(profile.id);
        setSessionFeedback(`Inloggad som ${profile.email}`);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setSessionFeedback(
          error instanceof Error ? error.message : 'Kunde inte lasa session fran Supabase',
        );
      }
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, [supabaseClient]);

  const currentUser = profiles.find((profile) => profile.id === currentUserId) ?? null;
  const libraryRecipes = recipes.filter((recipe) => recipe.ownerId === currentUserId);
  const discoverSections = buildDiscoverSections(recipes, currentUserId ?? '');
  const selectedDiscoverRecipe = recipes.find((recipe) => recipe.id === selectedDiscoverRecipeId) ?? null;
  const shoppingList = weeklyPlan
    ? buildShoppingList(weeklyPlan, recipes, currentUser?.pantryItems ?? [])
    : [];

  const publicRecipeCount = useMemo(
    () => libraryRecipes.filter((recipe) => recipe.isPublic).length,
    [libraryRecipes],
  );

  return {
    currentUser,
    currentUserId,
    days: DAYS,
    defaultTags: DEFAULT_TAGS,
    discoverSections,
    libraryRecipes,
    profiles,
    publicRecipeCount,
    recipes,
    selectedDiscoverRecipe,
    shoppingList,
    supabaseClient,
    supabaseStatusLabel: getSupabaseStatusLabel(supabaseConfig),
    authFeedback,
    isSendingMagicLink,
    authMode: supabaseClient ? 'supabase' : 'local',
    catalogFeedback,
    sessionFeedback,
    recipeFeedback,
    templateTags,
    weeklyPlan,
    signIn: async (name: string, email: string) => {
      if (supabaseClient) {
        setIsSendingMagicLink(true);
        setAuthFeedback(null);
        try {
          await requestMagicLink(supabaseClient, email);
          setAuthFeedback(`Magisk lank skickad till ${email.trim().toLowerCase()}`);
        } catch (error) {
          setAuthFeedback(error instanceof Error ? error.message : 'Kunde inte skicka inloggningslank');
        } finally {
          setIsSendingMagicLink(false);
        }
        return null;
      }

      const profile = createProfile(name, email);
      setProfiles((current) => [...current, profile]);
      setCurrentUserId(profile.id);
      setAuthFeedback(null);
      return profile;
    },
    addRecipe: async (input: {
      name: string;
      imageUri?: string;
      tags: string[];
      ingredients: string[];
      steps: string[];
      isPublic: boolean;
    }) => {
      if (!currentUserId) {
        return;
      }

      const recipe = createRecipe({
        ownerId: currentUserId,
        ...input,
      });

      if (supabaseClient) {
        try {
          const savedRecipe = await createRecipeRecord(supabaseClient, recipe);
          setRecipes((current) => [savedRecipe, ...current.filter((entry) => entry.id !== savedRecipe.id)]);
          setRecipeFeedback(`Recept sparat i Supabase: ${savedRecipe.name}`);
        } catch (error) {
          setRecipeFeedback(
            error instanceof Error ? error.message : 'Kunde inte spara recept i Supabase',
          );
        }
        return;
      }

      setRecipes((current) => [recipe, ...current]);
      setRecipeFeedback(null);
    },
    copyRecipe: (recipeId: string) => {
      if (!currentUserId) {
        return;
      }

      if (supabaseClient) {
        const sourceRecipe = recipes.find((recipe) => recipe.id === recipeId);
        if (!sourceRecipe) {
          return;
        }

        void copyRecipeRecord(supabaseClient, sourceRecipe, currentUserId)
          .then((copiedRecipe) => {
            setRecipes((current) => [copiedRecipe, ...current]);
            setRecipeFeedback(`Recept kopierat till ditt bibliotek: ${copiedRecipe.name}`);
          })
          .catch((error) => {
            setRecipeFeedback(
              error instanceof Error ? error.message : 'Kunde inte kopiera recept i Supabase',
            );
          });
        return;
      }

      setRecipes((current) => copyRecipeToLibrary(current, recipeId, currentUserId));
    },
    rateRecipe: (recipeId: string, value: 1 | 2 | 3 | 4 | 5) => {
      if (!currentUserId) {
        return;
      }

      if (supabaseClient) {
        void upsertRecipeRatingRecord(supabaseClient, {
          recipeId,
          userId: currentUserId,
          value,
        })
          .then(() => {
            setRecipes((current) =>
              current.map((recipe) =>
                recipe.id === recipeId
                  ? upsertRecipeRating(recipe, { recipeId, userId: currentUserId, value })
                  : recipe,
              ),
            );
            setRecipeFeedback('Betyg sparat i Supabase');
          })
          .catch((error) => {
            setRecipeFeedback(
              error instanceof Error ? error.message : 'Kunde inte spara betyg i Supabase',
            );
          });
        return;
      }

      setRecipes((current) =>
        current.map((recipe) =>
          recipe.id === recipeId
            ? upsertRecipeRating(recipe, { recipeId, userId: currentUserId, value })
            : recipe,
        ),
      );
    },
    commentRecipe: (recipeId: string, text: string) => {
      if (!currentUser || !text.trim()) {
        return;
      }

      if (supabaseClient) {
        void addRecipeCommentRecord(supabaseClient, {
          recipeId,
          userId: currentUser.id,
          authorName: currentUser.name,
          text: text.trim(),
        })
          .then((comment) => {
            setRecipes((current) =>
              current.map((recipe) =>
                recipe.id === recipeId
                  ? {
                      ...recipe,
                      comments: [comment, ...recipe.comments],
                      commentCount: (recipe.commentCount ?? recipe.comments.length) + 1,
                    }
                  : recipe,
              ),
            );
            setRecipeFeedback('Kommentar sparad i Supabase');
          })
          .catch((error) => {
            setRecipeFeedback(
              error instanceof Error ? error.message : 'Kunde inte spara kommentar i Supabase',
            );
          });
        return;
      }

      setRecipes((current) =>
        current.map((recipe) =>
          recipe.id === recipeId
            ? addRecipeComment(recipe, {
                recipeId,
                authorId: currentUser.id,
                authorName: currentUser.name,
                text: text.trim(),
              })
            : recipe,
        ),
      );
    },
    averageRating,
    selectDiscoverRecipe: setSelectedDiscoverRecipeId,
    setTemplateTag: (day: DayOfWeek, tag: string) => {
      setTemplateTags((current) => ({ ...current, [day]: tag }));
    },
    generatePlan: () => {
      if (!currentUserId) {
        return;
      }

      const template = createWeeklyTemplate(currentUserId, templateTags);
      const plan = generateWeeklyPlan({
        ownerId: currentUserId,
        template,
        recipes,
      });
      setWeeklyPlan(plan);
    },
    regenerateDay: (day: DayOfWeek) => {
      if (!currentUserId || !weeklyPlan) {
        return;
      }

      setWeeklyPlan(
        regeneratePlanDay({
          ownerId: currentUserId,
          plan: weeklyPlan,
          day,
          recipes,
        }),
      );
    },
    addPantryItem: (name: string) => {
      if (!currentUserId || !name.trim()) {
        return;
      }

      setProfiles((current) =>
        current.map((profile) =>
          profile.id === currentUserId
            ? {
                ...profile,
                pantryItems: [...profile.pantryItems, name.trim().toLowerCase()],
              }
            : profile,
        ),
      );
    },
  };
};
