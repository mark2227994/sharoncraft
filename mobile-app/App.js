import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Provider, useDispatch, useSelector } from "react-redux";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { BottomNav } from "./src/components/BottomNav";
import { CatalogScreen } from "./src/screens/CatalogScreen";
import { ContactScreen } from "./src/screens/ContactScreen";
import { FavoritesScreen } from "./src/screens/FavoritesScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ProductScreen } from "./src/screens/ProductScreen";
import { store } from "./src/store";
import { hydrateFavorites } from "./src/store/slices/favoritesSlice";
import { palette } from "./src/theme";

const FAVORITES_STORAGE_KEY = "sharoncraft-mini/favorites";

function AppShell() {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.ids);
  const selectedProductId = useSelector((state) => state.favorites.selectedProductId);
  const activeTab = useSelector((state) => state.favorites.activeTab);
  const hasHydratedFavorites = useRef(false);

  useEffect(() => {
    async function loadFavorites() {
      try {
        const savedValue = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
        if (!savedValue) {
          return;
        }

        const parsedValue = JSON.parse(savedValue);
        dispatch(
          hydrateFavorites({
            ids: Array.isArray(parsedValue) ? parsedValue : [],
          }),
        );
      } catch (error) {
        console.warn("Unable to load favorites", error);
      } finally {
        hasHydratedFavorites.current = true;
      }
    }

    loadFavorites();
  }, [dispatch]);

  useEffect(() => {
    if (!hasHydratedFavorites.current) {
      return;
    }

    AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites)).catch((error) => {
      console.warn("Unable to save favorites", error);
    });
  }, [favorites]);

  const headerTitle = activeTab === "product" ? "Product Story" : tabLabels[activeTab];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.appShell}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Play Store Mini Project</Text>
            <Text style={styles.headerTitle}>{headerTitle}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{favorites.length} saved</Text>
          </View>
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === "home" && <HomeScreen />}
          {activeTab === "catalog" && <CatalogScreen />}
          {activeTab === "favorites" && <FavoritesScreen />}
          {activeTab === "contact" && <ContactScreen />}
          {activeTab === "product" && <ProductScreen productId={selectedProductId} />}
        </ScrollView>
        <BottomNav />
      </View>
    </SafeAreaView>
  );
}

const tabLabels = {
  home: "SharonCraft Mini",
  catalog: "Browse Collection",
  favorites: "Saved Pieces",
  contact: "Order & Contact",
  product: "Product Story",
};

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppShell />
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.canvas,
  },
  appShell: {
    flex: 1,
    backgroundColor: palette.canvas,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    backgroundColor: palette.paper,
  },
  eyebrow: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: palette.muted,
    marginBottom: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: palette.ink,
  },
  badge: {
    backgroundColor: palette.accentSoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  badgeText: {
    color: palette.accentDeep,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 30,
    gap: 18,
  },
});
