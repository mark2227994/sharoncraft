import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ProductCard } from "../components/ProductCard";
import { catalog, categories } from "../data/catalog";
import { palette } from "../theme";

export function CatalogScreen() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const visibleProducts =
    selectedCategory === "All"
      ? catalog
      : catalog.filter((product) => product.category === selectedCategory);

  return (
    <View style={styles.wrap}>
      <View style={styles.filterRow}>
        {categories.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <Pressable
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{category}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.stack}>
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 16,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#efe4d7",
  },
  chipActive: {
    backgroundColor: palette.ink,
  },
  chipText: {
    color: palette.muted,
    fontWeight: "700",
  },
  chipTextActive: {
    color: palette.paper,
  },
  stack: {
    gap: 14,
  },
});
