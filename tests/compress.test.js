const compress = require("../util/compress");
const sharp = require("sharp");

jest.mock("sharp");

describe("compress", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("uses mozjpeg when compressing to jpeg", async () => {
    const mockToBuffer = jest
      .fn()
      .mockResolvedValue({ data: Buffer.from("out"), info: { size: 50 } });
    const mockToFormat = jest.fn().mockReturnValue({ toBuffer: mockToBuffer });
    const mockGrayscale = jest.fn().mockReturnValue({
      toFormat: mockToFormat,
    });

    sharp.mockReturnValue({ grayscale: mockGrayscale });

    await compress("input-path", false, false, 60, 100);

    expect(mockToFormat).toHaveBeenCalledWith("jpeg", {
      quality: 60,
      progressive: true,
      optimizeScans: true,
      mozjpeg: true,
    });
    expect(mockToBuffer).toHaveBeenCalledWith({ resolveWithObject: true });
  });
});
