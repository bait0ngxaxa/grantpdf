declare module 'docxtemplater/image' {
  interface ImageModuleOptions {
    centered?: boolean;
    getImage: (tag: string) => Buffer | Promise<Buffer> | null;
    getSize: (image: Buffer) => [number, number];
  }
  
  export default class ImageModule {
    constructor(options: ImageModuleOptions);
  }
}

declare module 'docxtemplater-image-module-free';