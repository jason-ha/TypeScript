//// [tests/cases/compiler/nodeModulesExportsExpressionDeclarationResolutionToInternalTypeOverReexportDirectToExportedSingleSource.ts] ////

//// [package.json]
{
    "name": "pkg-a",
    "version": "1.0.0",
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

//// [index.js]
exports.SchemaFactory = class SchemaFactory {};
exports.SchemaFactoryBeta = class SchemaFactoryBeta extends exports.SchemaFactory {};
exports.ObjectBase_Internal = class ObjectBase_Internal {};
exports.ObjectBeta_Internal = class ObjectBeta_Internal extends exports.ObjectBase_Internal {};

//// [public.d.ts]
export { SchemaFactory } from "./index.js";

//// [beta.d.ts]
export { SchemaFactory, SchemaFactoryBeta } from "./index.js";

//// [alpha.d.ts]
export { SchemaFactory, SchemaFactoryBeta } from "./index.js";

//// [index.d.ts]
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
// Expected schema.d.ts to import from pkg-a/internal or alternate valid type expression.

//// [package.json]
{
    "name": "pkg-b",
    "version": "1.0.0",
    "type": "module",
    "exports": {
        ".": "./src/schema.js"
    }
}

//// [schemaUtils.ts]
import { SchemaFactoryBeta } from "pkg-a/alpha";
export const sf = new SchemaFactoryBeta("example");

//// [schema.ts]
import { sf } from "./schemaUtils.js";
// Expected schema.d.ts to import from pkg-a/internal or alternate valid type expression.
export class AppState extends sf.objectBeta("AppState", {
    count: sf.number,
}) {}

// Package "c" imports AppState from package "b" and checks it satisfies ObjectBase_Internal.

//// [package.json]
{
    "name": "pkg-c",
    "private": true,
    "type": "module"
}

//// [main.ts]
import type { ObjectBase_Internal } from "pkg-a/internal";
import { AppState } from "pkg-b";
AppState satisfies typeof ObjectBase_Internal;


//// [index.js]
exports.SchemaFactory = class SchemaFactory {
};
exports.SchemaFactoryBeta = class SchemaFactoryBeta extends exports.SchemaFactory {
};
exports.ObjectBase_Internal = class ObjectBase_Internal {
};
exports.ObjectBeta_Internal = class ObjectBeta_Internal extends exports.ObjectBase_Internal {
};
export {};
//// [schemaUtils.js]
import { SchemaFactoryBeta } from "pkg-a/alpha";
export const sf = new SchemaFactoryBeta("example");
//// [schema.js]
import { sf } from "./schemaUtils.js";
// Expected schema.d.ts to import from pkg-a/internal or alternate valid type expression.
export class AppState extends sf.objectBeta("AppState", {
    count: sf.number,
}) {
}
// Package "c" imports AppState from package "b" and checks it satisfies ObjectBase_Internal.
//// [main.js]
import { AppState } from "pkg-b";
AppState;


//// [index.d.ts]
export class SchemaFactory {
}
declare const SchemaFactoryBeta_base: {
    new (): SchemaFactory;
};
export class SchemaFactoryBeta extends SchemaFactoryBeta_base {
}
export class ObjectBase_Internal {
}
declare const ObjectBeta_Internal_base: {
    new (): ObjectBase_Internal;
};
export class ObjectBeta_Internal extends ObjectBeta_Internal_base {
}
export {};
//// [schemaUtils.d.ts]
import { SchemaFactoryBeta } from "pkg-a/alpha";
export declare const sf: SchemaFactoryBeta;
//// [schema.d.ts]
declare const AppState_base: typeof import("pkg-a/internal").ObjectBeta_Internal;
export declare class AppState extends AppState_base {
}
export {};
//// [main.d.ts]
export {};
