import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useMatveckanApp } from './useMatveckanApp';

type TabKey = 'library' | 'discover' | 'planner' | 'profile';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'library', label: 'Mitt bibliotek' },
  { key: 'discover', label: 'Upptack recept' },
  { key: 'planner', label: 'Veckoplan' },
  { key: 'profile', label: 'Profil' },
];

const ratingOptions = [1, 2, 3, 4, 5] as const;

export const MatveckanApp = () => {
  const app = useMatveckanApp();
  const [activeTab, setActiveTab] = useState<TabKey>('discover');
  const [name, setName] = useState('Fredrik');
  const [email, setEmail] = useState('fredrik@example.com');
  const [searchText, setSearchText] = useState('');
  const [recipeName, setRecipeName] = useState('');
  const [recipeTags, setRecipeTags] = useState('Vegetariskt');
  const [recipeIngredients, setRecipeIngredients] = useState('');
  const [recipeSteps, setRecipeSteps] = useState('');
  const [recipeImageUri, setRecipeImageUri] = useState('');
  const [recipePublic, setRecipePublic] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [pantryText, setPantryText] = useState('');
  const normalizedSearch = searchText.trim().toLowerCase();
  const filteredBuiltIn = app.discoverSections.builtIn.filter((recipe) =>
    normalizedSearch
      ? [recipe.name, recipe.tags.join(' '), recipe.comments.map((comment) => comment.text).join(' ')].join(' ').toLowerCase().includes(normalizedSearch)
      : true,
  );
  const filteredCommunity = app.discoverSections.community.filter((recipe) =>
    normalizedSearch
      ? [recipe.name, recipe.tags.join(' '), recipe.comments.map((comment) => comment.text).join(' ')].join(' ').toLowerCase().includes(normalizedSearch)
      : true,
  );
  const visibleRecipes = [...filteredBuiltIn, ...filteredCommunity];
  const activeDiscoverRecipe =
    visibleRecipes.find((recipe) => recipe.id === app.selectedDiscoverRecipe?.id) ??
    visibleRecipes[0] ??
    null;
  const publicLibraryRecipes = app.libraryRecipes.filter((recipe) => recipe.isPublic);

  if (!app.currentUser) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar style="dark" />
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Matveckan</Text>
          <Text style={styles.heroTitle}>Planera veckan utan att fastna i vad ska vi ata</Text>
          <Text style={styles.heroBody}>
            Skapa en profil, fyll ditt bibliotek, upptack recept och generera en hel vecka med ett knapptryck.
          </Text>
          <TextInput
            accessibilityLabel="Namn"
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Namn"
          />
          <TextInput
            accessibilityLabel="E-post"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="E-post"
            autoCapitalize="none"
          />
          <Pressable style={styles.primaryButton} onPress={() => app.signIn(name, email)}>
            <Text style={styles.primaryButtonText}>
              {app.authMode === 'supabase'
                ? app.isSendingMagicLink
                  ? 'Skickar lank...'
                  : 'Skicka magisk lank'
                : 'Skapa profil'}
            </Text>
          </Pressable>
          {app.authFeedback ? <Text style={styles.detailMeta}>{app.authFeedback}</Text> : null}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Matveckan</Text>
            <Text style={styles.headerTitle}>Hej {app.currentUser.name}</Text>
            <Text style={styles.detailMeta}>{app.supabaseStatusLabel}</Text>
            {app.catalogFeedback ? <Text style={styles.detailMeta}>{app.catalogFeedback}</Text> : null}
            {app.sessionFeedback ? <Text style={styles.detailMeta}>{app.sessionFeedback}</Text> : null}
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{app.libraryRecipes.length} ratter</Text>
          </View>
        </View>

        <View style={styles.tabRow}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
            >
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeTab === 'discover' ? (
          <View style={styles.section}>
            <TextInput
              accessibilityLabel="Sok recept"
              style={styles.input}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Sok bland inbyggda och publika recept"
            />
            <Text style={styles.sectionTitle}>Inbyggda recept</Text>
            {filteredBuiltIn.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                name={recipe.name}
                subtitle={`${app.averageRating(recipe)} i betyg`}
                active={activeDiscoverRecipe?.id === recipe.id}
                onPress={() => app.selectDiscoverRecipe(recipe.id)}
              />
            ))}

            <Text style={styles.sectionTitle}>Fran andra anvandare</Text>
            {filteredCommunity.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                name={recipe.name}
                subtitle={`${app.averageRating(recipe)} i betyg`}
                active={activeDiscoverRecipe?.id === recipe.id}
                onPress={() => app.selectDiscoverRecipe(recipe.id)}
              />
            ))}

            {activeDiscoverRecipe ? (
              <View style={styles.detailCard}>
                <Image source={{ uri: activeDiscoverRecipe.imageUri }} style={styles.detailImage} />
                <Text style={styles.detailTitle}>{activeDiscoverRecipe.name}</Text>
                <Text style={styles.detailMeta}>
                  Taggar: {activeDiscoverRecipe.tags.join(', ')}
                </Text>
                <Text style={styles.detailMeta}>
                  Betyg: {app.averageRating(activeDiscoverRecipe)} / 5
                </Text>
                <Text style={styles.detailMeta}>
                  Kommentarer: {activeDiscoverRecipe.comments.length}
                </Text>
                <Pressable
                  style={styles.primaryButton}
                  onPress={() => app.copyRecipe(activeDiscoverRecipe.id)}
                >
                  <Text style={styles.primaryButtonText}>Kopiera till mitt bibliotek</Text>
                </Pressable>
                <View style={styles.ratingRow}>
                  {ratingOptions.map((value) => (
                    <Pressable
                      key={value}
                      style={styles.ratingButton}
                      onPress={() => app.rateRecipe(activeDiscoverRecipe.id, value)}
                    >
                      <Text style={styles.ratingText}>{value}</Text>
                    </Pressable>
                  ))}
                </View>
                <TextInput
                  accessibilityLabel="Kommentar"
                  style={styles.input}
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder="Skriv en kommentar"
                />
                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => {
                    app.commentRecipe(activeDiscoverRecipe.id, commentText);
                    setCommentText('');
                  }}
                >
                  <Text style={styles.secondaryButtonText}>Lagg till kommentar</Text>
                </Pressable>
                {activeDiscoverRecipe.comments.map((comment) => (
                  <View key={comment.id} style={styles.commentRow}>
                    <Text style={styles.commentAuthor}>{comment.authorName}</Text>
                    <Text style={styles.commentText}>{comment.text}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        {activeTab === 'library' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lagg till egen ratt</Text>
            <TextInput
              accessibilityLabel="Rattens namn"
              style={styles.input}
              value={recipeName}
              onChangeText={setRecipeName}
              placeholder="Rattens namn"
            />
            <TextInput
              accessibilityLabel="Bild"
              style={styles.input}
              value={recipeImageUri}
              onChangeText={setRecipeImageUri}
              placeholder="Bild-URL"
            />
            <TextInput
              accessibilityLabel="Taggar"
              style={styles.input}
              value={recipeTags}
              onChangeText={setRecipeTags}
              placeholder="Vegetariskt, Fredagsmys"
            />
            <TextInput
              accessibilityLabel="Ingredienser"
              style={styles.input}
              value={recipeIngredients}
              onChangeText={setRecipeIngredients}
              placeholder="Tomat, Pasta, Basilika"
            />
            <TextInput
              accessibilityLabel="Receptsteg"
              style={[styles.input, styles.multilineInput]}
              value={recipeSteps}
              onChangeText={setRecipeSteps}
              placeholder="Koka pasta. Ror ihop sasen."
              multiline
            />
            <Pressable
              style={[styles.toggleButton, recipePublic && styles.toggleButtonActive]}
              onPress={() => setRecipePublic((current) => !current)}
            >
              <Text style={styles.toggleText}>
                {recipePublic ? 'Publik ratt' : 'Privat ratt'}
              </Text>
            </Pressable>
            <Pressable
              style={styles.primaryButton}
              onPress={() => {
                app.addRecipe({
                  name: recipeName,
                  imageUri: recipeImageUri,
                  tags: recipeTags.split(','),
                  ingredients: recipeIngredients.split(','),
                  steps: recipeSteps.split('.'),
                  isPublic: recipePublic,
                });
                setRecipeName('');
                setRecipeImageUri('');
                setRecipeTags('Vegetariskt');
                setRecipeIngredients('');
                setRecipeSteps('');
              }}
            >
              <Text style={styles.primaryButtonText}>Spara ratt</Text>
            </Pressable>
            {app.libraryRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                name={recipe.name}
                subtitle={`${recipe.tags.join(', ')} • ${recipe.isPublic ? 'Publik' : 'Privat'}`}
              />
            ))}
          </View>
        ) : null}

        {activeTab === 'planner' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Veckomall</Text>
            {app.days.map((day) => (
              <View key={day} style={styles.dayCard}>
                <Text style={styles.dayTitle}>{day}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.tagRow}>
                    {app.defaultTags.map((tag) => (
                      <Pressable
                        key={`${day}-${tag}`}
                        style={[
                          styles.tagButton,
                          app.templateTags[day] === tag && styles.tagButtonActive,
                        ]}
                        onPress={() => app.setTemplateTag(day, tag)}
                      >
                        <Text
                          style={[
                            styles.tagText,
                            app.templateTags[day] === tag && styles.tagTextActive,
                          ]}
                        >
                          {tag}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
                <Text style={styles.daySubtitle}>Vald kategori: {app.templateTags[day]}</Text>
                {app.weeklyPlan ? (
                  <>
                    <Text style={styles.daySubtitle}>
                      Ratt:{' '}
                      {app.recipes.find(
                        (recipe) =>
                          recipe.id === app.weeklyPlan?.days.find((entry) => entry.day === day)?.recipeId,
                      )?.name ?? 'Ingen matchande ratt'}
                    </Text>
                    <Pressable style={styles.secondaryButton} onPress={() => app.regenerateDay(day)}>
                      <Text style={styles.secondaryButtonText}>Generera om dagen</Text>
                    </Pressable>
                  </>
                ) : null}
              </View>
            ))}
            <Pressable style={styles.primaryButton} onPress={app.generatePlan}>
              <Text style={styles.primaryButtonText}>Generera veckans matlista</Text>
            </Pressable>

            {app.shoppingList.length > 0 ? (
              <View style={styles.detailCard}>
                <Text style={styles.sectionTitle}>Inkoplista</Text>
                {app.shoppingList.map((item) => (
                  <Text key={item.name} style={styles.shoppingItem}>
                    {item.name} • {item.recipeNames.join(', ')}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        {activeTab === 'profile' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{app.currentUser.name}</Text>
            <Text style={styles.detailMeta}>{app.currentUser.email}</Text>
            <Text style={styles.detailMeta}>Publika ratter: {app.publicRecipeCount}</Text>
            <Text style={styles.sectionTitle}>Mina publika recept</Text>
            {publicLibraryRecipes.length > 0 ? (
              publicLibraryRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  name={recipe.name}
                  subtitle={`${recipe.tags.join(', ')} • ${app.averageRating(recipe)} i betyg`}
                />
              ))
            ) : (
              <Text style={styles.detailMeta}>Inga publika recept an sa lange.</Text>
            )}
            <Text style={styles.sectionTitle}>Basvaror</Text>
            <View style={styles.pantryRow}>
              <TextInput
                accessibilityLabel="Basvara"
                style={[styles.input, styles.pantryInput]}
                value={pantryText}
                onChangeText={setPantryText}
                placeholder="Lagg till basvara"
              />
              <Pressable
                style={styles.secondaryButton}
                onPress={() => {
                  app.addPantryItem(pantryText);
                  setPantryText('');
                }}
              >
                <Text style={styles.secondaryButtonText}>Lagg till</Text>
              </Pressable>
            </View>
            {app.currentUser.pantryItems.map((item) => (
              <Text key={item} style={styles.shoppingItem}>
                {item}
              </Text>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const RecipeCard = ({
  active,
  name,
  onPress,
  subtitle,
}: {
  active?: boolean;
  name: string;
  onPress?: () => void;
  subtitle: string;
}) => (
  <Pressable onPress={onPress} style={[styles.recipeCard, active && styles.recipeCardActive]}>
    <Text style={styles.recipeTitle}>{name}</Text>
    <Text style={styles.recipeSubtitle}>{subtitle}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f6f1e8',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  heroCard: {
    margin: 20,
    marginTop: 56,
    padding: 24,
    backgroundColor: '#fffaf2',
    borderRadius: 24,
    gap: 14,
  },
  eyebrow: {
    color: '#9f5c2c',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    color: '#1f1305',
  },
  heroBody: {
    color: '#5f4a3a',
    fontSize: 16,
    lineHeight: 24,
  },
  input: {
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2d2bf',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  primaryButton: {
    backgroundColor: '#cb5a2d',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff9f1',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cb5a2d',
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#cb5a2d',
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#1f1305',
    fontSize: 28,
    fontWeight: '800',
  },
  headerBadge: {
    backgroundColor: '#1f1305',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  headerBadgeText: {
    color: '#fffaf2',
    fontWeight: '700',
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#eadbc8',
    borderRadius: 999,
  },
  tabButtonActive: {
    backgroundColor: '#cb5a2d',
  },
  tabLabel: {
    color: '#5f4a3a',
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#fff9f1',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f1305',
  },
  recipeCard: {
    backgroundColor: '#fffaf2',
    padding: 16,
    borderRadius: 18,
    gap: 4,
  },
  recipeCardActive: {
    borderWidth: 2,
    borderColor: '#cb5a2d',
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f1305',
  },
  recipeSubtitle: {
    color: '#6f5a4b',
  },
  detailCard: {
    gap: 12,
    backgroundColor: '#fffaf2',
    padding: 16,
    borderRadius: 20,
  },
  detailImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f1305',
  },
  detailMeta: {
    color: '#6f5a4b',
    fontSize: 15,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#eadbc8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingText: {
    color: '#1f1305',
    fontWeight: '700',
  },
  commentRow: {
    backgroundColor: '#f4ebdd',
    padding: 12,
    borderRadius: 14,
    gap: 4,
  },
  commentAuthor: {
    color: '#1f1305',
    fontWeight: '700',
  },
  commentText: {
    color: '#6f5a4b',
  },
  toggleButton: {
    borderRadius: 14,
    backgroundColor: '#eadbc8',
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#cce3d1',
  },
  toggleText: {
    color: '#1f1305',
    fontWeight: '700',
  },
  dayCard: {
    backgroundColor: '#fffaf2',
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  dayTitle: {
    color: '#1f1305',
    fontSize: 18,
    fontWeight: '800',
  },
  daySubtitle: {
    color: '#6f5a4b',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tagButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#f2e6d7',
  },
  tagButtonActive: {
    backgroundColor: '#1f1305',
  },
  tagText: {
    color: '#6f5a4b',
    fontWeight: '600',
  },
  tagTextActive: {
    color: '#fffaf2',
  },
  shoppingItem: {
    color: '#1f1305',
    fontSize: 15,
  },
  pantryRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  pantryInput: {
    flex: 1,
  },
});
