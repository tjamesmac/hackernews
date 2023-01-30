import { Handlers, PageProps } from "$fresh/server.ts";
import { fetchItem } from "./index.tsx";

async function getItem(id: number) {
  const items = await fetchItem(id, true);
  return items;
}

type Item = any;

export const handler: Handlers<Item> = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return ctx.renderNotFound();
    }
    const item = await getItem(Number(id));
    return ctx.render(item);
  },
};

export default function Greet(props: PageProps) {
  const { data } = props;

  return (
    <>
      <h1 class="text-9xl">{data.title}</h1>
    </>
  );
}
