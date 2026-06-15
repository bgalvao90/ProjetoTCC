import MarkdownIt from "markdown-it";
import React, { useMemo } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { theme } from "../styles/theme";

type Props = { content: string };

const markdown = new MarkdownIt({ html: false, linkify: true, breaks: true });
markdown.validateLink = (url) => /^https?:\/\//i.test(url);

export function MarkdownContent({ content }: Props) {
  const lines = useMemo(() => markdown.render(content).replace(/<[^>]+>/g, "").split("\n"), [content]);
  return (
    <View>
      {lines.filter(Boolean).map((line, index) => {
        const url = line.match(/https?:\/\/[^\s]+/)?.[0];
        return (
          <Text
            key={`${index}-${line}`}
            style={[styles.text, url && styles.link]}
            onPress={url ? () => Linking.openURL(url) : undefined}
          >
            {line}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  text: { color: theme.colors.text, lineHeight: 21 },
  link: { color: theme.colors.primary, textDecorationLine: "underline" },
});
