import { GameComponent } from "../components/game";

export default async function HomePage() {
  const data = await getData();
  return (
    <div>
      <title>{data.title}</title>
      <GameComponent />
    </div>
  );
}

const getData = async () => {
  const data = {
    title: 'Waku',
    headline: 'Waku',
    body: 'Hello world!',
  };

  return data;
};

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
