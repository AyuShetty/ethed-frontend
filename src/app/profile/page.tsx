import ProfilePortfolio from "./_components/ProfilePortfolio";

interface Props {
  params: { handle: string };
}

export default function ProfilePage({ params }: Props) {
  return <ProfilePortfolio handle={params.handle} />;
}