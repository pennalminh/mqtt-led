import BaseComponent from "./BaseComponent.js";

class TextComponent extends BaseComponent {
  readonly type = "text";

  font: string;
  text: string = "";

  private singleLine = false;
  private effectIn = 0;
  private justify = "left";
  private color = "#FFFFFF";

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    alpha: number,
    font: string,
    text: string,
    guid?: string
  ) {
    super(x, y, width, height, alpha, guid);

    this.font = font;

    this.setText(text);
  }

  setSingleLine = (state: boolean) => {
    this.singleLine = state;
  };

  setSlidingText = (state: boolean) => {
    if (state) {
      this.effectIn = 5;
      this.text = this.text + "       ";
    } else {
      this.effectIn = 0;
      this.text = this.text.trimEnd();
    }
  };

  setJustify = (justify: string) => {
    this.justify = justify;
  };

  setColor = (color: string) => {
    this.color = color;
  };

  setText = (input: string | Uint8Array | Buffer) => {
    // Convert potential UTF-8 input to proper string
    try {
      let processedText: string;
      // If text is already a Buffer or Uint8Array, decode it
      if (input instanceof Uint8Array || Buffer.isBuffer(input)) {
        const decoder = new TextDecoder("utf-8");
        processedText = decoder.decode(input);
      } else {
        // Handle string input - ensure it's properly encoded
        processedText = decodeURIComponent(escape(input));
      }

      this.text = processedText;

      const fontWidth = 9;
      // Calculate length considering multi-byte characters
      // const charCount = [...text].length;
      // if (charCount >= this.width / fontWidth - 1) {
      //   this.setSlidingText(true);
      // } else {
      //   this.setSlidingText(false);
      // }
    } catch (e) {
      console.error("Error processing UTF-8 text:", e);
      this.text = typeof input === "string" ? input : ""; // Fallback to empty string for non-string inputs
    }
  };

  setSize = (x: number, y: number, width: number, height: number) => {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.setText(this.text);
  };

  setAlpha = (alpha: number) => {
    this.alpha = alpha;
  };

  setBlingSymbol = (symbol: string = "↑", interval: number = 500) => {
    let showSymbol = true;

    setInterval(() => {
      this.text = showSymbol
        ? this.text.replace(symbol, "") + symbol
        : this.text.replace(symbol, "");
      showSymbol = !showSymbol;
    }, interval);
  };

  generate = (): object => {
    return {
      "@_alpha": this.alpha,
      "@_guid": this.guid,
      rectangle: {
        "@_x": this.x,
        "@_height": this.height,
        "@_width": this.width,
        "@_y": this.y,
      },
      resources: {
        text: {
          "@_guid": this.guid + "Text",
          "@_singleLine": this.singleLine,
          style: {
            "@_valign": "middle",
            "@_align": this.justify,
          },
          string: this.text,
          font: {
            "@_name": this.font,
            "@_italic": false,
            "@_bold": false,
            "@_underline": false,
            "@_size": 12,
            "@_color": this.color,
          },

          effect: {
            "@_in": this.effectIn,
            "@_out": 0,
            "@_inSpeed": 4,
            "@_outSpeed": 0,
            "@_duration": 10,
          },
        },
      },
    };
  };
}

export default TextComponent;
