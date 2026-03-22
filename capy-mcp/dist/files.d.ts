export declare function fileExists(path: string): Promise<boolean>;
export declare function readText(path: string): Promise<string | null>;
export declare function writeText(path: string, contents: string): Promise<void>;
export declare function toPosixPath(path: string): string;
