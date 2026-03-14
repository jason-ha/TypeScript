// @target: es2022
// @module: node16,nodenext
// @noImplicitAny: true
// @allowJs: true
// @declaration: true
// @outDir: /out

// Package "a" uses "exports" with trimmed public.d.ts, beta.d.ts, and alpha.d.ts that limit type exports.
// The "." export only exposes SchemaFactory and ObjectBase (via public.d.ts).
// The "./internal" export exposes the full index.d.ts (via internal.d.ts).
// The "./alpha" export exposes the full index.d.ts including SchemaFactoryBeta and ObjectBeta (via alpha.d.ts via beta.d.ts via public.d.ts).
// The "./beta" export exposes the full index.d.ts including SchemaFactoryBeta and ObjectBeta (via beta.d.ts via public.d.ts).
// (Note: the exports order is different compared to similar tests to highlight order independence.)
// Expected: package "b" schema.d.ts to import from pkg-a/beta (while schemaUtils.ts imports pkg-a/alpha).

// @Filename: /node_modules/pkg-a/package.json
{
    "name": "pkg-a",
    "version": "1.0.0",
    "type": "module",
    "exports": {
        ".": {
            "types": "./public.d.ts",
            "default": "./index.js"
        },
        "./internal": {
            "types": "./internal.d.ts",
            "default": "./index.js"
        },
        "./alpha": {
            "types": "./alpha.d.ts",
            "default": "./index.js"
        },
        "./beta": {
            "types": "./beta.d.ts",
            "default": "./index.js"
        }
    }
}

// @Filename: /node_modules/pkg-a/index.js
exports.SchemaFactory = class SchemaFactory {};
exports.SchemaFactoryBeta = class SchemaFactoryBeta extends exports.SchemaFactory {};
exports.ObjectBase = class ObjectBase {};
exports.ObjectBeta = class ObjectBeta extends exports.ObjectBase {};

// @Filename: /node_modules/pkg-a/public.d.ts
export { SchemaFactory, ObjectBase } from "./index.js";

// @Filename: /node_modules/pkg-a/beta.d.ts
export * from "./public.js";
export { SchemaFactoryBeta, ObjectBeta } from "./index.js";

// @Filename: /node_modules/pkg-a/alpha.d.ts
export * from "./beta.js";

// @Filename: /node_modules/pkg-a/internal.d.ts
export * from "./index.js";

// @Filename: /node_modules/pkg-a/index.d.ts
export declare class SchemaFactory {
    constructor(name: string);
    readonly number: "number-schema";
}
export declare class SchemaFactoryBeta extends SchemaFactory {
    objectBeta(name: string, fields: Record<string, "number-schema">): typeof ObjectBeta;
}
export declare class ObjectBase {
    readonly props: Record<string, unknown>;
}
export declare class ObjectBeta extends ObjectBase {
    readonly betaMetadata: string;
}

// Package "b" has two .ts source files following a schema provider pattern.
// schemaUtils.ts creates a SchemaFactoryBeta instance from pkg-a/alpha.
// schema.ts exports AppState extending sf.objectBeta(...).
// The root export is schema.ts.
// Expected schema.d.ts to import from pkg-a/beta.

// @Filename: /node_modules/pkg-b/package.json
{
    "name": "pkg-b",
    "version": "1.0.0",
    "type": "module",
    "exports": {
        ".": "./src/schema.js"
    }
}

// @Filename: /node_modules/pkg-b/src/schemaUtils.ts
import { SchemaFactoryBeta } from "pkg-a/alpha";
export const sf = new SchemaFactoryBeta("example");

// @Filename: /node_modules/pkg-b/src/schema.ts
import { sf } from "./schemaUtils.js";
// Expected schema.d.ts to import from pkg-a/beta.
export class AppState extends sf.objectBeta("AppState", {
    count: sf.number,
}) {}

// Package "c" imports AppState from package "b" and checks it satisfies ObjectBase.

// @Filename: /package.json
{
    "name": "pkg-c",
    "private": true,
    "type": "module"
}

// @Filename: /main.ts
import type { ObjectBase } from "pkg-a";
import { AppState } from "pkg-b";
AppState satisfies typeof ObjectBase;
