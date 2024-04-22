import { createMiddleware } from "hono/factory"
import { build } from "esbuild"
import * as pathLib from "node:path"

type TSAutoCompileOptions = {
    basePath: string
}

const parseBasePath = (path: TSAutoCompileOptions["basePath"], isDeletePrefix?: boolean): TSAutoCompileOptions["basePath"] => {
    if (path.endsWith("/")) return parseBasePath(path.slice(0, -1), isDeletePrefix)
    if (isDeletePrefix) {
        if (path.startsWith("./")) {
            return path.slice(2)
        }else if (path.startsWith("../")) {
            return path.slice(3)
        }

        return path
    }
    else return path
}

export function TSAutoCompileMiddeware(options: TSAutoCompileOptions) {
    return createMiddleware(async (c, next) => {
        const path = c.req.path
        const parsedBasePath = parseBasePath(options.basePath, true)
        if (path.includes(parsedBasePath)) {
            const fileRelativePath = parseBasePath(options.basePath, false) + path.replace("/" + parsedBasePath, "");
            const buildOptions = {
                entryPoints: [pathLib.resolve(__dirname, fileRelativePath)],
                minify: true,
                bundle: true,
                target: 'es2016',
                platform: 'browser',
                write: false
            }
            const result = await build(buildOptions as any)
            return c.body(result.outputFiles![0].text ?? "console.log('compile failed')", {
                headers: new Headers({
                    "Content-Type": "text/javascript"
                })
            })
        }
        await next()
    })      
}