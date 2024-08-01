declare module "youtube-captions-scraper" {
  type Options = {
    videoID: string;
    lang?: string;
  };

  type Result = {
    start: number;
    dur: number;
    text: string;
  }[];

  export function getSubtitles(option: Options): Promise<Result>;
}
