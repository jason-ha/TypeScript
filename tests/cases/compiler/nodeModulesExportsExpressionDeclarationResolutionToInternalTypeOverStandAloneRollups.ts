// @target: es2022
// @module: node16,nodenext
// @noImplicitAny: true
// @allowJs: true
// @declaration: true
// @outDir: /out

// Package "a" uses "exports" with roll-up public.d.ts, beta.d.ts, and alpha.d.ts that limit type exports.
// The "." export only exposes SchemaFactory (via public.d.ts declarations).
// The "./beta" export exposes SchemaFactory and SchemaFactoryBeta (via beta.d.ts declarations).
// The "./alpha" export exposes SchemaFactory and SchemaFactoryBeta (via alpha.d.ts declarations).
// The "./internal" export exposes the full index.d.ts directly including ObjectBase_Internal and ObjectBeta_Internal.
// Expected: package "B" schema.d.ts to yield error, import from pkg-a/internal, or use alternate valid type expression.

// @Filename: /node_modules/pkg-a/package.json
{
    "name": "pkg-a",
    "type": "module",
    "exports": {
        ".": {
            "types": "./public.d.ts",
            "default": "./index.js"
        },
        "./beta": {
            "types": "./beta.d.ts",
            "default": "./index.js"
        },
        "./alpha": {
            "types": "./alpha.d.ts",
            "default": "./index.js"
        },
        "./internal": {
            "types": "./index.d.ts",
            "default": "./index.js"
        }
    }
}

// @Filename: /node_modules/pkg-a/index.js
exports.SchemaFactory = class SchemaFactory {};
exports.SchemaFactoryBeta = class SchemaFactoryBeta extends exports.SchemaFactory {};
exports.ObjectBase_Internal = class ObjectBase_Internal {};
exports.ObjectBeta_Internal = class ObjectBeta_Internal extends exports.ObjectBase_Internal {};

// @Filename: /node_modules/pkg-a/public.d.ts
export declare class SchemaFactory {
    constructor(name: string);
    readonly number: "number-schema";
}

// @Filename: /node_modules/pkg-a/beta.d.ts
export declare class SchemaFactory {
    constructor(name: string);
    readonly number: "number-schema";
}
export declare class SchemaFactoryBeta extends SchemaFactory {
    objectBeta(name: string, fields: Record<string, "number-schema">): typeof ObjectBeta_Internal;
}
declare class ObjectBase_Internal {
    readonly props: Record<string, unknown>;
}
declare class ObjectBeta_Internal extends ObjectBase_Internal {
    readonly betaMetadata: string;
}

// @Filename: /node_modules/pkg-a/alpha.d.ts
export declare class SchemaFactory {
    constructor(name: string);
    readonly number: "number-schema";
}
export declare class SchemaFactoryBeta extends SchemaFactory {
    objectBeta(name: string, fields: Record<string, "number-schema">): typeof ObjectBeta_Internal;
}
declare class ObjectBase_Internal {
    readonly props: Record<string, unknown>;
}
declare class ObjectBeta_Internal extends ObjectBase_Internal {
    readonly betaMetadata: string;
}

// @Filename: /node_modules/pkg-a/index.d.ts
export declare class SchemaFactory {
    constructor(name: string);
    readonly number: "number-schema";
}
export declare class SchemaFactoryBeta extends SchemaFactory {
    objectBeta(name: string, fields: Record<string, "number-schema">): typeof ObjectBeta_Internal;
}
export declare class ObjectBase_Internal {
    readonly props: Record<string, unknown>;
}
export declare class ObjectBeta_Internal extends ObjectBase_Internal {
    readonly betaMetadata: string;
}

// Package "b" has two .ts source files following a schema provider pattern.
// schemaUtils.ts creates a SchemaFactoryBeta instance from pkg-a/alpha.
// schema.ts exports AppState extending sf.objectBeta(...).
// The root export is schema.ts.
// Expected schema.d.ts to yield error, import from pkg-a/internal, or use alternate valid type expression.

// @Filename: /node_modules/pkg-b/package.json
{
    "name": "pkg-b",
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
// Expected schema.d.ts to yield error, import from pkg-a/internal, or use alternate valid type expression.
export class AppState extends sf.objectBeta("AppState", {
    count: sf.number,
}) {}

// Package "c" imports AppState from package "b" and checks it satisfies ObjectBase_Internal.

// @Filename: /package.json
{
    "name": "pkg-c",
    "private": true,
    "type": "module"
}

// @Filename: /main.ts
import type { ObjectBase_Internal } from "pkg-a/internal";
import { AppState } from "pkg-b";
AppState satisfies typeof ObjectBase_Internal;
