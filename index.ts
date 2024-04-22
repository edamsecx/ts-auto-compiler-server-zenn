import { Hono } from "hono";
import { TSAutoCompileMiddeware } from "./mod";

const app = new Hono();

app.use(TSAutoCompileMiddeware({
    basePath: "./script/"
}))

app.all("*", c => c.text("hello"))

Bun.serve({
    fetch: app.fetch
})