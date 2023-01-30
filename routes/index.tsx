import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

const API_BASE = "https://hacker-news.firebaseio.com/v0";

type Item = any;

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

export async function fetchItem(
  id: number,
  withComments = false,
): Promise<any> {
  const resp = await fetch(
    `${API_BASE}/item/${id}.json`,
  );
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`${resp.status} ${body}`);
  }

  const item = await resp.json() as any;
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

export function isAbsolute(url: string) {
  return /^https?:\/\//.test(url);
}

export function getUrl(item: Item) {
  return item.url && isAbsolute(item.url) ? item.url : `/item?id=${item.id}`;
}

export default function Home(props: PageProps<any>) {
  const { data } = props;
  return (
    <>
      <Head>
        <title>The News</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-lg">
        <ul class="flex flex-col gap-1">
          {data.map((item) => (
            <li class="text-2xl p-1 hover:text-blue-700">
              <a href={getUrl(item)}>{item.title}</a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
