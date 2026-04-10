import { Pressable, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { setActiveTab } from "../store/slices/favoritesSlice";
import { palette } from "../theme";

const tabs = [
  { key: "home", label: "Home" },
  { key: "catalog", label: "Browse" },
  { key: "favorites", label: "Saved" },
  { key: "contact", label: "Order" },
];

export function BottomNav() {
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.favorites.activeTab);

  return (
    <View style={styles.wrap}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => dispatch(setActiveTab(tab.key))}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: palette.line,
    backgroundColor: palette.paper,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#f0e5d8",
  },
  tabActive: {
    backgroundColor: palette.ink,
  },
  label: {
    color: palette.muted,
    fontWeight: "700",
  },
  labelActive: {
    color: palette.paper,
  },
});
