// Cross-platform Icon Component
// Uses native SF Symbols on iOS (expo-symbols)
// and MaterialIcons on Android / Web.

import React from "react";
import { Platform, OpaqueColorValue, StyleProp, TextStyle, ViewStyle } from "react-native";
import { SymbolView, SymbolWeight } from "expo-symbols";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// ------------------------------------------------------------
// 🗺️ SF Symbols → Material Icons Mapping
// ------------------------------------------------------------
const MAPPING = {
  // Navigation & Home
  "house.fill": "home",
  "house": "home-outlined",
  "arrow.left": "arrow-back",
  "arrow.right": "arrow-forward",
  "arrow.up": "arrow-upward",
  "arrow.down": "arrow-downward",
  "chevron.left": "chevron-left",
  "chevron.right": "chevron-right",
  "chevron.up": "keyboard-arrow-up",
  "chevron.down": "keyboard-arrow-down",
  "arrow.clockwise": "refresh",
  "arrow.counterclockwise": "refresh",

  // Communication & Social
  "paperplane.fill": "send",
  "paperplane": "send-outlined",
  "envelope.fill": "mail",
  "envelope": "mail-outline",
  "phone.fill": "phone",
  "phone": "phone-outlined",
  "message.fill": "chat",
  "message": "chat-bubble-outline",
  "bell.fill": "notifications",
  "bell": "notifications-none",
  "heart.fill": "favorite",
  "heart": "favorite-border",

  // Actions & Controls
  "plus": "add",
  "plus.circle.fill": "add-circle",
  "plus.circle": "add-circle-outline",
  "minus": "remove",
  "minus.circle.fill": "remove-circle",
  "minus.circle": "remove-circle-outline",
  "xmark": "close",
  "xmark.circle.fill": "cancel",
  "xmark.circle": "cancel",
  "checkmark": "check",
  "checkmark.circle.fill": "check-circle",
  "checkmark.circle": "check-circle-outline",
  "checkmark.square.fill": "check-box",
  "checkmark.square": "check-box-outline-blank",
  "multiply": "clear",
  "trash.fill": "delete",
  "trash": "delete-outline",

  // Editing & Creation
  "pencil": "edit",
  "pencil.and.list.clipboard": "edit-note",
  "square.and.pencil": "edit",
  "doc.text.fill": "description",
  "doc.text": "description",
  "folder.fill": "folder",
  "folder": "folder-open",
  "doc.fill": "insert-drive-file",
  "doc": "insert-drive-file",

  // Media & Content
  "photo.fill": "image",
  "photo": "image-outlined",
  "camera.fill": "camera-alt",
  "camera": "camera-alt",
  "video.fill": "videocam",
  "video": "videocam-off",
  "music.note": "music-note",
  "speaker.wave.2.fill": "volume-up",
  "speaker.slash.fill": "volume-off",
  "play.fill": "play-arrow",
  "pause.fill": "pause",
  "stop.fill": "stop",

  // System & Settings
  "gear": "settings",
  "gearshape.fill": "settings",
  "slider.horizontal.3": "tune",
  "info.circle.fill": "info",
  "info.circle": "info-outlined",
  "exclamationmark.triangle.fill": "warning",
  "exclamationmark.triangle": "warning-amber",
  "questionmark.circle.fill": "help",
  "questionmark.circle": "help-outline",

  // Shapes & Symbols
  "square": "square",
  "square.grid.3x3": "apps",
  "circle": "circle",
  "triangle.fill": "change-history",
  "star.fill": "star",
  "star": "star-border",
  "bookmark.fill": "bookmark",
  "bookmark": "bookmark-border",

  // Technology & Code
  "chevron.left.forwardslash.chevron.right": "code",
  "qrcode.viewfinder": "qr-code",
  "wifi": "wifi",
  "antenna.radiowaves.left.and.right": "signal-cellular-alt",
  "battery.100": "battery-full",
  "battery.25": "battery-2-bar",
  "lock.fill": "lock",
  "lock.open.fill": "lock-open",

  // Shopping & Commerce
  "cart.fill": "shopping-cart",
  "cart": "shopping-cart-outlined",
  "creditcard.fill": "credit-card",
  "creditcard": "credit-card",
  "dollarsign.circle.fill": "monetization-on",
  "bag.fill": "shopping-bag",
  "bag": "shopping-bag",

  // Location & Maps
  "location.fill": "location-on",
  "location": "location-on",
  "map.fill": "map",
  "map": "map",
  "compass.drawing": "explore",

  // Time & Calendar
  "clock.fill": "access-time",
  "clock": "access-time",
  "calendar": "event",
  "timer": "timer",

  // User & Profile
  "person": "person",
  "person.fill": "person",
  "person.2.fill": "group",
  "person.2": "group",
  "person.circle.fill": "account-circle",
  "person.circle": "account-circle",
  "person.crop.circle.fill": "account-circle",
  "person.crop.circle": "account-circle",

  // Sharing & Export
  "square.and.arrow.up": "share",
  "square.and.arrow.down": "download",
  "arrow.up.doc.fill": "upload-file",
  "link": "link",

  // Search & Discovery
  "magnifyingglass": "search",
  "doc.text.magnifyingglass": "find-in-page",
  "line.3.horizontal.decrease": "filter-list",
  "line.3.horizontal.decrease.circle": "filter-list",
  "arrow.up.arrow.down": "sort",

  // Visibility & Display
  "eye.fill": "visibility",
  "eye.slash.fill": "visibility-off",
  "lightbulb.fill": "lightbulb",
  "moon.fill": "dark-mode",
  "sun.max.fill": "light-mode",

  // Family & Children
  "figure.2.and.child.holdinghands": "family-restroom",
  "person.badge.key.fill": "admin-panel-settings",

  // Medical & Food
  "cross.case": "medical-services",
  "fork.knife": "restaurant",

  // Communication
  "megaphone.fill": "campaign",
  "rectangle.portrait.and.arrow.right": "logout",
} as const;

// ------------------------------------------------------------
// 🧱 Types
// ------------------------------------------------------------
export type IconSymbolName = keyof typeof MAPPING | string;

interface IconSymbolProps {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}

// ------------------------------------------------------------
// ⚙️ Component
// ------------------------------------------------------------
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = "regular",
}: IconSymbolProps) {
  const mappedName = (MAPPING as Record<string, string>)[name] ?? name;

  if (Platform.OS === "ios") {
    // ✅ New Expo SymbolView uses `style` for sizing, not `pointSize`
    return (
      <SymbolView
        name={name as any}
        tintColor={color}
        weight={weight}
        style={[{ width: size, height: size }, style]}
      />
    );
  }

  // ✅ Android / Web fallback
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={mappedName as React.ComponentProps<typeof MaterialIcons>["name"]}
      style={style as StyleProp<TextStyle>}
    />
  );
}
