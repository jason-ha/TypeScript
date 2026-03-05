//// [tests/cases/conformance/node/nodeModulesExportsExpressionDeclarationResolution.ts] ////

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
            "types": "./index.d.ts",
            "default": "./index.js"
        }
    }
}

//// [index.js]
exports.SchemaFactory = class SchemaFactory {};
exports.SchemaFactoryBeta = class SchemaFactoryBeta extends exports.SchemaFactory {};
exports.ObjectBase = class ObjectBase {};
exports.ObjectBeta = class ObjectBeta extends exports.ObjectBase {};

//// [public.d.ts]
export declare class SchemaFactory {
    constructor(name: string);
    readonly number: "number-schema";
}
export declare class ObjectBase {
    readonly props: Record<string, unknown>;
}

//// [index.d.ts]
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
// schemaUtils.ts creates a SchemaFactoryBeta instance from pkg-a/beta.
// schema.ts exports AppState extending sf.objectBeta(...).
// The root export is schema.ts.

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
import { SchemaFactoryBeta } from "pkg-a/beta";
export const sf = new SchemaFactoryBeta("example");

//// [schema.ts]
import { sf } from "./schemaUtils.js";
export class AppState extends sf.objectBeta("AppState", {
    count: sf.number,
}) {}

// Package "c" imports AppState from package "b" and checks it's instantiation satisfies ObjectBase.

//// [package.json]
{
    "name": "pkg-c",
    "private": true,
    "type": "module"
}

//// [main.ts]
import { ObjectBase } from "pkg-a";
import { AppState } from "pkg-b";
const appState = new AppState();
appState satisfies ObjectBase;


//// [index.js]
exports.SchemaFactory = class SchemaFactory {
};
exports.SchemaFactoryBeta = class SchemaFactoryBeta extends exports.SchemaFactory {
};
exports.ObjectBase = class ObjectBase {
};
exports.ObjectBeta = class ObjectBeta extends exports.ObjectBase {
};
export {};
//// [schemaUtils.js]
import { SchemaFactoryBeta } from "pkg-a/beta";
export const sf = new SchemaFactoryBeta("example");
//// [schema.js]
import { sf } from "./schemaUtils.js";
export class AppState extends sf.objectBeta("AppState", {
    count: sf.number,
}) {
}
// Package "c" imports AppState from package "b" and checks it's instantiation satisfies ObjectBase.
//// [main.js]
import { AppState } from "pkg-b";
const appState = new AppState();
appState;


//// [index.d.ts]
export class SchemaFactory {
}
declare const SchemaFactoryBeta_base: {
    new (): SchemaFactory;
};
export class SchemaFactoryBeta extends SchemaFactoryBeta_base {
}
export class ObjectBase {
}
declare const ObjectBeta_base: {
    new (): ObjectBase;
};
export class ObjectBeta extends ObjectBeta_base {
}
export {};
//// [schemaUtils.d.ts]
import { SchemaFactoryBeta } from "pkg-a/beta";
export declare const sf: SchemaFactoryBeta;
//// [schema.d.ts]
declare const AppState_base: typeof import("pkg-a/beta").ObjectBeta;
export declare class AppState extends AppState_base {
}
export {};
//// [main.d.ts]
export {};
