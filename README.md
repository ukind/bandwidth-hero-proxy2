# Bandwidth Hero Data Compression Service

Welcome to the **Serverless** port of Bandwidth Hero Data Compression Service 🚀. This service is designed to compress images on the fly, saving you bandwidth and improving your browsing experience.

To get started with deploying your own instance of this service, please follow the detailed instructions in the #Deployment section below.

Forked from [adi-g15/bandwidth-hero-proxy](https://github.com/adi-g15/bandwidth-hero-proxy) just trying to make the code up-to-date and error less upto my limited (equal to nothing) coding knowledge.

The original and this fork, both are, data compression service used by [Bandwidth Hero](https://github.com/ayastreb/bandwidth-hero) browser extension. It compresses (optionally grayscale) given image to low-res [WebP](https://developers.google.com/speed/webp/) or JPEG image.

It downloads original image and transforms it with [Sharp](https://github.com/lovell/sharp) on the fly without saving images on disk.

**Benefits** - It's faster for initial requests, as it doesn't require restarting a sleeping heroku server deployment, also, you may benefit from a better ping (in my case it is such)

> Note: It downloads images on user's behalf (By passing in same headers to the domain with required image), passing cookies and user's IP address through to the origin host.

## Deployment

You can deploy this service to [Vercel](https://vercel.com/) in just a few steps:

1. Fork or clone this repository.
2. Create a new Vercel project and select this repository as the source.
3. Accept the defaults for the build configuration. Vercel will automatically detect the serverless function located at `api/index.js`.
4. Deploy the project. Your instance will be available at `https://your-vercel-project.vercel.app/`.

Then, in the **Data Compression Service** field inside the Bandwidth Hero extension, set the endpoint to `https://your-vercel-project.vercel.app/api/index`, and you are good to go.

For local development you can run:

```bash
npm install
npm run start
```

This uses `vercel dev` under the hood to emulate the production environment locally.

<!-- READ THIS ARTICLE LATER AdityaG
Check out [this guide](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04)
on how to setup Node.js on Ubuntu.
DigitalOcean also provides an
[easy way](https://www.digitalocean.com/products/one-click-apps/node-js/) to setup a server ready to
host Node.js apps.
-->
