import { Html5Entities } from "https://deno.land/x/html_entities@v1.0/mod.js";
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

function htmlDecode(input) {
  return Html5Entities.decode(input);
}

function Comment({ data }) {
  console.log(htmlDecode(data.content));
  return (
    <li>
      {data.content && <p class="pt-5">{htmlDecode(data.content)}</p>}
      {data.user && <span>{data.user}</span>}
    </li>
  );
}

export default function Greet(props: PageProps) {
  const { data } = props;

  return (
    <>
      <h1 class="text-5xl">{data.title}</h1>
      {data.content && <p class="pt-5">{htmlDecode(data.content)}</p>}
      <ul>
        {data.comments.length > 0 && data.comments.map((comment) => {
          return <Comment data={comment} />;
        })}
      </ul>
    </>
  );
}
