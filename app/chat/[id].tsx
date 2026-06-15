import { Redirect, useLocalSearchParams } from "expo-router";

export default function LegacyChatRedirect() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Redirect href={`/solicitacoes/${id}`} />;
}
