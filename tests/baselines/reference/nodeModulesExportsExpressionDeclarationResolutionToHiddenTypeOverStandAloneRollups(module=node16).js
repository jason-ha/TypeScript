//// [tests/cases/compiler/nodeModulesExportsExpressionDeclarationResolutionToHiddenTypeOverStandAloneRollups.ts] ////

//// [package.json]
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

//// [index.js]
exports.SchemaFactory = class SchemaFactory {};
exports.SchemaFactoryBeta = class SchemaFactoryBeta extends exports.SchemaFactory {};

//// [public.d.ts]
export declare class SchemaFactory {
    constructor(name: string);
    readonly number: "number-schema";
    object(name: string, fields: Record<string, "number-schema">): typeof ObjectBase_Hidden;
}
declare class ObjectBase_Hidden {
    readonly props: Record<string, unknown>;
}

//// [beta.d.ts]
export declare class SchemaFactory {
    constructor(name: string);
    readonly number: "number-schema";
    object(name: string, fields: Record<string, "number-schema">): typeof ObjectBase_Hidden;
}
export declare class SchemaFactoryBeta extends SchemaFactory {
    objectBeta(name: string, fields: Record<string, "number-schema">): typeof ObjectBeta_Hidden;
}
declare class ObjectBase_Hidden {
    readonly props: Record<string, unknown>;
}
declare class ObjectBeta_Hidden extends ObjectBase_Hidden {
    readonly betaMetadata: string;
}

//// [alpha.d.ts]
export declare class SchemaFactory {
    constructor(name: string);
    readonly number: "number-schema";
    object(name: string, fields: Record<string, "number-schema">): typeof ObjectBase_Hidden;
}
export declare class SchemaFactoryBeta extends SchemaFactory {
    objectBeta(name: string, fields: Record<string, "number-schema">): typeof ObjectBeta_Hidden;
}
declare class ObjectBase_Hidden {
    readonly props: Record<string, unknown>;
}
declare class ObjectBeta_Hidden extends ObjectBase_Hidden {
    readonly betaMetadata: string;
}

//// [index.d.ts]
export declare class SchemaFactory {
    constructor(name: string);
    readonly number: "number-schema";
    object(name: string, fields: Record<string, "number-schema">): typeof ObjectBase_Hidden;
}
export declare class SchemaFactoryBeta extends SchemaFactory {
    objectBeta(name: string, fields: Record<string, "number-schema">): typeof ObjectBeta_Hidden;
}
declare class ObjectBase_Hidden {
    readonly props: Record<string, unknown>;
}
declare class ObjectBeta_Hidden extends ObjectBase_Hidden {
    readonly betaMetadata: string;
}

// Package "b" has two .ts source files following a schema provider pattern.
// schemaUtils.ts creates a SchemaFactoryBeta instance from pkg-a/alpha.
// schema.ts exports AppState extending sf.objectBeta(...).
// The root export is schema.ts.
// Expected schema.d.ts to yield error importing from pkg-a/alpha or use alternate valid type expression.

//// [package.json]
{
    "name": "pkg-b",
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
// Expected schema.d.ts to yield error importing from pkg-a/alpha or use alternate valid type expression.
export class AppState extends sf.objectBeta("AppState", {
    count: sf.number,
}) {}

// Package "c" imports AppState from package "b" and checks it satisfies factory return type (ObjectBase_Hidden).

//// [package.json]
{
    "name": "pkg-c",
    "private": true,
    "type": "module"
}

//// [main.ts]
import type { SchemaFactory } from "pkg-a";
import { AppState } from "pkg-b";
AppState satisfies ReturnType<SchemaFactory["object"]>;


//// [index.js]
exports.SchemaFactory = class SchemaFactory {
};
exports.SchemaFactoryBeta = class SchemaFactoryBeta extends exports.SchemaFactory {
};
export {};
//// [schemaUtils.js]
import { SchemaFactoryBeta } from "pkg-a/alpha";
export const sf = new SchemaFactoryBeta("example");
//// [schema.js]
import { sf } from "./schemaUtils.js";
// Expected schema.d.ts to yield error importing from pkg-a/alpha or use alternate valid type expression.
export class AppState extends sf.objectBeta("AppState", {
    count: sf.number,
}) {
}
// Package "c" imports AppState from package "b" and checks it satisfies factory return type (ObjectBase_Hidden).
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
export {};
//// [schemaUtils.d.ts]
import { SchemaFactoryBeta } from "pkg-a/alpha";
export declare const sf: SchemaFactoryBeta;
//// [main.d.ts]
export {};
