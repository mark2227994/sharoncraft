import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";

import { ProductCard } from "../components/ProductCard";
import { catalog } from "../data/catalog";
import { palette } from "../theme";

export function FavoritesScreen() {
  const favoriteIds = useSelector((state) => state.favorites.ids);
  const savedProducts = catalog.filter((product) => favoriteIds.includes(product.id));

  if (savedProducts.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No saved pieces yet</Text>
        <Text style={styles.emptyBody}>
          Tap Save on a product and it will stay here, even after you close the app.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      {savedProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    backgroundColor: palette.paper,
    borderRadius: 28,
    padding: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: palette.line,
  },
  emptyTitle: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: "900",
  },
  emptyBody: {
    color: palette.muted,
    lineHeight: 22,
  },
  stack: {
    gap: 14,
  },
});
