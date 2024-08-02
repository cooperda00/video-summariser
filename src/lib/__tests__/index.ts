import * as fs from "fs";
import * as path from "path";
import { isValidYoutubeURL } from "../isValidYoutubeURL";

describe("isValidYoutubeURL", () => {
  describe("Tests all urls loaded return true", () => {
    let urls: string[];

    const filePath = path.join(__dirname, "validYoutubeURLs.txt");
    const fileContent = fs.readFileSync(filePath, "utf-8");
    urls = fileContent.split("\n").filter((url) => url.trim() !== "");

    urls.forEach((url) => {
      test(`Validates ${url}`, () => {
        expect(isValidYoutubeURL(url)).toEqual({ isValid: true });
      });
    });
  });

  test("handles edge cases", () => {
    expect(isValidYoutubeURL("")).toEqual(
      expect.objectContaining({ isValid: false })
    ); // Empty string

    expect(isValidYoutubeURL("https://google.com")).toEqual(
      expect.objectContaining({ isValid: false })
    ); // Not youtube domain

    expect(
      isValidYoutubeURL("https://www.youtube.com/watch?channel=B-TeamJiuJitsu")
    ).toEqual(expect.objectContaining({ isValid: false })); // Missing videoId
  });
});
