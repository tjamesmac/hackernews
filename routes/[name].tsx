import { Html5Entities } from "https://deno.land/x/html_entities@v1.0/mod.js";
import { Handlers, PageProps } from "$fresh/server.ts";
import { fetchItem } from "./index.tsx";
import Header from "../components/Header.tsx";
import { Layout } from "../components/Layout.tsx";

type Comment = {
  id: number;
  user: string;
  points: number | undefined;
  time: number;
  content: string;
  url: string | undefined;
  type: "comment" | string;
  title: string | undefined;
  comments_count: number;
  comments: Comment[];
};

async function getItem(id: number) {
  const items = await fetchItem(id, true);
  return items;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const id = new URL(req.url).searchParams.get("id");

    if (!id) {
      return ctx.renderNotFound();
    }

    const item = await getItem(Number(id));
    return ctx.render(item);
  },
};

function htmlDecode(input: string) {
  return Html5Entities.decode(input);
}

function Comment({ data }: { data: Comment }) {
  console.log(data, "<----- data");
  return (
    <li class="mb-2">
      {data.user && <span class="text-blue-300">{data.user}</span>}
      {data.time && <span class="text-blue-300">{data.time}</span>}
      {data.content && <p>{htmlDecode(data.content)}</p>}
    </li>
  );
}

export default function Post(props: PageProps) {
  const { title, content, comments } = props.data;

  return (
    <Layout>
      <Header active="/" />
      <h3 class="text-3xl mb-2">{title}</h3>
      {content && <p>{htmlDecode(content)}</p>}
      <ul>
        {comments.length > 0 && comments.map((comment: Comment) => {
          return <Comment data={comment} />;
        })}
      </ul>
    </Layout>
  );
}
