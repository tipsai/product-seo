# Images

## First, the site's own look

Images follow the user's site and product, never a default style. Before the first image, run `node scripts/brand.mjs --url <home page> --url <a blog post>`. It records the site's colours, fonts and logo into `seo/brand.md` with screenshots. Confirm the result with the owner, then take every colour and font below from that file. Attach two or three of the site's own images as style references when the image model accepts them.

## Two layers

1. **An image model draws only objects without text.** Use `assets/prompts/image-object.md` with the colours from `seo/brand.md`. Any image generator the user's agent has will do.
2. **Everything with letters or interface is built in HTML and screenshotted.** Headlines, captions, charts, product screens. Generated letters warp and generated interfaces look fake.

Compose the final picture in HTML: the object as a transparent image, the text and interface as markup. `assets/cover-template.html` is a worked example of this method: a kicker, a large headline, a slot for the object, a safe zone, and colour and font variables at the top of the file. Its defaults are neutral grays on purpose. Copy it, set the variables from `seo/brand.md`, edit the text, and render it with `node scripts/shoot.mjs --html <file> --out <image.png>`. The default is 1536×1024 at double density.

## Product images

Show the real interface with believable data. Check the interface against the product, not from memory: tab names, colours, button labels. Never show a feature the product does not have.

## Screenshots of other products

- The official site, in a 1440×900 window at double density.
- Decline or hide the cookie banner. If it will not go away, screenshot the product's App Store or Google Play page.
- Put the shot in a browser frame on a brand-coloured background and caption it: "The X site: …".

## Format

- 1536×1024 for covers and in-text images, WebP, a meaningful file name and alt text.
- A cover and, for a page of 1,000–1,500 words, three or four images inside: the main block as a picture, a figure worth remembering, the product in the moment.

## Phone check

On a phone an image is about 320 px wide. On a 1536 px canvas that means captions from 32 px and nothing smaller than 28 px. Solve readability by using fewer words (five to ten around the interface), not by making everything bold. Screenshot the page at 390 px and look before showing anyone. Look at each cover twice more: at about 490 px wide, the size of a card in a blog feed, and at 320 px. The headline must still read, and nothing important may sit near the edges.

Tables must not scroll sideways: full column width on desktop, rows turning into cards on a phone.

## Variety

Covers on neighbouring pages must not share a format. Rotate:

- the product screen in the moment;
- one 3D object (no more than one in four);
- a document or template shown large;
- a quote set as typography;
- a large number from the page;
- a dark background;
- before and after.

Take the idea of the cover from the content of the page.

Inside the page: one scene with real interface, or rows with icons. Not identical white boxes joined by arrows, and not a table turned into a picture.

## Check your own image before showing it

- Is the topic clear without reading the headline?
- Any large empty areas?
- Is everything aligned?
- Is the contrast enough?
- Does anything overlap?
- How does it crop in the blog feed?
- Is it readable at phone width?

## Common mistakes

- Covers that all follow one layout. Each looks fine alone, and the feed looks generated in a row. Rotate formats.
- In-text diagrams made of identical boxes and arrows. One scene with real interface explains more.
- Letting the image model draw text or interface. Letters warp and screens look fake; build those in HTML.
- Checking images only on a desktop. Most readers see them at about 320 px wide.
