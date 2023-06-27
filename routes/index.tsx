import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import { Layout } from "../components/Layout.tsx";

const API_BASE = "https://hacker-news.firebaseio.com/v0";

export const handler: Handlers<any> = {
  async GET(_, ctx) {
    const resp = await fetch(`${API_BASE}/topstories.json`);

    if (!resp.ok) {
      const body = await resp.text();
      throw new Error(`${resp.status} ${body}`);
    }

    const itemIds = Object.values(await resp.json()).slice(0, 30) as number[];
    const items = await Promise.all(
      itemIds.map((id) => fetchItem(id)),
    );
    return ctx.render(items);
  },
};

type Comments = any;

type Item = {
  id: string;
  user: string;
  points: number;
  time: Date;
  content: string;
  url: string;
  type: string; // TODO: perhaps a certain type
  title: string;
  comments_count: number;
  comments?: Comments[];
};

type IncomingResp = {
  id: string;
  by: string;
  score: number;
  time: Date;
  text: string;
  url: string;
  type: string; // TODO: perhaps a certain type
  title: string;
  comments_count: number;
  kids: {
    id: number;
  };
};

export async function fetchItem(
  id: number,
  withComments = false,
): Promise<Item> {
  const resp = await fetch(
    `${API_BASE}/item/${id}.json`,
  );
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`${resp.status} ${body}`);
  }

  const item = await resp.json() as IncomingResp;
  item.kids = item.kids || [];
  return {
    id: item.id,
    user: item.by,
    points: item.score,
    time: item.time,
    content: item.text,
    url: item.url,
    type: item.type,
    title: item.title,
    comments_count: Object.values(item.kids).length,
    comments: withComments
      ? await Promise.all(
        Object.values(item.kids).map((id) => fetchItem(id, withComments)),
      )
      : [],
  };
}

export default function Home(props: PageProps<Item[]>) {
  const { data } = props;
  return (
    <Layout>
      <Head>
        <title>The News</title>
      </Head>
      <Header active="/" />
      <div class="p-2 mx-auto max-w-screen-lg">
        <ul class="flex flex-col gap-3">
          {data.map((item: Item) => <NewsItem item={item} />)}
        </ul>
      </div>
      {/* <Footer /> */}
    </Layout>
  );
}

export function isAbsolute(url: string) {
  return /^https?:\/\//.test(url);
}

export function getUrl(item: Item) {
  // return item.url && isAbsolute(item.url) ? item.url : `/item?id=${item.id}`;
  return item.id && `/item?id=${item.id}`;
}

export function NewsItem({ item }: { item: Item }) {
  return (
    <li class="text-1xl hover:text-blue-700">
      <a href={getUrl(item)}>{item.title}</a>
      <div class="flex flex-row gap-2">
        {item.points && <span class="text-blue-300">{item.points} points</span>}
        {item.user && <span class="text-blue-300">{item.user}</span>}
        {item.comments_count && (
          <span class="text-blue-300">
            {`${item.comments_count} ${
              item.comments_count < 2 ? "comment" : "comments"
            }`}
          </span>
        )}
      </div>
    </li>
  );
}
