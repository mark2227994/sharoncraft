import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { palette } from "../theme";

const WHATSAPP_URL =
  "https://wa.me/254700000000?text=Hello%20SharonCraft%2C%20I%20want%20to%20order%20from%20the%20mobile%20app.";
const PHONE_URL = "tel:+254700000000";

async function openLink(url) {
  const canOpen = await Linking.canOpenURL(url);

  if (!canOpen) {
    Alert.alert("Action unavailable", "Update the phone number or install the required app first.");
    return;
  }

  Linking.openURL(url);
}

export function ContactScreen() {
  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <Text style={styles.title}>Launch simple, sell simple</Text>
        <Text style={styles.body}>
          For a first Play Store release, use direct order requests. It keeps the project small,
          lets you test demand, and avoids payment complexity on day one.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Suggested MVP order flow</Text>
        <Text style={styles.step}>1. User browses and saves products.</Text>
        <Text style={styles.step}>2. User taps WhatsApp or call to confirm color and delivery.</Text>
        <Text style={styles.step}>3. You handle payment manually or with M-Pesa outside the app.</Text>
      </View>

      <Pressable style={styles.primary} onPress={() => openLink(WHATSAPP_URL)}>
        <Text style={styles.primaryText}>Message on WhatsApp</Text>
      </Pressable>
      <Pressable style={styles.secondary} onPress={() => openLink(PHONE_URL)}>
        <Text style={styles.secondaryText}>Call seller</Text>
      </Pressable>
      <Text style={styles.note}>
        Replace the placeholder phone number before publishing to the Play Store.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
  },
  hero: {
    backgroundColor: palette.oliveSoft,
    borderRadius: 28,
    padding: 20,
    gap: 8,
  },
  title: {
    color: palette.ink,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
  },
  body: {
    color: palette.ink,
    lineHeight: 22,
  },
  card: {
    backgroundColor: palette.paper,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 24,
    padding: 18,
    gap: 10,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "800",
  },
  step: {
    color: palette.muted,
    lineHeight: 22,
  },
  primary: {
    backgroundColor: palette.ink,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },
  primaryText: {
    color: palette.paper,
    fontWeight: "800",
  },
  secondary: {
    backgroundColor: palette.accentSoft,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },
  secondaryText: {
    color: palette.accentDeep,
    fontWeight: "800",
  },
  note: {
    color: palette.muted,
    textAlign: "center",
    lineHeight: 20,
  },
});
