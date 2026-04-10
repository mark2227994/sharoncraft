import { Pressable, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { openProduct, toggleFavorite } from "../store/slices/favoritesSlice";
import { palette } from "../theme";

export function ProductCard({ product }) {
  const dispatch = useDispatch();
  const savedIds = useSelector((state) => state.favorites.ids);
  const isSaved = savedIds.includes(product.id);

  return (
    <View style={styles.card}>
      <Pressable onPress={() => dispatch(openProduct(product.id))}>
        <View style={[styles.swatch, { backgroundColor: product.palette[0] }]}>
          <View style={[styles.swatchAccent, { backgroundColor: product.palette[1] }]} />
          <Text style={styles.category}>{product.category}</Text>
        </View>
        <View style={styles.body}>
          <View style={styles.row}>
            <Text style={styles.name}>{product.name}</Text>
          </View>
          <Text style={styles.price}>{product.price}</Text>
          <Text style={styles.mood}>{product.mood}</Text>
        </View>
      </Pressable>
      <View style={styles.footer}>
        <Pressable
          onPress={() => dispatch(toggleFavorite(product.id))}
          style={[styles.favorite, isSaved && styles.favoriteActive]}
        >
          <Text style={[styles.favoriteText, isSaved && styles.favoriteTextActive]}>
            {isSaved ? "Saved" : "Save"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.paper,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: palette.line,
    shadowColor: palette.shadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },
  swatch: {
    height: 108,
    padding: 16,
    justifyContent: "space-between",
  },
  swatchAccent: {
    width: 92,
    height: 18,
    borderRadius: 999,
  },
  category: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 250, 244, 0.84)",
    color: palette.ink,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  body: {
    padding: 16,
    gap: 8,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  name: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: palette.ink,
  },
  favorite: {
    borderWidth: 1,
    borderColor: palette.line,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  favoriteActive: {
    backgroundColor: palette.ink,
    borderColor: palette.ink,
  },
  favoriteText: {
    color: palette.ink,
    fontWeight: "700",
  },
  favoriteTextActive: {
    color: palette.paper,
  },
  price: {
    color: palette.accentDeep,
    fontWeight: "800",
    fontSize: 16,
  },
  mood: {
    color: palette.muted,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: "flex-end",
  },
});
