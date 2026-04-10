import { Pressable, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { catalog } from "../data/catalog";
import { setActiveTab, toggleFavorite } from "../store/slices/favoritesSlice";
import { palette } from "../theme";

export function ProductScreen({ productId }) {
  const dispatch = useDispatch();
  const favoriteIds = useSelector((state) => state.favorites.ids);
  const product = catalog.find((item) => item.id === productId) ?? catalog[0];
  const isSaved = favoriteIds.includes(product.id);

  return (
    <View style={styles.wrap}>
      <View style={[styles.hero, { backgroundColor: product.palette[0] }]}>
        <View style={[styles.ribbon, { backgroundColor: product.palette[1] }]} />
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{product.price}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Why it works in the app</Text>
        <Text style={styles.body}>{product.story}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Customer vibe</Text>
        <Text style={styles.body}>{product.mood}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() => dispatch(toggleFavorite(product.id))}
          style={[styles.primary, isSaved && styles.secondary]}
        >
          <Text style={[styles.primaryText, isSaved && styles.secondaryText]}>
            {isSaved ? "Remove from saved" : "Save for later"}
          </Text>
        </Pressable>
        <Pressable onPress={() => dispatch(setActiveTab("contact"))} style={styles.secondary}>
          <Text style={styles.secondaryText}>Ask to order</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
  },
  hero: {
    borderRadius: 28,
    padding: 22,
    gap: 8,
  },
  ribbon: {
    width: 110,
    height: 18,
    borderRadius: 999,
    marginBottom: 8,
  },
  category: {
    color: palette.muted,
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  name: {
    color: palette.ink,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
  },
  price: {
    color: palette.accentDeep,
    fontSize: 18,
    fontWeight: "800",
  },
  card: {
    backgroundColor: palette.paper,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 8,
  },
  heading: {
    color: palette.ink,
    fontWeight: "800",
    fontSize: 18,
  },
  body: {
    color: palette.muted,
    lineHeight: 22,
  },
  actions: {
    gap: 10,
  },
  primary: {
    backgroundColor: palette.ink,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryText: {
    color: palette.paper,
    fontWeight: "800",
  },
  secondary: {
    backgroundColor: palette.accentSoft,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryText: {
    color: palette.accentDeep,
    fontWeight: "800",
  },
});
