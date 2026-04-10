import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { ProductCard } from "../components/ProductCard";
import { catalog } from "../data/catalog";
import { palette } from "../theme";

export function HomeScreen() {
  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={["#40281d", "#8f4217", "#d98842"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.heroEyebrow}>Mini app concept</Text>
        <Text style={styles.heroTitle}>A warm mobile shop for handmade Kenyan beadwork.</Text>
        <Text style={styles.heroBody}>
          Start with curated products, favorites, and order requests. Add checkout and live
          catalog later when the app proves demand.
        </Text>
        <View style={styles.metrics}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>6</Text>
            <Text style={styles.metricLabel}>starter items</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>3</Text>
            <Text style={styles.metricLabel}>core journeys</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>1</Text>
            <Text style={styles.metricLabel}>weekend MVP</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why this is a good side project</Text>
        <View style={styles.reasonGrid}>
          <View style={[styles.reasonCard, { backgroundColor: palette.oliveSoft }]}>
            <Text style={styles.reasonTitle}>Small scope</Text>
            <Text style={styles.reasonBody}>Catalog first means you can launch without full payments.</Text>
          </View>
          <View style={[styles.reasonCard, { backgroundColor: palette.plumSoft }]}>
            <Text style={styles.reasonTitle}>Real business fit</Text>
            <Text style={styles.reasonBody}>This repo already has products, content, and brand direction.</Text>
          </View>
          <View style={[styles.reasonCard, { backgroundColor: palette.accentSoft }]}>
            <Text style={styles.reasonTitle}>Easy to market</Text>
            <Text style={styles.reasonBody}>A Play Store listing can focus on gifts, beadwork, and culture.</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Starter collection</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {catalog.slice(0, 4).map((product) => (
            <View key={product.id} style={styles.cardWidth}>
              <ProductCard product={product} />
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 18,
  },
  hero: {
    borderRadius: 32,
    padding: 22,
    gap: 14,
  },
  heroEyebrow: {
    color: "#f9d7b3",
    textTransform: "uppercase",
    letterSpacing: 1.3,
    fontWeight: "700",
    fontSize: 12,
  },
  heroTitle: {
    color: "#fff8f2",
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "900",
  },
  heroBody: {
    color: "#ffe8d6",
    lineHeight: 22,
    fontSize: 15,
  },
  metrics: {
    flexDirection: "row",
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "rgba(255, 248, 242, 0.12)",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 18,
  },
  metricValue: {
    color: "#fff8f2",
    fontWeight: "900",
    fontSize: 24,
  },
  metricLabel: {
    color: "#ffe8d6",
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: palette.ink,
  },
  reasonGrid: {
    gap: 10,
  },
  reasonCard: {
    padding: 16,
    borderRadius: 24,
  },
  reasonTitle: {
    color: palette.ink,
    fontWeight: "800",
    fontSize: 17,
    marginBottom: 6,
  },
  reasonBody: {
    color: palette.ink,
    lineHeight: 21,
  },
  row: {
    gap: 12,
    paddingRight: 18,
  },
  cardWidth: {
    width: 280,
  },
});
