//// [tests/cases/compiler/nodeModulesExportsExpressionDeclarationResolutionToHiddenTypeOverReexportDirectToExportedBarrel.ts] ////

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
//// [schema.d.ts]
declare const AppState_base: typeof import("pkg-a").ObjectBeta_Hidden;
export declare class AppState extends AppState_base {
}
export {};
//// [main.d.ts]
export {};


//// [DtsFileErrors]


/out/node_modules/pkg-b/src/schema.d.ts(1,53): error TS2694: Namespace '"/node_modules/pkg-a/public"' has no exported member 'ObjectBeta_Hidden'.


==== /node_modules/pkg-a/package.json (0 errors) ====
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
    
==== /out/node_modules/pkg-a/index.d.ts (0 errors) ====
    export class SchemaFactory {
    }
    declare const SchemaFactoryBeta_base: {
        new (): SchemaFactory;
    };
    export class SchemaFactoryBeta extends SchemaFactoryBeta_base {
    }
    export {};
    
==== /node_modules/pkg-a/public.d.ts (0 errors) ====
    export { SchemaFactory } from "./index.js";
    
==== /node_modules/pkg-a/beta.d.ts (0 errors) ====
    export { SchemaFactory, SchemaFactoryBeta } from "./index.js";
    
==== /node_modules/pkg-a/alpha.d.ts (0 errors) ====
    export { SchemaFactory, SchemaFactoryBeta } from "./index.js";
    
==== /node_modules/pkg-a/index.d.ts (0 errors) ====
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
    
==== /node_modules/pkg-b/package.json (0 errors) ====
    {
        "name": "pkg-b",
        "version": "1.0.0",
        "type": "module",
        "exports": {
            ".": "./src/schema.js"
        }
    }
    
==== /out/node_modules/pkg-b/src/schemaUtils.d.ts (0 errors) ====
    import { SchemaFactoryBeta } from "pkg-a/alpha";
    export declare const sf: SchemaFactoryBeta;
    
==== /out/node_modules/pkg-b/src/schema.d.ts (1 errors) ====
    declare const AppState_base: typeof import("pkg-a/internal").ObjectBeta_Hidden;
                                                                 ~~~~~~~~~~
!!! error TS2694: Namespace '"/node_modules/pkg-a/internal"' has no exported member 'ObjectBeta_Hidden'.
    export declare class AppState extends AppState_base {
    }
    export {};
    
==== /package.json (0 errors) ====
    {
        "name": "pkg-c",
        "private": true,
        "type": "module"
    }
    
==== /out/main.d.ts (0 errors) ====
    export {};
    