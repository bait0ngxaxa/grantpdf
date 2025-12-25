declare module "wordcut" {
    interface Wordcut {
        init(): void;
        cut(text: string, delimiter?: string): string;
    }

    const wordcut: Wordcut;
    export = wordcut;
}
